/* =========================================================
   JOBS.JS — Job Listings page
   ========================================================= */

const JOB_DATA = [
  {
    id: 'frontend-dev',
    title: 'Frontend Developer',
    department: 'Engineering',
    location: 'Bangalore',
    level: 'Mid',
    type: 'Full-time',
    arrangement: 'Hybrid',
    salaryMin: 900000,
    salaryMax: 1400000,
    techStack: ['HTML', 'CSS', 'JavaScript', 'React'],
    blurb: 'Build candidate-facing flows with clean, accessible interfaces.',
  },
  {
    id: 'backend-dev',
    title: 'Backend Developer',
    department: 'Engineering',
    location: 'Hyderabad',
    level: 'Senior',
    type: 'Full-time',
    arrangement: 'Remote',
    salaryMin: 1600000,
    salaryMax: 2400000,
    techStack: ['Node.js', 'PostgreSQL', 'Docker', 'AWS'],
    blurb: 'Own the services that power applications behind the scenes.',
  },
  {
    id: 'ui-ux-designer',
    title: 'UI/UX Designer',
    department: 'Design',
    location: 'Remote',
    level: 'Mid',
    type: 'Full-time',
    arrangement: 'Remote',
    salaryMin: 1000000,
    salaryMax: 1500000,
    techStack: ['Figma', 'Design Systems', 'Prototyping'],
    blurb: 'Shape the look and feel of every candidate touchpoint.',
  },
  {
    id: 'devops-engineer',
    title: 'DevOps Engineer',
    department: 'Engineering',
    location: 'Pune',
    level: 'Senior',
    type: 'Full-time',
    arrangement: 'Hybrid',
    salaryMin: 1800000,
    salaryMax: 2600000,
    techStack: ['Docker', 'AWS', 'Git', 'CI/CD'],
    blurb: 'Keep deployments smooth and infrastructure dependable.',
  },
  {
    id: 'product-manager',
    title: 'Product Manager',
    department: 'Product',
    location: 'Mumbai',
    level: 'Lead',
    type: 'Full-time',
    arrangement: 'Hybrid',
    salaryMin: 2200000,
    salaryMax: 3200000,
    techStack: ['Roadmapping', 'Analytics', 'SQL'],
    blurb: 'Set direction for the hiring product roadmap end to end.',
  },
  {
    id: 'frontend-intern',
    title: 'Frontend Developer',
    department: 'Engineering',
    location: 'Delhi',
    level: 'Entry',
    type: 'Internship',
    arrangement: 'On-site',
    salaryMin: 300000,
    salaryMax: 450000,
    techStack: ['HTML', 'CSS', 'JavaScript'],
    blurb: 'Learn the craft while shipping real, user-facing screens.',
  },
];

function formatSalaryRange(min, max) {
  const fmt = (n) => `₹${(n / 100000).toFixed(0)}L`;
  return `${fmt(min)} – ${fmt(max)} / year`;
}

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('jobsGrid');
  if (!grid) return;

  const searchInput = document.getElementById('jobSearch');
  const levelFilter = document.getElementById('filterLevel');
  const locationFilter = document.getElementById('filterLocation');
  const deptFilter = document.getElementById('filterDept');
  const emptyState = document.getElementById('jobsEmpty');
  const searchError = document.getElementById('jobSearchError');
  const resultCount = document.getElementById('jobsResultCount');

  function jobCardHtml(job) {
    return `
      <article class="card job-card fade-in">
        <div class="job-card-top">
          <h3>${job.title}</h3>
          <span class="badge">${job.type}</span>
        </div>
        <p class="job-card-meta mono">${job.department} · ${job.location} · ${job.level} level</p>
        <div class="job-card-badges">
          <span class="badge badge--teal">${job.arrangement}</span>
        </div>
        <p class="job-card-salary">${formatSalaryRange(job.salaryMin, job.salaryMax)}</p>
        <p>${job.blurb}</p>
        <div class="job-tech-stack">
          ${job.techStack.map((t) => `<span class="job-tech-chip">${t}</span>`).join('')}
        </div>
        <button class="btn btn--primary btn--block" data-apply="${job.id}" data-title="${job.title}">
          Apply Now
        </button>
      </article>`;
  }

  function render(jobs) {
    grid.innerHTML = jobs.map(jobCardHtml).join('');
    emptyState.style.display = jobs.length ? 'none' : 'block';
    resultCount.textContent = `${jobs.length} open position${jobs.length === 1 ? '' : 's'}`;

    grid.querySelectorAll('[data-apply]').forEach((btn) => {
      btn.addEventListener('click', () => {
        setJobRole(btn.dataset.title);
        showToast(`Applying to ${btn.dataset.title}`);
        setTimeout(() => {
          window.location.href = 'application-step1.html';
        }, 400);
      });
    });
  }

  function applyFilters() {
    const query = searchInput.value.trim();
    let valid = true;

    if (query.length > 0 && query.length < 2) {
      searchError.textContent = 'Type at least 2 characters to search.';
      searchError.style.display = 'block';
      valid = false;
    } else {
      searchError.style.display = 'none';
    }

    const results = JOB_DATA.filter((job) => {
      const matchesQuery =
        !valid || query.length < 2
          ? query.length === 0
          : job.title.toLowerCase().includes(query.toLowerCase());
      const matchesLevel = !levelFilter.value || job.level === levelFilter.value;
      const matchesLocation = !locationFilter.value || job.location === locationFilter.value;
      const matchesDept = !deptFilter.value || job.department === deptFilter.value;
      return (query.length < 2 || matchesQuery) && matchesLevel && matchesLocation && matchesDept;
    });

    render(results);
  }

  [searchInput].forEach((el) => el.addEventListener('input', applyFilters));
  [levelFilter, locationFilter, deptFilter].forEach((el) => el.addEventListener('change', applyFilters));

  render(JOB_DATA);
});
