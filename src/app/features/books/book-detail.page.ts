import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { getErrorMessage } from '@core/utils';
import { Book, BorrowRecord } from '@models';
import { AuthService, BooksService, BorrowingService } from '@services';
import { ErrorModalComponent } from '@shared/error-modal/error-modal.component';

@Component({
  selector: 'app-book-detail-page',
  imports: [DatePipe, ErrorModalComponent, RouterLink],
  templateUrl: './book-detail.page.html',
  styleUrl: './book-detail.page.css',
})
export class BookDetailPageComponent implements OnInit {
  book = signal<Book | null>(null);
  error = signal('');
  history = signal<BorrowRecord[]>([]);
  dueDate = signal<string | null>(null);
  isMember = computed(() => this.authService.role() === 'Reader');

  private readonly route = inject(ActivatedRoute);
  readonly booksService = inject(BooksService);
  private readonly borrowingService = inject(BorrowingService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.refresh(id);
  }

  borrowedByMe() {
    const b = this.book();
    if (!b) return false;
    return this.history().some(
      (h) =>
        !h.isReturned &&
        (h.bookId === b.id ||
          (h.bookTitle === b.title && (h.bookAuthor === b.author || !h.bookAuthor))),
    );
  }

  borrow(bookId: number) {
    if (!this.authService.isAuthenticated()) {
      this.router.navigateByUrl('/login');
      return;
    }
    this.error.set('');
    this.borrowingService.borrowBook(bookId).subscribe({
      next: () => this.refresh(bookId),
      error: (err) => {
        this.error.set(
          getErrorMessage(err, 'You already have a borrowed book. Please return it first.'),
        );
      },
    });
  }

  returnBook(bookId: number) {
    this.error.set('');
    this.borrowingService.returnBook(bookId).subscribe({
      next: () => this.refresh(bookId),
      error: (err) => this.error.set(getErrorMessage(err, 'Return failed. Please try again.')),
    });
  }
  private refresh(id: number) {
    this.error.set('');
    this.booksService.getBookById(id).subscribe((book: Book) => this.book.set(book));

    if (this.authService.isAuthenticated()) {
      this.borrowingService.getMyHistory().subscribe((rows: BorrowRecord[]) => {
        this.history.set(rows);
        const active = rows.find((r: BorrowRecord) => r.bookId === id && !r.isReturned);
        this.dueDate.set(active?.dueDate ?? null);
      });
    }
  }
}
