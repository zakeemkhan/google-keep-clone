import { BulbIcon } from './Icons.jsx';

export default function Sidebar({ isMobile, open, collapsed, onClose }) {
  const classes = ['sidebar'];
  if (isMobile && open) classes.push('open');
  if (!isMobile && collapsed) classes.push('collapsed');

  return (
    <>
      <nav className={classes.join(' ')} aria-label="Sections">
        <a href="#" className="side-item active">
          <BulbIcon />
          <span>Notes</span>
        </a>
      </nav>
      <div className={`scrim${isMobile && open ? ' show' : ''}`} onClick={onClose} />
    </>
  );
}
