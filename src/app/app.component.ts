import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {FirstMainComponent} from './first-main/first-main.component';
import {MatGridList, MatGridTile} from '@angular/material/grid-list';
import {WeddingCalanderComponent} from './wedding-calander/wedding-calander.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FirstMainComponent, MatGridList, MatGridTile, WeddingCalanderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'mobile-invitation-v1';
}
