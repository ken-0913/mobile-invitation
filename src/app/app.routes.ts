import { Routes } from '@angular/router';
import { InvitationPageComponent } from './pages/invitation-page/invitation-page.component';

export const routes: Routes = [
  // 카카오 공유 링크: /i/{shortId}
  { path: 'i/:shortId', component: InvitationPageComponent },
  // shortId 없이 접속하면 샘플/기본 청첩장
  { path: '', component: InvitationPageComponent },
];
