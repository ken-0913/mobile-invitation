import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { Invitation } from '../../models/invitation.model';

@Component({
  selector: 'app-wedding-account',
  imports: [CdkCopyToClipboard],
  templateUrl: './wedding-account.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './wedding-account.component.scss',
})
export class WeddingAccountComponent {
  @Input({ required: true }) invitation!: Invitation;

  showCopiedAlert(): void {
    alert('계좌번호가 복사 되었습니다. ');
  }
}
