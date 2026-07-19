import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();
const backendApiBaseUrl =
  process.env['BACKEND_API_BASE_URL'] ?? 'http://localhost:8080';

app.get('/api/invitations/:shortId', async (req, res, next) => {
  try {
    const shortId = req.params['shortId'];

    if (!shortId) {
      res.status(400).json({ error: 'shortId is required' });
      return;
    }

    const backendResponse = await fetch(
      `${backendApiBaseUrl}/api/public/invitations/${encodeURIComponent(shortId)}`,
    );

    if (backendResponse.status === 404) {
      res.status(404).json({ error: 'Invitation not found' });
      return;
    }

    if (!backendResponse.ok) {
      res.status(backendResponse.status).json({ error: 'Backend request failed' });
      return;
    }

    res.json(await backendResponse.json());
  } catch (error) {
    next(error);
  }
});

app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
