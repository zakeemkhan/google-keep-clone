import { useEffect, useRef } from 'react';
import Sortable from 'sortablejs';
import NoteCard from './NoteCard.jsx';
import useMasonry from '../hooks/useMasonry.js';

/*  A masonry grid of notes + AI-assisted feature #2: drag-and-drop.

    SortableJS moves the card in the page while you drag. When you drop,
    we put the card back where React left it and tell React the new order
    instead — so React stays in charge of the page.

    Notes can only be dragged within the same grid. If you render two
    grids (e.g. "Pinned" and "Others"), notes can't be dragged between them.

    Props:
      notes      – the notes to show in this grid
      label      – optional heading above the grid (e.g. "PINNED")
      onMove     – (movedId, targetId) => void
      ...rest    – passed to every NoteCard (e.g. onDelete)               */

export default function NotesGrid({ notes, label, onMove, ...cardProps }) {
  const gridRef = useRef(null);

  // Keep the latest props for SortableJS callbacks (created only once)
  const latest = useRef({ notes, onMove });
  latest.current = { notes, onMove };

  useMasonry(gridRef, [notes]);

  useEffect(() => {
    const sortable = Sortable.create(gridRef.current, {
      animation: 180,
      easing: 'cubic-bezier(0.2, 0, 0, 1)',
      delay: 250, // phones: long-press to pick up, so scrolling still works
      delayOnTouchOnly: true,
      touchStartThreshold: 5,
      filter: '.icon-btn', // clicking a button never starts a drag
      preventOnFilter: false,
      ghostClass: 'drag-ghost',
      chosenClass: 'drag-chosen',
      dragClass: 'dragging',
      forceFallback: true,
      fallbackOnBody: true,
      onEnd(evt) {
        const { item, from, oldIndex, newIndex } = evt;
        if (oldIndex == null || newIndex == null || oldIndex === newIndex) return;

        // Undo SortableJS's DOM move — React will re-render in the new order
        from.removeChild(item);
        from.insertBefore(item, from.children[oldIndex] ?? null);

        const { notes: current, onMove: move } = latest.current;
        move(current[oldIndex].id, current[newIndex].id);
      },
    });
    return () => sortable.destroy();
  }, []);

  // The grid always stays in the page (SortableJS is attached to it once);
  // it's just hidden while it has no notes.
  return (
    <section className="notes-section" hidden={notes.length === 0}>
      {label && <h2 className="section-label">{label}</h2>}
      <div className="notes-grid" ref={gridRef}>
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} {...cardProps} />
        ))}
      </div>
    </section>
  );
}
