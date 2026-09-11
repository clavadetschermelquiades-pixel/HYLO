# Hylo – Hybrid Training Tracker

PWA zum Tracken von Laufen und Krafttraining. React + Vite, Daten liegen
ausschließlich lokal im Browser (`localStorage`) – kein Server, keine Cloud.

## Voraussetzung: Node.js

Dieses Projekt braucht Node.js (≥ 18) und npm zum Bauen/Starten.
Prüfen mit:

```bash
node -v
```

Falls nicht installiert: [nodejs.org](https://nodejs.org) → LTS-Installer
herunterladen und ausführen, oder via Homebrew: `brew install node`.

## Setup

```bash
npm install
```

## Entwicklung (lokaler Server mit Hot Reload)

```bash
npm run dev
```

Öffnet auf `http://localhost:5173`.

## Produktions-Build (inkl. Service Worker & Manifest)

```bash
npm run build
npm run preview
```

`npm run preview` startet einen lokalen Server für den `dist/`-Ordner –
so kann die echte PWA (mit Service Worker) getestet werden.

## Hosting

Der `dist/`-Ordner nach `npm run build` ist eine statische Site und kann auf
jedem Static-Hosting deployed werden, z. B. Vercel, Netlify, GitHub Pages oder
Cloudflare Pages. Wichtig: HTTPS ist Pflicht für Service Worker/PWA-Install
(alle genannten Anbieter liefern das automatisch).

## Daten

Alle Einträge (Aktivitäten, Morgenchecks) liegen in `localStorage` des
Browsers/Geräts. Es gibt keinen Sync zwischen Geräten und keinen Server-Export.
