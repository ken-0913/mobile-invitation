import { Invitation } from '../models/invitation.model';

/**
 * 로컬 개발 / Firestore 미설정 시 사용하는 샘플 청첩장.
 * 기존 컴포넌트들에 하드코딩되어 있던 값을 하나의 문서로 통합했다.
 * (원본은 신랑/신부 라벨이 뒤바뀌어 있어 바로잡음: 신랑=우준, 신부=아영)
 */
export const SAMPLE_INVITATION: Invitation = {
  status: 'published',
  wedding: {
    // 예식 일시 단일 소스
    dateTime: new Date(2024, 10, 19, 11, 30), // 2024-11-19 11:30
    venue: {
      name: '아모리스 역삼',
      hall: '1층 단독홀',
      address: '서울 강남구 테헤란로 152 GS타워',
      lat: 37.5006,
      lng: 127.0366,
    },
  },
  groom: {
    name: '우준',
    nameEn: 'WOOJUN',
    father: '김정용',
    mother: '전계선',
    order: '아들',
  },
  bride: {
    name: '아영',
    nameEn: 'AYOUNG',
    father: '이성호',
    mother: '박은주',
    order: '딸',
  },
  content: {
    coverTitle: "YOU'RE INVITED TO THE WEDDING OF",
    greeting:
      '"인생은 누구나 비슷한 길을 걸어간단다.\n' +
      '결국엔 늙어서 지난 날을 추억하는 것일 뿐이야.\n' +
      '그러니 결혼은 따뜻한 사람과 하거라"\n\n' +
      '평생 서로에게 따뜻함이 될 것을 약속하는 자리에\n' +
      '늘 곁에서 아껴 주신 고마운 분들을 모십니다.',
  },
  gallery: {
    coverImage:
      'https://i.namu.wiki/i/iP1Jv2tdRbClaIjZnJ3C3qgoi6nMxk-gVW2xmhf3BeB2IYX9vYYf_jhHc1YiZ-6NOgaPBeja5j4mjZuiysjCfg.webp',
    images: [
      'https://i.namu.wiki/i/iP1Jv2tdRbClaIjZnJ3C3qgoi6nMxk-gVW2xmhf3BeB2IYX9vYYf_jhHc1YiZ-6NOgaPBeja5j4mjZuiysjCfg.webp',
      'https://picsum.photos/seed/wedding2/800/1200',
      'https://picsum.photos/seed/wedding3/800/1200',
    ],
  },
  accounts: {
    groom: [{ bank: '국민', number: '1234-1234-1234', holder: '김우준' }],
    bride: [{ bank: '신한', number: '4321-4321-4321', holder: '이아영' }],
  },
  transport: {
    subway: '2호선 역삼역 7번출구 GS타워 지하 1층과 연결',
    bus: '간선 146, 147, 360, 730',
    parking:
      'GS타워 지하주차장 / 4시간 무료 주차 / 1,000대 가능. 홀 입구에서 차량 등록 해드리겠습니다.',
  },
  share: {
    title: '우준 ♥ 아영 결혼합니다',
    description: '2024.11.19 (화) 오전 11:30 아모리스 역삼',
    imageUrl:
      'https://i.namu.wiki/i/iP1Jv2tdRbClaIjZnJ3C3qgoi6nMxk-gVW2xmhf3BeB2IYX9vYYf_jhHc1YiZ-6NOgaPBeja5j4mjZuiysjCfg.webp',
  },
};
