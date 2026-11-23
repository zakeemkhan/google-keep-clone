import { useEffect, useRef, useState } from 'react';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import NoteComposer from './components/NoteComposer.jsx';
import NotesGrid from './components/NotesGrid.jsx';
import Toast from './components/Toast.jsx';
import { BulbIcon } from './components/Icons.jsx';
import useLocalStorage from './hooks/useLocalStorage.js';
import useTheme from './hooks/useTheme.js';
import useMediaQuery from './hooks/useMediaQuery.js';

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export default function App() {
  /**
   * A note looks like: { id, title, body, createdAt }
   * 🔧 Manual feature: add your new field to new notes in addNote().
   */
  const [notes, setNotes] = useLocalStorage('keep-clone-notes', []);
  const [theme, toggleTheme] = useTheme();

  /* ---------- Sidebar: drawer on phones, collapsible on laptops ---------- */
  const isMobile = useMediaQuery('(max-width: 640px)');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => setDrawerOpen(false), [isMobile]);

  function toggleMenu() {
    if (isMobile) setDrawerOpen((open) => !open);
    else setCollapsed((c) => !c);
  }

  /* ---------- Add ---------- */
  function addNote({ title, body }) {
    const newNote = { id: makeId(), title, body, createdAt: Date.now(), pinned: false };
    setNotes((prev) => [newNote, ...prev]);
  }

  /* ---------- Delete + Undo ---------- */
  const [lastDeleted, setLastDeleted] = useState(null); // { note, index }
  const toastTimer = useRef(null);

  function deleteNote(id) {
    const index = notes.findIndex((n) => n.id === id);
    if (index === -1) return;
    setLastDeleted({ note: notes[index], index });
    setNotes((prev) => prev.filter((n) => n.id !== id));

    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setLastDeleted(null), 5000);
  }

  function undoDelete() {
    if (!lastDeleted) return;
    const { note, index } = lastDeleted;
    setNotes((prev) => {
      const next = [...prev];
      next.splice(index, 0, note);
      return next;
    });
    setLastDeleted(null);
    clearTimeout(toastTimer.current);
  }

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  /* ---------- Pin / unpin (manual feature) ---------- */
  function togglePin(id) {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    );
  }

  /* ---------- Drag-and-drop: move one note to another note's spot ---------- */
  function moveNote(movedId, targetId) {
    setNotes((prev) => {
      const from = prev.findIndex((n) => n.id === movedId);
      const to = prev.findIndex((n) => n.id === targetId);
      if (from === -1 || to === -1 || from === to) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }
  const pinnedNotes = notes.filter((n) => n.pinned);
  const otherNotes = notes.filter((n) => !n.pinned);


  return (
    <>
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
        onToggleMenu={toggleMenu}
        menuOpen={isMobile ? drawerOpen : !collapsed}
      />

      <div className="layout">
        <Sidebar
          isMobile={isMobile}
          open={drawerOpen}
          collapsed={collapsed}
          onClose={() => setDrawerOpen(false)}
        />

        <main className="main">
          <NoteComposer onAdd={addNote} />


          <NotesGrid
            label={pinnedNotes.length > 0 ? 'Pinned' : ''}
            notes={pinnedNotes}
            onMove={moveNote}
            onDelete={deleteNote}
            onTogglePin={togglePin}
          />
          <NotesGrid
            label={pinnedNotes.length > 0 ? 'Others' : ''}
            notes={otherNotes}
            onMove={moveNote}
            onDelete={deleteNote}
            onTogglePin={togglePin}
          />

          {notes.length === 0 && (
            <div className="empty-state">
              <BulbIcon />
              <p>Notes that you add appear here</p>
            </div>
          )}
        </main>
      </div>

      <Toast
        message={lastDeleted ? 'Note deleted' : ''}
        actionLabel="Undo"
        onAction={undoDelete}
      />
    </>
  );
}
