import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { getErrorMessage } from '@core/utils';
import { BorrowRecord } from '@models';
import { AuthService, BorrowingService } from '@services';
import { ErrorModalComponent } from '@shared/error-modal/error-modal.component';

@Component({
  selector: 'app-profile-page',
  imports: [DatePipe, RouterLink, ErrorModalComponent],
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.css',
})
export class ProfilePageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly borrowingService = inject(BorrowingService);
  private readonly authService = inject(AuthService);

  records = signal<BorrowRecord[]>([]);
  loading = signal(false);
  error = signal('');
  userName = computed(() => this.authService.user()?.name ?? 'User');

  ngOnInit(): void {
    if (this.authService.role() === 'Admin') {
      this.router.navigateByUrl('/admin/dashboard');
      return;
    }
    this.loading.set(true);
    this.borrowingService.getMyHistory().subscribe({
      next: (rows) => {
        this.records.set(rows);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(getErrorMessage(err, 'Failed to load your profile. Please try again.'));
      },
    });
  }

  isOverdue(r: BorrowRecord) {
    return !!r.dueDate && new Date(r.dueDate).getTime() < Date.now();
  }
}
