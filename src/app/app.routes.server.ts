import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // 청첩장은 요청 시점에 데이터/OG 태그를 서버 렌더링한다 (프리렌더 아님).
  { path: 'i/:shortId', renderMode: RenderMode.Server },
  { path: '', renderMode: RenderMode.Server, status: 404 },
  { path: '**', renderMode: RenderMode.Server, status: 404 },
];
