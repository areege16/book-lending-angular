import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, of, throwError } from 'rxjs';

import { API_BASE_URL } from '../core/config/api.config';
import { Book, BookPayload, PagedResult } from '../core/models';
import { getErrorMessage, unwrapData } from '../core/utils';

const MAX_PAGE_SIZE = 12;

@Injectable({ providedIn: 'root' })
export class BooksService {
  private readonly http = inject(HttpClient);

  getBooksPage(pageNumber: number, pageSize: number = 10) {
    const size = Math.min(MAX_PAGE_SIZE, Math.max(1, pageSize));
    const page = Math.max(1, pageNumber);
    return this.http
      .get<unknown>(`${API_BASE_URL}/api/Books`, {
        params: { pageNumber: String(page), pageSize: String(size) },
      })
      .pipe(
        map((res) => this.toPagedBooks(res)),
        catchError((err: unknown) => {
          const msg = getErrorMessage(err, '');
          if (/no books/i.test(msg)) {
            return of({
              items: [] as Book[],
              pageNumber: page,
              pageSize: size,
              totalCount: 0,
              totalPages: 0,
              hasNextPage: false,
              hasPreviousPage: false,
            });
          }
          return throwError(() => err);
        }),
      );
  }

  getBookById(id: number) {
    return this.http
      .get<unknown>(`${API_BASE_URL}/api/Books/${id}`)
      .pipe(map((res) => this.toBook(unwrapData(res))));
  }

  addBook(payload: BookPayload) {
    const formData = this.toFormData(payload);
    return this.http.post(`${API_BASE_URL}/api/Books/admin`, formData);
  }

  updateBook(id: number, payload: BookPayload) {
    const formData = this.toFormData(payload);
    return this.http.put(`${API_BASE_URL}/api/Books/admin/${id}`, formData);
  }

  deleteBook(id: number) {
    return this.http.delete(`${API_BASE_URL}/api/Books/admin/${id}`);
  }

  getCoverUrl(coverImageUrl?: string | null): string {
    if (!coverImageUrl) return '';
    if (coverImageUrl.startsWith('http://') || coverImageUrl.startsWith('https://'))
      return coverImageUrl;
    const base = API_BASE_URL.replace(/\/$/, '');
    return coverImageUrl.startsWith('/') ? base + coverImageUrl : base + '/' + coverImageUrl;
  }

  private toFormData(payload: BookPayload): FormData {
    const fd = new FormData();
    fd.append('Title', payload.title);
    fd.append('Author', payload.author);
    fd.append('ISBN', payload.isbn);
    fd.append('Description', payload.description);
    if (payload.coverImage) {
      fd.append('CoverImage', payload.coverImage);
    }
    return fd;
  }

  private toPagedBooks(res: unknown): PagedResult<Book> {
    const inner = unwrapData(res) as {
      items?: unknown[];
      pageNumber?: number;
      pageSize?: number;
      totalCount?: number;
      totalPages?: number;
      hasNextPage?: boolean;
      hasPreviousPage?: boolean;
    } | null;

    const items = (inner?.items ?? []).map((x) => this.toBook(x));
    const pageNumber = Number(inner?.pageNumber ?? 1);
    const pageSize = Math.max(1, Number(inner?.pageSize ?? 10));
    const totalCount = Number(inner?.totalCount ?? 0);

    let totalPages = 0;
    if (totalCount > 0) {
      totalPages = Number(inner?.totalPages ?? Math.ceil(totalCount / pageSize));
    }

    const hasNextPage =
      typeof inner?.hasNextPage === 'boolean' ? inner.hasNextPage : pageNumber < totalPages;
    const hasPreviousPage =
      typeof inner?.hasPreviousPage === 'boolean' ? inner.hasPreviousPage : pageNumber > 1;

    return {
      items,
      pageNumber,
      pageSize,
      totalCount,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    };
  }

  private toBook(raw: unknown): Book {
    const b = raw as Record<string, unknown>;
    return {
      id: Number(b['id'] ?? b['bookId'] ?? 0),
      title: String(b['title'] ?? ''),
      author: String(b['author'] ?? ''),
      isbn: String(b['isbn'] ?? ''),
      description: String(b['description'] ?? ''),
      coverImageUrl:
        (b['coverImageUrl'] as string | undefined) ??
        (b['coverUrl'] as string | undefined) ??
        (b['coverImage'] as string | undefined),
      isAvailable: Boolean(b['isAvailable'] ?? b['available'] ?? false),
    };
  }
}
