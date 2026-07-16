import {
  Component,
  Inject,
  Input,
  OnInit,
  PLATFORM_ID,
  ChangeDetectionStrategy,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Invitation } from '../../models/invitation.model';

declare global {
  interface Window {
    Kakao: any;
  }
}

@Component({
  selector: 'app-kakao-share',
  imports: [],
  templateUrl: './kakao-share.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './kakao-share.component.scss',
})
export class KakaoShareComponent implements OnInit {
  @Input({ required: true }) invitation!: Invitation;

  private readonly JAVASCRIPT_KEY = '9b0205af17263ee2eba7167d5cb76a8e';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    // Kakao SDK 는 브라우저에서만 초기화 (SSR 서버엔 window 없음)
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(this.JAVASCRIPT_KEY);
    }
  }

  copyToClipboard(): void {
    const currentUrl = window.location.href;
    navigator.clipboard
      .writeText(currentUrl)
      .then(() => alert('URL이 복사되었습니다!'))
      .catch((err) => {
        console.error('URL 복사 실패:', err);
        alert('URL 복사 실패');
      });
  }

  share(): void {
    if (!isPlatformBrowser(this.platformId) || !window.Kakao) {
      return;
    }
    const link = window.location.href;
    const share = this.invitation.share;
    const image = share.imageUrl ?? this.invitation.gallery.coverImage;

    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: share.title,
        description: share.description,
        imageUrl: image,
        link: { mobileWebUrl: link, webUrl: link },
      },
      buttons: [
        {
          title: '청첩장 보기',
          link: { mobileWebUrl: link, webUrl: link },
        },
      ],
    });
  }
}
