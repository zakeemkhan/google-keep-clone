# Keep Clone (React)

A responsive Google Keep homepage clone built with **React + Vite**. Notes are saved in `localStorage`, so there's no backend.

**Live demo:** https://zakeem-keep-clone.netlify.app/

## Features

### Core
- Navigation bar with a collapsible sidebar (slide-in drawer on phones)
- "Take a note…" composer that expands, grows as you type, and saves on **Close**, **Ctrl/Cmd + Enter**, **Esc** or a click outside
- Masonry notes grid (CSS Grid sized by a `useMasonry` hook)
- Delete notes, with a 5-second **Undo** toast
- Responsive: multi-column on laptops, 2-column on phones, icon-only sidebar on tablets

### Custom feature (built manually, without Cursor)
- _Describe your feature here_

### AI-assisted features (built with AI help)
1. **Dark mode** (`useTheme` hook): smooth colour fade and spinning sun/moon icon when switching. It remembers your choice, follows the OS setting by default, and never flashes white on load.
2. **Drag-and-drop reordering** (`NotesGrid` + SortableJS): drag notes to rearrange them, or long-press on phones. The order is saved, and notes can only be reordered within their own group.

## Project structure
```
index.html
src/
  main.jsx              – starts React
  App.jsx               – notes state: add, delete/undo, reorder
  App.css               – all styles (light + dark theme)
  components/
    Navbar.jsx  Sidebar.jsx  NoteComposer.jsx
    NotesGrid.jsx  NoteCard.jsx  Toast.jsx  Icons.jsx
  hooks/
    useLocalStorage.js  useTheme.js  useMasonry.js  useMediaQuery.js
```

## Run locally
```
npm install
npm run dev
```
Then open the link it prints (usually http://localhost:5173).

## Deploy
Netlify reads `netlify.toml`: build command `npm run build`, publish directory `dist`.
