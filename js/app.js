/* =========================================================
   APP.JS — Shared utilities + glue that doesn't belong to
   any single feature file (toasts, nav, footer, home page
   counters, success page reveal).
   ========================================================= */

/* ---------- Toast notifications ---------- */
function ensureToastRegion() {
  let region = document.querySelector('.toast-region');
  if (!region) {
    region = document.createElement('div');
    region.className = 'toast-region';
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', 'polite');
    document.body.appendChild(region);
  }
  return region;
}

function showToast(message, type = 'success', duration = 3200) {
  const region = ensureToastRegion();
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'toast--error' : ''}`;
  toast.setAttribute('role', 'alert');

  const icon =
    type === 'error'
      ? '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>'
      : '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>';

  toast.innerHTML = `${icon}<span>${message}</span>`;
  region.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('is-leaving');
    setTimeout(() => toast.remove(), 220);
  }, duration);
}

/* ---------- Footer year ---------- */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
});

/* ---------- Active nav link ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (!page) return;
  document.querySelectorAll(`.main-nav a, .mobile-nav-panel a`).forEach((link) => {
    if (link.dataset.navKey === page) link.classList.add('is-active');
  });
});

/* ---------- Mobile nav toggle ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.querySelector('.mobile-menu-btn');
  const panel = document.querySelector('.mobile-nav-panel');
  if (!btn || !panel) return;

  btn.addEventListener('click', () => {
    const isOpen = panel.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(isOpen));
  });

  // Esc closes the mobile panel
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('is-open')) {
      panel.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      btn.focus();
    }
  });
});

/* ---------- Home page: animated stat counters (Intersection Observer) ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const stats = document.querySelectorAll('.stat-number[data-count-to]');
  if (!stats.length) return;

  const animateCount = (el) => {
    const target = parseInt(el.dataset.countTo, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1100;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      el.classList.add('is-counting');
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  stats.forEach((el) => observer.observe(el));
});

/* ---------- Success page reveal ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const idEl = document.querySelector('[data-application-id]');
  if (!idEl) return;

  const profile = getProfile();
  let appId = profile.meta.applicationId;

  // Fallback: if someone lands here directly without going through review,
  // still show a valid-looking ID rather than a blank page.
  if (!appId) {
    appId = generateApplicationId();
    profile.meta.applicationId = appId;
    saveProfile(profile);
  }

  idEl.textContent = appId;

  const nameEl = document.querySelector('[data-applicant-name]');
  if (nameEl) nameEl.textContent = profile.personal.fullName || 'Candidate';

  const roleEl = document.querySelector('[data-applied-role]');
  if (roleEl) roleEl.textContent = profile.jobRole || 'the role';

  const restartBtn = document.querySelector('[data-start-new]');
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      clearProfile();
      window.location.href = 'jobs.html';
    });
  }
});

/* ---------- Skeleton loading: hide skeletons once restore is done ---------- */
function hideSkeletons() {
  document.querySelectorAll('.skeleton').forEach((el) => el.classList.add('visually-hidden'));
  document.querySelectorAll('[data-real-content]').forEach((el) => el.classList.remove('visually-hidden'));
}
