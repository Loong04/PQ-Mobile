/* Reference announcements for the frontend preview. No server delivery is implied. */
(() => {
  'use strict';
  const records = [
    {
      id: 'covid-wfh',
      title: 'COVID-19: Stay Home & Work From Home',
      excerpt: 'Dear All, it is a tough time, but as a team we can make this happen.',
      paragraphs: [
        'Dear All,',
        'It is a tough time we are going through, but as a team we can make this happen! Let us do our best to ensure we all help each other and survive this crucial period together.',
        'Attached is a memo of our new working procedures.',
        'All the best, stay home and stay safe.',
        'Management.'
      ],
      acknowledgedAt: '2024-06-06T16:53:00+08:00',
      attachments: [{ name: 'lighthouse-clip-art-png.png', type: 'Image attachment' }]
    },
    {
      id: 'hari-raya-cmco',
      title: 'Hari Raya during CMCO',
      excerpt: 'Dear All, In light to COVID-19, CMCO has extended till 9 June 2020.',
      paragraphs: ['Dear All,', 'In light to COVID-19, CMCO has extended till 9 June 2020.'],
      partial: true
    },
    { id: 'lockdown-3', title: 'LOCKDOWN 3.0', excerpt: 'Lockdown 3.0 is coming this weekend', paragraphs: ['Lockdown 3.0 is coming this weekend'] },
    { id: 'return-to-work', title: 'COME BACK TO WORK', excerpt: 'PLEASE COME BACK TO WORK', paragraphs: ['PLEASE COME BACK TO WORK'] },
    { id: 'test-video', title: 'test video', excerpt: 'test', paragraphs: ['test'], video: true }
  ];
  const storageKey = 'peoplehcm:workplace:news:v1';
  const $ = id => document.getElementById(id);
  const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const theme = () => document.documentElement.dataset.theme || 'dark';
  const validTime = value => typeof value === 'string' && Number.isFinite(Date.parse(value));

  function readState() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
      const state = {};
      for (const record of records) {
        const row = saved?.[record.id];
        if (!row || typeof row !== 'object') continue;
        state[record.id] = {
          acknowledgedAt: validTime(row.acknowledgedAt) ? row.acknowledgedAt : null,
          feedback: typeof row.feedback === 'string' ? row.feedback.slice(0, 1000) : ''
        };
      }
      return state;
    } catch { return {}; }
  }

  function saveState(id, changes) {
    const state = readState();
    state[id] = { ...state[id], ...changes };
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  function listUrl() {
    const url = new URL('news.html', location.href);
    url.searchParams.set('theme', theme());
    return url.href;
  }

  function renderList() {
    const matching = records;
    $('newsResultCount').textContent = `${matching.length} ${matching.length === 1 ? 'announcement' : 'announcements'}`;
    $('newsEmpty').hidden = matching.length > 0;
    $('newsList').innerHTML = matching.map(record => {
      const url = new URL('news-detail.html', location.href);
      url.searchParams.set('id', record.id);
      url.searchParams.set('theme', theme());
      const media = record.attachments?.length ? `<div class="news-field"><span class="news-field-label">Attachment</span><span class="news-media-value"><i class="fa-solid fa-paperclip" aria-hidden="true"></i>${record.attachments.length} file</span></div>` : record.video ? '<div class="news-field"><span class="news-field-label">Media</span><span class="news-media-value"><i class="fa-solid fa-video" aria-hidden="true"></i>Video</span></div>' : '';
      return `<a class="news-card" data-news-id="${record.id}" href="${escape(url.href)}" aria-label="Read ${escape(record.title)}">
        <div class="news-card-header"><i class="fa-solid ${record.video ? 'fa-video' : 'fa-newspaper'}" aria-hidden="true"></i><h2>${escape(record.title)}</h2></div>
        <div class="news-card-body${media ? ' has-media' : ''}"><div class="news-field"><span class="news-field-label">Description</span><p class="news-card-excerpt">${escape(record.excerpt)}</p></div>${media}</div>
        <div class="news-card-footer"><span class="news-read-more">Read more<i class="fa-solid fa-chevron-right" aria-hidden="true"></i></span></div>
      </a>`;
    }).join('');
  }

  function formatAcknowledgement(value) {
    const date = new Date(value);
    const options = { timeZone: 'Asia/Kuala_Lumpur' };
    return date.toLocaleDateString('en-GB', { ...options, day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + date.toLocaleTimeString('en-GB', { ...options, hour: '2-digit', minute: '2-digit', hour12: false });
  }

  const record = records.find(row => row.id === new URLSearchParams(location.search).get('id'));
  function renderDetailState() {
    const row = readState()[record.id] || {};
    const acknowledgedAt = row.acknowledgedAt || record.acknowledgedAt;
    $('newsAcknowledged').hidden = !acknowledgedAt;
    $('newsAcknowledge').hidden = !!acknowledgedAt;
    $('newsFeedbackTrigger').classList.toggle('news-secondary-button', !acknowledgedAt);
    if (acknowledgedAt) {
      const time = $('newsAcknowledged').querySelector('time');
      time.dateTime = acknowledgedAt;
      time.textContent = formatAcknowledgement(acknowledgedAt);
    }
    $('newsSavedFeedback').hidden = !row.feedback;
    $('newsSavedFeedbackText').textContent = row.feedback || '';
    $('newsFeedbackTrigger').querySelector('span').textContent = row.feedback ? 'Edit feedback' : 'Give feedback';
  }

  function updateBackLinks() {
    document.querySelectorAll('#newsDetailBack, [data-news-list-link]').forEach(link => { link.href = listUrl(); });
  }

  function initDetail() {
    updateBackLinks();
    if (!record) { $('newsUnavailable').hidden = false; return; }
    document.title = `PeopleHCM - ${record.title}`;
    $('newsArticle').hidden = false;
    $('newsDetailActions').hidden = false;
    $('newsArticleTitle').textContent = record.title;
    $('newsArticleBody').replaceChildren(...record.paragraphs.map(text => {
      const paragraph = document.createElement('p');
      paragraph.textContent = text;
      return paragraph;
    }));
    if (record.partial) {
      const note = document.createElement('p');
      note.className = 'news-reference-note';
      note.textContent = 'Only the excerpt shown in the reference is available.';
      $('newsArticleBody').append(note);
    }
    if (record.attachments?.length) {
      $('newsAttachmentSection').hidden = false;
      $('newsAttachments').innerHTML = record.attachments.map(file => `<div class="news-attachment"><span class="news-file-icon"><i class="fa-regular fa-file-image" aria-hidden="true"></i></span><div class="news-file-copy"><strong>${escape(file.name)}</strong><small>${escape(file.type)} · File unavailable</small></div></div>`).join('');
    }
    if (record.video) {
      $('newsMedia').hidden = false;
      $('newsMedia').innerHTML = '<div class="news-media-unavailable"><i class="fa-solid fa-video" aria-hidden="true"></i><strong>Video unavailable</strong><span>The original video file has not been provided.</span></div>';
    }
    renderDetailState();
    $('newsAcknowledge').addEventListener('click', () => {
      try {
        const current = readState()[record.id];
        if (!current?.acknowledgedAt && !record.acknowledgedAt) saveState(record.id, { acknowledgedAt: new Date().toISOString() });
        $('newsStorageError').hidden = true;
        renderDetailState();
        $('newsFeedbackTrigger').focus();
      } catch {
        $('newsStorageError').hidden = false;
        $('newsStorageError').textContent = 'Acknowledgement could not be saved. Please allow browser storage and try again.';
      }
    });

    const dialog = $('newsFeedbackDialog');
    const field = $('newsFeedbackText');
    const updateCount = () => { $('newsFeedbackCount').textContent = `${field.value.length} / 1,000`; };
    $('newsFeedbackTrigger').addEventListener('click', () => {
      field.value = readState()[record.id]?.feedback || '';
      field.setCustomValidity('');
      $('newsFeedbackError').hidden = true;
      updateCount();
      dialog.showModal();
      field.focus();
    });
    $('newsFeedbackClose').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => $('newsFeedbackTrigger').focus());
    dialog.addEventListener('click', event => {
      const bounds = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
    });
    field.addEventListener('input', () => { field.setCustomValidity(''); updateCount(); });
    $('newsFeedbackForm').addEventListener('submit', event => {
      event.preventDefault();
      const feedback = field.value.trim();
      if (!feedback || feedback.length > 1000) {
        field.setCustomValidity(!feedback ? 'Please enter your feedback.' : 'Please keep feedback within 1,000 characters.');
        field.reportValidity();
        return;
      }
      try {
        saveState(record.id, { feedback });
        renderDetailState();
        dialog.close();
        showToast('Feedback saved on this device');
      } catch {
        $('newsFeedbackError').hidden = false;
        $('newsFeedbackError').textContent = 'Feedback could not be saved. Please allow browser storage and try again.';
      }
    });
  }

  if ($('newsList')) {
    renderList();
  } else if ($('newsArticle')) initDetail();

  function refresh() {
    if ($('newsList')) renderList();
    else if ($('newsArticle')) { updateBackLinks(); if (record) renderDetailState(); }
  }
  new MutationObserver(refresh).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  window.addEventListener('popstate', refresh);
  window.addEventListener('pageshow', refresh);
  window.addEventListener('storage', event => { if (event.key === storageKey || event.key === null) refresh(); });
})();
