import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {FirstMainComponent} from './components/first-main/first-main.component';
import {MatGridList, MatGridTile} from '@angular/material/grid-list';
import {WeddingCalanderComponent} from './components/wedding-calander/wedding-calander.component';
import {WeddingLocationComponent} from './components/wedding-location/wedding-location.component';
import {WeddingGalleryComponent} from './components/wedding-gallery/wedding-gallery.component';
import {WeddingAccountComponent} from './components/wedding-account/wedding-account.component';
import {KakaoShareComponent} from './components/kakao-share/kakao-share.component';
import {WeddingFoorterComponent} from './components/wedding-footer/wedding-foorter.component';
import {WeddingInviteCommentComponent} from './components/wedding-invite-comment/wedding-invite-comment.component';
import {TypekitLoaderComponent} from './components/type-kit-loader/type-kit-loader.component';
import {WeddingGalleryV2Component} from './components/wedding-gallery-v2/wedding-gallery-v2.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    FirstMainComponent,
    MatGridList,
    MatGridTile,
    WeddingCalanderComponent,
    WeddingLocationComponent,
    WeddingGalleryComponent,
    WeddingAccountComponent,
    KakaoShareComponent,
    WeddingFoorterComponent,
    WeddingInviteCommentComponent,
    TypekitLoaderComponent,
    WeddingGalleryV2Component
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'mobile-invitation-v1';
}
