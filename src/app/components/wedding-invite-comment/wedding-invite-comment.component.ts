import { Component } from '@angular/core';

@Component({
  selector: 'app-wedding-invite-comment',
  standalone: true,
  imports: [],
  templateUrl: './wedding-invite-comment.component.html',
  styleUrl: './wedding-invite-comment.component.scss'
})
export class WeddingInviteCommentComponent {
  brideFather= '김정용'
  brideMother= '전계선'
  groomFather= '김정용'
  groomMother= '전계선'
  brideName='우준'
  groomName='아영';
}
