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

/**
 * Reverse proxy: forwards every /api/** request from the browser to the
 * user-service (or, later, an API gateway in front of every microservice).
 *
 * This keeps `environment.production.ts` pointed at a same-origin, relative
 * `/api` base URL, so the browser never needs to know the backend's real
 * host/port and there is no CORS to configure in production. The target is
 * resolved from USER_SERVICE_URL, which docker-compose sets to the internal
 * service name (e.g. http://user-service:8081) so containers talk to each
 * other over the Docker network rather than through the host.
 */
const USER_SERVICE_URL = (process.env['USER_SERVICE_URL'] || 'http://localhost:8081').replace(
  /\/+$/,
  '',
);

app.use('/api', express.json(), async (req, res) => {
  const targetUrl = `${USER_SERVICE_URL}/api${req.originalUrl.slice('/api'.length)}`;

  try {
    const headers: Record<string, string> = {};
    if (req.headers['authorization']) {
      headers['authorization'] = req.headers['authorization'] as string;
    }
    const hasBody = !['GET', 'HEAD'].includes(req.method) && req.body && Object.keys(req.body).length > 0;
    if (hasBody) {
      headers['content-type'] = 'application/json';
    }

    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: hasBody ? JSON.stringify(req.body) : undefined,
    });

    const text = await upstream.text();
    res.status(upstream.status);
    const contentType = upstream.headers.get('content-type');
    if (contentType) {
      res.setHeader('content-type', contentType);
    }
    res.send(text);
  } catch (error) {
    console.error(`[api-proxy] Failed to reach ${targetUrl}:`, error);
    res.status(502).json({ message: 'Backend service unavailable. Please try again shortly.' });
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
