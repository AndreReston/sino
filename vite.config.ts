import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { defineConfig, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import { IncomingForm } from 'formidable';

const uploadsDir = path.resolve(process.cwd(), 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const templatesDir = path.resolve(process.cwd(), 'server');
const templatesFile = path.resolve(templatesDir, 'templates.json');
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}
if (!fs.existsSync(templatesFile)) {
  fs.writeFileSync(templatesFile, '[]', 'utf-8');
}

type TemplateRecord = {
  id: string;
  title: string;
  canvas_data: any;
  created_at: string;
  updated_at: string;
};

const readTemplates = (): TemplateRecord[] => {
  try {
    const content = fs.readFileSync(templatesFile, 'utf-8');
    return JSON.parse(content) as TemplateRecord[];
  } catch (err) {
    return [];
  }
};

const writeTemplates = (items: TemplateRecord[]) => {
  fs.writeFileSync(templatesFile, JSON.stringify(items, null, 2), 'utf-8');
};

function buildAssetList() {
  return fs.readdirSync(uploadsDir)
    .filter((file) => !file.startsWith('.'))
    .map((file) => ({
      name: file,
      url: `/uploads/${encodeURIComponent(file)}`,
    }));
}

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  configureServer(server: ViteDevServer) {
    server.middlewares.use(async (req, res, next) => {
      if (!req.url) return next();
      const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

      if (url.pathname === '/api/media/list' && req.method === 'GET') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ items: buildAssetList() }));
        return;
      }

      if (url.pathname === '/api/media/upload' && req.method === 'POST') {
        const form = new IncomingForm({
          uploadDir: uploadsDir,
          keepExtensions: true,
          multiples: false,
          maxFileSize: 500 * 1024 * 1024, // 500 MB for video support
        });

        form.parse(req, (err, fields, files) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
            return;
          }

          const fileField = files.file || files.upload;
          const file = Array.isArray(fileField) ? fileField[0] : fileField;
          if (!file || typeof file.filepath !== 'string') {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'No file was uploaded.' }));
            return;
          }

          const originalName = (file.originalFilename || 'upload').replace(/[^a-zA-Z0-9._-]/g, '_');
          const finalName = `${Date.now()}-${originalName}`;
          const destination = path.join(uploadsDir, finalName);

          fs.rename(file.filepath, destination, (renameErr) => {
            if (renameErr) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: renameErr.message }));
              return;
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              name: originalName,
              url: `/uploads/${encodeURIComponent(finalName)}`,
            }));
          });
        });

        return;
      }

      if (url.pathname === '/api/templates' && req.method === 'GET') {
        const items = readTemplates().map((template) => ({
          id: template.id,
          title: template.title,
          created_at: template.created_at,
          updated_at: template.updated_at,
        }));
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ items }));
        return;
      }

      if (url.pathname === '/api/templates/save' && req.method === 'POST') {
        let body = '';
        for await (const chunk of req) {
          body += chunk;
        }

        try {
          const payload = JSON.parse(body);
          const title = String(payload.title || 'Untitled Template').trim();
          const canvasData = payload.canvas_data;

          if (!title || !canvasData) {
            throw new Error('Title and canvas data are required.');
          }

          const templates = readTemplates();
          const template: TemplateRecord = {
            id: randomUUID(),
            title,
            canvas_data: canvasData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          templates.unshift(template);
          writeTemplates(templates);

          res.statusCode = 201;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ template }));
        } catch (err) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: (err as Error).message }));
        }
        return;
      }

      if (url.pathname.startsWith('/api/templates/') && req.method === 'GET') {
        const id = url.pathname.replace('/api/templates/', '');
        const template = readTemplates().find((item) => item.id === id);
        if (!template) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Template not found.' }));
          return;
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ template }));
        return;
      }

      next();
    });
  },
});
