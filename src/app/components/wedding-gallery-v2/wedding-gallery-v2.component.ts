import {Component, HostListener, ChangeDetectionStrategy, Input} from '@angular/core';
import { Invitation } from '../../models/invitation.model';


@Component({
    selector: 'app-wedding-gallery-v2',
    imports: [],
    templateUrl: 'wedding-gallery-v2.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: 'wedding-gallery-v2.component.scss'
})
export class WeddingGalleryV2Component {
  @Input({ required: true }) invitation!: Invitation;

  get images(): string[] {
    return this.invitation.gallery.images;
  }

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
