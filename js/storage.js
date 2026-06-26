/* =========================================================
   STORAGE.JS — candidateProfile persistence layer
   Every other script reads/writes the candidate's progress
   through these functions instead of touching localStorage
   directly, so the shape of the saved object lives in one place.
   ========================================================= */

const PROFILE_KEY = 'candidateProfile';
const JOB_ROLE_KEY = 'jobRole';
const THEME_KEY = 'atsTheme';

/** Default shape of a fresh candidate profile. */
function createEmptyProfile() {
  return {
    jobRole: '',
    personal: { fullName: '', email: '', phone: '', location: '' },
    professional: { linkedin: '', github: '', portfolio: '', education: '', skills: [] },
    experience: {
      joiningDate: '',
      lastWorkingDate: '',
      currentSalary: '',
      expectedSalary: '',
      resume: null, // { name, size }
      coverLetter: '',
    },
    account: { passwordCreated: false },
    declarationAccepted: false,
    meta: { lastSaved: null, applicationId: null, status: null, statusHistory: [] },
  };
}

/** Read the full profile from localStorage, or a fresh skeleton if none exists. */
function getProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return createEmptyProfile();
    const parsed = JSON.parse(raw);
    // Merge onto a fresh skeleton so older/partial saves never crash a page
    // that expects a newer field to exist.
    const empty = createEmptyProfile();
    return {
      ...empty,
      ...parsed,
      personal: { ...empty.personal, ...(parsed.personal || {}) },
      professional: { ...empty.professional, ...(parsed.professional || {}) },
      experience: { ...empty.experience, ...(parsed.experience || {}) },
      account: { ...empty.account, ...(parsed.account || {}) },
      meta: { ...empty.meta, ...(parsed.meta || {}) },
    };
  } catch (err) {
    console.warn('Could not read candidateProfile, starting fresh.', err);
    return createEmptyProfile();
  }
}

/** Overwrite the full profile and stamp the save time. */
function saveProfile(profile) {
  profile.meta = { ...profile.meta, lastSaved: new Date().toISOString() };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  return profile;
}

/**
 * Shallow-merge a partial update into one top-level section of the profile.
 * updateProfile('personal', { fullName: 'Asha Rao' })
 */
function updateProfile(section, partial) {
  const profile = getProfile();
  if (section) {
    profile[section] = { ...profile[section], ...partial };
  }
  return saveProfile(profile);
}

/** Replace an entire top-level section (used for arrays like skills, or resume object). */
function setProfileField(section, key, value) {
  const profile = getProfile();
  profile[section] = { ...profile[section], [key]: value };
  return saveProfile(profile);
}

function clearProfile() {
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(JOB_ROLE_KEY);
}

/* ---------- Job role (kept as its own key per the original spec) ---------- */
function setJobRole(role) {
  localStorage.setItem(JOB_ROLE_KEY, role);
  updateProfile('jobRole', role); // also mirrored into the profile object
  const profile = getProfile();
  profile.jobRole = role;
  saveProfile(profile);
}

function getJobRole() {
  return localStorage.getItem(JOB_ROLE_KEY) || getProfile().jobRole || '';
}

/* ---------- Application status (Dashboard) ---------- */
const STATUS_FLOW = ['Submitted', 'Under Review', 'Interview Scheduled', 'Accepted'];
const STATUS_REJECTED = 'Rejected';

function setApplicationStatus(status) {
  const profile = getProfile();
  const history = profile.meta.statusHistory || [];
  history.push({ status, date: new Date().toISOString() });
  profile.meta = { ...profile.meta, status, statusHistory: history };
  saveProfile(profile);
  return profile;
}

function getApplicationStatus() {
  return getProfile().meta.status || null;
}

function getStatusHistory() {
  return getProfile().meta.statusHistory || [];
}

/* ---------- Application ID ---------- */
function generateApplicationId() {
  const year = new Date().getFullYear();
  const digits = Math.floor(10000 + Math.random() * 89999);
  return `ATS-${year}-${digits}`;
}

/* ---------- Shared formatting helper (used by upload.js + review.js) ---------- */
function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Years/months between two date strings (used by experience.js + review.js). */
function calculateYearsMonths(fromStr, toStr) {
  const from = new Date(fromStr);
  const to = new Date(toStr);
  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  if (to.getDate() < from.getDate()) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years: Math.max(years, 0), months: Math.max(months, 0) };
}

/**
 * Debounce helper used by autosave wiring across the form pages.
 * Kept here (rather than app.js) since its main caller is storage-related.
 */
function debounce(fn, wait = 500) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}
