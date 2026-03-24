import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { getErrorMessage } from '@core/utils';
import { BorrowRecord } from '@models';
import { BorrowingService } from '@services';
import { ErrorModalComponent } from '@shared/error-modal/error-modal.component';

@Component({
  selector: 'app-delayed-books-page',
  imports: [DatePipe, ErrorModalComponent],
  templateUrl: './delayed-books.page.html',
  styleUrl: './delayed-books.page.css',
})
export class DelayedBooksPageComponent implements OnInit {
  private readonly borrowingService = inject(BorrowingService);

  records = signal<BorrowRecord[]>([]);
  loading = signal(false);
  error = signal('');

  delayed = computed(() =>
    this.records().filter(
      (r) =>
        r.isOverdue ?? (!r.isReturned && !!r.dueDate && new Date(r.dueDate).getTime() < Date.now()),
    ),
  );

  ngOnInit(): void {
    this.loading.set(true);
    this.error.set('');
    this.borrowingService.getAdminRecords().subscribe({
      next: (rows) => {
        this.records.set(rows);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(getErrorMessage(err, 'Failed to load delayed books. Please try again.'));
      },
    });
  }
}
