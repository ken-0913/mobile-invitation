/**
 * 청첩장 도메인 모델.
 * Firestore 문서(invitations/{shortId})와 1:1 대응한다.
 * 스키마 문서: docs/firestore-schema.md
 *
 * 주의: wedding.dateTime 은 앱 내부에서 JS Date 로 다룬다.
 * Firestore 에서 읽을 때 Timestamp -> Date 변환은 InvitationService 에서 처리한다.
 */

export interface Person {
  /** 한글 이름 (필수) */
  name: string;
  /** 영문 이름 (필수) */
  nameEn: string;
  /** 부 성함 (선택) */
  father?: string;
  /** 모 성함 (선택) */
  mother?: string;
  /** 아들/차남/딸 등 관계 표기 (선택) */
  order?: string;
}

export interface Venue {
  name: string;
  hall?: string;
  address: string;
  /** 지도 마커 위도 */
  lat: number;
  /** 지도 마커 경도 */
  lng: number;
}

export interface Wedding {
  /** 예식 일시 — 모든 날짜 표기의 단일 소스 */
  dateTime: Date;
  venue: Venue;
}

export interface InvitationContent {
  coverTitle: string;
  /** 인사말 본문. 줄바꿈(\n) 포함 */
  greeting: string;
}

export interface Gallery {
  /** 표지 대표 사진 URL */
  coverImage: string;
  /** 캐러셀 이미지 URL 배열 (순서대로) */
  images: string[];
}

export interface Account {
  bank: string;
  number: string;
  holder: string;
}

export interface Accounts {
  groom: Account[];
  bride: Account[];
}

export interface Transport {
  subway?: string;
  bus?: string;
  parking?: string;
}

export interface ShareInfo {
  title: string;
  description: string;
  /** 미리보기 썸네일 URL. 없으면 gallery.coverImage 사용 */
  imageUrl?: string;
}

export interface Invitation {
  status: 'draft' | 'published';
  createdAt?: Date;
  updatedAt?: Date;
  wedding: Wedding;
  groom: Person;
  bride: Person;
  content: InvitationContent;
  gallery: Gallery;
  accounts: Accounts;
  transport: Transport;
  share: ShareInfo;
}
