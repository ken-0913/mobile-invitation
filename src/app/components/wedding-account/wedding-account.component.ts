import {AfterViewInit, Component, input, signal} from '@angular/core';
import {MatCard, MatCardContent} from '@angular/material/card';
import {MatFormField} from '@angular/material/form-field';
import {MatOption, MatSelect} from '@angular/material/select';
import {CdkCopyToClipboard} from '@angular/cdk/clipboard';

@Component({
  selector: 'app-wedding-account',
  standalone: true,
  imports: [
    MatCardContent,
    MatCard,
    MatFormField,
    MatSelect,
    MatOption,
    CdkCopyToClipboard
  ],
  templateUrl: './wedding-account.component.html',
  styleUrl: './wedding-account.component.scss'
})
export class WeddingAccountComponent{
  brideAccount = '1234-1234-1234';
  groomAccount = '4321-4321-4321';
  showCopiedAlert(): void {
    alert('계좌번호가 복사 되었습니다. ')
  }
}
