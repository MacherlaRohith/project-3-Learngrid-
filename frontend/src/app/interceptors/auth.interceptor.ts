import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HTTP_INTERCEPTORS } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenStorageService } from '../services/token-storage.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const tokenService = inject(TokenStorageService);
  const token = tokenService.getToken();
  
  if (token != null) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  return next(req);
};
