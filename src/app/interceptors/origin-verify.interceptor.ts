import { InjectionToken, inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';

/**
 * SSR loopback 호출용 공유 시크릿.
 * 서버 설정(app.config.server.ts)에서만 process.env 값으로 주입한다.
 * 브라우저에는 제공되지 않으므로 값이 null → 인터셉터는 no-op.
 */
export const ORIGIN_VERIFY_SECRET = new InjectionToken<string | null>(
  'ORIGIN_VERIFY_SECRET',
);

/**
 * SSR 이 자기 자신의 /api 를 loopback 호출할 때 X-Origin-Verify 헤더를 붙인다.
 * 원본(Express)이 Cloudflare 경유가 아닌 요청을 403 으로 막기 때문에,
 * 이 내부 호출도 시크릿을 실어야 통과한다.
 */
export const originVerifyInterceptor: HttpInterceptorFn = (req, next) => {
  const secret = inject(ORIGIN_VERIFY_SECRET, { optional: true });
  if (secret && req.url.includes('/api/')) {
    return next(
      req.clone({ setHeaders: { 'X-Origin-Verify': secret } }),
    );
  }
  return next(req);
};
