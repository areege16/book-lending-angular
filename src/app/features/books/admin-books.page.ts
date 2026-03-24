import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { getErrorMessage } from '@core/utils';
import { Book } from '@models';
import { BooksService } from '@services';
import { ErrorModalComponent } from '@shared/error-modal/error-modal.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-admin-books-page',
  imports: [ReactiveFormsModule, ErrorModalComponent, FormsModule],
  templateUrl: './admin-books.page.html',
  styleUrl: './admin-books.page.css',
})
export class AdminBooksPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  booksService = inject(BooksService);

  books = signal<Book[]>([]);
  loading = signal(false);
  error = signal('');
  editingId = signal<number | null>(null);
  editingBook = signal<Book | null>(null);
  selectedCover: File | null = null;
  searchText = '';

  pageNumber = 1;
  pageSize = 14;
  totalCount = signal(0);
  totalPages = signal(0);
  hasNextPage = signal(false);
  hasPreviousPage = signal(false);

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    author: ['', [Validators.required]],
    isbn: ['', [Validators.required]],
    description: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.load();
  }

  onFileChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.selectedCover = file;
  }

  edit(book: Book) {
    this.editingId.set(book.id);
    this.selectedCover = null;
    this.booksService.getBookById(book.id).subscribe((full) => {
      this.editingBook.set(full);
      this.form.patchValue({
        title: full.title,
        author: full.author,
        isbn: full.isbn,
        description: full.description,
      });
    });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set('');
    const payload = { ...this.form.getRawValue(), coverImage: this.selectedCover };
    const req: Observable<unknown> = this.editingId()
      ? this.booksService.updateBook(this.editingId()!, payload)
      : this.booksService.addBook(payload);
    req.subscribe({
      next: () => {
        this.loading.set(false);
        this.editingId.set(null);
        this.editingBook.set(null);
        this.form.reset();
        this.load();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(getErrorMessage(err, 'Failed to save book. Please try again.'));
      },
    });
  }

  remove(id: number) {
    this.error.set('');
    this.booksService.deleteBook(id).subscribe({
      next: () => this.load(),
      error: (err) => {
        this.error.set(
          getErrorMessage(err, "This book has borrowing history, so it can't be deleted."),
        );
      },
    });
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.pageNumber = page;
      this.load();
    }
  }

  nextPage() {
    if (this.hasNextPage()) {
      this.pageNumber++;
      this.load();
    }
  }
  prevPage() {
    if (this.hasPreviousPage()) {
      this.pageNumber--;
      this.load();
    }
  }

  get filteredBooks(): Book[] {
    if (!this.searchText.trim()) return this.books();
    const term = this.searchText.toLowerCase();
    return this.books().filter(
      (b) => b.title.toLowerCase().includes(term) || b.author.toLowerCase().includes(term),
    );
  }

  get pageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.pageNumber;
    const pages: number[] = [];

    pages.push(1);

    let start = Math.max(2, current - 2);
    let end = Math.min(total - 1, current + 2);

    if (start > 2) pages.push(-1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total - 1) pages.push(-1);

    if (total > 1) pages.push(total);

    return pages;
  }

  private load() {
    this.booksService.getBooksPage(this.pageNumber, this.pageSize).subscribe({
      next: (result) => {
        this.books.set(result.items);
        this.totalCount.set(result.totalCount);
        this.totalPages.set(result.totalPages);
        this.hasNextPage.set(result.hasNextPage);
        this.hasPreviousPage.set(result.hasPreviousPage);
      },
      error: (err) =>
        this.error.set(getErrorMessage(err, 'Failed to load books. Please try again.')),
    });
  }
}
