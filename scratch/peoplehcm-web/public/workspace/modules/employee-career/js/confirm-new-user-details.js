const params = new URLSearchParams(window.location.search);
const requestedRecord = params.get('record');
const profiles = window.confirmNewUserProfiles || [];
const recordIndex = /^\d+$/.test(requestedRecord || '') ? Number(requestedRecord) : -1;
const profile = recordIndex >= 0 && recordIndex < profiles.length ? profiles[recordIndex] : null;

if (!profile) {
  const theme = document.documentElement.dataset.theme || 'dark';
  window.location.replace(`confirm-new-user.html?theme=${encodeURIComponent(theme)}`);
}

const fieldMap = {
  newUserName: 'name',
  newUserAlias: 'alias',
  newUserIdentity: 'identity',
  newUserBirthDate: 'birthDate',
  newUserGender: 'gender',
  newUserNationality: 'nationality',
  newUserRace: 'race',
  newUserReligion: 'religion',
  newUserQualification: 'qualification',
  newUserMaritalStatus: 'maritalStatus',
  newUserPaymentMode: 'paymentMode',
  newUserBank: 'bank',
  newUserBankAccount: 'bankAccount',
  newUserEpf: 'epf',
  newUserIncomeTax: 'incomeTax',
  newUserHireDate: 'hireDate',
  newUserBasicPay: 'basicPay',
  newUserCompany: 'company',
  newUserBranch: 'branch',
  newUserDepartment: 'department',
  newUserJobType: 'jobType',
  newUserJobPosition: 'jobPosition',
  newUserReportingGroup: 'reportingGroup',
  newUserSupervisor: 'supervisor',
  newUserShiftGroup: 'shiftGroup',
  newUserProbationMonths: 'probationMonths',
  newUserProbationDays: 'probationDays',
  newUserContactName: 'name',
  newUserPhone: 'mobile',
  newUserEmail: 'email',
  newUserAddress1: 'address1',
  newUserAddress2: 'address2',
  newUserAddress3: 'address3',
  newUserPostCode: 'postCode',
  newUserEmergencyName: 'emergencyName',
  newUserEmergencyPhone: 'emergencyPhone',
  newUserEmergencyAddress1: 'emergencyAddress1',
  newUserEmergencyAddress2: 'emergencyAddress2',
  newUserEmergencyAddress3: 'emergencyAddress3',
  newUserEmergencyPostCode: 'emergencyPostCode'
};

function setControlValue(control, value) {
  const nextValue = value || '';
  if (control instanceof HTMLSelectElement && nextValue && ![...control.options].some(option => option.value === nextValue)) {
    control.add(new Option(nextValue, nextValue));
  }
  control.value = nextValue;
}

function populateProfile() {
  if (!profile) return;
  Object.entries(fieldMap).forEach(([id, key]) => {
    const control = document.getElementById(id);
    if (control) setControlValue(control, profile[key]);
  });

  const initials = (profile.name || 'New User').split(/\s+/).map(part => part[0]).slice(0, 2).join('');
  document.getElementById('newUserProfileAvatar').textContent = initials;
  document.getElementById('newUserProfileName').textContent = profile.name || 'New User';
  document.getElementById('newUserProfileId').textContent = profile.identity || '\u2014';
  renderAttachments(profile.attachments);

  const theme = document.documentElement.dataset.theme || 'dark';
  const returnUrl = `confirm-new-user.html?theme=${encodeURIComponent(theme)}`;
  document.getElementById('newUserBackLink').href = returnUrl;
  document.getElementById('newUserCancel').href = returnUrl;
}

function renderAttachments(attachments) {
  const list = document.getElementById('newUserAttachmentList');
  const filenames = Array.isArray(attachments) ? attachments.filter(Boolean) : [];
  list.replaceChildren();
  if (!filenames.length) {
    const empty = document.createElement('p');
    empty.className = 'new-user-attachment-empty';
    empty.textContent = 'No attachments';
    list.append(empty);
    return;
  }
  filenames.forEach(filename => {
    const item = document.createElement('span');
    item.className = 'new-user-attachment-name';
    item.textContent = typeof filename === 'string' ? filename : filename.name;
    list.append(item);
  });
}

function showStep(step) {
  const activeStep = step === 2 ? 2 : 1;
  document.querySelectorAll('.new-user-step-panel').forEach(panel => {
    panel.hidden = Number(panel.dataset.stepPanel) !== activeStep;
  });
  document.querySelectorAll('.new-user-stepper-item').forEach(item => {
    const itemStep = Number(item.dataset.step);
    item.classList.toggle('active', itemStep === activeStep);
    item.classList.toggle('completed', itemStep < activeStep);
    item.setAttribute('aria-selected', String(itemStep === activeStep));
    item.tabIndex = itemStep === activeStep ? 0 : -1;
    if (itemStep === activeStep) item.setAttribute('aria-current', 'step');
    else item.removeAttribute('aria-current');
  });
  document.getElementById('newUserStepperFill').style.width = activeStep === 2 ? '50%' : '0%';
  const content = document.querySelector('.employee-career-content');
  if (content) content.scrollTop = 0;
}

document.addEventListener('DOMContentLoaded', () => {
  if (!profile) return;
  populateProfile();
  showStep(1);
  const stepItems = [...document.querySelectorAll('.new-user-stepper-item')];
  stepItems.forEach((item, index) => {
    item.addEventListener('click', () => showStep(Number(item.dataset.step)));
    item.addEventListener('keydown', event => {
      let targetIndex = index;
      if (event.key === 'ArrowRight') targetIndex = (index + 1) % stepItems.length;
      else if (event.key === 'ArrowLeft') targetIndex = (index - 1 + stepItems.length) % stepItems.length;
      else if (event.key === 'Home') targetIndex = 0;
      else if (event.key === 'End') targetIndex = stepItems.length - 1;
      else return;
      event.preventDefault();
      showStep(Number(stepItems[targetIndex].dataset.step));
      stepItems[targetIndex].focus();
    });
  });
  document.getElementById('newUserNext').addEventListener('click', () => showStep(2));
  document.getElementById('newUserPrevious').addEventListener('click', () => showStep(1));
});
