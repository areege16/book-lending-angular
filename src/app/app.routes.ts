import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './core/guards/auth.guards';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'books',
  },
  {
    path: 'login',
    title: 'Login | Readify',
    loadComponent: () => import('./features/auth/login.page').then((m) => m.LoginPageComponent),
  },
  {
    path: 'register',
    title: 'Register | Readify',
    loadComponent: () =>
      import('./features/auth/register.page').then((m) => m.RegisterPageComponent),
  },
  {
    path: 'books',
    title: 'Books | Readify',
    loadComponent: () =>
      import('./features/books/book-list.page').then((m) => m.BookListPageComponent),
  },
  {
    path: 'books/:id',
    title: 'Book Details | Readify',
    loadComponent: () =>
      import('./features/books/book-detail.page').then((m) => m.BookDetailPageComponent),
  },
  {
    path: 'admin/books',
    title: 'Manage Books | Readify',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./features/books/admin-books.page').then((m) => m.AdminBooksPageComponent),
  },
  {
    path: 'profile',
    title: 'My Profile | Readify',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/borrowing/profile.page').then((m) => m.ProfilePageComponent),
  },
  {
    path: 'admin/dashboard',
    title: 'Admin Dashboard | Readify',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./features/borrowing/admin-dashboard.page').then(
        (m) => m.AdminDashboardPageComponent,
      ),
  },
  {
    path: 'admin/delayed-books',
    title: 'Delayed Books | Readify',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./features/borrowing/delayed-books.page').then((m) => m.DelayedBooksPageComponent),
  },
  {
    path: '**',
    redirectTo: 'books',
  },
];
