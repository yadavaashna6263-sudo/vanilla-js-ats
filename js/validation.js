/* =========================================================
   VALIDATION.JS — Regex validators + real-time field wiring
   Covers: Step 1 (Personal Info) entirely, plus the URL
   fields on Step 2 and the salary/cover-letter fields on
   Step 3 (skills.js / upload.js / experience.js own the rest
   of those pages).
   ========================================================= */

/* ---------- Patterns ---------- */
const PATTERNS = {
  fullName: /^[A-Za-z][A-Za-z\s.'-]{2,49}$/, // letters only, 3–50 chars
  email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
  phoneIndia: /^(?:\+91[\s-]?)?[6-9]\d{9}$/, // Indian mobile numbers
  linkedin: /^https?:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9\-_%]+\/?$/i,
  github: /^https?:\/\/(www\.)?github\.com\/[A-Za-z0-9\-]+\/?$/i,
  numbersOnly: /^\d+$/,
};

/* ---------- Disposable email detection ---------- */
const DISPOSABLE_EMAIL_DOMAINS = [
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'throwaway.email',
  'yopmail.com',
  'trashmail.com',
  'getnada.com',
  'dispostable.com',
  'fakeinbox.com',
  'maildrop.cc',
  'sharklasers.com',
];

function isDisposableEmail(value) {
  const domain = value.split('@')[1]?.toLowerCase().trim();
  return !!domain && DISPOSABLE_EMAIL_DOMAINS.includes(domain);
}

function isValidEmail(value) {
  return PATTERNS.email.test(value) && !isDisposableEmail(value);
}

function isValidPortfolioUrl(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}

/* ---------- Generic field <-> validator binding ---------- */
/**
 * Wires one .field wrapper (containing the input + .field-error span)
 * to a validator function. Runs on 'input' (debounced feel via blur for
 * the "required" nag) and marks aria-invalid / is-valid / is-invalid.
 */
function bindFieldValidation(fieldEl, validatorFn, { errorMessage, onChange } = {}) {
  const input = fieldEl.querySelector('input, select, textarea');
  const errorEl = fieldEl.querySelector('.field-error');
  if (!input) return;

  function run() {
    const value = input.value.trim();
    if (value === '') {
      fieldEl.classList.remove('is-valid', 'is-invalid');
      input.removeAttribute('aria-invalid');
      if (onChange) onChange(false);
      return;
    }
    const result = validatorFn(value);
    const valid = result === true;
    fieldEl.classList.toggle('is-valid', valid);
    fieldEl.classList.toggle('is-invalid', !valid);
    input.setAttribute('aria-invalid', String(!valid));
    if (errorEl) errorEl.textContent = typeof result === 'string' ? result : errorMessage || '';
    if (onChange) onChange(valid);
  }

  input.addEventListener('input', run);
  input.addEventListener('blur', run);

  // Re-validate once on load in case of restored autosave values
  if (input.value.trim() !== '') run();
}

/**
 * Disables/enables a "Next" button based on every required field in
 * the form being both filled and free of .is-invalid.
 */
function refreshNextButtonState(form, nextBtn, extraCheck) {
  if (!form || !nextBtn) return;
  const update = () => {
    const requiredFields = Array.from(form.querySelectorAll('[required]'));
    const allFilled = requiredFields.every((f) => f.value.trim() !== '');
    const noInvalid = form.querySelectorAll('.is-invalid').length === 0;
    const extra = typeof extraCheck === 'function' ? extraCheck() : true;
    nextBtn.disabled = !(allFilled && noInvalid && extra);
  };
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  update();
  return update;
}

/**
 * Renders a live "Please fix N errors before continuing" banner at the top
 * of a form, with jump-links to each problem field. Only appears once the
 * candidate has actually started interacting with the form, so a blank
 * page never opens with an alarming error list.
 */
function renderErrorSummary(form, summaryEl) {
  if (!form || !summaryEl) return;
  let touched = false;
  form.addEventListener(
    'focusin',
    () => {
      touched = true;
      update();
    },
    { once: true }
  );

  function collectIssues() {
    const issues = [];
    form.querySelectorAll('.field').forEach((fieldEl) => {
      const input = fieldEl.querySelector('input, select, textarea');
      if (!input || !input.id) return;
      const labelEl = fieldEl.querySelector('label');
      const labelText = labelEl ? labelEl.textContent.replace('*', '').trim() : input.id;
      const isInvalid = fieldEl.classList.contains('is-invalid');
      const isEmptyRequired = input.hasAttribute('required') && input.value.trim() === '';
      if (isInvalid || isEmptyRequired) issues.push({ id: input.id, label: labelText });
    });
    return issues;
  }

  function update() {
    if (!touched) return;
    const issues = collectIssues();
    if (!issues.length) {
      summaryEl.classList.remove('is-visible');
      summaryEl.innerHTML = '';
      return;
    }
    summaryEl.classList.add('is-visible');
    summaryEl.innerHTML = `
      <p class="error-summary-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;flex-shrink:0;"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>
        Please fix ${issues.length} error${issues.length === 1 ? '' : 's'} before continuing.
      </p>
      <ul>${issues.map((i) => `<li><a href="#${i.id}">${i.label}</a></li>`).join('')}</ul>`;
  }

  summaryEl.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    const target = document.getElementById(link.getAttribute('href').slice(1));
    if (target) setTimeout(() => target.focus(), 350);
  });

  form.addEventListener('input', update);
  form.addEventListener('change', update);
}

/* =========================================================
   STEP 1 — Personal Information
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('step1Form');
  if (!form) return;

  const nextBtn = document.getElementById('step1NextBtn');
  const profile = getProfile();
  renderErrorSummary(form, document.getElementById('errorSummary'));

  // Restore previously saved values
  const fullName = form.querySelector('#fullName');
  const email = form.querySelector('#email');
  const phone = form.querySelector('#phone');
  const location = form.querySelector('#location');
  const desiredPosition = form.querySelector('#desiredPosition');

  fullName.value = profile.personal.fullName || '';
  email.value = profile.personal.email || '';
  phone.value = profile.personal.phone || '';
  location.value = profile.personal.location || '';
  desiredPosition.value = getJobRole() || 'No role selected — pick one from Jobs';

  bindFieldValidation(fullName.closest('.field'), (v) => PATTERNS.fullName.test(v), {
    errorMessage: 'Use 3–50 letters only (spaces, hyphens and apostrophes allowed).',
  });
  bindFieldValidation(
    email.closest('.field'),
    (v) => {
      if (isDisposableEmail(v)) return 'Disposable email addresses aren\u2019t accepted — please use a permanent one.';
      return PATTERNS.email.test(v);
    },
    { errorMessage: 'Enter a valid email address, like name@example.com.' }
  );
  bindFieldValidation(phone.closest('.field'), (v) => PATTERNS.phoneIndia.test(v), {
    errorMessage: 'Enter a valid 10-digit Indian mobile number.',
  });

  const update = refreshNextButtonState(form, nextBtn, () => location.value.trim() !== '');

  // Autosave on every change
  const persist = debounce(() => {
    updateProfile('personal', {
      fullName: fullName.value.trim(),
      email: email.value.trim(),
      phone: phone.value.trim(),
      location: location.value,
    });
    showToast('Draft saved');
  }, 700);

  [fullName, email, phone, location].forEach((el) => el.addEventListener('input', persist));
  location.addEventListener('change', update);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (nextBtn.disabled) return;
    updateProfile('personal', {
      fullName: fullName.value.trim(),
      email: email.value.trim(),
      phone: phone.value.trim(),
      location: location.value,
    });
    window.location.href = 'application-step2.html';
  });
});

/* =========================================================
   STEP 2 — URL fields (LinkedIn / GitHub / Portfolio)
   Education + Skills are wired in skills.js on the same page.
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('step2Form');
  if (!form) return;

  const profile = getProfile();
  renderErrorSummary(form, document.getElementById('errorSummary'));
  const linkedin = form.querySelector('#linkedin');
  const github = form.querySelector('#github');
  const portfolio = form.querySelector('#portfolio');

  linkedin.value = profile.professional.linkedin || '';
  github.value = profile.professional.github || '';
  portfolio.value = profile.professional.portfolio || '';

  bindFieldValidation(linkedin.closest('.field'), (v) => PATTERNS.linkedin.test(v), {
    errorMessage: 'Use the format linkedin.com/in/your-username.',
  });
  bindFieldValidation(github.closest('.field'), (v) => PATTERNS.github.test(v), {
    errorMessage: 'Use the format github.com/your-username.',
  });
  bindFieldValidation(portfolio.closest('.field'), isValidPortfolioUrl, {
    errorMessage: 'Enter a valid URL, including https://',
  });

  const persist = debounce(() => {
    updateProfile('professional', {
      linkedin: linkedin.value.trim(),
      github: github.value.trim(),
      portfolio: portfolio.value.trim(),
    });
    showToast('Draft saved');
  }, 700);

  [linkedin, github, portfolio].forEach((el) => el.addEventListener('input', persist));

  // Expose a re-check used by skills.js to gate the shared Next button
  window.step2UrlFieldsValid = () => {
    const optionalOk = (input, pattern) => input.value.trim() === '' || pattern(input.value.trim());
    return (
      optionalOk(linkedin, (v) => PATTERNS.linkedin.test(v)) &&
      optionalOk(github, (v) => PATTERNS.github.test(v)) &&
      optionalOk(portfolio, isValidPortfolioUrl)
    );
  };
});

/* =========================================================
   STEP 3 — Salary fields + Cover Letter counter
   Dates + resume are wired in experience.js / upload.js.
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('step3Form');
  if (!form) return;

  const profile = getProfile();
  renderErrorSummary(form, document.getElementById('errorSummary'));
  const currentSalary = form.querySelector('#currentSalary');
  const expectedSalary = form.querySelector('#expectedSalary');
  const coverLetter = form.querySelector('#coverLetter');
  const counter = document.getElementById('coverLetterCounter');

  currentSalary.value = profile.experience.currentSalary || '';
  expectedSalary.value = profile.experience.expectedSalary || '';
  coverLetter.value = profile.experience.coverLetter || '';

  bindFieldValidation(currentSalary.closest('.field'), (v) => PATTERNS.numbersOnly.test(v), {
    errorMessage: 'Numbers only, please — no commas or currency symbols.',
  });

  bindFieldValidation(
    expectedSalary.closest('.field'),
    (v) => PATTERNS.numbersOnly.test(v) && Number(v) > Number(currentSalary.value || 0),
    { errorMessage: 'Expected salary should be higher than your current salary.' }
  );

  function updateCounter() {
    const len = coverLetter.value.length;
    counter.textContent = `${len} / 1000`;
    counter.classList.remove('is-low', 'is-high');
    if (len > 0 && len < 100) counter.classList.add('is-low');
    if (len > 1000) counter.classList.add('is-high');
  }
  updateCounter();
  coverLetter.addEventListener('input', updateCounter);

  window.step3CoverLetterValid = () => {
    const len = coverLetter.value.trim().length;
    return len >= 100 && len <= 1000;
  };
  window.step3SalaryValid = () => {
    const currentOk = PATTERNS.numbersOnly.test(currentSalary.value.trim());
    const expectedOk =
      expectedSalary.value.trim() === '' ||
      (PATTERNS.numbersOnly.test(expectedSalary.value.trim()) &&
        Number(expectedSalary.value) > Number(currentSalary.value || 0));
    return currentOk && expectedOk;
  };

  const persist = debounce(() => {
    updateProfile('experience', {
      currentSalary: currentSalary.value.trim(),
      expectedSalary: expectedSalary.value.trim(),
      coverLetter: coverLetter.value,
    });
    showToast('Draft saved');
  }, 700);

  [currentSalary, expectedSalary, coverLetter].forEach((el) => el.addEventListener('input', persist));
});
