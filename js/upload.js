/* =========================================================
   UPLOAD.JS — Step 3: Resume drag-and-drop upload
   Also owns the final Step 3 "Next" gating, aggregating
   validity flags exposed by validation.js and experience.js.
   ========================================================= */

const MAX_RESUME_BYTES = 5 * 1024 * 1024; // 5MB
// formatFileSize() now lives in storage.js, shared with review.js

document.addEventListener('DOMContentLoaded', () => {
  const zone = document.getElementById('uploadZone');
  if (!zone) return;

  const fileInput = document.getElementById('resumeInput');
  const preview = document.getElementById('uploadPreview');
  const previewName = document.getElementById('uploadPreviewName');
  const previewSize = document.getElementById('uploadPreviewSize');
  const removeBtn = document.getElementById('uploadRemove');
  const zoneError = document.getElementById('uploadError');
  const submitBtn = document.getElementById('step3NextBtn');
  const form = document.getElementById('step3Form');

  const profile = getProfile();
  let currentResume = profile.experience.resume || null;
  if (currentResume) showPreview(currentResume);

  function showPreview(resume) {
    previewName.textContent = resume.name;
    previewSize.textContent = formatFileSize(resume.size);
    preview.classList.add('is-visible');
    zone.querySelector('.upload-zone-text').style.display = 'none';
  }

  function clearPreview() {
    preview.classList.remove('is-visible');
    zone.querySelector('.upload-zone-text').style.display = '';
    fileInput.value = '';
    currentResume = null;
    setProfileField('experience', 'resume', null);
    checkNext();
  }

  function handleFile(file) {
    zoneError.style.display = 'none';
    zone.classList.remove('is-invalid');

    if (file.type !== 'application/pdf') {
      zoneError.textContent = 'Only PDF files are accepted.';
      zoneError.style.display = 'block';
      zone.classList.add('is-invalid');
      return;
    }
    if (file.size > MAX_RESUME_BYTES) {
      zoneError.textContent = 'File is too large — the limit is 5MB.';
      zoneError.style.display = 'block';
      zone.classList.add('is-invalid');
      return;
    }

    // Note: only metadata is persisted to localStorage (not the binary),
    // since browser storage isn't meant to hold multi-MB file payloads.
    currentResume = { name: file.name, size: file.size };
    setProfileField('experience', 'resume', currentResume);
    showPreview(currentResume);
    showToast('Resume uploaded');
    checkNext();
  }

  zone.addEventListener('click', () => fileInput.click());
  zone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput.click();
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) handleFile(fileInput.files[0]);
  });

  ['dragenter', 'dragover'].forEach((evt) =>
    zone.addEventListener(evt, (e) => {
      e.preventDefault();
      zone.classList.add('is-dragover');
    })
  );
  ['dragleave', 'drop'].forEach((evt) =>
    zone.addEventListener(evt, (e) => {
      e.preventDefault();
      zone.classList.remove('is-dragover');
    })
  );
  zone.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });

  removeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    clearPreview();
  });

  /* ---------- Resume Score (/100) ---------- */
  const RESUME_SCORE_RULES = [
    { label: 'Skills selected (3+)', points: 20, check: (p) => (p.professional.skills || []).length >= 3 },
    { label: 'Portfolio added', points: 20, check: (p) => !!p.professional.portfolio },
    { label: 'GitHub added', points: 20, check: (p) => !!p.professional.github },
    {
      label: 'Cover letter added',
      points: 20,
      check: (p) => (p.experience.coverLetter || '').trim().length >= 100,
    },
    {
      label: 'Experience added',
      points: 20,
      check: (p) => !!p.experience.joiningDate && !!p.experience.lastWorkingDate,
    },
  ];

  function renderResumeScore() {
    const scoreEl = document.getElementById('resumeScore');
    if (!scoreEl) return;
    const liveProfile = getProfile();
    let score = 0;
    const rows = RESUME_SCORE_RULES.map((rule) => {
      const met = rule.check(liveProfile);
      if (met) score += rule.points;
      return { ...rule, met };
    });

    scoreEl.innerHTML = `
      <div class="resume-score-head">
        <span>Resume Score</span>
        <span class="resume-score-value">${score}/100</span>
      </div>
      <div class="resume-score-track"><div class="resume-score-fill" style="width:${score}%;"></div></div>
      <ul>
        ${rows
          .map(
            (r) =>
              `<li class="${r.met ? 'is-met' : ''}"><span class="rule-dot"></span>${r.label} (+${r.points})</li>`
          )
          .join('')}
      </ul>`;
  }

  /* ---------- Aggregate gating for the whole of Step 3 ---------- */
  function checkNext() {
    const resumeOk = !!currentResume;
    const salaryOk = typeof window.step3SalaryValid === 'function' ? window.step3SalaryValid() : true;
    const coverLetterOk =
      typeof window.step3CoverLetterValid === 'function' ? window.step3CoverLetterValid() : true;
    const datesOk = typeof window.experienceDatesValid === 'function' ? window.experienceDatesValid() : true;
    submitBtn.disabled = !(resumeOk && salaryOk && coverLetterOk && datesOk);
  }
  window.checkStep3Next = checkNext;
  form.addEventListener('input', checkNext);
  form.addEventListener('input', renderResumeScore);
  form.addEventListener('change', renderResumeScore);
  checkNext();
  renderResumeScore();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (submitBtn.disabled) return;
    window.location.href = 'account.html';
  });
});
