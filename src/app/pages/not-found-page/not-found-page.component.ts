import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  RESPONSE_INIT,
  inject,
} from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-not-found-page',
  templateUrl: './not-found-page.component.html',
  styleUrl: './not-found-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPageComponent implements OnInit {
  private title = inject(Title);
  private responseInit = inject(RESPONSE_INIT, { optional: true });

  ngOnInit(): void {
    this.title.setTitle('페이지를 찾을 수 없습니다');

    if (this.responseInit) {
      this.responseInit.status = 404;
    }
  }
}
