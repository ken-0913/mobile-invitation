import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Invitation } from '../../models/invitation.model';
import { englishDate, englishTime } from '../../utils/date-format';

@Component({
  selector: 'app-first-main',
  imports: [],
  templateUrl: './first-main.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './first-main.component.scss',
})
export class FirstMainComponent {
  @Input({ required: true }) invitation!: Invitation;

  get coverTitle(): string {
    return this.invitation.content.coverTitle;
  }

  get namesEn(): string {
    return `${this.invitation.groom.nameEn} & ${this.invitation.bride.nameEn}`;
  }

  get dateText(): string {
    return englishDate(this.invitation.wedding.dateTime);
  }

  get timeText(): string {
    return englishTime(this.invitation.wedding.dateTime);
  }

  get venueText(): string {
    const v = this.invitation.wedding.venue;
    return v.hall ? `${v.name} ${v.hall}` : v.name;
  }

  get coverImage(): string {
    return this.invitation.gallery.coverImage;
  }
}
