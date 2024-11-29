import {ChangeDetectionStrategy, Component, model} from '@angular/core';
import {MatCard} from '@angular/material/card';
import {MatCalendar} from '@angular/material/datepicker';
import {provideNativeDateAdapter} from '@angular/material/core';
import {NgClass, NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-wedding-calander',
  standalone: true,
  imports: [
    MatCard,
    MatCalendar,
    NgForOf,
    NgIf,
    NgClass
  ],
  templateUrl: './wedding-calander.component.html',
  styleUrl: './wedding-calander.component.scss',
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeddingCalanderComponent {
  currentDate: Date;
  currentMonth: number;
  currentYear: number;
  daysInMonth: number[];
  monthNames: string[];
  anteMeridiem: string;
  weddingStartTime: string;

  constructor() {
    this.currentDate = new Date('2024-11-19');
    this.currentMonth = 0; // 현재 월
    this.currentYear = 2025; // 현재 연도
    this.monthNames = [
      '1월', '2월', '3월', '4월', '5월', '6월',
      '7월', '8월', '9월', '10월', '11월', '12월'
    ];
    this.daysInMonth = [];
    this.anteMeridiem= '오전'; //if true, AM;
    this.weddingStartTime = '11시 30분'
  }

  ngOnInit(): void {
    this.generateCalendar();
  }

  generateCalendar(): void {
    this.daysInMonth = [];
    const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1);
    const lastDayOfMonth = new Date(this.currentYear, this.currentMonth + 1, 0);

    // 첫 번째 날짜가 속한 주의 날짜
    const firstDay = firstDayOfMonth.getDay();

    // 해당 월의 마지막 날짜
    const lastDate = lastDayOfMonth.getDate();

    // 첫 주 시작 전의 공백을 추가
    for (let i = 0; i < firstDay; i++) {
      this.daysInMonth.push(0);
    }

    // 현재 월의 날짜들을 추가
    for (let i = 1; i <= lastDate; i++) {
      this.daysInMonth.push(i);
    }
  }


  createRows(): number[][] {
    const rows: number[][] = [];
    let row: number[] = [];
    for (let i = 0; i < this.daysInMonth.length; i++) {
      row.push(this.daysInMonth[i]);
      if (row.length === 7) {
        rows.push(row);
        row = [];
      }
    }
    if (row.length > 0) {
      rows.push(row);
    }
    return rows;
  }
}
