(function() {
  'use strict';

  /* === HAMBURGER TOGGLE === */
  const btn = document.querySelector('[data-hamburger]');
  const nav = document.querySelector('[data-nav-menu]');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    nav.hidden = expanded;
  }, { passive: true });

  /* === BREAKPOINT LISTENER === */
  const mql = window.matchMedia('(min-width: 769px)');
  function handleBreakpoint(e) {
    if (e.matches) {
      nav.hidden = false;
      btn.setAttribute('aria-expanded', 'false');
      btn.hidden = true;
    } else {
      btn.hidden = false;
    }
  }
  mql.addEventListener('change', handleBreakpoint);
  handleBreakpoint(mql);

  /* === MARK CURRENT PAGE === */
  document.querySelectorAll('[data-nav-link]').forEach(link => {
    if (link.pathname === location.pathname) {
      link.setAttribute('aria-current', 'page');
    }
  });
})();