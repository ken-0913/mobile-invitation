interface Env {
  ORIGIN_URL: string;
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

    return fetch(originUrl, {
      method: request.method,
      headers,
      body: request.body,
      redirect: 'manual',
    });
  },
} satisfies ExportedHandler<Env>;
