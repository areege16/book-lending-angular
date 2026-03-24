import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';

import { API_BASE_URL } from '../core/config/api.config';
import { BorrowRecord } from '../core/models';
import { unwrapData } from '../core/utils';

@Injectable({ providedIn: 'root' })
export class BorrowingService {
  private readonly http = inject(HttpClient);

  borrowBook(bookId: number) {
    return this.http.post(`${API_BASE_URL}/api/Borrowing/reader/borrow/${bookId}`, {});
  }

  returnBook(bookId: number) {
    return this.http.post(`${API_BASE_URL}/api/Borrowing/reader/return/${bookId}`, {});
  }

  getMyHistory() {
    return this.http
      .get<unknown>(`${API_BASE_URL}/api/Borrowing/reader/my-history`)
      .pipe(map((res) => this.toRecords(res)));
  }

  getAdminRecords() {
    return this.http
      .get<unknown>(`${API_BASE_URL}/api/Borrowing/admin/records`)
      .pipe(map((res) => this.toRecords(res)));
  }

  private toRecords(raw: unknown): BorrowRecord[] {
    const data = unwrapData(raw);
    const rows = Array.isArray(data)
      ? data
      : ((data as { items?: unknown[] })?.items ?? (raw as { items?: unknown[] })?.items ?? []);
    return rows.map((row) => {
      const x = row as Record<string, unknown>;
      const returnDate = x['returnDate'] as string | null | undefined;
      const dueDate = x['dueDate'] as string;
      const isOverdueFromApi = Boolean(x['isOverdue']);
      const computedOverdue = !!dueDate && !returnDate && new Date(dueDate).getTime() < Date.now();
      return {
        bookId: Number(x['bookId'] ?? x['id'] ?? 0),
        bookTitle: String(x['bookTitle'] ?? x['title'] ?? ''),
        bookAuthor: x['bookAuthor'] as string,
        borrowedAt: x['borrowDate'] as string,
        dueDate,
        returnedAt: returnDate ?? null,
        isReturned: !!returnDate,
        isOverdue: isOverdueFromApi || computedOverdue,
        userName: x['userName'] as string,
        userEmail: x['userEmail'] as string,
      };
    });
  }
}
