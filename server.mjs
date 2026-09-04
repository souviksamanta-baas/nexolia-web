// Standalone HTML preview server for the `mockups/` folder.
// Not used by the Next.js app — run with `npm run mockups` when you want
// to review the static QA references without booting Next.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PORT = Number(process.env.PORT) || 4400;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.md': 'text/markdown; charset=utf-8',
};

async function serveFile(res, filePath) {
  const data = await readFile(filePath);
  const ext = extname(filePath).toLowerCase();
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  res.end(data);
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    let pathname = url.pathname;
    if (pathname !== '/' && pathname.endsWith('/')) pathname = pathname.slice(0, -1);
    if (pathname === '/') pathname = '/mockups/index.html';

    // /public/* → repo `public/` (mockups reference logos there).
    if (pathname.startsWith('/public/')) {
      const filePath = join(ROOT, pathname.slice(1));
      try {
        await serveFile(res, filePath);
        return;
      } catch {
        // fall through
      }
    }

    // /mockups/* → repo `mockups/`.
    if (pathname.startsWith('/mockups')) {
      let filePath = join(ROOT, pathname.slice(1));
      try {
        const info = await stat(filePath);
        if (info.isDirectory()) filePath = join(filePath, 'index.html');
      } catch {
        // let serveFile 404 below
      }
      try {
        await serveFile(res, filePath);
        return;
      } catch {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not Found');
        return;
      }
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
  } catch {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Internal Server Error');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Mockups preview on http://localhost:${PORT}/mockups/`);
});
