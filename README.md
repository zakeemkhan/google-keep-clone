# Keep Clone

A responsive Google Keep homepage clone built with plain HTML, CSS and JavaScript. Notes are saved in `localStorage`, so there's no backend.

**Live demo:** _add your Netlify link here_

## Features

### Core
- Navigation bar with a collapsible sidebar (slide-in drawer on phones)
- "Take a note…" composer that expands, grows as you type, and saves on **Close**, **Ctrl/Cmd + Enter**, **Esc** or a click outside
- Masonry notes grid (JS-sized CSS Grid, so cards pack tightly)
- Delete notes, with a 5-second **Undo** toast
- Responsive: multi-column on laptops, 2-column on phones, icon-only sidebar on tablets

### Custom feature (built manually, without Cursor)
- _Describe your feature here_

### AI-assisted features (built with Cursor)
1. **Dark mode**: toggle in the navbar. It remembers your choice, follows your OS setting by default, and doesn't flash white on load.
2. **Drag-and-drop reordering**: drag notes to rearrange them. On phones, long-press (250 ms) to pick a note up. The order is saved. Built on [SortableJS](https://github.com/SortableJS/Sortable).

## Project structure
```
index.html
css/style.css
js/app.js
js/vendor/Sortable.min.js
```

## Run locally
Open `index.html` in a browser, or use the VS Code Live Server extension.

## Deploy
Deployed on Netlify as a static site: no build command, publish directory `/`.
