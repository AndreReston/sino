// vite.config.ts
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { IncomingForm } from "file:///home/project/node_modules/formidable/src/index.js";
var uploadsDir = path.resolve(process.cwd(), "public/uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
var templatesDir = path.resolve(process.cwd(), "server");
var templatesFile = path.resolve(templatesDir, "templates.json");
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}
if (!fs.existsSync(templatesFile)) {
  fs.writeFileSync(templatesFile, "[]", "utf-8");
}
var readTemplates = () => {
  try {
    const content = fs.readFileSync(templatesFile, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    return [];
  }
};
var writeTemplates = (items) => {
  fs.writeFileSync(templatesFile, JSON.stringify(items, null, 2), "utf-8");
};
function buildAssetList() {
  return fs.readdirSync(uploadsDir).filter((file) => !file.startsWith(".")).map((file) => ({
    name: file,
    url: `/uploads/${encodeURIComponent(file)}`
  }));
}
var vite_config_default = defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react"]
  },
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (!req.url) return next();
      const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
      if (url.pathname === "/api/media/list" && req.method === "GET") {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ items: buildAssetList() }));
        return;
      }
      if (url.pathname === "/api/media/upload" && req.method === "POST") {
        const form = new IncomingForm({
          uploadDir: uploadsDir,
          keepExtensions: true,
          multiples: false,
          maxFileSize: 500 * 1024 * 1024
          // 500 MB for video support
        });
        form.parse(req, (err, fields, files) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: err.message }));
            return;
          }
          const fileField = files.file || files.upload;
          const file = Array.isArray(fileField) ? fileField[0] : fileField;
          if (!file || typeof file.filepath !== "string") {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "No file was uploaded." }));
            return;
          }
          const originalName = (file.originalFilename || "upload").replace(/[^a-zA-Z0-9._-]/g, "_");
          const finalName = `${Date.now()}-${originalName}`;
          const destination = path.join(uploadsDir, finalName);
          fs.rename(file.filepath, destination, (renameErr) => {
            if (renameErr) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: renameErr.message }));
              return;
            }
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({
              name: originalName,
              url: `/uploads/${encodeURIComponent(finalName)}`
            }));
          });
        });
        return;
      }
      if (url.pathname === "/api/templates" && req.method === "GET") {
        const items = readTemplates().map((template) => ({
          id: template.id,
          title: template.title,
          created_at: template.created_at,
          updated_at: template.updated_at
        }));
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ items }));
        return;
      }
      if (url.pathname === "/api/templates/save" && req.method === "POST") {
        let body = "";
        for await (const chunk of req) {
          body += chunk;
        }
        try {
          const payload = JSON.parse(body);
          const title = String(payload.title || "Untitled Template").trim();
          const canvasData = payload.canvas_data;
          if (!title || !canvasData) {
            throw new Error("Title and canvas data are required.");
          }
          const templates = readTemplates();
          const template = {
            id: randomUUID(),
            title,
            canvas_data: canvasData,
            created_at: (/* @__PURE__ */ new Date()).toISOString(),
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          };
          templates.unshift(template);
          writeTemplates(templates);
          res.statusCode = 201;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ template }));
        } catch (err) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: err.message }));
        }
        return;
      }
      if (url.pathname.startsWith("/api/templates/") && req.method === "GET") {
        const id = url.pathname.replace("/api/templates/", "");
        const template = readTemplates().find((item) => item.id === id);
        if (!template) {
          res.statusCode = 404;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Template not found." }));
          return;
        }
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ template }));
        return;
      }
      next();
    });
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgZnMgZnJvbSAnZnMnO1xyXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcclxuaW1wb3J0IHsgcmFuZG9tVVVJRCB9IGZyb20gJ2NyeXB0byc7XHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZywgdHlwZSBWaXRlRGV2U2VydmVyIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XHJcbmltcG9ydCB7IEluY29taW5nRm9ybSB9IGZyb20gJ2Zvcm1pZGFibGUnO1xyXG5cclxuY29uc3QgdXBsb2Fkc0RpciA9IHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCAncHVibGljL3VwbG9hZHMnKTtcclxuaWYgKCFmcy5leGlzdHNTeW5jKHVwbG9hZHNEaXIpKSB7XHJcbiAgZnMubWtkaXJTeW5jKHVwbG9hZHNEaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xyXG59XHJcblxyXG5jb25zdCB0ZW1wbGF0ZXNEaXIgPSBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwgJ3NlcnZlcicpO1xyXG5jb25zdCB0ZW1wbGF0ZXNGaWxlID0gcGF0aC5yZXNvbHZlKHRlbXBsYXRlc0RpciwgJ3RlbXBsYXRlcy5qc29uJyk7XHJcbmlmICghZnMuZXhpc3RzU3luYyh0ZW1wbGF0ZXNEaXIpKSB7XHJcbiAgZnMubWtkaXJTeW5jKHRlbXBsYXRlc0RpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XHJcbn1cclxuaWYgKCFmcy5leGlzdHNTeW5jKHRlbXBsYXRlc0ZpbGUpKSB7XHJcbiAgZnMud3JpdGVGaWxlU3luYyh0ZW1wbGF0ZXNGaWxlLCAnW10nLCAndXRmLTgnKTtcclxufVxyXG5cclxudHlwZSBUZW1wbGF0ZVJlY29yZCA9IHtcclxuICBpZDogc3RyaW5nO1xyXG4gIHRpdGxlOiBzdHJpbmc7XHJcbiAgY2FudmFzX2RhdGE6IGFueTtcclxuICBjcmVhdGVkX2F0OiBzdHJpbmc7XHJcbiAgdXBkYXRlZF9hdDogc3RyaW5nO1xyXG59O1xyXG5cclxuY29uc3QgcmVhZFRlbXBsYXRlcyA9ICgpOiBUZW1wbGF0ZVJlY29yZFtdID0+IHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgY29udGVudCA9IGZzLnJlYWRGaWxlU3luYyh0ZW1wbGF0ZXNGaWxlLCAndXRmLTgnKTtcclxuICAgIHJldHVybiBKU09OLnBhcnNlKGNvbnRlbnQpIGFzIFRlbXBsYXRlUmVjb3JkW107XHJcbiAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICByZXR1cm4gW107XHJcbiAgfVxyXG59O1xyXG5cclxuY29uc3Qgd3JpdGVUZW1wbGF0ZXMgPSAoaXRlbXM6IFRlbXBsYXRlUmVjb3JkW10pID0+IHtcclxuICBmcy53cml0ZUZpbGVTeW5jKHRlbXBsYXRlc0ZpbGUsIEpTT04uc3RyaW5naWZ5KGl0ZW1zLCBudWxsLCAyKSwgJ3V0Zi04Jyk7XHJcbn07XHJcblxyXG5mdW5jdGlvbiBidWlsZEFzc2V0TGlzdCgpIHtcclxuICByZXR1cm4gZnMucmVhZGRpclN5bmModXBsb2Fkc0RpcilcclxuICAgIC5maWx0ZXIoKGZpbGUpID0+ICFmaWxlLnN0YXJ0c1dpdGgoJy4nKSlcclxuICAgIC5tYXAoKGZpbGUpID0+ICh7XHJcbiAgICAgIG5hbWU6IGZpbGUsXHJcbiAgICAgIHVybDogYC91cGxvYWRzLyR7ZW5jb2RlVVJJQ29tcG9uZW50KGZpbGUpfWAsXHJcbiAgICB9KSk7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgcGx1Z2luczogW3JlYWN0KCldLFxyXG4gIG9wdGltaXplRGVwczoge1xyXG4gICAgZXhjbHVkZTogWydsdWNpZGUtcmVhY3QnXSxcclxuICB9LFxyXG4gIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXI6IFZpdGVEZXZTZXJ2ZXIpIHtcclxuICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoYXN5bmMgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XHJcbiAgICAgIGlmICghcmVxLnVybCkgcmV0dXJuIG5leHQoKTtcclxuICAgICAgY29uc3QgdXJsID0gbmV3IFVSTChyZXEudXJsLCBgaHR0cDovLyR7cmVxLmhlYWRlcnMuaG9zdCB8fCAnbG9jYWxob3N0J31gKTtcclxuXHJcbiAgICAgIGlmICh1cmwucGF0aG5hbWUgPT09ICcvYXBpL21lZGlhL2xpc3QnICYmIHJlcS5tZXRob2QgPT09ICdHRVQnKSB7XHJcbiAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSAyMDA7XHJcbiAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcclxuICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgaXRlbXM6IGJ1aWxkQXNzZXRMaXN0KCkgfSkpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHVybC5wYXRobmFtZSA9PT0gJy9hcGkvbWVkaWEvdXBsb2FkJyAmJiByZXEubWV0aG9kID09PSAnUE9TVCcpIHtcclxuICAgICAgICBjb25zdCBmb3JtID0gbmV3IEluY29taW5nRm9ybSh7XHJcbiAgICAgICAgICB1cGxvYWREaXI6IHVwbG9hZHNEaXIsXHJcbiAgICAgICAgICBrZWVwRXh0ZW5zaW9uczogdHJ1ZSxcclxuICAgICAgICAgIG11bHRpcGxlczogZmFsc2UsXHJcbiAgICAgICAgICBtYXhGaWxlU2l6ZTogNTAwICogMTAyNCAqIDEwMjQsIC8vIDUwMCBNQiBmb3IgdmlkZW8gc3VwcG9ydFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBmb3JtLnBhcnNlKHJlcSwgKGVyciwgZmllbGRzLCBmaWxlcykgPT4ge1xyXG4gICAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDUwMDtcclxuICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcclxuICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiBlcnIubWVzc2FnZSB9KSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBjb25zdCBmaWxlRmllbGQgPSBmaWxlcy5maWxlIHx8IGZpbGVzLnVwbG9hZDtcclxuICAgICAgICAgIGNvbnN0IGZpbGUgPSBBcnJheS5pc0FycmF5KGZpbGVGaWVsZCkgPyBmaWxlRmllbGRbMF0gOiBmaWxlRmllbGQ7XHJcbiAgICAgICAgICBpZiAoIWZpbGUgfHwgdHlwZW9mIGZpbGUuZmlsZXBhdGggIT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNDAwO1xyXG4gICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xyXG4gICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdObyBmaWxlIHdhcyB1cGxvYWRlZC4nIH0pKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGNvbnN0IG9yaWdpbmFsTmFtZSA9IChmaWxlLm9yaWdpbmFsRmlsZW5hbWUgfHwgJ3VwbG9hZCcpLnJlcGxhY2UoL1teYS16QS1aMC05Ll8tXS9nLCAnXycpO1xyXG4gICAgICAgICAgY29uc3QgZmluYWxOYW1lID0gYCR7RGF0ZS5ub3coKX0tJHtvcmlnaW5hbE5hbWV9YDtcclxuICAgICAgICAgIGNvbnN0IGRlc3RpbmF0aW9uID0gcGF0aC5qb2luKHVwbG9hZHNEaXIsIGZpbmFsTmFtZSk7XHJcblxyXG4gICAgICAgICAgZnMucmVuYW1lKGZpbGUuZmlsZXBhdGgsIGRlc3RpbmF0aW9uLCAocmVuYW1lRXJyKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChyZW5hbWVFcnIpIHtcclxuICAgICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDUwMDtcclxuICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xyXG4gICAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogcmVuYW1lRXJyLm1lc3NhZ2UgfSkpO1xyXG4gICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSAyMDA7XHJcbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XHJcbiAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgICAgICAgIG5hbWU6IG9yaWdpbmFsTmFtZSxcclxuICAgICAgICAgICAgICB1cmw6IGAvdXBsb2Fkcy8ke2VuY29kZVVSSUNvbXBvbmVudChmaW5hbE5hbWUpfWAsXHJcbiAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICh1cmwucGF0aG5hbWUgPT09ICcvYXBpL3RlbXBsYXRlcycgJiYgcmVxLm1ldGhvZCA9PT0gJ0dFVCcpIHtcclxuICAgICAgICBjb25zdCBpdGVtcyA9IHJlYWRUZW1wbGF0ZXMoKS5tYXAoKHRlbXBsYXRlKSA9PiAoe1xyXG4gICAgICAgICAgaWQ6IHRlbXBsYXRlLmlkLFxyXG4gICAgICAgICAgdGl0bGU6IHRlbXBsYXRlLnRpdGxlLFxyXG4gICAgICAgICAgY3JlYXRlZF9hdDogdGVtcGxhdGUuY3JlYXRlZF9hdCxcclxuICAgICAgICAgIHVwZGF0ZWRfYXQ6IHRlbXBsYXRlLnVwZGF0ZWRfYXQsXHJcbiAgICAgICAgfSkpO1xyXG4gICAgICAgIHJlcy5zdGF0dXNDb2RlID0gMjAwO1xyXG4gICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XHJcbiAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGl0ZW1zIH0pKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICh1cmwucGF0aG5hbWUgPT09ICcvYXBpL3RlbXBsYXRlcy9zYXZlJyAmJiByZXEubWV0aG9kID09PSAnUE9TVCcpIHtcclxuICAgICAgICBsZXQgYm9keSA9ICcnO1xyXG4gICAgICAgIGZvciBhd2FpdCAoY29uc3QgY2h1bmsgb2YgcmVxKSB7XHJcbiAgICAgICAgICBib2R5ICs9IGNodW5rO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGNvbnN0IHBheWxvYWQgPSBKU09OLnBhcnNlKGJvZHkpO1xyXG4gICAgICAgICAgY29uc3QgdGl0bGUgPSBTdHJpbmcocGF5bG9hZC50aXRsZSB8fCAnVW50aXRsZWQgVGVtcGxhdGUnKS50cmltKCk7XHJcbiAgICAgICAgICBjb25zdCBjYW52YXNEYXRhID0gcGF5bG9hZC5jYW52YXNfZGF0YTtcclxuXHJcbiAgICAgICAgICBpZiAoIXRpdGxlIHx8ICFjYW52YXNEYXRhKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGl0bGUgYW5kIGNhbnZhcyBkYXRhIGFyZSByZXF1aXJlZC4nKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBjb25zdCB0ZW1wbGF0ZXMgPSByZWFkVGVtcGxhdGVzKCk7XHJcbiAgICAgICAgICBjb25zdCB0ZW1wbGF0ZTogVGVtcGxhdGVSZWNvcmQgPSB7XHJcbiAgICAgICAgICAgIGlkOiByYW5kb21VVUlEKCksXHJcbiAgICAgICAgICAgIHRpdGxlLFxyXG4gICAgICAgICAgICBjYW52YXNfZGF0YTogY2FudmFzRGF0YSxcclxuICAgICAgICAgICAgY3JlYXRlZF9hdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxyXG4gICAgICAgICAgICB1cGRhdGVkX2F0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgICAgdGVtcGxhdGVzLnVuc2hpZnQodGVtcGxhdGUpO1xyXG4gICAgICAgICAgd3JpdGVUZW1wbGF0ZXModGVtcGxhdGVzKTtcclxuXHJcbiAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDIwMTtcclxuICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XHJcbiAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgdGVtcGxhdGUgfSkpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA0MDA7XHJcbiAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xyXG4gICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAoZXJyIGFzIEVycm9yKS5tZXNzYWdlIH0pKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAodXJsLnBhdGhuYW1lLnN0YXJ0c1dpdGgoJy9hcGkvdGVtcGxhdGVzLycpICYmIHJlcS5tZXRob2QgPT09ICdHRVQnKSB7XHJcbiAgICAgICAgY29uc3QgaWQgPSB1cmwucGF0aG5hbWUucmVwbGFjZSgnL2FwaS90ZW1wbGF0ZXMvJywgJycpO1xyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gcmVhZFRlbXBsYXRlcygpLmZpbmQoKGl0ZW0pID0+IGl0ZW0uaWQgPT09IGlkKTtcclxuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XHJcbiAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwNDtcclxuICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XHJcbiAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdUZW1wbGF0ZSBub3QgZm91bmQuJyB9KSk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDIwMDtcclxuICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xyXG4gICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyB0ZW1wbGF0ZSB9KSk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBuZXh0KCk7XHJcbiAgICB9KTtcclxuICB9LFxyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF5TixPQUFPLFFBQVE7QUFDeE8sT0FBTyxVQUFVO0FBQ2pCLFNBQVMsa0JBQWtCO0FBQzNCLFNBQVMsb0JBQXdDO0FBQ2pELE9BQU8sV0FBVztBQUNsQixTQUFTLG9CQUFvQjtBQUU3QixJQUFNLGFBQWEsS0FBSyxRQUFRLFFBQVEsSUFBSSxHQUFHLGdCQUFnQjtBQUMvRCxJQUFJLENBQUMsR0FBRyxXQUFXLFVBQVUsR0FBRztBQUM5QixLQUFHLFVBQVUsWUFBWSxFQUFFLFdBQVcsS0FBSyxDQUFDO0FBQzlDO0FBRUEsSUFBTSxlQUFlLEtBQUssUUFBUSxRQUFRLElBQUksR0FBRyxRQUFRO0FBQ3pELElBQU0sZ0JBQWdCLEtBQUssUUFBUSxjQUFjLGdCQUFnQjtBQUNqRSxJQUFJ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
