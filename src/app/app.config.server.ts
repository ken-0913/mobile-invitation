import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { ORIGIN_VERIFY_SECRET } from './interceptors/origin-verify.interceptor';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    // SSR loopback /api 호출에 실을 시크릿. Cloud Run 환경변수에서 읽는다.
    { provide: ORIGIN_VERIFY_SECRET, useValue: process.env['ORIGIN_VERIFY_SECRET'] ?? null },
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
