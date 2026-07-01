import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
};

const ROUTES = {
  '/': 'index.html',
  '/privacidad': 'privacidad.html',
  '/privacy': 'privacidad.html',
  '/styles.css': 'styles.css',
};

async function serveFile(res, filePath) {
  const data = await readFile(filePath);
  const ext = extname(filePath);
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  res.end(data);
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    let pathname = url.pathname;

    if (pathname !== '/' && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }

    if (pathname.startsWith('/public/')) {
      const filePath = join(ROOT, pathname.slice(1));
      await serveFile(res, filePath);
      return;
    }

    const mapped = ROUTES[pathname];
    if (mapped) {
      await serveFile(res, join(ROOT, mapped));
      return;
    }

    const staticPath = join(ROOT, 'public', pathname.slice(1));
    try {
      const info = await stat(staticPath);
      if (info.isFile()) {
        await serveFile(res, staticPath);
        return;
      }
    } catch {
      // fall through to 404
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
  } catch {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Internal Server Error');
  }
});

server.listen(PORT, () => {
  console.log(`Nexolia Web listening on http://localhost:${PORT}`);
});
