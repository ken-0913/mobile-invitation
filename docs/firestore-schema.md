# Firestore 문서 스키마 — 청첩장 (invitations)

이 앱은 청첩장 1건을 Firestore 문서 1개로 저장한다. **문서 ID = 10자 랜덤 shortId**,
카카오 공유 URL(`/i/{shortId}`)의 shortId로 `doc(invitations/{shortId})` 단건 조회한다.

관련 결정은 [../CLAUDE.md](../CLAUDE.md)의 "아키텍처" 참고.

## 핵심 원칙

- **예식 일시는 `wedding.dateTime` 하나(Timestamp)만 저장한다.** 표지 영문 날짜, 달력 표시,
  "2024년 4월 11일 오전 11시 30분" 같은 표기는 모두 프론트에서 이 값으로 **파생**한다.
  (현재 하드코딩 코드는 같은 날짜가 3곳에 서로 다른 값으로 중복되어 있음 → 단일 소스로 제거.)
- **이미지 파일은 Cloud Storage에 저장하고 문서에는 URL만 담는다.** 문서 1MiB 제한 및
  base64 인라인 저장 지양(현재 갤러리에 base64가 박혀 있음 → URL로 교체).
- **계좌는 배열**로 둔다. 한국 청첩장은 신랑/신부 + 양가 부모 계좌까지 여러 개인 경우가 많다.
- 이름은 **한글·영문 둘 다** 저장한다. `bank`·`holder`는 **필수**.

## 컬렉션 구조

```
invitations/{shortId}                      ← 청첩장 문서 (아래 스키마)
invitations/{shortId}/guestbook/{msgId}    ← (향후) 방명록. 지금은 미사용.
```

## 문서 스키마

```jsonc
// Firestore: invitations/{shortId}   (문서 ID = 10자 shortId)
{
  // ── 메타 ──
  "status": "published",              // "draft" | "published"
  "createdAt": <Timestamp>,
  "updatedAt": <Timestamp>,

  // ── 예식 핵심 (단일 소스) ──
  "wedding": {
    "dateTime": <Timestamp>,          // 예: 2024-03-09T11:30:00+09:00 ← 유일한 일시 소스
    "venue": {
      "name": "아모리스 역삼",
      "hall": "1층 단독홀",           // 선택
      "address": "서울 강남구 …",     // 도로명 주소
      "lat": 37.5006,                 // 지도 마커 위도
      "lng": 127.0366                 // 지도 마커 경도
    }
  },

  // ── 신랑 / 신부 (한글·영문 모두 필수) ──
  "groom": {
    "name": "아영",                   // 한글 (필수)
    "nameEn": "AYOUNG",               // 영문 (필수)
    "father": "김정용",               // 부 성함 (선택)
    "mother": "전계선",               // 모 성함 (선택)
    "order": "아들"                   // 아들/차남 등 (선택)
  },
  "bride": {
    "name": "우준",
    "nameEn": "WOOJUN",
    "father": "…",
    "mother": "…",
    "order": "딸"
  },

  // ── 문구 ──
  "content": {
    "coverTitle": "YOU'RE INVITED TO THE WEDDING OF",
    "greeting": "인생은 누구나 …\n결혼은 따뜻한 사람과 하거라"   // 줄바꿈(\n) 포함
  },

  // ── 갤러리 (파일은 Cloud Storage, 문서엔 URL만) ──
  "gallery": {
    "coverImage": "https://…/cover.webp",       // 표지 대표 사진
    "images": ["https://…/1.webp", "https://…/2.webp"]   // 캐러셀 순서대로
  },

  // ── 계좌 (배열: 신랑측/신부측 각각 여러 개 가능. bank·number·holder 모두 필수) ──
  "accounts": {
    "groom": [
      { "bank": "국민", "number": "1234-1234-1234", "holder": "김아영" }
    ],
    "bride": [
      { "bank": "신한", "number": "4321-4321-4321", "holder": "이우준" }
    ]
  },

  // ── 교통 ──
  "transport": {
    "subway": "2호선 역삼역 7번출구 GS타워 지하1층 연결",
    "bus": "간선 146, 147, 360, 730",
    "parking": "GS타워 지하주차장 / 4시간 무료 / 1,000대"
  },

  // ── 카카오 공유 미리보기(OG) ──
  "share": {
    "title": "아영 ♥ 우준 결혼합니다",
    "description": "2024.03.09 (토) 오전 11:30 아모리스 역삼",
    "imageUrl": "https://…/og.jpg"    // 미리보기 썸네일 (없으면 gallery.coverImage 사용)
  }
}
```

## 필드 타입 요약

| 경로 | 타입 | 필수 | 비고 |
|---|---|---|---|
| `status` | string | ✅ | `draft` / `published` |
| `createdAt` / `updatedAt` | Timestamp | ✅ | |
| `wedding.dateTime` | Timestamp | ✅ | 모든 날짜 표기의 단일 소스 |
| `wedding.venue.name` | string | ✅ | |
| `wedding.venue.hall` | string | ⬜ | |
| `wedding.venue.address` | string | ✅ | |
| `wedding.venue.lat` / `lng` | number | ✅ | 지도 마커 |
| `groom/bride.name` | string | ✅ | 한글 |
| `groom/bride.nameEn` | string | ✅ | 영문 |
| `groom/bride.father` / `mother` / `order` | string | ⬜ | |
| `content.coverTitle` | string | ✅ | |
| `content.greeting` | string | ✅ | `\n` 줄바꿈 |
| `gallery.coverImage` | string(URL) | ✅ | |
| `gallery.images` | string[](URL) | ✅ | |
| `accounts.groom` / `accounts.bride` | array | ✅ | 각 원소 `{bank, number, holder}` 모두 필수 |
| `transport.subway` / `bus` / `parking` | string | ⬜ | |
| `share.title` / `description` | string | ✅ | 카카오 OG |
| `share.imageUrl` | string(URL) | ⬜ | 없으면 coverImage 대체 |

## 파생·제외 값 (문서에 저장하지 않음)

- **날짜의 각종 표기**(영문 날짜, 달력, "N년 N월 N일 오전 N시 N분") → `wedding.dateTime`에서 파생.
- **share.link** → 청첩장 자기 URL(`/i/{shortId}`)이라 런타임에 생성.
- **푸터 저작권** → 앱 공통 문구. 청첩장별 데이터 아님.
- **Kakao appkey / JavaScript key** → 앱 설정·시크릿. 문서 아님.

## 매핑: 현재 하드코딩 → 스키마

| 컴포넌트 | 현재 하드코딩 필드 | 스키마 경로 |
|---|---|---|
| first-main | title / brideName·groomName / date·time / address / (표지 이미지) | content.coverTitle / groom·bride.nameEn / wedding.dateTime / wedding.venue / gallery.coverImage |
| invite-comment | greeting(HTML) / 부모 성함 / 한글 이름 / 일시 / 홀 이름 | content.greeting / groom·bride.father·mother / groom·bride.name / wedding.dateTime / wedding.venue.name |
| wedding-calander | currentDate / weddingStartTime | wedding.dateTime |
| wedding-location | 일시 / 좌표 / subway·bus(address)·parking | wedding.dateTime / wedding.venue.lat·lng / transport.* |
| wedding-account | brideAccount / groomAccount | accounts.bride / accounts.groom |
| wedding-gallery-v2 | images[] | gallery.images |
| kakao-share | title / description / imageUrl | share.* |
| wedding-footer | copyRight | (제외, 앱 공통) |
