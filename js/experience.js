/* =========================================================
   EXPERIENCE.JS — Step 3: Experience calculator
   Joining Date + Last Working Date → "X Years Y Months"
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const joiningInput = document.getElementById('joiningDate');
  if (!joiningInput) return;

  const lastWorkingInput = document.getElementById('lastWorkingDate');
  const readout = document.getElementById('experienceReadout');
  const dateError = document.getElementById('dateError');

  const profile = getProfile();
  joiningInput.value = profile.experience.joiningDate || '';
  lastWorkingInput.value = profile.experience.lastWorkingDate || '';

  function update() {
    const joinVal = joiningInput.value;
    const lastVal = lastWorkingInput.value;

    if (!joinVal || !lastVal) {
      readout.style.display = 'none';
      dateError.style.display = 'none';
      checkNext();
      return;
    }

    const joinDate = new Date(joinVal);
    const lastDate = new Date(lastVal);

    if (lastDate < joinDate) {
      readout.style.display = 'none';
      dateError.textContent = 'Last working date cannot be before the joining date.';
      dateError.style.display = 'block';
      checkNext();
      return;
    }

    dateError.style.display = 'none';
    const { years, months } = calculateYearsMonths(joinVal, lastVal);
    readout.style.display = 'flex';
    readout.innerHTML = `<strong>${years} Year${years === 1 ? '' : 's'} ${months} Month${
      months === 1 ? '' : 's'
    }</strong><span>total experience</span>`;

    updateProfile('experience', { joiningDate: joinVal, lastWorkingDate: lastVal });
    checkNext();
  }

  function checkNext() {
    window.experienceDatesValid = () => {
      if (!joiningInput.value || !lastWorkingInput.value) return false;
      return new Date(lastWorkingInput.value) >= new Date(joiningInput.value);
    };
    if (typeof window.checkStep3Next === 'function') window.checkStep3Next();
  }

  joiningInput.addEventListener('change', update);
  lastWorkingInput.addEventListener('change', update);

  // Make the validity flag available immediately, even before any change fires
  window.experienceDatesValid = () => {
    if (!joiningInput.value || !lastWorkingInput.value) return false;
    return new Date(lastWorkingInput.value) >= new Date(joiningInput.value);
  };

  update();
});
