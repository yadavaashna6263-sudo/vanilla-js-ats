/* =========================================================
   READINESS.JS — Candidate Readiness Score
   A weighted, whole-application completeness score (0–100),
   rendered as a circular progress ring. Used on review.html
   and dashboard.html.
   ========================================================= */

const READINESS_RULES = [
  { key: 'linkedin', label: 'LinkedIn added', points: 10, check: (p) => !!p.professional.linkedin },
  { key: 'github', label: 'GitHub added', points: 10, check: (p) => !!p.professional.github },
  { key: 'portfolio', label: 'Portfolio added', points: 15, check: (p) => !!p.professional.portfolio },
  { key: 'resume', label: 'Resume uploaded', points: 20, check: (p) => !!p.experience.resume },
  {
    key: 'coverLetter',
    label: 'Cover letter complete',
    points: 20,
    check: (p) => (p.experience.coverLetter || '').trim().length >= 100,
  },
  {
    key: 'skills',
    label: '3+ skills selected',
    points: 15,
    check: (p) => (p.professional.skills || []).length >= 3,
  },
  {
    key: 'experience',
    label: 'Experience added',
    points: 10,
    check: (p) => !!p.experience.joiningDate && !!p.experience.lastWorkingDate,
  },
];

function calculateReadinessScore(profile) {
  let score = 0;
  const breakdown = READINESS_RULES.map((rule) => {
    const met = rule.check(profile);
    if (met) score += rule.points;
    return { label: rule.label, points: rule.points, met };
  });
  return { score, breakdown };
}

/**
 * Renders a circular progress ring + breakdown checklist into `container`.
 * `size` controls the ring diameter in px (default 130).
 */
function renderReadinessWidget(container, profile, { size = 130, showBreakdown = true } = {}) {
  const { score, breakdown } = calculateReadinessScore(profile);
  const r = size / 2 - 11;
  const cx = size / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  const breakdownHtml = showBreakdown
    ? `<ul class="readiness-breakdown">
        ${breakdown
          .map(
            (b) =>
              `<li class="${b.met ? 'is-met' : ''}"><span class="rule-dot"></span>${b.label}
                <span class="readiness-points mono">+${b.points}</span></li>`
          )
          .join('')}
      </ul>`
    : '';

  container.innerHTML = `
    <div class="readiness-widget">
      <div class="readiness-ring-wrap" style="width:${size}px;height:${size}px;">
        <svg viewBox="0 0 ${size} ${size}" class="readiness-ring">
          <circle cx="${cx}" cy="${cx}" r="${r}" class="readiness-ring-track" />
          <circle cx="${cx}" cy="${cx}" r="${r}" class="readiness-ring-fill"
            style="stroke-dasharray:${circumference};stroke-dashoffset:${offset};" />
        </svg>
        <div class="readiness-ring-label">
          <strong>${score}%</strong>
          <span>Readiness</span>
        </div>
      </div>
      ${breakdownHtml}
    </div>`;
}
