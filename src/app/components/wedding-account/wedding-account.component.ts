import {AfterViewInit, Component, input, signal} from '@angular/core';
import {MatCard, MatCardContent} from '@angular/material/card';
import {MatFormField} from '@angular/material/form-field';
import {MatOption, MatSelect} from '@angular/material/select';

@Component({
  selector: 'app-wedding-account',
  standalone: true,
  imports: [
    MatCardContent,
    MatCard,
    MatFormField,
    MatSelect,
    MatOption
  ],
  templateUrl: './wedding-account.component.html',
  styleUrl: './wedding-account.component.scss'
})
export class WeddingAccountComponent implements AfterViewInit {
  private inputElement: HTMLInputElement | undefined;

  ngAfterViewInit(): void {
    this.inputElement = document.querySelector('.custom-input') as HTMLInputElement;
  }

  async copyToClipboard(): Promise<void> {

    const inputElement = document.querySelector('.customer-input') as HTMLInputElement;
    if (inputElement) {
      try {
        // Clipboard API를 사용하여 클립보드에 복사
        await navigator.clipboard.writeText(inputElement.value);
        alert('계좌번호가 복사되었습니다!');
      } catch (err) {
        console.error('클립보드 복사 실패', err);
        alert('클립보드 복사에 실패했습니다.');
      }
    } else {
      alert('입력 요소를 찾을 수 없습니다.');
    }
  }
}
