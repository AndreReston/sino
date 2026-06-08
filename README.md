# DesignForge

Visual design and video editing platform.

## Run locally (development)

```bash
npm install
npm run dev
```

## Build shareable packages

After `npm install`, create distributable files in the `release/` folder:

| Command | Output | Best for |
|---------|--------|----------|
| `npm run package:win` | `DesignForge-Portable-1.0.0.exe` + `DesignForge-Setup-1.0.0.exe` | Sharing a Windows desktop app (no install needed for Portable) |
| `npm run package:web` | `DesignForge-Web-1.0.0.zip` | Hosting online or sending a static web bundle |
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
