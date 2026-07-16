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

const url =
  '//dapi.kakao.com/v2/maps/sdk.js?appkey=9b0205af17263ee2eba7167d5cb76a8e&autoload=false';
declare const kakao: any;

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
    this.loadKakaoMapScript()
      .then(() => this.initMap())
      .catch((error) => console.error('카카오 맵 스크립트 로드 실패:', error));
  }

  loadKakaoMapScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src='${url}']`)) {
        resolve();
      }
      const script = document.createElement('script');
      script.src = url;
      script.type = 'text/javascript';
      script.onload = () => kakao.maps.load(resolve);
      script.onerror = (error) => reject(error);
      document.head.appendChild(script);
    });
  }

  initMap(): void {
    if (typeof kakao === 'undefined' || !kakao.maps) {
      console.error('카카오 맵 객체가 초기화되지 않았습니다.');
      return;
    }
    const { lat, lng } = this.invitation.wedding.venue;
    const container = this.mapContainer.nativeElement;
    const options = {
      center: new kakao.maps.LatLng(lat, lng),
      level: 3,
    };
    this.map = new kakao.maps.Map(container, options);

    // 예식장 위치 마커
    new kakao.maps.Marker({
      map: this.map,
      position: new kakao.maps.LatLng(lat, lng),
    });
  }
}
