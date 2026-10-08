const confirmNewUserRecords = window.confirmNewUserRecords || [];
const fields = [['gender', 'Gender'], ['nationality', 'Nationality'], ['qualification', 'Qualification'], ['mobile', 'Mobile #'], ['email', 'Email']];
const displayValue = value => value || '\u2014';

function renderConfirmNewUsers(records) {
  const list = document.getElementById('confirmNewUserList');
  const total = document.getElementById('confirmNewUserTotal');
  const reviewRecords = Array.isArray(records) ? records : [];
  list.replaceChildren();
  total.textContent = String(reviewRecords.length);

  reviewRecords.forEach((record, index) => {
    const card = document.createElement('article');
    card.className = 'confirm-new-user-card';
    const header = document.createElement('header');
    const avatar = document.createElement('span');
    avatar.className = 'confirm-new-user-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = record.name.split(/\s+/).map(part => part[0]).slice(0, 2).join('');
    const identity = document.createElement('div');
    identity.className = 'confirm-new-user-identity';
    const name = document.createElement('h3');
    name.className = 'confirm-new-user-name';
    name.textContent = displayValue(record.name);
    const identityValue = document.createElement('p');
    identityValue.className = 'confirm-new-user-identity-number';
    identityValue.dataset.field = 'identity';
    identityValue.textContent = displayValue(record.identity);
    identity.append(name, identityValue);
    header.append(avatar, identity);

    const details = document.createElement('dl');
    fields.forEach(([key, label]) => {
      const item = document.createElement('div');
      item.className = 'confirm-new-user-meta';
      item.dataset.metaField = key;
      const term = document.createElement('dt');
      term.textContent = label;
      const definition = document.createElement('dd');
      definition.dataset.field = key;
      definition.textContent = displayValue(record[key]);
      item.append(term, definition);
      details.append(item);
    });

    const actions = document.createElement('div');
    actions.className = 'confirm-new-user-actions';
    [['confirm-new-user-confirm', 'Confirm'], ['confirm-new-user-reject', 'Reject']].forEach(([className, label]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = className;
      button.textContent = label;
      button.setAttribute('aria-label', `${label} ${record.name}`);
      if (className === 'confirm-new-user-confirm') {
        button.addEventListener('click', () => {
          const query = new URLSearchParams({ record: String(index), theme: document.documentElement.dataset.theme || 'dark' });
          window.location.href = `confirm-new-user-details.html?${query.toString()}`;
        });
      }
      actions.append(button);
    });
    card.append(header, details, actions);
    list.append(card);
  });
}

window.renderConfirmNewUsers = renderConfirmNewUsers;
document.addEventListener('DOMContentLoaded', () => renderConfirmNewUsers(confirmNewUserRecords));
