import { useEffect, useRef, useState } from 'react';

/*  The "Take a note…" box.
    Expands when clicked, grows as you type, and saves when you:
    click Close, press Ctrl/Cmd + Enter, press Esc, or click outside.   */

export default function NoteComposer({ onAdd }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [expanded, setExpanded] = useState(false);

  const formRef = useRef(null);
  const bodyRef = useRef(null);

  // Keep the latest values for the outside-click listener
  const latest = useRef({ title, body });
  latest.current = { title, body };

  function commit() {
    const t = latest.current.title.trim();
    const b = latest.current.body.trim();
    if (t || b) onAdd({ title: t, body: b });

    setTitle('');
    setBody('');
    setExpanded(false);
    document.activeElement?.blur();
  }

  // Auto-grow the textarea
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    el.style.height = 'auto';
    if (body) el.style.height = `${el.scrollHeight}px`;
  }, [body]);

  // Clicking anywhere outside saves & closes (like Google Keep)
  useEffect(() => {
    if (!expanded) return;
    function onMouseDown(e) {
      if (formRef.current && !formRef.current.contains(e.target)) commit();
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  function handleKeyDown(e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      commit();
    } else if (e.key === 'Escape') {
      commit();
    }
  }

  return (
    <form
      ref={formRef}
      className={`composer${expanded ? ' expanded' : ''}`}
      autoComplete="off"
      onSubmit={(e) => {
        e.preventDefault();
        commit();
      }}
      onKeyDown={handleKeyDown}
    >
      <input
        className="composer-title"
        type="text"
        placeholder="Title"
        maxLength={200}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onFocus={() => setExpanded(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            bodyRef.current?.focus();
          }
        }}
      />
      <textarea
        ref={bodyRef}
        className="composer-body"
        placeholder="Take a note…"
        rows={1}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onFocus={() => setExpanded(true)}
      />
      <div className="composer-actions">
        <span className="composer-hint">Ctrl + Enter to save</span>
        <button type="button" className="text-btn" onClick={commit}>
          Close
        </button>
      </div>
    </form>
  );
}
