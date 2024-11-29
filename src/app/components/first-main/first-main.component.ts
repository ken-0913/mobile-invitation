import { Component } from '@angular/core';
import { MatGridList, MatGridTile } from '@angular/material/grid-list';

@Component({
  selector: 'app-first-main',
  standalone: true,
  imports: [
    MatGridList,
    MatGridTile,
  ],
  templateUrl: './first-main.component.html',
  styleUrl: './first-main.component.scss'
})
export class FirstMainComponent {
  title = "YOU'RE INVITED TO THE WEDDING OF";
  brideName = 'WOOJUN';
  groomName = 'AYOUNG';
  date ='SATURDAY, MARCH 9TH, 2024';
  time = 'AT 11:30 IN THE MORNING';
  address = 'SINGLEHALL, AMORIS YEOKSAM'

}
