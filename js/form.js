if (!('scheduler' in globalThis)) { globalThis.scheduler = { yield: () => Promise.resolve() }; }
(function() {
  'use strict';

  /* === CLIENT-SIDE FORM VALIDATION — NO DEPENDENCIES === */
  document.querySelectorAll('form[novalidate]').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await scheduler.yield();

      let valid = true;

      form.querySelectorAll('[required]').forEach(field => {
        const error = form.querySelector(`[data-error="${field.name}"]`);
        if (!field.value.trim()) {
          valid = false;
          field.setAttribute('aria-invalid', 'true');
          if (error) {
            error.textContent = '[Field required]';
            error.removeAttribute('hidden');
          }
        } else {
          field.removeAttribute('aria-invalid');
          if (error) {
            error.textContent = '';
            error.hidden = true;
          }
        }
      });

      if (valid) {
        const status = document.getElementById('form-status');
        const btn = form.querySelector('[type="submit"]');

        /* Guard: block submit when the form action is still a placeholder.
           Becomes inert once a real Formspree ID replaces XXXXXXXX. */
        if (/\/X{4,}$/.test(new URL(form.action, location.href).pathname)) {
          status.innerHTML =
            'Our contact form is not yet connected. Please email us directly at <a href="mailto:hello@gardenstatecoon.com">hello@gardenstatecoon.com</a>.';
          return;
        }

        btn.disabled = true;
        await scheduler.yield();
        try {
          const resp = await fetch(form.action, {method:'POST',body:new FormData(form),headers:{'Accept':'application/json'}});
          if (resp.ok) { status.textContent = 'Message sent! We\u2019ll reply within 48 hours.'; form.reset(); }
          else { status.textContent = 'Something went wrong. Please email us directly.'; }
        } catch (err) { status.textContent = 'Network error. Please try again.'; }
        finally { btn.disabled = false; }
      }
    });
  });
})();
