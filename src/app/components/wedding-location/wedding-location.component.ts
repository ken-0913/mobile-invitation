import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
const url = "//dapi.kakao.com/v2/maps/sdk.js?appkey=9b0205af17263ee2eba7167d5cb76a8e&autoload=false"
declare const kakao: any;

@Component({
  selector: 'app-wedding-location',
  standalone: true,
  imports: [],
  templateUrl: './wedding-location.component.html',
  styleUrl: './wedding-location.component.scss'
})
export class WeddingLocationComponent implements AfterViewInit {

  @ViewChild('map', { static: false }) mapContainer!: ElementRef;  // map을 표시할 DOM 요소 참조
  map: any;
  currentYear: number = 2024;
  monthNames: number = 4;
  currentDate: number =11;
  days: string = '일'
  anteMeridiem: string = '오전'
  weddingStartHourTime: number = 11
  weddingStartMinuteTime: number = 30
// {{ currentYear }}
// {{ monthNames[currentMonth] }}
// {{currentDate.getDate()}}일
// {{ anteMeridiem }}
// {{weddingStartTime}}
  subway ='2호선 역삼역 7번출구 GS타워 지하 1층과 연결'
  address ='간선 146, 147, 360, 730'
  parking ='GS타워 지하주차장 / 4시간 무료 주차 / 1,000대 가능홀 입구에서 차량 등록 해드리겠습니다.'

  constructor() { }

  ngAfterViewInit() {
    // 스크립트 로드 및 지도 초기화
    this.loadKakaoMapScript().then(() => {
      this.initMap();
    }).catch((error) => {
      console.error("카카오 맵 스크립트 로드 실패:", error);
    });
  }

  // 카카오 맵 스크립트를 비동기적으로 로드하는 함수
  loadKakaoMapScript(): Promise<void> {
        return new Promise((resolve, reject) => {
      // 이미 스크립트가 로드되어 있으면 바로 resolve
      if (document.querySelector(`script[src='${url}']`)) {
        resolve();
      }

      // 새로운 script 태그 생성
      const script = document.createElement('script');
      script.src = url;
      script.type = 'text/javascript';
      script.onload = () => {
        // 카카오 맵 SDK 로드 완료 후 초기화
        kakao.maps.load(resolve);  // 스크립트 로딩 후 SDK 초기화
      };
      script.onerror = (error) => reject(error);  // 로드 실패 시 reject

      document.head.appendChild(script);  // document에 script 태그 추가
    });
  }

  // 카카오 맵 초기화 함수
  initMap(): void {
    // kakao.maps 객체가 존재하는지 확인
    if (!kakao || !kakao.maps) {
      console.error("카카오 맵 객체가 초기화되지 않았습니다.");
      return;
    }

    const container = this.mapContainer.nativeElement;  // mapContainer DOM 엘리먼트 참조
    const options = {
      center: new kakao.maps.LatLng(33.450701, 126.570667),  // 기본 위치 설정 (위도, 경도)
      level: 3  // 확대 수준
    };

    // 지도 생성
    this.map = new kakao.maps.Map(container, options);
  }
}
