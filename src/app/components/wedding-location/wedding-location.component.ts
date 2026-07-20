import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  Input,
  PLATFORM_ID,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Invitation } from '../../models/invitation.model';
import { koreanDateTimeFull } from '../../utils/date-format';
import { environment } from '../../../environments/environment';

// 신규 NCP 키는 ncpKeyId, 구 키는 ncpClientId 파라미터를 쓴다.
const NAVER_MAPS_SRC = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${environment.naverMapClientId}`;
declare const naver: any;

@Component({
  selector: 'app-wedding-location',
  imports: [],
  templateUrl: './wedding-location.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './wedding-location.component.scss',
})
export class WeddingLocationComponent implements AfterViewInit {
  @Input({ required: true }) invitation!: Invitation;

  @ViewChild('map', { static: false }) mapContainer!: ElementRef;
  map: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  get dateLine(): string {
    return koreanDateTimeFull(this.invitation.wedding.dateTime);
  }

  get subway(): string {
    return this.invitation.transport.subway ?? '';
  }

  get bus(): string {
    return this.invitation.transport.bus ?? '';
  }

  get parking(): string {
    return this.invitation.transport.parking ?? '';
  }

  ngAfterViewInit() {
    // 지도/외부 스크립트는 브라우저에서만 (SSR 서버에는 document/window 없음)
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.loadNaverMapScript()
      .then(() => this.initMap())
      .catch((error) => console.error('네이버 지도 스크립트 로드 실패:', error));
  }

  private loadNaverMapScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof naver !== 'undefined' && naver.maps) {
        resolve();
        return;
      }
      // 이미 삽입돼 로드 중이면 그 스크립트의 로드 완료를 기다린다.
      const existing = document.querySelector<HTMLScriptElement>(
        'script[data-naver-maps]',
      );
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', (error) => reject(error));
        return;
      }
      const script = document.createElement('script');
      script.src = NAVER_MAPS_SRC;
      script.async = true;
      script.dataset['naverMaps'] = 'true';
      script.onload = () => resolve();
      script.onerror = (error) => reject(error);
      document.head.appendChild(script);
    });
  }

  private initMap(): void {
    if (typeof naver === 'undefined' || !naver.maps) {
      console.error('네이버 지도 객체가 초기화되지 않았습니다.');
      return;
    }
    const { lat, lng } = this.invitation.wedding.venue;
    if (lat == null || lng == null) {
      return;
    }
    const position = new naver.maps.LatLng(lat, lng);
    this.map = new naver.maps.Map(this.mapContainer.nativeElement, {
      center: position,
      zoom: 16,
    });

    // 예식장 위치 마커
    new naver.maps.Marker({
      position,
      map: this.map,
    });
  }
}
