# CLAUDE.md

이 파일은 이 저장소에서 작업하는 Claude(및 개발자)를 위한 안내 문서입니다.

## 프로젝트 개요

- **무엇을 만드는가**: 모바일 청첩장(웨딩 인비테이션)을 만드는 웹 애플리케이션이다.
- 청첩장은 **카카오톡으로 링크를 공유**해 배포한다. (`index.html`에 Kakao JS SDK, `kakao-share` 컴포넌트 존재)
- 한 페이지 스크롤형 청첩장으로, 표지 → 인사말 → 예식일 → 갤러리 → 오시는 길 → 계좌 → 공유 → 푸터 순으로 섹션이 이어진다.

## 방향 / 목표 (아직 미구현)

> 아래는 앞으로 구현할 방향이다. 현재 코드에는 반영되어 있지 않다.

1. **각 청첩장 정보는 데이터베이스에 저장한다.**
   - 현재는 신랑/신부 이름·일시·장소 등이 각 컴포넌트에 **하드코딩**되어 있다
     (예: `src/app/components/first-main/first-main.component.ts`).
   - 향후 이 값들을 DB에서 불러오도록 바꾼다. 여러 청첩장을 데이터로 관리하는 구조가 목표.
2. **URL은 짧을수록 좋다.**
   - 카카오톡으로 링크를 배포하므로, 청첩장 식별자를 가능한 한 짧게 설계한다.
   - **경로 파라미터** 방식: `example.com/i/{shortId}`.
   - **식별자(shortId)는 10자 랜덤 short code** (base62/nanoid 등). 순번 ID(1,2,3…) 금지 —
     청첩장에 이름·주소·계좌가 담기므로 추측 가능한 ID는 개인정보 노출 위험. 전체 UUID는 너무 길다.
     10자 랜덤이면 짧으면서 사실상 추측 불가능(예: base62 → 62^10 ≈ 8.4×10^17).
   - 현재는 라우팅이 비어 있다(`src/app/app.routes.ts`가 빈 배열).

## 기술 스택

- **Angular 22** (standalone 컴포넌트, `@if`/`@for` 제어 흐름 문법) + **Angular Material 22**
- **Node 요구 버전**: `^22.22.3 || ^24.15.0 || >=26.0.0` — Angular 22가 요구.
  - nvm 사용 시 `nvm use 24` 등으로 맞춰야 한다. 오래된 Node에서는 빌드가 실패한다.
- 스타일: SCSS. `ng-gallery`가 의존성에 있으나 **사용되지 않는 죽은 코드**
  (`wedding-gallery` v1 컴포넌트에서만 import되며, 화면에는 커스텀 캐러셀인 `wedding-gallery-v2`가 붙어 있다).

## 명령어

```bash
npm start      # ng serve — http://localhost:4200/ 개발 서버
npm run build  # ng build — dist/ 에 프로덕션 번들 생성
npm test       # ng test — Karma + Jasmine 단위 테스트
```

## 구조

- `src/app/app.component.html` — 청첩장 섹션들을 순서대로 조립하는 진입점.
- `src/app/components/*` — 섹션별 컴포넌트:
  - `first-main` (표지), `wedding-invite-comment` (인사말), `wedding-calander` (예식일),
    `wedding-gallery-v2` (사진 캐러셀, 사용 중), `wedding-gallery` (v1, 미사용),
    `wedding-location` (오시는 길/지도), `wedding-account` (계좌), `kakao-share` (카카오 공유),
    `wedding-footer` (푸터), `type-kit-loader` (폰트 로더).
- `src/styles.scss` — 전역 스타일. 본문은 `.container`(모바일 우선, `max-width: 480px` 중앙 정렬).

## 레이아웃 / 모바일

- 모바일 우선. 본문 컨테이너는 최대 480px 폭으로 중앙 정렬한다.
- 전역적으로 `box-sizing: border-box`, `img { max-width: 100% }`, `overflow-x: hidden`을 둔다
  (`src/styles.scss`). 고정 px 폭으로 인한 가로 스크롤을 피할 것.

## 아키텍처

카카오 공유 링크로 접속하면, URL의 short code로 DB에서 청첩장 정보를 가져와 렌더링한다.

```
카카오 공유 링크:  https://도메인/i/{shortId}     ← 10자 랜덤 short code
        │
   Cloud Run 컨테이너 (Angular SSR)
     - 라우트 파라미터 shortId 추출
     - Firestore 문서 조회: doc(invitations/{shortId})
     - 청첩장별 Open Graph 메타태그를 서버에서 렌더링(카카오 미리보기용)
        │
   조회 결과 { 신랑신부, 일시, 장소, 사진, 계좌... } 를
   컴포넌트에 주입해 렌더링
```

- **식별자**: 10자 랜덤 short code (경로 파라미터 `/i/{shortId}`). 위 "방향/목표 2" 참고.
- **API 계층 필수**: 정적 SPA는 DB에 직접 접근하지 않는다(자격증명 노출 방지).
  브라우저 → API → DB → JSON 흐름.
- **카카오 OG 미리보기**: 순수 SPA는 크롤러가 JS를 실행하지 않아 미리보기가 비거나 동일해진다.
  Cloud Run + **Angular SSR**로 청첩장별 OG 태그를 서버 렌더링하여 해결한다.
- **컴포넌트 데이터 주입**: 각 섹션 컴포넌트는 `@Input({required:true}) invitation` 으로
  데이터를 받는다. `InvitationPageComponent`(`/i/:shortId` 라우트)가 `InvitationService`로
  청첩장을 조회해 각 섹션에 주입한다. (하드코딩 제거 완료)

### 구현 현황
- ✅ 도메인 모델(`src/app/models/invitation.model.ts`) + 샘플(`src/app/data/sample-invitation.ts`)
- ✅ `InvitationService`(`firebase/firestore/lite`, `environment.useSampleData` 폴백)
- ✅ 라우팅 `/i/:shortId` + `InvitationPageComponent` + 섹션 컴포넌트 `@Input` 리팩터링
- ✅ Angular SSR + 청첩장별 OG 메타태그(서버 렌더링) + Cloud Run `Dockerfile`
- ⬜ 실제 Firebase 프로젝트 연결(현재 `environment.ts` 값은 placeholder, `useSampleData=true`)
- ⬜ 이미지 Cloud Storage 업로드, 청첩장 생성/관리(쓰기) 경로, shortId 생성기

## 배포

- **도메인/CDN**: **Firebase Hosting** (`invitation.aor.kr`, 기본 `mobile-invitation-prod.web.app`).
  정적 파일은 두지 않고 모든 요청을 rewrite 로 Cloud Run 서비스 `mobile-invitation` 에 프록시한다
  (`firebase.json` 참고). 커스텀 도메인은 CNAME `invitation.aor.kr → mobile-invitation-prod.web.app`.
  새 도메인을 붙이면 `cloudrun/service.yaml` 의 `NG_ALLOWED_HOSTS` 에도 추가해야 한다
  (Hosting 이 legacy 형식 `*-pfppe2wxla-du.a.run.app` Host 로 프록시하므로 그 항목도 필요).
- **GCP Cloud Run** (컨테이너 기반). Angular **SSR** 앱을 컨테이너로 빌드해 배포한다.
  - `Dockerfile` (멀티스테이지 빌드→런타임, Node 24-slim). 이미 저장소에 있음.
  - SSR 서버는 `PORT` 환경변수 사용(Cloud Run 주입, 기본 8080). `src/server.ts` 참고.
  - **`NG_ALLOWED_HOSTS` 필수**: Angular 22 SSR 은 SSRF 방지로 Host 헤더를 검증한다.
    배포 도메인(예: `xxx.run.app,yourdomain.com`)을 지정하지 않으면 400. 로컬은 `'*'` 가능.
  - 로컬 실행: `npm run serve:ssr:mobile-invitation-v1`.
- **DB**: **Firestore** (GCP 서버리스 NoSQL). 청첩장 1건 = 문서 1개, 문서 ID = 10자 shortId.
  - 조회는 `doc(invitations/{shortId})` 단건 read. 서버리스·저렴하며, 향후 방명록/RSVP 등
    쓰기 기능도 재설계 없이 확장 가능(이 이유로 객체 스토리지 대신 Firestore 채택).
  - **문서 스키마**: [docs/firestore-schema.md](docs/firestore-schema.md) 참고.
  - 이미지 파일은 Cloud Storage에 저장하고 문서에는 URL만 담는다.
- **폐기 예정**: 기존 `.github/workflows/azure-static-web-apps.yaml`(Azure Static Web Apps)는
  Cloud Run으로 전환하면서 제거/교체한다.
