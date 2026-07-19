interface Env {
  ORIGIN_URL: string;
  // wrangler secret. 원본(Cloud Run)이 이 헤더로 Cloudflare 경유 여부를 검증한다.
  ORIGIN_VERIFY_SECRET?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const originUrl = new URL(url.pathname + url.search, env.ORIGIN_URL);

    const headers = new Headers(request.headers);
    // Angular SSR(NG_TRUST_PROXY_HEADERS=1)이 원래 도메인을 알 수 있도록 전달.
    // NG_ALLOWED_HOSTS에 이 호스트가 등록되어 있어야 한다.
    headers.set('X-Forwarded-Host', url.hostname);
    headers.set('X-Forwarded-Proto', 'https');
    // 공유 시크릿: run.app 직접 접속(Cloudflare 우회)을 원본에서 차단하기 위한 증명.
    if (env.ORIGIN_VERIFY_SECRET) {
      headers.set('X-Origin-Verify', env.ORIGIN_VERIFY_SECRET);
    }

    return fetch(originUrl, {
      method: request.method,
      headers,
      body: request.body,
      redirect: 'manual',
    });
  },
} satisfies ExportedHandler<Env>;
