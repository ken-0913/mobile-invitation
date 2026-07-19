# Mobile Invitation V1

모바일 청첩장 공개 페이지다.

## Architecture

```text
Browser / Angular SSR
  -> mobild-invitation-v1 Express route (/api/invitations/:slug)
  -> admin backend public API (/api/public/invitations/:slug)
  -> Firebase Firestore
```

이 프로젝트는 Firebase에 직접 접근하지 않는다. 동일한 Firebase DB는 `../admin` 백엔드가 읽고, 공개 프론트는 백엔드 API만 호출한다.

## Runtime Environment

```sh
BACKEND_API_BASE_URL=http://192.168.0.134:18080
PORT=8080
```

로컬 Docker 테스트 예시:

```sh
docker build -t mobild-invitation-v1:backend-api .
docker run --rm -p 15174:8080 \
  -e BACKEND_API_BASE_URL=http://192.168.0.134:18080 \
  -e NG_ALLOWED_HOSTS=192.168.0.134 \
  mobild-invitation-v1:backend-api
```

샘플 URL:

```text
http://192.168.0.134:15174/i/sample-wedding-04
```
