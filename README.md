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

## Figma Visual Test

Figma 프레임을 PNG로 내려받고, 로컬 Angular SSR 빌드 화면을 같은 모바일 크기로 캡처한 뒤 픽셀 diff를 만든다. 기본 비교 대상은 Figma 파일 `D3d7IWJSBWv39g6utVj21y`의 메인 프레임 `4:6`이다.

```sh
FIGMA_TOKEN="<figma token>" npm run visual:figma
```

Codex/Figma MCP에서 받은 단기 이미지 URL이나 이미 내려받은 기준 이미지를 쓰는 것도 가능하다.

```sh
FIGMA_IMAGE_URL="https://www.figma.com/api/mcp/asset/..." npm run visual:figma
FIGMA_IMAGE_PATH="tmp/figma-baseline.png" npm run visual:figma -- --skip-build
```

결과물은 `tmp/figma-visual/figma.png`, `local.png`, `diff.png`, `report.json`에 저장된다. 다른 Figma 노드는 다음처럼 지정한다.

```sh
npm run visual:figma -- --figma-url "https://www.figma.com/design/...?...node-id=4-6"
npm run visual:figma -- --file-key D3d7IWJSBWv39g6utVj21y --node-id 4:6
```

섹션별로 비교하려면 `--sections`를 지정한다. 기본 프리셋은 `first-main`, `invite-comment`, `calendar`, `location`이다.

```sh
npm run visual:figma -- --sections first-main,invite-comment,calendar,location
npm run visual:figma -- --sections all
```

섹션별 결과물은 `tmp/figma-visual/sections/<section>/figma.png`, `local.png`, `diff.png`, `report.json`에 저장된다. 전체 요약은 기존처럼 `tmp/figma-visual/report.json`에 저장된다.

백엔드 데이터에 따라 달라지는 날짜/시간 표기는 기본 비교에서 제외한다. `first-main`의 영문 날짜/시간, `invite-comment`의 날짜/예식 정보, `calendar`의 날짜 그리드와 하단 날짜 문구, `location`의 날짜 라인이 기본 mask에 포함된다.

`invite-comment` 프리셋은 Figma의 `YOU'RE INVITED` 섹션이다. 부모 성함, 신랑/신부 이름, 관계 표기는 백엔드 데이터에 따라 달라지므로 해당 가족명 영역을 기본 비교에서 제외한다.

`location` 프리셋은 지도 영역을 기본으로 비교에서 제외한다. Figma의 지도 자리(`x:0, y:117, width:393, height:262`)는 `#D9D9D9` placeholder지만 실제 서비스에서는 네이버 지도처럼 외부 지도가 렌더링되는 영역이라 diff 판단에 포함하지 않는다.

프리셋 밖의 섹션은 JSON으로 selector와 Figma crop 좌표를 직접 넘길 수 있다.

```sh
VISUAL_SECTIONS='[{"name":"custom","selector":".calendar","figmaCrop":{"x":0,"y":1129,"width":393,"height":453}}]' npm run visual:figma
```

동적 이미지나 지도 영역을 비교에서 제외하려면 `VISUAL_MASKS`에 좌표 배열을 넣는다.

```sh
VISUAL_MASKS='[{"x":0,"y":0,"width":393,"height":572}]' npm run visual:figma
```
