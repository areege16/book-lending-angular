import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';

import { getErrorMessage } from '@core/utils/error.utils';
import { BorrowRecord } from '@models/app.models';
import { BorrowingService } from '@services/borrowing.service';
import { ErrorModalComponent } from '@shared/error-modal/error-modal.component';

@Component({
  selector: 'app-admin-dashboard-page',
  imports: [DatePipe, ErrorModalComponent],
  templateUrl: './admin-dashboard.page.html',
  styleUrl: './admin-dashboard.page.css',
})
export class AdminDashboardPageComponent implements OnInit {
  private readonly borrowingService = inject(BorrowingService);

  records = signal<BorrowRecord[]>([]);
  loading = signal(false);
  error = signal('');

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
        this.error.set(getErrorMessage(err, 'Failed to load borrowing records. Please try again.'));
      },
    });
  }

  isOverdue(r: BorrowRecord) {
    return !!r.dueDate && !r.isReturned && new Date(r.dueDate).getTime() < Date.now();
  }
}
