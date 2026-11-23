import { useEffect, useState } from 'react';
import { Logo, MenuIcon, MoonIcon, SunIcon } from './Icons.jsx';

export default function Navbar({ theme, onToggleTheme, onToggleMenu, menuOpen }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isDark = theme === 'dark';

  return (
    <header className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="nav-left">
        <button
          type="button"
          className="icon-btn"
          aria-label="Main menu"
          aria-expanded={menuOpen}
          onClick={onToggleMenu}
        >
          <MenuIcon />
        </button>
        <a href="#" className="brand">
          <Logo />
          <span className="brand-name">Keep Clone</span>
        </a>
      </div>

      {/* 🔧 Slot for a search bar, if you ever add one */}
      <div className="nav-center" />

      <div className="nav-right">
        <button
          type="button"
          className="icon-btn theme-toggle"
          aria-label="Toggle dark mode"
          aria-pressed={isDark}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={onToggleTheme}
        >
          {/* key makes React re-mount the icon, which replays the spin animation */}
          {isDark ? <SunIcon key="sun" className="theme-icon" /> : <MoonIcon key="moon" className="theme-icon" />}
        </button>
        <div className="avatar" title="Signed in (demo)">M</div>
      </div>
    </header>
  );
}
