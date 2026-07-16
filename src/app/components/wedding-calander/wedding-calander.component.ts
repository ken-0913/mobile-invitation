import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { Invitation } from '../../models/invitation.model';
import { koreanTime } from '../../utils/date-format';

@Component({
  selector: 'app-wedding-calander',
  imports: [NgClass],
  templateUrl: './wedding-calander.component.html',
  styleUrl: './wedding-calander.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeddingCalanderComponent implements OnInit {
  @Input({ required: true }) invitation!: Invitation;

  currentMonth = 0;
  currentYear = 0;
  weddingDay = 0;
  daysInMonth: number[] = [];
  monthNames: string[] = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월',
  ];

  get timeText(): string {
    return koreanTime(this.invitation.wedding.dateTime);
  }

  ngOnInit(): void {
    const d = this.invitation.wedding.dateTime;
    this.currentYear = d.getFullYear();
    this.currentMonth = d.getMonth();
    this.weddingDay = d.getDate();
    this.generateCalendar();
  }

  generateCalendar(): void {
    this.daysInMonth = [];
    const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1);
    const lastDayOfMonth = new Date(this.currentYear, this.currentMonth + 1, 0);

    const firstDay = firstDayOfMonth.getDay();
    const lastDate = lastDayOfMonth.getDate();

    // 첫 주 시작 전의 공백
    for (let i = 0; i < firstDay; i++) {
      this.daysInMonth.push(0);
    }
    // 현재 월의 날짜들
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
