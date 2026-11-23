import { DeleteIcon } from './Icons.jsx';

/*  One note in the grid.
    🔧 Manual feature: add your own button next to Delete,
       and your own className when the note needs to look different. */

export default function NoteCard({ note, onDelete }) {
  return (
    <article
      className="note"
      data-id={note.id}
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === 'Delete' || e.key === 'Backspace') && e.target === e.currentTarget) {
          onDelete(note.id);
        }
      }}
    >
      {note.title && <h3 className="note-title">{note.title}</h3>}
      {note.body && <p className="note-body">{note.body}</p>}

      <div className="note-toolbar">
        <button
          type="button"
          className="icon-btn delete-btn"
          title="Delete note"
          aria-label="Delete note"
          onClick={() => onDelete(note.id)}
        >
          <DeleteIcon />
        </button>
      </div>
    </article>
  );
}
