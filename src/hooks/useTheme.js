import { useEffect, useState } from 'react';

/*  AI-assisted feature #1 — Dark mode
    - Remembers the choice in localStorage
    - Follows the OS setting until the user picks one
    - Fades colours smoothly when switching (html.theme-fading)            */

const THEME_KEY = 'keep-clone-theme';
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

function readSaved() {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
}

export default function useTheme() {
  // index.html already set data-theme before React loaded
  const [theme, setTheme] = useState(
    () => document.documentElement.dataset.theme || 'light'
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#202124' : '#ffffff');
  }, [theme]);

  // Follow OS changes only if the user never chose a theme
  useEffect(() => {
    const onChange = (e) => {
      if (!readSaved()) setTheme(e.matches ? 'dark' : 'light');
    };
    darkQuery.addEventListener('change', onChange);
    return () => darkQuery.removeEventListener('change', onChange);
  }, []);

  function toggleTheme() {
    const root = document.documentElement;
    root.classList.add('theme-fading');
    window.setTimeout(() => root.classList.remove('theme-fading'), 400);

    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  return [theme, toggleTheme];
}
