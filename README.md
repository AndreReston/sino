# DreFlow

Visual design and video editing platform.

## Run locally (development)

```bash
npm install
npm run dev
```

## Background removal setup

To enable ML-powered background removal, set `VITE_BG_REMOVAL_API_URL` in your environment. Optionally set `VITE_BG_REMOVAL_API_KEY` if your service uses authentication.

Example `.env`:

```env
VITE_BG_REMOVAL_API_URL=https://your-bg-removal-service.example.com/api/remove-background
VITE_BG_REMOVAL_API_KEY=your_api_key_here
```

If the API returns a JSON object, it should expose either `image` as a base64 data URL or `url` to the processed image.

## Build shareable packages

After `npm install`, create distributable files in the `release/` folder:

| Command | Output | Best for |
|---------|--------|----------|
| `npm run package:win` | `DreFlow-Portable-1.0.0.exe` + `DreFlow-Setup-1.0.0.exe` | Sharing a Windows desktop app (no install needed for Portable) |
| `npm run package:web` | `DreFlow-Web-1.0.0.zip` | Hosting online or sending a static web bundle |
| `npm run package:all` | Both of the above | Full release |

### Windows desktop app

- **Portable `.exe`** — double-click to run; copy the file to any PC and share it directly.
- **Setup `.exe`** — standard installer with Start Menu / Desktop shortcuts.

### Web ZIP

Extract the ZIP and either:

1. Upload all files to Netlify, Vercel, GitHub Pages, or any static host (HTTPS enables PWA install), or
2. Run locally: `npx serve .` inside the extracted folder.

## Desktop development

```bash
npm run electron:dev
```

Opens the app in an Electron window with hot reload.
