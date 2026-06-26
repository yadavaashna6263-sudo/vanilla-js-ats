/* =========================================================
   REVIEW.JS — Review & Submit
   Renders the full candidateProfile back to the candidate,
   gates submission on the declaration checkbox, then stamps
   an Application ID and hands off to success.html.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('reviewRoot');
  if (!root) return;

  const skeleton = document.getElementById('reviewSkeleton');
  const declaration = document.getElementById('declarationCheckbox');
  const submitBtn = document.getElementById('reviewSubmitBtn');

  // Simulate the brief "restoring your data" moment with a skeleton,
  // matching the rest of the app's autosave/restore pattern.
  setTimeout(() => {
    const profile = getProfile();
    renderReview(profile);
    skeleton.classList.add('visually-hidden');
    root.classList.remove('visually-hidden');
  }, 500);

  function field(label, value) {
    return `<div class="review-item"><dt>${label}</dt><dd>${value || '—'}</dd></div>`;
  }

  function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    return parts
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join('');
  }

  function candidateCardHtml(profile) {
    const hasExp = profile.experience.joiningDate && profile.experience.lastWorkingDate;
    const expText = hasExp
      ? (() => {
          const { years, months } = calculateYearsMonths(
            profile.experience.joiningDate,
            profile.experience.lastWorkingDate
          );
          return `${years} yr${years === 1 ? '' : 's'} ${months} mo${months === 1 ? '' : 's'} experience`;
        })()
      : 'Experience not added';

    return `
      <div class="candidate-card fade-in">
        <div class="candidate-avatar">${getInitials(profile.personal.fullName)}</div>
        <div class="candidate-card-info">
          <h3>${profile.personal.fullName || 'Unnamed Candidate'}</h3>
          <p class="candidate-card-role">${profile.jobRole || 'No role selected'}</p>
          <p class="candidate-card-meta">${profile.personal.location || 'Location not set'} · ${expText}</p>
          <div class="candidate-card-skills">
            ${(profile.professional.skills || []).map((s) => `<span class="badge">${s}</span>`).join('') ||
              '<span class="hint">No skills selected</span>'}
          </div>
        </div>
      </div>`;
  }

  function renderReview(profile) {
    root.innerHTML = `
      ${candidateCardHtml(profile)}

      <section class="review-section fade-in">
        <div class="review-section-head">
          <h3>Readiness Score</h3>
        </div>
        <div id="reviewReadiness"></div>
      </section>

      <section class="review-section fade-in">
        <div class="review-section-head">
          <h3>Personal Details</h3>
          <a class="btn btn--ghost btn--sm" href="application-step1.html">Edit Personal Info</a>
        </div>
        <dl class="review-grid">
          ${field('Full Name', profile.personal.fullName)}
          ${field('Email', profile.personal.email)}
          ${field('Phone', profile.personal.phone)}
          ${field('Location', profile.personal.location)}
          ${field('Desired Position', profile.jobRole)}
        </dl>
      </section>

      <section class="review-section fade-in fade-in--delay-1">
        <div class="review-section-head">
          <h3>Professional Details</h3>
          <a class="btn btn--ghost btn--sm" href="application-step2.html">Edit Professional Info</a>
        </div>
        <dl class="review-grid">
          ${field('LinkedIn', profile.professional.linkedin)}
          ${field('GitHub', profile.professional.github)}
          ${field('Portfolio', profile.professional.portfolio)}
          ${field('Education', profile.professional.education)}
          <div class="review-skills">
            ${(profile.professional.skills || [])
              .map((s) => `<span class="badge">${s}</span>`)
              .join('') || '<span class="hint">No skills selected</span>'}
          </div>
        </dl>
      </section>

      <section class="review-section fade-in fade-in--delay-2">
        <div class="review-section-head">
          <h3>Experience &amp; Resume</h3>
          <a class="btn btn--ghost btn--sm" href="application-step3.html">Edit Resume</a>
        </div>
        <dl class="review-grid">
          ${field('Joining Date', profile.experience.joiningDate)}
          ${field('Last Working Date', profile.experience.lastWorkingDate)}
          ${field('Current Salary', profile.experience.currentSalary ? `₹${profile.experience.currentSalary}` : '')}
          ${field('Expected Salary', profile.experience.expectedSalary ? `₹${profile.experience.expectedSalary}` : '')}
          ${field(
            'Resume',
            profile.experience.resume
              ? `${profile.experience.resume.name} (${formatFileSize(profile.experience.resume.size)})`
              : ''
          )}
        </dl>
      </section>

      <section class="review-section fade-in fade-in--delay-3">
        <div class="review-section-head">
          <h3>Cover Letter</h3>
        </div>
        <p>${profile.experience.coverLetter || 'No cover letter written.'}</p>
      </section>
    `;

    const readinessContainer = document.getElementById('reviewReadiness');
    if (readinessContainer) renderReadinessWidget(readinessContainer, profile, { size: 120 });
  }

  declaration.addEventListener('change', () => {
    submitBtn.disabled = !declaration.checked;
  });

  submitBtn.addEventListener('click', () => {
    if (!declaration.checked) return;
    const profile = getProfile();
    profile.declarationAccepted = true;
    profile.meta.applicationId = generateApplicationId();
    saveProfile(profile);
    setApplicationStatus('Submitted');
    showToast('Application submitted');
    setTimeout(() => {
      window.location.href = 'success.html';
    }, 500);
  });
});
