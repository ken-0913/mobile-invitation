# syntax=docker/dockerfile:1

# ---- 빌드 스테이지 ----
FROM node:24-slim AS build
WORKDIR /app

# 의존성 먼저 설치 (레이어 캐시)
COPY package*.json ./
RUN npm ci

# 소스 복사 후 SSR 빌드
COPY . .
RUN npm run build

# ---- 런타임 스테이지 ----
FROM node:24-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# 런타임 의존성만 설치 (@angular/ssr, express, firebase 등)
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# 빌드 산출물 복사
COPY --from=build /app/dist ./dist

# Cloud Run 은 PORT 환경변수를 주입한다 (server.ts 가 이를 사용).
ENV PORT=8080
ENV BACKEND_API_BASE_URL="http://localhost:18080"

# SSRF 보호(Angular SSR). 배포 도메인으로 반드시 교체.
#   예: NG_ALLOWED_HOSTS="mobile-invitation-xxxx.run.app,yourdomain.com"
# Cloud Run 프록시 뒤에 있으므로 X-Forwarded-Host 를 신뢰하려면 NG_TRUST_PROXY_HEADERS 도 설정.
ENV NG_ALLOWED_HOSTS=""
ENV NG_TRUST_PROXY_HEADERS="1"

EXPOSE 8080
CMD ["node", "dist/mobile-invitation-v1/server/server.mjs"]
