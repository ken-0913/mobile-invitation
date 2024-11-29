import {Component, OnInit} from '@angular/core';
declare global {
  interface Window {
    Kakao: any;
  }
}


@Component({
  selector: 'app-kakao-share',
  standalone: true,
  imports: [
  ],
  templateUrl: './kakao-share.component.html',
  styleUrl: './kakao-share.component.scss'
})
export class KakaoShareComponent implements OnInit{

  private readonly JAVASCRIPT_KEY = '9b0205af17263ee2eba7167d5cb76a8e';
  constructor() {
    this.initializeKakao();
  }

  ngOnInit(): void {}
  private initializeKakao(): void {
    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(this.JAVASCRIPT_KEY);
    }
  }
  copyToClipboard(): void {
    // 현재 페이지 URL을 가져옵니다.
    const currentUrl = window.location.href;

    // 클립보드 API 사용
    navigator.clipboard.writeText(currentUrl).then(() => {
      alert('URL이 복사되었습니다!');
    }).catch(err => {
      console.error('URL 복사 실패:', err);
      alert('URL 복사 실패');
    });
  }
  share(): void {
    this.shareMessage({
      title: '공유할 제목',
      description: '공유할 설명',
      imageUrl: '공유할 이미지 URL',
      link: '공유할 링크'
    });
  }
  shareMessage(options: {
    title: string;
    description: string;
    imageUrl?: string;
    link: string;
  }): void {
    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: options.title,
        description: options.description,
        imageUrl: options.imageUrl,
        link: {
          mobileWebUrl: options.link,
          webUrl: options.link
        }
      },
      buttons: [
        {
          title: '웹으로 보기',
          link: {
            mobileWebUrl: options.link,
            webUrl: options.link
          }
        }
      ]
    });
  }


}
