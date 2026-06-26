/* =========================================================
   LOGIN.JS — Log In
   There's no backend here, so "logging in" means checking the
   entered email against the candidateProfile already saved in
   this browser's localStorage. Honest by design: the password
   field is collected but never actually verified against anything.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  if (!form) return;

  const emailInput = document.getElementById('loginEmail');
  const errorEl = document.getElementById('loginError');

  function showError(message) {
    errorEl.classList.add('is-visible');
    errorEl.innerHTML = `
      <p class="error-summary-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;flex-shrink:0;"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>
        ${message}
      </p>`;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    errorEl.classList.remove('is-visible');

    const email = emailInput.value.trim().toLowerCase();
    const profile = getProfile();
    const savedEmail = (profile.personal.email || '').toLowerCase();

    if (profile.meta.applicationId && savedEmail && savedEmail === email) {
      showToast(`Welcome back, ${profile.personal.fullName || 'there'}!`);
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 400);
    } else {
      showError("We couldn't find an application with that email on this device.");
    }
  });
});
