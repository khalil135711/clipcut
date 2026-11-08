# ClipCut – Web Video Editor

A lightweight, CapCut-style video editor that runs **100% in the browser**. No backend, no upload, no build step – your videos never leave your device.

## Features
- Import multiple videos and arrange them on a timeline
- Split, delete, reorder, trim start/end
- Speed control (0.5x – 2x)
- Filters (B&W, vintage, vivid, blur, bright)
- Text captions with start time and length
- Export to WebM (video + audio) via Canvas `captureStream` + `MediaRecorder`

## Run locally
```bash
git clone https://github.com/<your-user>/clipcut.git
cd clipcut
python3 -m http.server 8000   # then open http://localhost:8000
```
Or just open `index.html` in Chrome / Edge / Firefox.

## Deploy on GitHub Pages
Push to `main`. The workflow in `.github/workflows/pages.yml` publishes the site automatically
(Settings → Pages → Source: **GitHub Actions**).

## Project structure
```
index.html        UI markup
css/style.css     styles (light/dark)
js/app.js         editor logic (timeline, playback, export)
```

## Known limitations
- Canvas filters are not supported in Safari
- One video track only; no transitions or keyframes
- Export runs in real time (1 min video ≈ 1 min export)

## Roadmap
- [ ] Multi-track timeline and drag & drop
- [ ] Faster export with WebCodecs / ffmpeg.wasm
- [ ] Separate audio tracks, volume control
- [ ] Transitions, stickers, auto-captions
- [ ] Save/load projects (IndexedDB)

## License
MIT
