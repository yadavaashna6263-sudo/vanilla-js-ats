/* =========================================================
   PROGRESS.JS — Sticky top progress bar
   Reads body[data-progress] (0–100) and body[data-progress-label]
   set per page, then animates the fill + updates step dots
   on the multi-step form pages.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  // Only render the tracker on pages that opt in via data-progress
  // (the application flow) — Home and Jobs stay free of it.
  if (document.body.dataset.progress === undefined) return;

  const value = parseInt(document.body.dataset.progress || '0', 10);
  const label = document.body.dataset.progressLabel || '';

  let track = document.querySelector('.progress-track');
  if (!track) {
    track = document.createElement('div');
    track.className = 'progress-track';
    track.setAttribute('role', 'progressbar');
    track.setAttribute('aria-valuemin', '0');
    track.setAttribute('aria-valuemax', '100');
    track.innerHTML = '<div class="progress-fill"></div>';
    document.body.prepend(track);
  }
  track.setAttribute('aria-valuenow', String(value));
  track.setAttribute('aria-label', `Application progress: ${label || value + '%'}`);

  const fill = track.querySelector('.progress-fill');
  requestAnimationFrame(() => {
    fill.style.width = `${value}%`;
  });

  if (label) {
    let tag = document.querySelector('.progress-label');
    if (!tag) {
      tag = document.createElement('div');
      tag.className = 'progress-label mono';
      document.body.appendChild(tag);
    }
    tag.textContent = label;
  }

  // Step dots on the application form pages (form-steps with N .form-step children)
  const steps = document.querySelectorAll('.form-step');
  const activeIndex = parseInt(document.body.dataset.stepIndex || '0', 10);
  if (steps.length) {
    steps.forEach((step, i) => {
      step.classList.remove('is-active', 'is-done');
      if (i < activeIndex) step.classList.add('is-done');
      if (i === activeIndex) step.classList.add('is-active');
    });
  }

  // Breadcrumb nav — replaces the plain step-name labels with clickable
  // done/current/pending items: "Personal › Professional › Experience › Account › Review"
  const breadcrumbEl = document.querySelector('.form-steps-labels');
  if (breadcrumbEl && steps.length) {
    const FLOW_STEPS = [
      { label: 'Personal', href: 'application-step1.html' },
      { label: 'Professional', href: 'application-step2.html' },
      { label: 'Experience', href: 'application-step3.html' },
      { label: 'Account', href: 'account.html' },
      { label: 'Review', href: 'review.html' },
    ];
    breadcrumbEl.className = 'breadcrumb-nav';
    breadcrumbEl.removeAttribute('aria-hidden');
    breadcrumbEl.setAttribute('aria-label', 'Application steps');

    breadcrumbEl.innerHTML = FLOW_STEPS.map((step, i) => {
      const state = i < activeIndex ? 'done' : i === activeIndex ? 'current' : 'pending';
      const inner = state === 'done' ? `<a href="${step.href}">${step.label}</a>` : step.label;
      const sep = i < FLOW_STEPS.length - 1 ? '<span class="breadcrumb-sep">›</span>' : '';
      return `<span class="breadcrumb-item is-${state}"${
        state === 'current' ? ' aria-current="step"' : ''
      }>${inner}</span>${sep}`;
    }).join('');
  }
});
