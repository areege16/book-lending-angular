import { HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from '@services';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  if (!token) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });

  return next(authReq).pipe(
    catchError((err) => {
      if (err.status === HttpStatusCode.Unauthorized) {
        auth.logout();
      }
      return throwError(() => err);
    }),
  );
};
