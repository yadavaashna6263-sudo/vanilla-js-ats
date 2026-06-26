/* =========================================================
   PASSWORD.JS — Account Creation: password rules,
   animated strength meter, confirm-match validation.
   Note: only a "passwordCreated" flag is persisted to the
   candidate profile — the password value itself is never
   written to localStorage.
   ========================================================= */

const STRENGTH_LABELS = ['Weak', 'Medium', 'Strong', 'Excellent'];
const STRENGTH_COLORS = ['var(--danger)', 'var(--accent)', 'var(--accent-2)', 'var(--accent-2)'];

function getPasswordRules(value) {
  return {
    length: value.length >= 8,
    upper: /[A-Z]/.test(value),
    lower: /[a-z]/.test(value),
    number: /\d/.test(value),
    special: /[^A-Za-z0-9]/.test(value),
  };
}

function scorePassword(rules) {
  const metCount = Object.values(rules).filter(Boolean).length;
  if (metCount <= 2) return 0; // Weak
  if (metCount === 3) return 1; // Medium
  if (metCount === 4) return 2; // Strong
  return 3; // Excellent (all 5)
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('accountForm');
  if (!form) return;
  renderErrorSummary(form, document.getElementById('errorSummary'));

  const password = document.getElementById('password');
  const confirmPassword = document.getElementById('confirmPassword');
  const bars = document.querySelectorAll('.strength-bar');
  const strengthLabel = document.getElementById('strengthLabel');
  const ruleItems = {
    length: document.querySelector('[data-rule="length"]'),
    upper: document.querySelector('[data-rule="upper"]'),
    lower: document.querySelector('[data-rule="lower"]'),
    number: document.querySelector('[data-rule="number"]'),
    special: document.querySelector('[data-rule="special"]'),
  };
  const matchError = document.getElementById('matchError');
  const submitBtn = document.getElementById('accountSubmitBtn');

  function renderRules(rules) {
    Object.entries(rules).forEach(([key, met]) => {
      if (ruleItems[key]) ruleItems[key].classList.toggle('is-met', met);
    });
  }

  function renderMeter(score) {
    bars.forEach((bar, i) => {
      bar.classList.remove('is-filling');
      if (i <= score) {
        bar.style.background = STRENGTH_COLORS[score];
        bar.classList.add('is-filling');
      } else {
        bar.style.background = 'var(--border)';
      }
    });
    strengthLabel.textContent = password.value ? `Strength: ${STRENGTH_LABELS[score]}` : '';
  }

  function checkMatch() {
    if (!confirmPassword.value) {
      matchError.style.display = 'none';
      confirmPassword.removeAttribute('aria-invalid');
      return true;
    }
    const matches = password.value === confirmPassword.value;
    matchError.style.display = matches ? 'none' : 'block';
    confirmPassword.setAttribute('aria-invalid', String(!matches));
    confirmPassword.closest('.field').classList.toggle('is-invalid', !matches);
    confirmPassword.closest('.field').classList.toggle('is-valid', matches && confirmPassword.value !== '');
    return matches;
  }

  function checkNext() {
    const rules = getPasswordRules(password.value);
    const allRulesMet = Object.values(rules).every(Boolean);
    const matches = checkMatch();
    submitBtn.disabled = !(allRulesMet && matches && confirmPassword.value !== '');
  }

  password.addEventListener('input', () => {
    const rules = getPasswordRules(password.value);
    renderRules(rules);
    renderMeter(scorePassword(rules));
    checkNext();
  });

  confirmPassword.addEventListener('input', checkNext);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (submitBtn.disabled) return;
    updateProfile('account', { passwordCreated: true });
    showToast('Account created');
    window.location.href = 'review.html';
  });
});
