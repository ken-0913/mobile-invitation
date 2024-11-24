import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {FirstMainComponent} from './first-main/first-main.component';
import {MatGridList, MatGridTile} from '@angular/material/grid-list';
import {WeddingCalanderComponent} from './wedding-calander/wedding-calander.component';
import {WeddingLocationComponent} from './wedding-location/wedding-location.component';
import {WeddingGalleryComponent} from './wedding-gallery/wedding-gallery.component';
import {WeddingAccountComponent} from './wedding-account/wedding-account.component';
import {KakaoShareComponent} from './kakao-share/kakao-share.component';
import {WeddingFoorterComponent} from './wedding-foorter/wedding-foorter.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FirstMainComponent, MatGridList, MatGridTile, WeddingCalanderComponent, WeddingLocationComponent, WeddingGalleryComponent, WeddingAccountComponent, KakaoShareComponent, WeddingFoorterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'mobile-invitation-v1';
}
