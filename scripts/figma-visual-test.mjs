#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const defaultFigmaUrl =
  'https://www.figma.com/design/D3d7IWJSBWv39g6utVj21y/%EB%AA%A8%EB%B0%94%EC%9D%BC%EC%B2%AD%EC%B2%A9%EC%9E%A5-%EC%9D%98%EB%A2%B0?node-id=4-6';

const sectionPresets = {
  'first-main': {
    selector: '.wedding-main',
    figmaCrop: { x: 0, y: 0, width: 393, height: 572 },
    masks: [
      {
        x: 0,
        y: 452,
        width: 393,
        height: 48,
        reason: 'backend-date-time',
      },
    ],
  },
  'invite-comment': {
    selector: '.wedding-invite-comment',
    figmaCrop: { x: 0, y: 572, width: 393, height: 557 },
    masks: [
      {
        x: 0,
        y: 315,
        width: 393,
        height: 70,
        reason: 'backend-family-names',
      },
      {
        x: 0,
        y: 420,
        width: 393,
        height: 60,
        reason: 'backend-date-time',
      },
    ],
  },
  calendar: {
    selector: '.calendar',
    figmaCrop: { x: 0, y: 1129, width: 393, height: 453 },
    masks: [
      {
        x: 0,
        y: 125,
        width: 393,
        height: 190,
        reason: 'backend-calendar-days',
      },
      {
        x: 0,
        y: 330,
        width: 393,
        height: 40,
        reason: 'backend-date-time',
      },
    ],
  },
  location: {
    selector: '.map_container',
    figmaCrop: { x: 0, y: 2267, width: 393, height: 556 },
    masks: [
      {
        x: 0,
        y: 50,
        width: 393,
        height: 24,
        reason: 'backend-date-time',
      },
      {
        x: 0,
        y: 117,
        width: 393,
        height: 262,
        reason: 'external-map-area',
      },
    ],
  },
};

const options = parseOptions(process.argv.slice(2));
const figmaUrlConfig = parseFigmaUrl(
  stringOption('figma-url', process.env['FIGMA_URL'] ?? defaultFigmaUrl),
);
const sections = parseSections(stringOption('sections', process.env['VISUAL_SECTIONS']));

const config = {
  build: !booleanOption('skip-build') && process.env['VISUAL_SKIP_BUILD'] !== '1',
  shortId: stringOption('short-id', process.env['VISUAL_SHORT_ID'] ?? 'sample-wedding-04'),
  fileKey: stringOption('file-key', process.env['FIGMA_FILE_KEY'] ?? figmaUrlConfig.fileKey),
  nodeId: normalizeNodeId(
    stringOption('node-id', process.env['FIGMA_NODE_ID'] ?? figmaUrlConfig.nodeId),
  ),
  figmaImagePath: stringOption('figma-image-path', process.env['FIGMA_IMAGE_PATH']),
  figmaImageUrl: stringOption('figma-image-url', process.env['FIGMA_IMAGE_URL']),
  outputDir: resolve(
    projectRoot,
    stringOption('output-dir', process.env['VISUAL_OUTPUT_DIR'] ?? 'tmp/figma-visual'),
  ),
  host: stringOption('host', process.env['VISUAL_HOST'] ?? 'localhost'),
  width: numberOption('width', process.env['VISUAL_VIEWPORT_WIDTH'], 393),
  height: numberOption('height', process.env['VISUAL_VIEWPORT_HEIGHT'], 3500),
  waitMs: numberOption('wait-ms', process.env['VISUAL_WAIT_MS'], 12000),
  pixelThreshold: numberOption('pixel-threshold', process.env['VISUAL_PIXEL_THRESHOLD'], 0.1),
  maxDiffRatio: numberOption('max-diff-ratio', process.env['VISUAL_MAX_DIFF_RATIO'], 0.02),
  chromeBin: stringOption('chrome-bin', process.env['CHROME_BIN']),
  masks: parseMasks(stringOption('masks', process.env['VISUAL_MASKS'])),
  sections,
};

const children = new Set();
let mockBackend;
let appServer;

main()
  .catch((error) => {
    console.error(`\n[visual:figma] ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await stopServer(appServer);
    await stopServer(mockBackend);
    stopChildren();
  });

process.on('SIGINT', () => {
  stopChildren();
  process.exit(130);
});

async function main() {
  validateConfig(config);
  await mkdir(config.outputDir, { recursive: true });

  const paths = {
    figma: join(config.outputDir, 'figma.png'),
    local: join(config.outputDir, 'local.png'),
    diff: join(config.outputDir, 'diff.png'),
    report: join(config.outputDir, 'report.json'),
  };
  const sectionMode = config.sections.length > 0;

  console.log('[visual:figma] Fetching Figma reference image...');
  await prepareFigmaImage(paths.figma);

  if (config.build) {
    console.log('[visual:figma] Building Angular app...');
    await run('npm', ['run', 'build'], { cwd: projectRoot, stdio: 'inherit' });
  }

  mockBackend = await startMockBackend();
  const appPort = await getFreePort();
  const appUrl = `http://${config.host}:${appPort}/i/${encodeURIComponent(config.shortId)}`;
  appServer = await startAppServer(appPort, mockBackend.baseUrl);

  console.log(`[visual:figma] Capturing local page: ${appUrl}`);
  await waitForHttpOk(appUrl, 30000);
  assertChildRunning(appServer, 'Angular SSR server');

  if (!sectionMode) {
    await captureLocalTargets(appUrl, [{ name: 'full', destination: paths.local }]);
    console.log('[visual:figma] Comparing screenshots...');
    const report = await compareImagePair(paths, { masks: config.masks });
    await writeFile(paths.report, `${JSON.stringify(report, null, 2)}\n`);
    printComparison('Diff ratio', report);
    console.log(`[visual:figma] Artifacts: ${relative(paths.figma)}, ${relative(paths.local)}, ${relative(paths.diff)}`);

    if (!report.passed) {
      throw new Error(reportErrorMessage(report));
    }
    return;
  }

  const sectionPaths = await prepareSectionFigmaImages(paths.figma);
  await captureLocalTargets(
    appUrl,
    config.sections.map((section) => ({
      name: section.name,
      selector: section.selector,
      destination: sectionPaths.get(section.name).local,
    })),
  );

  console.log('[visual:figma] Comparing section screenshots...');
  const reports = [];
  for (const section of config.sections) {
    const currentPaths = sectionPaths.get(section.name);
    const report = await compareImagePair(currentPaths, {
      masks: [...config.masks, ...(section.masks ?? [])],
      section,
    });
    await writeFile(currentPaths.report, `${JSON.stringify(report, null, 2)}\n`);
    reports.push(report);
    printComparison(section.name, report);
  }

  const report = {
    passed: reports.every((item) => item.passed),
    mode: 'sections',
    sections: reports,
    config: reportConfig(),
  };
  await writeFile(paths.report, `${JSON.stringify(report, null, 2)}\n`);

  if (!report.passed) {
    const failed = reports.filter((item) => !item.passed).map((item) => item.name).join(', ');
    throw new Error(`section visual diff failed: ${failed}`);
  }
}

async function prepareFigmaImage(destination) {
  if (config.figmaImagePath) {
    const source = resolve(projectRoot, config.figmaImagePath);
    if (!existsSync(source)) {
      throw new Error(`FIGMA_IMAGE_PATH does not exist: ${source}`);
    }
    if (source !== destination) {
      await copyFile(source, destination);
    }
    return;
  }

  if (config.figmaImageUrl) {
    await download(config.figmaImageUrl, destination);
    return;
  }

  const token =
    process.env['FIGMA_TOKEN'] ??
    process.env['FIGMA_ACCESS_TOKEN'] ??
    process.env['FIGMA_OAUTH_TOKEN'];

  if (!token) {
    throw new Error(
      'Set FIGMA_TOKEN, FIGMA_ACCESS_TOKEN, FIGMA_OAUTH_TOKEN, FIGMA_IMAGE_URL, or FIGMA_IMAGE_PATH.',
    );
  }

  const imageUrl = await requestFigmaImageUrl(token);
  await download(imageUrl, destination);
}

async function requestFigmaImageUrl(token) {
  const url = new URL(`https://api.figma.com/v1/images/${config.fileKey}`);
  url.searchParams.set('ids', config.nodeId);
  url.searchParams.set('format', 'png');
  url.searchParams.set('scale', '1');

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(`Figma image request failed (${response.status}): ${JSON.stringify(payload)}`);
  }

  const images = payload.images ?? {};
  const imageUrl = images[config.nodeId] ?? Object.values(images)[0];
  if (!imageUrl) {
    throw new Error(`Figma did not return an image URL for node ${config.nodeId}`);
  }
  return imageUrl;
}

async function startMockBackend() {
  const server = createServer((request, response) => {
    const url = new URL(request.url ?? '/', 'http://127.0.0.1');
    if (url.pathname.startsWith('/api/public/invitations/')) {
      writeJson(response, invitationFixture());
      return;
    }

    response.writeHead(404, { 'content-type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({ error: 'Not found' }));
  });

  await listen(server, 0);
  const port = server.address().port;
  console.log(`[visual:figma] Mock backend: http://127.0.0.1:${port}`);
  return { server, baseUrl: `http://127.0.0.1:${port}` };
}

async function startAppServer(port, backendBaseUrl) {
  const serverPath = join(projectRoot, 'dist/mobile-invitation-v1/server/server.mjs');
  if (!existsSync(serverPath)) {
    throw new Error(`Build output not found: ${serverPath}`);
  }

  const child = spawn(process.execPath, [serverPath], {
    cwd: projectRoot,
    env: {
      ...process.env,
      PORT: String(port),
      BACKEND_API_BASE_URL: backendBaseUrl,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  children.add(child);
  child.stdout.on('data', (chunk) => process.stdout.write(`[app] ${chunk}`));
  child.stderr.on('data', (chunk) => process.stderr.write(`[app] ${chunk}`));
  child.on('exit', () => children.delete(child));
  return { child };
}

async function captureLocalTargets(url, targets) {
  const chrome = config.chromeBin ?? findChrome();
  const userDataDir = join(config.outputDir, 'chrome-profile');
  const debuggingPort = await getFreePort();
  await mkdir(userDataDir, { recursive: true });

  const child = spawn(
    chrome,
    [
      '--headless=new',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-background-networking',
      '--disable-breakpad',
      '--disable-component-update',
      '--disable-crash-reporter',
      '--disable-sync',
      '--no-first-run',
      '--no-default-browser-check',
      '--hide-scrollbars',
      '--run-all-compositor-stages-before-draw',
      '--force-device-scale-factor=1',
      '--remote-allow-origins=*',
      `--remote-debugging-port=${debuggingPort}`,
      `--user-data-dir=${userDataDir}`,
      'about:blank',
    ],
    {
      cwd: projectRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  children.add(child);
  child.on('exit', () => children.delete(child));

  try {
    const wsUrl = await waitForPageWebSocket(debuggingPort);
    const client = await createCdpClient(wsUrl);

    try {
      await client.send('Page.enable');
      await client.send('Runtime.enable');
      await client.send('Network.enable');
      await client.send('Emulation.setDeviceMetricsOverride', {
        width: config.width,
        height: config.height,
        deviceScaleFactor: 1,
        mobile: true,
      });

      const loadEvent = client.once('Page.loadEventFired', config.waitMs + 15000);
      const navigation = await client.send('Page.navigate', { url });
      if (navigation.errorText) {
        throw new Error(`Chrome navigation failed: ${navigation.errorText}`);
      }

      await loadEvent;
      await delay(1000);

      const pageState = await client.send('Runtime.evaluate', {
        expression:
          '({href: location.href, title: document.title, text: document.body?.innerText?.slice(0, 200) ?? ""})',
        returnByValue: true,
      });
      const value = pageState.result?.value ?? {};
      if (String(value.text).includes('ERR_CONNECTION_REFUSED')) {
        throw new Error(`Chrome captured a connection-refused page for ${url}`);
      }

      await waitForAssets(client);

      for (const target of targets) {
        const screenshot = await client.send('Page.captureScreenshot', {
          format: 'png',
          fromSurface: true,
          captureBeyondViewport: Boolean(target.selector),
          ...(target.selector ? { clip: await getElementClip(client, target) } : {}),
        });
        await writeFile(target.destination, Buffer.from(screenshot.data, 'base64'));
      }
    } finally {
      client.close();
    }
  } finally {
    if (!child.killed) {
      child.kill();
    }
  }
}

async function compareImagePair(paths, options = {}) {
  const expected = PNG.sync.read(await readFile(paths.figma));
  const actual = PNG.sync.read(await readFile(paths.local));
  const section = options.section;

  if (expected.width !== actual.width || expected.height !== actual.height) {
    const overlap = {
      width: Math.min(expected.width, actual.width),
      height: Math.min(expected.height, actual.height),
    };
    const overlapExpected = cropPng(expected, { x: 0, y: 0, ...overlap });
    const overlapActual = cropPng(actual, { x: 0, y: 0, ...overlap });
    applyMasks(overlapExpected, overlapActual, options.masks ?? []);

    const diff = new PNG({ width: overlap.width, height: overlap.height });
    const mismatchedPixels = pixelmatch(
      overlapExpected.data,
      overlapActual.data,
      diff.data,
      overlap.width,
      overlap.height,
      { threshold: config.pixelThreshold },
    );
    await writeFile(paths.diff, PNG.sync.write(diff));

    const totalPixels = overlap.width * overlap.height;
    return {
      name: section?.name ?? 'full',
      passed: false,
      reason: 'dimension-mismatch',
      figma: { width: expected.width, height: expected.height },
      local: { width: actual.width, height: actual.height },
      overlap,
      overlapMismatchedPixels: mismatchedPixels,
      overlapDiffRatio: mismatchedPixels / totalPixels,
      artifacts: artifactPaths(paths),
      config: reportConfig(),
    };
  }

  applyMasks(expected, actual, options.masks ?? []);
  const diff = new PNG({ width: expected.width, height: expected.height });
  const mismatchedPixels = pixelmatch(
    expected.data,
    actual.data,
    diff.data,
    expected.width,
    expected.height,
    { threshold: config.pixelThreshold },
  );

  await writeFile(paths.diff, PNG.sync.write(diff));
  const totalPixels = expected.width * expected.height;
  const diffRatio = mismatchedPixels / totalPixels;

  return {
    name: section?.name ?? 'full',
    passed: diffRatio <= config.maxDiffRatio,
    mismatchedPixels,
    totalPixels,
    diffRatio,
    figma: { width: expected.width, height: expected.height },
    local: { width: actual.width, height: actual.height },
    artifacts: artifactPaths(paths),
    config: reportConfig(),
  };
}

async function prepareSectionFigmaImages(figmaPath) {
  const fullFigma = PNG.sync.read(await readFile(figmaPath));
  const sectionPaths = new Map();

  for (const section of config.sections) {
    const directory = join(config.outputDir, 'sections', section.name);
    await mkdir(directory, { recursive: true });

    const paths = {
      figma: join(directory, 'figma.png'),
      local: join(directory, 'local.png'),
      diff: join(directory, 'diff.png'),
      report: join(directory, 'report.json'),
    };

    const cropped = cropPng(fullFigma, section.figmaCrop);
    await writeFile(paths.figma, PNG.sync.write(cropped));
    sectionPaths.set(section.name, paths);
  }

  return sectionPaths;
}

function cropPng(source, crop) {
  const x = clamp(Math.floor(crop.x), 0, source.width);
  const y = clamp(Math.floor(crop.y), 0, source.height);
  const width = clamp(Math.floor(crop.width), 1, source.width - x);
  const height = clamp(Math.floor(crop.height), 1, source.height - y);
  const target = new PNG({ width, height });

  PNG.bitblt(source, target, x, y, width, height, 0, 0);
  return target;
}

function applyMasks(expected, actual, masks) {
  for (const mask of masks) {
    const minX = clamp(Math.floor(mask.x), 0, expected.width);
    const minY = clamp(Math.floor(mask.y), 0, expected.height);
    const maxX = clamp(Math.ceil(mask.x + mask.width), 0, expected.width);
    const maxY = clamp(Math.ceil(mask.y + mask.height), 0, expected.height);

    for (let y = minY; y < maxY; y += 1) {
      for (let x = minX; x < maxX; x += 1) {
        const index = (expected.width * y + x) << 2;
        for (const image of [expected, actual]) {
          image.data[index] = 255;
          image.data[index + 1] = 255;
          image.data[index + 2] = 255;
          image.data[index + 3] = 255;
        }
      }
    }
  }
}

function invitationFixture() {
  const coverImage = inlineSvgImage('cover', '#ece2d9', '#b48d7a');
  const galleryImage = inlineSvgImage('gallery', '#e4e9e4', '#758b7b');

  return {
    status: 'published',
    wedding: {
      dateTime: '2024-03-09T11:30:00+09:00',
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
      father: '김정용',
      mother: '전계선',
      order: '딸',
    },
    content: {
      coverTitle: "YOU'RE INVITED TO THE WEDDING OF",
      greeting:
        '“인생은 누구나 비슷한 길을 걸어간단다.\n' +
        '결국엔 늙어서 지난 날을 추억하는 것일 뿐이야.\n' +
        '그러니 결혼은 따뜻한 사람과 하거라”\n\n' +
        '평생 서로에게 따뜻함이 될 것을 약속하는 자리에\n' +
        '늘 곁에서 아껴 주신 고마운 분들을 모십니다.',
    },
    gallery: {
      coverImage,
      images: [galleryImage, galleryImage, galleryImage],
    },
    accounts: {
      groom: [{ bank: '국민', number: '1234-1234-1234', holder: '김우준' }],
      bride: [{ bank: '신한', number: '4321-4321-4321', holder: '이아영' }],
    },
    transport: {
      subway: '2호선 역삼역 7번 출구 GS타워 지하 1층과 연결',
      bus: '간선 146, 147, 360, 730',
      parking:
        'GS타워 지하주차장 / 4시간 무료 주차 / 1,000대 가능. 홀 입구에서 차량 등록 해드리겠습니다.',
    },
    share: {
      title: '우준 ♥ 아영 결혼합니다',
      description: '2024.03.09 (토) 오전 11:30 아모리스 역삼',
      imageUrl: coverImage,
    },
  };
}

function inlineSvgImage(label, background, foreground) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1200">` +
    `<rect width="800" height="1200" fill="${background}"/>` +
    `<circle cx="400" cy="430" r="210" fill="${foreground}" opacity=".22"/>` +
    `<rect x="190" y="710" width="420" height="170" rx="85" fill="${foreground}" opacity=".28"/>` +
    `<text x="400" y="620" text-anchor="middle" font-size="56" fill="${foreground}" font-family="serif">${label}</text>` +
    `</svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function parseOptions(argv) {
  const parsed = new Map();

  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];
    if (!current.startsWith('--')) {
      continue;
    }

    const [rawKey, inlineValue] = current.slice(2).split('=', 2);
    if (inlineValue !== undefined) {
      parsed.set(rawKey, inlineValue);
      continue;
    }

    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      parsed.set(rawKey, next);
      i += 1;
      continue;
    }

    parsed.set(rawKey, 'true');
  }

  return parsed;
}

function stringOption(name, fallback) {
  return options.get(name) ?? fallback;
}

function booleanOption(name) {
  return options.get(name) === 'true';
}

function numberOption(name, envValue, fallback) {
  const raw = options.get(name) ?? envValue;
  if (raw === undefined || raw === '') {
    return fallback;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid numeric option ${name}: ${raw}`);
  }
  return parsed;
}

function parseFigmaUrl(url) {
  const parsed = new URL(url);
  const parts = parsed.pathname.split('/').filter(Boolean);
  const designIndex = parts.indexOf('design');
  const fileKey = designIndex >= 0 ? parts[designIndex + 1] : undefined;
  const branchIndex = parts.indexOf('branch');
  const nodeId = parsed.searchParams.get('node-id');

  return {
    fileKey: branchIndex >= 0 ? parts[branchIndex + 1] : fileKey,
    nodeId: nodeId ? normalizeNodeId(nodeId) : undefined,
  };
}

function normalizeNodeId(nodeId) {
  return nodeId?.replace('-', ':');
}

function parseMasks(raw) {
  if (!raw) {
    return [];
  }

  const masks = JSON.parse(raw);
  if (!Array.isArray(masks)) {
    throw new Error('VISUAL_MASKS must be a JSON array.');
  }

  return masks.map((mask) => ({
    x: Number(mask.x),
    y: Number(mask.y),
    width: Number(mask.width),
    height: Number(mask.height),
  }));
}

function parseSections(raw) {
  if (!raw) {
    return [];
  }

  const value = raw.trim();
  if (!value) {
    return [];
  }

  if (value === 'all') {
    return Object.entries(sectionPresets).map(([name, section]) =>
      normalizeSection({ name, ...section }),
    );
  }

  if (value.startsWith('[')) {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      throw new Error('VISUAL_SECTIONS JSON must be an array.');
    }
    return parsed.map(normalizeSection);
  }

  return value.split(',').map((name) => {
    const key = name.trim();
    const preset = sectionPresets[key];
    if (!preset) {
      throw new Error(
        `Unknown section "${key}". Available sections: ${Object.keys(sectionPresets).join(', ')}`,
      );
    }
    return normalizeSection({ name: key, ...preset });
  });
}

function normalizeSection(section) {
  if (!section.name || !section.selector || !section.figmaCrop) {
    throw new Error('Each section needs name, selector, and figmaCrop.');
  }

  return {
    name: section.name,
    selector: section.selector,
    figmaCrop: {
      x: Number(section.figmaCrop.x),
      y: Number(section.figmaCrop.y),
      width: Number(section.figmaCrop.width),
      height: Number(section.figmaCrop.height),
    },
    masks: Array.isArray(section.masks) ? section.masks : [],
  };
}

function validateConfig(current) {
  for (const key of ['fileKey', 'nodeId']) {
    if (!current[key]) {
      throw new Error(`Missing required Figma ${key}. Use --figma-url, --file-key, or --node-id.`);
    }
  }

  for (const key of ['width', 'height', 'waitMs']) {
    if (!Number.isFinite(current[key]) || current[key] <= 0) {
      throw new Error(`${key} must be a positive number.`);
    }
  }

  for (const section of current.sections) {
    for (const key of ['x', 'y', 'width', 'height']) {
      if (!Number.isFinite(section.figmaCrop[key]) || section.figmaCrop[key] < 0) {
        throw new Error(`Section ${section.name} has an invalid figmaCrop.${key}.`);
      }
    }
    if (section.figmaCrop.width <= 0 || section.figmaCrop.height <= 0) {
      throw new Error(`Section ${section.name} crop width and height must be positive.`);
    }
  }
}

async function download(url, destination) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed (${response.status}): ${url}`);
  }
  await writeFile(destination, Buffer.from(await response.arrayBuffer()));
}

function writeJson(response, data) {
  response.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(data));
}

async function waitForHttpOk(url, timeoutMs) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // Keep polling until the app server is listening.
    }

    await delay(500);
  }

  throw new Error(`Timed out waiting for ${url}`);
}

async function getFreePort() {
  const server = createServer();
  await listen(server, 0);
  const port = server.address().port;
  await stopServer({ server });
  return port;
}

function listen(server, port) {
  return new Promise((resolveListen, rejectListen) => {
    server.once('error', rejectListen);
    server.listen(port, '127.0.0.1', () => {
      server.off('error', rejectListen);
      resolveListen();
    });
  });
}

async function stopServer(target) {
  if (!target) {
    return;
  }

  if (target.child && !target.child.killed) {
    target.child.kill();
  }

  if (!target.server) {
    return;
  }

  await new Promise((resolveClose) => target.server.close(resolveClose));
}

function stopChildren() {
  for (const child of children) {
    if (!child.killed) {
      child.kill();
    }
  }
}

function run(command, args, settings) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(command, args, settings);
    children.add(child);

    let stderr = '';
    if (settings.stdio === 'pipe') {
      child.stdout.on('data', (chunk) => process.stdout.write(chunk));
      child.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
        process.stderr.write(chunk);
      });
    }

    child.on('error', rejectRun);
    child.on('close', (code) => {
      children.delete(child);
      if (code === 0) {
        resolveRun();
        return;
      }
      rejectRun(new Error(`${command} ${args.join(' ')} failed with exit code ${code}\n${stderr}`));
    });
  });
}

function findChrome() {
  const candidates = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ];

  const chrome = candidates.find((candidate) => existsSync(candidate));
  if (!chrome) {
    throw new Error('Chrome was not found. Set CHROME_BIN to a Chromium-compatible browser.');
  }
  return chrome;
}

async function waitForPageWebSocket(port) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < 15000) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      if (response.ok) {
        const targets = await response.json();
        const page = targets.find(
          (target) => target.type === 'page' && target.webSocketDebuggerUrl,
        );
        if (page) {
          return page.webSocketDebuggerUrl;
        }
      }
    } catch {
      // Chrome is still starting.
    }

    await delay(250);
  }

  throw new Error('Timed out waiting for Chrome DevTools websocket.');
}

async function waitForAssets(client) {
  await evaluateByValue(
    client,
    `Promise.all([
      document.fonts?.ready ?? Promise.resolve(),
      ...Array.from(document.images)
        .filter((image) => !image.complete)
        .map((image) => new Promise((resolve) => {
          image.addEventListener('load', resolve, { once: true });
          image.addEventListener('error', resolve, { once: true });
        })),
    ]).then(() => true)`,
  );
}

async function getElementClip(client, target) {
  const rect = await evaluateByValue(
    client,
    `(() => {
      const element = document.querySelector(${JSON.stringify(target.selector)});
      if (!element) {
        return { missing: true };
      }

      const rect = element.getBoundingClientRect();
      return {
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height,
      };
    })()`,
  );

  if (rect.missing) {
    throw new Error(`Selector not found for section ${target.name}: ${target.selector}`);
  }

  const clip = {
    x: Math.max(0, Math.floor(rect.x)),
    y: Math.max(0, Math.floor(rect.y)),
    width: Math.ceil(rect.width),
    height: Math.ceil(rect.height),
    scale: 1,
  };

  if (clip.width <= 0 || clip.height <= 0) {
    throw new Error(
      `Selector has empty bounds for section ${target.name}: ${target.selector}`,
    );
  }

  return clip;
}

async function evaluateByValue(client, expression) {
  const result = await client.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });

  if (result.exceptionDetails) {
    throw new Error(`Chrome evaluation failed: ${result.exceptionDetails.text}`);
  }

  return result.result?.value;
}

function createCdpClient(wsUrl) {
  if (typeof WebSocket === 'undefined') {
    throw new Error('This script requires a Node.js runtime with global WebSocket support.');
  }

  const socket = new WebSocket(wsUrl);
  let nextId = 1;
  const pending = new Map();
  const listeners = new Map();

  const opened = new Promise((resolveOpen, rejectOpen) => {
    socket.addEventListener('open', resolveOpen, { once: true });
    socket.addEventListener('error', rejectOpen, { once: true });
  });

  socket.addEventListener('message', (event) => {
    const message = JSON.parse(messageDataToString(event.data));

    if (message.id && pending.has(message.id)) {
      const { resolveCommand, rejectCommand } = pending.get(message.id);
      pending.delete(message.id);

      if (message.error) {
        rejectCommand(new Error(`${message.error.message}: ${message.error.data ?? ''}`));
        return;
      }

      resolveCommand(message.result ?? {});
      return;
    }

    if (message.method && listeners.has(message.method)) {
      for (const listener of listeners.get(message.method)) {
        listener(message.params ?? {});
      }
    }
  });

  return {
    async send(method, params = {}) {
      await opened;
      const id = nextId;
      nextId += 1;

      socket.send(JSON.stringify({ id, method, params }));
      return new Promise((resolveCommand, rejectCommand) => {
        pending.set(id, { resolveCommand, rejectCommand });
      });
    },

    once(method, timeoutMs) {
      return new Promise((resolveEvent, rejectEvent) => {
        const timeout = setTimeout(() => {
          cleanup();
          rejectEvent(new Error(`Timed out waiting for CDP event ${method}`));
        }, timeoutMs);

        const listener = (params) => {
          cleanup();
          resolveEvent(params);
        };

        const cleanup = () => {
          clearTimeout(timeout);
          listeners.set(
            method,
            (listeners.get(method) ?? []).filter((item) => item !== listener),
          );
        };

        listeners.set(method, [...(listeners.get(method) ?? []), listener]);
      });
    },

    close() {
      socket.close();
    },
  };
}

function messageDataToString(data) {
  if (typeof data === 'string') {
    return data;
  }

  if (data instanceof ArrayBuffer) {
    return Buffer.from(data).toString('utf8');
  }

  return Buffer.from(data).toString('utf8');
}

function reportConfig() {
  return {
    fileKey: config.fileKey,
    nodeId: config.nodeId,
    shortId: config.shortId,
    host: config.host,
    width: config.width,
    height: config.height,
    pixelThreshold: config.pixelThreshold,
    maxDiffRatio: config.maxDiffRatio,
    masks: config.masks,
    sections: config.sections.map((section) => ({
      name: section.name,
      selector: section.selector,
      figmaCrop: section.figmaCrop,
      masks: section.masks,
    })),
  };
}

function artifactPaths(paths) {
  return {
    figma: relative(paths.figma),
    local: relative(paths.local),
    diff: paths.diff ? relative(paths.diff) : undefined,
    report: paths.report ? relative(paths.report) : undefined,
  };
}

function printComparison(label, report) {
  if (report.reason === 'dimension-mismatch') {
    const overlap = report.overlapDiffRatio === undefined
      ? ''
      : `, overlap diff=${(report.overlapDiffRatio * 100).toFixed(2)}%`;
    console.log(
      `[visual:figma] ${label}: dimension mismatch ` +
        `figma=${report.figma.width}x${report.figma.height}, ` +
        `local=${report.local.width}x${report.local.height}${overlap}`,
    );
    return;
  }

  const percent = (report.diffRatio * 100).toFixed(2);
  console.log(`[visual:figma] ${label}: ${percent}% (${report.mismatchedPixels} px)`);
}

function reportErrorMessage(report) {
  if (report.reason === 'dimension-mismatch') {
    return (
      `image dimensions differ: figma=${report.figma.width}x${report.figma.height}, ` +
      `local=${report.local.width}x${report.local.height}`
    );
  }

  const percent = (report.diffRatio * 100).toFixed(2);
  const limit = (config.maxDiffRatio * 100).toFixed(2);
  return `visual diff ${percent}% is above the ${limit}% limit`;
}

function assertChildRunning(target, label) {
  if (target.child.exitCode === null && target.child.signalCode === null) {
    return;
  }

  throw new Error(
    `${label} exited before screenshot capture (exitCode=${target.child.exitCode}, signal=${target.child.signalCode})`,
  );
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function relative(path) {
  return path.replace(`${projectRoot}/`, '');
}

function delay(ms) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, ms));
}
