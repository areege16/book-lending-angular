import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { getErrorMessage } from '@core/utils';
import { Book } from '@models';
import { AuthService, BooksService, BorrowingService } from '@services';
import { ErrorModalComponent } from '@shared/error-modal/error-modal.component';

@Component({
  selector: 'app-book-list-page',
  imports: [RouterLink, ErrorModalComponent, FormsModule],
  templateUrl: './book-list.page.html',
  styleUrl: './book-list.page.css',
})
export class BookListPageComponent implements OnInit {
  readonly booksService = inject(BooksService);
  private readonly borrowingService = inject(BorrowingService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  books = signal<Book[]>([]);
  loading = signal(false);
  error = signal('');
  role = computed(() => this.authService.role());
  userName = computed(() => this.authService.user()?.name ?? 'Reader');

  searchText = '';
  filteredBooks = signal<Book[]>([]);

  pageNumber = signal(1);
  pageSize: number = 12;
  totalCount = signal(0);
  totalPages = signal(0);
  hasNextPage = signal(false);
  hasPreviousPage = signal(false);

  ngOnInit(): void {
    this.fetchBooks();
  }

  fetchBooks() {
    this.loading.set(true);
    this.error.set('');

    this.booksService.getBooksPage(this.pageNumber(), this.pageSize).subscribe({
      next: (paged) => {
        this.books.set(paged.items);
        this.filteredBooks.set(paged.items);
        this.totalCount.set(paged.totalCount);
        this.totalPages.set(paged.totalPages);
        this.hasNextPage.set(paged.hasNextPage);
        this.hasPreviousPage.set(paged.hasPreviousPage);
        this.loading.set(false);
        this.onSearch();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(getErrorMessage(err, 'Failed to load books. Please try again later.'));
      },
    });
  }

  onSearch() {
    if (!this.searchText.trim()) {
      this.filteredBooks.set(this.books());
      return;
    }
    const term = this.searchText.toLowerCase();
    this.filteredBooks.set(
      this.books().filter(
        (b) => b.title.toLowerCase().includes(term) || b.author.toLowerCase().includes(term),
      ),
    );
  }

  nextPage() {
    if (this.hasNextPage()) {
      this.pageNumber.set(this.pageNumber() + 1);
      this.fetchBooks();
    }
  }

  prevPage() {
    if (this.hasPreviousPage()) {
      this.pageNumber.set(this.pageNumber() - 1);
      this.fetchBooks();
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.pageNumber.set(page);
      this.fetchBooks();
    }
  }

  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.pageNumber();
    const pages: number[] = [];

    pages.push(1);

    const start = Math.max(2, current - 2);
    const end = Math.min(total - 1, current + 2);

    if (start > 2) pages.push(-1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total - 1) pages.push(-1);

    if (total > 1) pages.push(total);

    return pages;
  });

  borrow(bookId: number) {
    if (!this.authService.isAuthenticated()) {
      this.router.navigateByUrl('/login');
      return;
    }
    this.error.set('');
    this.borrowingService.borrowBook(bookId).subscribe({
      next: () => this.fetchBooks(),
      error: (err) => {
        this.error.set(
          getErrorMessage(err, 'You already have a borrowed book. Please return it first.'),
        );
      },
    });
  }
}
