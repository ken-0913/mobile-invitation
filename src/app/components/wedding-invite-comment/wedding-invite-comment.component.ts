import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Invitation } from '../../models/invitation.model';
import { koreanDateTimeFull } from '../../utils/date-format';

@Component({
  selector: 'app-wedding-invite-comment',
  imports: [],
  templateUrl: './wedding-invite-comment.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './wedding-invite-comment.component.scss',
})
export class WeddingInviteCommentComponent {
  @Input({ required: true }) invitation!: Invitation;

  get dateLine(): string {
    return koreanDateTimeFull(this.invitation.wedding.dateTime);
  }

  get hallText(): string {
    const v = this.invitation.wedding.venue;
    return v.hall ? `${v.name} ${v.hall}` : v.name;
  }
}
