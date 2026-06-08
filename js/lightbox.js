if (!('scheduler' in globalThis)) { globalThis.scheduler = { yield: () => Promise.resolve() }; }
(function() {
  'use strict';

  /* === NATIVE LIGHTBOX — NO DEPENDENCIES === */
  const dialog = document.getElementById('lightbox-dialog');
  if (!dialog) return;

  document.querySelectorAll('[data-lightbox]').forEach(trigger => {
    trigger.addEventListener('click', async (e) => {
      e.preventDefault();
      await scheduler.yield();
      dialog.querySelector('img').src = trigger.href;
      dialog.showModal();
    }, { passive: false });
  });

  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  }, { passive: true });
})();
