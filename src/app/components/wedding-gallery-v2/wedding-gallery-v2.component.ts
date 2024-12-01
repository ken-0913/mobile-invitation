import {Component, HostListener} from '@angular/core';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-wedding-gallery-v2',
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: 'wedding-gallery-v2.component.html',
  styleUrl: 'wedding-gallery-v2.component.scss'
})
export class WeddingGalleryV2Component {
  images: string[] = [
    'https://i.namu.wiki/i/iP1Jv2tdRbClaIjZnJ3C3qgoi6nMxk-gVW2xmhf3BeB2IYX9vYYf_jhHc1YiZ-6NOgaPBeja5j4mjZuiysjCfg.webp',
    'data:image/webp;base64,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',
    'https://i.namu.wiki/i/iP1Jv2tdRbClaIjZnJ3C3qgoi6nMxk-gVW2xmhf3BeB2IYX9vYYf_jhHc1YiZ-6NOgaPBeja5j4mjZuiysjCfg.webp'
  ];

  currentIndex = 0; // 현재 슬라이드 인덱스
  startX = 0; // 시작 X 좌표
  currentTranslate = 0; // 현재 translate 값 (%)
  prevTranslate = 0; // 이전 translate 값 (%)
  isDragging = false; // 드래그 중 여부

  // 터치 또는 마우스 시작 이벤트
  onSwipeStart(event: MouseEvent | TouchEvent): void {
    this.startX = this.getPositionX(event);
    this.isDragging = true;
  }

  // 터치 또는 마우스 이동 이벤트
  onSwipeMove(event: MouseEvent | TouchEvent): void {
    if (!this.isDragging) return;

    const currentX = this.getPositionX(event);
    const deltaX = currentX - this.startX;

    this.currentTranslate = this.prevTranslate + (deltaX / window.innerWidth) * 100; // px -> %
  }

  // 터치 또는 마우스 종료 이벤트
  onSwipeEnd(): void {
    this.isDragging = false;

    const movedBy = this.currentTranslate - this.prevTranslate;
    const threshold = 30; // 이동 임계값 (%)

    if (movedBy < -threshold && this.currentIndex < this.images.length - 1) {
      this.currentIndex++; // 오른쪽으로 이동
    } else if (movedBy > threshold && this.currentIndex > 0) {
      this.currentIndex--; // 왼쪽으로 이동
    }

    this.updateTranslate();
  }

  // translate 값 업데이트
  private updateTranslate(): void {
    this.currentTranslate = -this.currentIndex * 100;
    this.prevTranslate = this.currentTranslate;
  }

  // 마우스 또는 터치 이벤트에서 X 좌표 추출
  private getPositionX(event: MouseEvent | TouchEvent): number {
    return event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
  }

  // 브라우저 밖에서 드래그 종료 처리
  @HostListener('window:mouseup')
  @HostListener('window:touchend')
  onEndOutside(): void {
    if (this.isDragging) this.onSwipeEnd();
  }
}
