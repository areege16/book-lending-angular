import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpResponse,
  HttpStatusCode,
} from '@angular/common/http';
import { map } from 'rxjs';

export const apiResponseInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    map((event) => {
      if (event instanceof HttpResponse && event.body && typeof event.body === 'object') {
        const body = event.body as Record<string, unknown>;
        if (body['isSuccess'] === false) {
          const msg = (body['message'] ?? body['Message'] ?? 'An error occurred') as string;
          throw new HttpErrorResponse({
            error: body,
            status:
              typeof body['errorCode'] === 'number'
                ? (body['errorCode'] as number)
                : HttpStatusCode.BadRequest,
            statusText: msg,
          });
        }
      }
      return event;
    }),
  );
};
