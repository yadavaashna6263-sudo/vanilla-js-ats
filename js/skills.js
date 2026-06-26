/* =========================================================
   SKILLS.JS — Step 2: Searchable skill autocomplete
   Type to filter a master skill list, select from the
   dropdown (keyboard or mouse), and manage selections as
   removable chips. Also owns the shared "Next" gating for
   Step 2, combining with the URL-field validity exposed by
   validation.js.
   ========================================================= */

const SKILL_OPTIONS = [
  'HTML',
  'CSS',
  'JavaScript',
  'TypeScript',
  'React',
  'React Native',
  'Next.js',
  'Vue',
  'Angular',
  'Redux',
  'Node.js',
  'Express',
  'MongoDB',
  'PostgreSQL',
  'GraphQL',
  'Docker',
  'AWS',
  'Git',
  'Tailwind CSS',
  'Python',
];

const SKILLS_MIN = 3;
const SKILLS_MAX = 10;

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('skillSearch');
  if (!searchInput) return;

  const suggestionsEl = document.getElementById('skillSuggestions');
  const chipsEl = document.getElementById('selectedSkillsChips');
  const countLabel = document.getElementById('skillsCount');
  const education = document.getElementById('education');
  const nextBtn = document.getElementById('step2NextBtn');
  const form = document.getElementById('step2Form');

  const profile = getProfile();
  const selected = new Set(profile.professional.skills || []);
  education.value = profile.professional.education || '';

  let activeIndex = -1;
  let currentMatches = [];

  function renderChips() {
    chipsEl.innerHTML = Array.from(selected)
      .map(
        (skill) =>
          `<span class="skill-chip" data-skill="${skill}">
            ${skill}
            <button type="button" class="skill-chip-remove" aria-label="Remove ${skill}">&times;</button>
          </span>`
      )
      .join('');

    chipsEl.querySelectorAll('.skill-chip-remove').forEach((btn) => {
      btn.addEventListener('click', () => {
        const skill = btn.closest('.skill-chip').dataset.skill;
        selected.delete(skill);
        renderChips();
        refreshCount();
        persist();
        checkNext();
        searchInput.focus();
      });
    });
  }

  function closeSuggestions() {
    suggestionsEl.classList.remove('is-open');
    searchInput.setAttribute('aria-expanded', 'false');
    activeIndex = -1;
  }

  function openSuggestions() {
    const query = searchInput.value.trim().toLowerCase();
    currentMatches = SKILL_OPTIONS.filter(
      (skill) => !selected.has(skill) && skill.toLowerCase().includes(query)
    ).slice(0, 8);

    if (selected.size >= SKILLS_MAX) {
      suggestionsEl.innerHTML = `<p class="skill-suggestions-empty">Maximum of ${SKILLS_MAX} skills reached.</p>`;
      suggestionsEl.classList.add('is-open');
      searchInput.setAttribute('aria-expanded', 'true');
      return;
    }

    if (!currentMatches.length) {
      suggestionsEl.innerHTML = `<p class="skill-suggestions-empty">No matching skills found.</p>`;
    } else {
      suggestionsEl.innerHTML = currentMatches
        .map(
          (skill, i) =>
            `<div class="skill-suggestion" id="skill-opt-${i}" role="option" aria-selected="false" data-skill="${skill}">${skill}</div>`
        )
        .join('');
    }
    suggestionsEl.classList.add('is-open');
    searchInput.setAttribute('aria-expanded', 'true');
    activeIndex = -1;
  }

  function selectSkill(skill) {
    if (!skill || selected.has(skill)) return;
    if (selected.size >= SKILLS_MAX) {
      showToast(`You can select up to ${SKILLS_MAX} skills.`, 'error');
      return;
    }
    selected.add(skill);
    searchInput.value = '';
    renderChips();
    refreshCount();
    persist();
    checkNext();
    closeSuggestions();
    searchInput.focus();
  }

  function highlightActive() {
    suggestionsEl.querySelectorAll('.skill-suggestion').forEach((el, i) => {
      el.classList.toggle('is-active', i === activeIndex);
      el.setAttribute('aria-selected', String(i === activeIndex));
    });
    if (activeIndex >= 0) {
      searchInput.setAttribute('aria-activedescendant', `skill-opt-${activeIndex}`);
    } else {
      searchInput.removeAttribute('aria-activedescendant');
    }
  }

  searchInput.addEventListener('input', openSuggestions);
  searchInput.addEventListener('focus', openSuggestions);

  searchInput.addEventListener('keydown', (e) => {
    if (!suggestionsEl.classList.contains('is-open')) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (currentMatches.length) {
        activeIndex = (activeIndex + 1) % currentMatches.length;
        highlightActive();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (currentMatches.length) {
        activeIndex = (activeIndex - 1 + currentMatches.length) % currentMatches.length;
        highlightActive();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const pick = activeIndex >= 0 ? currentMatches[activeIndex] : currentMatches[0];
      if (pick) selectSkill(pick);
    } else if (e.key === 'Escape') {
      closeSuggestions();
    }
  });

  suggestionsEl.addEventListener('click', (e) => {
    const option = e.target.closest('.skill-suggestion');
    if (option) selectSkill(option.dataset.skill);
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.skill-search')) closeSuggestions();
  });

  function refreshCount() {
    const n = selected.size;
    countLabel.textContent = `${n} selected · choose ${SKILLS_MIN}–${SKILLS_MAX}`;
    countLabel.classList.remove('is-ok', 'is-bad');
    countLabel.classList.add(n >= SKILLS_MIN && n <= SKILLS_MAX ? 'is-ok' : 'is-bad');
  }

  function checkNext() {
    const skillsOk = selected.size >= SKILLS_MIN && selected.size <= SKILLS_MAX;
    const educationOk = education.value.trim() !== '';
    const urlsOk = typeof window.step2UrlFieldsValid === 'function' ? window.step2UrlFieldsValid() : true;
    nextBtn.disabled = !(skillsOk && educationOk && urlsOk);
  }

  const persist = debounce(() => {
    updateProfile('professional', {
      education: education.value,
      skills: Array.from(selected),
    });
    showToast('Draft saved');
  }, 700);

  education.addEventListener('change', () => {
    persist();
    checkNext();
  });

  // Re-check whenever the URL fields change too (validation.js fires 'input' on the form)
  form.addEventListener('input', checkNext);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (nextBtn.disabled) return;
    updateProfile('professional', { education: education.value, skills: Array.from(selected) });
    window.location.href = 'application-step3.html';
  });

  renderChips();
  refreshCount();
  checkNext();
});
