/* =========================================================
   DASHBOARD.JS — Application Dashboard
   Renders the status timeline from candidateProfile.meta,
   plus a clearly-labelled "demo controls" panel that lets
   the candidate simulate a recruiter moving the application
   forward — there's no backend here to do that for real.
   ========================================================= */

function getProgressIndex(history) {
  let idx = 0;
  history.forEach((h) => {
    const i = STATUS_FLOW.indexOf(h.status);
    if (i > idx) idx = i;
  });
  return idx;
}

function formatStatusDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

document.addEventListener('DOMContentLoaded', () => {
  const emptyState = document.getElementById('dashboardEmpty');
  const content = document.getElementById('dashboardContent');
  if (!content) return;

  const profile = getProfile();

  if (!profile.meta.applicationId) {
    content.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  document.getElementById('dashboardAppId').textContent = profile.meta.applicationId;
  document.getElementById('dashboardRole').textContent = profile.jobRole || 'a role';
  document.getElementById('dashboardName').textContent = profile.personal.fullName || 'Candidate';

  const timelineEl = document.getElementById('statusTimeline');
  const advanceBtn = document.getElementById('advanceStatusBtn');
  const rejectBtn = document.getElementById('rejectStatusBtn');
  const resetBtn = document.getElementById('resetStatusBtn');

  function render() {
    const history = getStatusHistory();
    const currentStatus = getApplicationStatus() || 'Submitted';
    const isRejected = currentStatus === 'Rejected';
    const progressIdx = getProgressIndex(history);

    const steps = STATUS_FLOW.map((label, i) => {
      let state;
      if (i < progressIdx) state = 'done';
      else if (i === progressIdx) state = isRejected ? 'done' : 'current';
      else state = 'pending';
      const entry = history.find((h) => h.status === label);
      return { label, state, date: entry ? entry.date : null };
    });

    if (isRejected) {
      const rejectedEntry = history.find((h) => h.status === 'Rejected');
      steps.push({ label: 'Rejected', state: 'rejected', date: rejectedEntry ? rejectedEntry.date : null });
    }

    timelineEl.innerHTML = steps
      .map((step) => {
        const icon =
          step.state === 'done'
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>'
            : '';
        return `
          <li class="status-step is-${step.state}">
            <span class="status-dot">${icon}</span>
            <p class="status-step-title">${step.label}</p>
            ${step.date ? `<p class="status-step-date">${formatStatusDate(step.date)}</p>` : ''}
            ${
              step.state === 'current'
                ? '<span class="status-step-tag">Current Stage</span>'
                : step.state === 'rejected'
                ? '<span class="status-step-tag">Application Closed</span>'
                : ''
            }
          </li>`;
      })
      .join('');

    const atFinalStage = progressIdx >= STATUS_FLOW.length - 1;
    advanceBtn.disabled = isRejected || atFinalStage;
    rejectBtn.disabled = isRejected;
  }

  advanceBtn.addEventListener('click', () => {
    const history = getStatusHistory();
    const progressIdx = getProgressIndex(history);
    const next = STATUS_FLOW[progressIdx + 1];
    if (!next) return;
    setApplicationStatus(next);
    showToast(`Status advanced to “${next}”`);
    render();
  });

  rejectBtn.addEventListener('click', () => {
    setApplicationStatus('Rejected');
    showToast('Status set to “Rejected”', 'error');
    render();
  });

  resetBtn.addEventListener('click', () => {
    const fresh = getProfile();
    fresh.meta.status = 'Submitted';
    fresh.meta.statusHistory = [{ status: 'Submitted', date: new Date().toISOString() }];
    saveProfile(fresh);
    showToast('Demo reset to “Submitted”');
    render();
  });

  // Readiness widget
  const readinessContainer = document.getElementById('dashboardReadiness');
  if (readinessContainer) renderReadinessWidget(readinessContainer, profile, { size: 120 });

  render();
});
