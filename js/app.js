/* =========================================================
   Keep Clone — app logic (vanilla JS, no build step)

   Sections:
     1. Storage       – load/save notes in localStorage
     2. Rendering     – build note cards
     3. Masonry       – size cards into the CSS grid
     4. Composer      – the "Take a note…" input
     5. Delete + Undo
     6. AI feature #1 – Dark mode
     7. AI feature #2 – Drag-and-drop reordering
     8. Navbar / sidebar
   ========================================================= */
(function () {
  'use strict';

  /* ---------- 1. Storage ---------- */
  const STORAGE_KEY = 'keep-clone-notes';

  /**
   * A note looks like:
   * { id: string, title: string, body: string, createdAt: number }
   * Add new fields here for your manual feature (e.g. color, pinned, tags).
   */
  function loadNotes() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.warn('Could not read notes, starting fresh.', err);
      return [];
    }
  }

  function saveNotes() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (err) {
      console.error('Could not save notes.', err);
    }
  }

  function makeId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  let notes = loadNotes();

  /* ---------- DOM refs ---------- */
  const grid = document.getElementById('notesGrid');
  const emptyState = document.getElementById('emptyState');
  const composer = document.getElementById('composer');
  const titleInput = document.getElementById('noteTitle');
  const bodyInput = document.getElementById('noteBody');
  const closeBtn = document.getElementById('closeComposer');
  const toast = document.getElementById('toast');
  const undoBtn = document.getElementById('undoBtn');
  const themeToggle = document.getElementById('themeToggle');
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');
  const scrim = document.getElementById('scrim');
  const navbar = document.querySelector('.navbar');

  const DELETE_ICON =
    '<svg viewBox="0 0 24 24"><path d="M15 4V3H9v1H4v2h1v13c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V6h1V4h-5zm2 15H7V6h10v13zM9 8h2v9H9zm4 0h2v9h-2z"/></svg>';

  /* ---------- 2. Rendering ---------- */
  function createNoteEl(note) {
    const card = document.createElement('article');
    card.className = 'note';
    card.dataset.id = note.id;
    card.tabIndex = 0;

    const title = document.createElement('h3');
    title.className = 'note-title';
    title.textContent = note.title; // textContent = safe from HTML injection

    const body = document.createElement('p');
    body.className = 'note-body';
    body.textContent = note.body;

    const toolbar = document.createElement('div');
    toolbar.className = 'note-toolbar';

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'icon-btn delete-btn';
    del.title = 'Delete note';
    del.setAttribute('aria-label', 'Delete note');
    del.innerHTML = DELETE_ICON;

    toolbar.append(del);
    card.append(title, body, toolbar);
    return card;
  }

  function render() {
    grid.replaceChildren(...notes.map(createNoteEl));
    emptyState.hidden = notes.length > 0;
    layoutMasonry();
  }

  /* ---------- 3. Masonry ----------
     The grid has 2px rows. Each card spans enough rows to fit
     its own height (+ bottom margin), so short and tall cards
     pack together like Google Keep. */
  const ROW_HEIGHT = 2;

  function sizeCard(card) {
    const gap = parseFloat(getComputedStyle(grid).getPropertyValue('--gap')) || 16;
    card.style.gridRowEnd = 'auto';
    const height = card.getBoundingClientRect().height;
    card.style.gridRowEnd = 'span ' + Math.ceil((height + gap) / ROW_HEIGHT);
  }

  function layoutMasonry() {
    grid.querySelectorAll('.note').forEach(sizeCard);
  }

  // Re-layout when the window resizes (column widths change → heights change)
  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(layoutMasonry, 80);
  });
  // Web font loading can change text height after first paint
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutMasonry);

  /* ---------- 4. Composer ---------- */
  function expandComposer() {
    composer.classList.add('expanded');
  }

  function autoGrow() {
    bodyInput.style.height = 'auto';
    bodyInput.style.height = bodyInput.scrollHeight + 'px';
  }

  function commitNote() {
    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    if (title || body) {
      notes.unshift({ id: makeId(), title: title, body: body, createdAt: Date.now() });
      saveNotes();
      render();
    }

    titleInput.value = '';
    bodyInput.value = '';
    bodyInput.style.height = '';
    composer.classList.remove('expanded');
    document.activeElement && document.activeElement.blur();
  }

  bodyInput.addEventListener('focus', expandComposer);
  titleInput.addEventListener('focus', expandComposer);
  bodyInput.addEventListener('input', autoGrow);
  closeBtn.addEventListener('click', commitNote);
  composer.addEventListener('submit', function (e) {
    e.preventDefault();
    commitNote();
  });

  composer.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      commitNote();
    } else if (e.key === 'Escape') {
      commitNote();
    } else if (e.key === 'Enter' && e.target === titleInput) {
      e.preventDefault();
      bodyInput.focus();
    }
  });

  // Clicking anywhere outside the composer saves & closes it (like Keep)
  document.addEventListener('mousedown', function (e) {
    if (composer.classList.contains('expanded') && !composer.contains(e.target)) {
      commitNote();
    }
  });

  /* ---------- 5. Delete + Undo ---------- */
  let lastDeleted = null; // { note, index }
  let toastTimer;

  function deleteNote(id) {
    const index = notes.findIndex(function (n) { return n.id === id; });
    if (index === -1) return;

    const card = grid.querySelector('[data-id="' + id + '"]');
    lastDeleted = { note: notes[index], index: index };
    notes.splice(index, 1);
    saveNotes();

    // Short fade before re-render
    if (card) {
      card.style.transition = 'opacity 0.15s, transform 0.15s';
      card.style.opacity = '0';
      card.style.transform = 'scale(0.95)';
      setTimeout(render, 150);
    } else {
      render();
    }
    showToast();
  }

  function showToast() {
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.hidden = true;
      lastDeleted = null;
    }, 5000);
  }

  undoBtn.addEventListener('click', function () {
    if (!lastDeleted) return;
    notes.splice(lastDeleted.index, 0, lastDeleted.note);
    lastDeleted = null;
    saveNotes();
    render();
    toast.hidden = true;
  });

  // One listener for every card's buttons (event delegation)
  grid.addEventListener('click', function (e) {
    const delBtn = e.target.closest('.delete-btn');
    if (delBtn) {
      deleteNote(delBtn.closest('.note').dataset.id);
    }
    // 🔧 Your manual feature can handle its own buttons here too
  });

  grid.addEventListener('keydown', function (e) {
    if ((e.key === 'Delete' || e.key === 'Backspace') && e.target.classList.contains('note')) {
      deleteNote(e.target.dataset.id);
    }
  });

  /* ---------- 6. AI feature #1 — Dark mode ----------
     - Remembers your choice in localStorage
     - Falls back to the OS setting if you never chose
     - Inline script in <head> applies it before paint (no flash) */
  const THEME_KEY = 'keep-clone-theme';
  const themeMeta = document.querySelector('meta[name="theme-color"]');

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    themeMeta.setAttribute('content', theme === 'dark' ? '#202124' : '#ffffff');
    themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
    themeToggle.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  }

  applyTheme(document.documentElement.dataset.theme || 'light');

  themeToggle.addEventListener('click', function () {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }
  });

  // Follow OS changes only if the user hasn't picked a theme themselves
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    let saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (err) { /* ignore */ }
    if (!saved) applyTheme(e.matches ? 'dark' : 'light');
  });

  /* ---------- 7. AI feature #2 — Drag-and-drop reordering ----------
     SortableJS handles mouse + touch. On phones you long-press
     (250 ms) to pick a note up, so normal scrolling still works. */
  if (window.Sortable) {
    Sortable.create(grid, {
      animation: 180,
      easing: 'cubic-bezier(0.2, 0, 0, 1)',
      delay: 250,
      delayOnTouchOnly: true,
      touchStartThreshold: 5,
      filter: '.icon-btn',       // clicking buttons never starts a drag
      preventOnFilter: false,
      ghostClass: 'drag-ghost',
      chosenClass: 'drag-chosen',
      dragClass: 'dragging',
      forceFallback: true,       // consistent look on all browsers
      fallbackOnBody: true,
      onEnd: function () {
        // Read the new order from the DOM and save it
        const order = Array.from(grid.children).map(function (el) { return el.dataset.id; });
        const byId = new Map(notes.map(function (n) { return [n.id, n]; }));
        notes = order.map(function (id) { return byId.get(id); }).filter(Boolean);
        saveNotes();
        layoutMasonry();
      }
    });
  }

  /* ---------- 8. Navbar / sidebar ---------- */
  const mobileQuery = window.matchMedia('(max-width: 640px)');

  function closeDrawer() {
    sidebar.classList.remove('open');
    scrim.classList.remove('show');
    menuBtn.setAttribute('aria-expanded', 'false');
  }

  menuBtn.addEventListener('click', function () {
    if (mobileQuery.matches) {
      const open = sidebar.classList.toggle('open');
      scrim.classList.toggle('show', open);
      menuBtn.setAttribute('aria-expanded', String(open));
    } else {
      const collapsed = sidebar.classList.toggle('collapsed');
      menuBtn.setAttribute('aria-expanded', String(!collapsed));
      setTimeout(layoutMasonry, 220); // grid width changed
    }
  });

  scrim.addEventListener('click', closeDrawer);
  mobileQuery.addEventListener('change', closeDrawer);

  window.addEventListener('scroll', function () {
    navbar.classList.toggle('scrolled', window.scrollY > 4);
  }, { passive: true });

  /* ---------- Go ---------- */
  render();
})();
