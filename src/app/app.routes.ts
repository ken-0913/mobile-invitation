import { Routes } from '@angular/router';
import { InvitationPageComponent } from './pages/invitation-page/invitation-page.component';
import { NotFoundPageComponent } from './pages/not-found-page/not-found-page.component';

export const routes: Routes = [
  // 카카오 공유 링크: /i/{shortId}
  { path: 'i/:shortId', component: InvitationPageComponent },
  // 루트 페이지는 운영하지 않는다.
  { path: '', component: NotFoundPageComponent, pathMatch: 'full' },
  { path: '**', component: NotFoundPageComponent },
];
