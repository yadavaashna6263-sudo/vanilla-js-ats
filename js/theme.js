/* =========================================================
   THEME.JS — Light / dark mode, persisted across pages
   Default theme is "dark" (the cinematic Spotlight look).
   ========================================================= */

function getStoredTheme() {
  return localStorage.getItem(THEME_KEY) || 'dark';
}

function applyTheme(theme) {
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  document.documentElement.style.colorScheme = theme === 'light' ? 'light' : 'dark';
}

// Apply immediately (before DOMContentLoaded) to avoid a flash of the wrong theme.
applyTheme(getStoredTheme());

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.theme-toggle');
  if (!toggle) return;

  toggle.setAttribute('aria-pressed', String(getStoredTheme() === 'light'));

  toggle.addEventListener('click', () => {
    const next = getStoredTheme() === 'light' ? 'dark' : 'light';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
    toggle.setAttribute('aria-pressed', String(next === 'light'));
  });
});
