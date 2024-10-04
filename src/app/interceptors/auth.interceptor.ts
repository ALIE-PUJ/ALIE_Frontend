import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('[authInterceptor] Intercepting HTTP Request');

  if (typeof localStorage === 'undefined') {
    console.log('[authInterceptor] Skipping in server-side rendering');
    return next(req);
  } else if (localStorage.getItem('token') === null) {
    console.log('[authInterceptor] No token found in localStorage');
    return next(req);
  } else {
    console.log('[authInterceptor] Adding Authorization header to request');
    const reqAuth = req.clone({
      headers: req.headers.set('Authorization', 'Bearer ' + localStorage.getItem('token') || '')
    });

    return next(reqAuth);
  }
};
