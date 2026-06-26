/* =========================================================
   COMPLETION.JS — Profile Completion Score
   completedFields / totalFields * 100, recalculated live as
   the candidate types on ANY step (not just the current one),
   since it reflects the whole application, not just this page.
   ========================================================= */

function calculateProfileCompletion(profile) {
  const checks = [
    !!profile.personal.fullName,
    !!profile.personal.email,
    !!profile.personal.phone,
    !!profile.personal.location,
    !!profile.professional.linkedin,
    !!profile.professional.github,
    !!profile.professional.portfolio,
    !!profile.professional.education,
    (profile.professional.skills || []).length > 0,
    !!profile.experience.joiningDate,
    !!profile.experience.lastWorkingDate,
    !!profile.experience.currentSalary,
    !!profile.experience.resume,
    (profile.experience.coverLetter || '').trim().length >= 100,
    !!profile.account.passwordCreated,
    !!profile.declarationAccepted,
  ];
  const total = checks.length;
  const completed = checks.filter(Boolean).length;
  return { completed, total, percent: Math.round((completed / total) * 100) };
}

document.addEventListener('DOMContentLoaded', () => {
  const widget = document.getElementById('profileCompletion');
  if (!widget) return;

  widget.innerHTML = `
    <div class="completion-head">
      <span>Profile Completion</span>
      <span class="completion-pct mono">0%</span>
    </div>
    <div class="completion-bar-track">
      <div class="completion-bar-fill" style="width:0%"></div>
    </div>`;

  const pctEl = widget.querySelector('.completion-pct');
  const fillEl = widget.querySelector('.completion-bar-fill');

  function render() {
    const { percent } = calculateProfileCompletion(getProfile());
    pctEl.textContent = `${percent}%`;
    fillEl.style.width = `${percent}%`;
  }

  render();
  // Whole-document listener: this page's own fields AND the autosave
  // debounce on other files both end up writing to storage, so re-render
  // generously rather than trying to hook every individual save call.
  document.addEventListener('input', debounce(render, 400));
  document.addEventListener('change', render);
});
