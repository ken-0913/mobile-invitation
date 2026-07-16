/**
 * 앱 환경 설정.
 *
 * useSampleData=true 이면 InvitationService 가 Firestore 대신 샘플 데이터를 반환한다.
 * 실제 Firestore 를 붙이려면:
 *   1) 아래 firebase 값을 실제 프로젝트 설정으로 교체
 *   2) useSampleData 를 false 로 변경
 */
export const environment = {
  production: false,

  /** true 면 Firestore 조회 없이 샘플 청첩장을 사용 (로컬 개발 기본값) */
  useSampleData: true,

  /** Firebase 웹 SDK 설정 — 실제 값으로 교체 필요 */
  firebase: {
    apiKey: 'REPLACE_ME',
    authDomain: 'REPLACE_ME.firebaseapp.com',
    projectId: 'REPLACE_ME',
    storageBucket: 'REPLACE_ME.appspot.com',
    messagingSenderId: 'REPLACE_ME',
    appId: 'REPLACE_ME',
  },
};
