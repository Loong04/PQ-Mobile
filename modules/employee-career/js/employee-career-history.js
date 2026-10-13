(() => {
  const $ = id => document.getElementById(id);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const data = window.EMPLOYEE_CAREER_HISTORY_DATA || {feedback: [], whereabout: []};
  function readCVRequests() {
    const reference = window.EMPLOYEE_CAREER_CV_HISTORY_DATA || [];
    let saved = [];
    try {
      saved = JSON.parse(localStorage.getItem('pq_change_request_history') || '[]');
    } catch { saved = []; }
    const rows = [...reference, ...(Array.isArray(saved) ? saved : [])].filter(row => row && typeof row.id === 'string' && typeof row.submittedAt === 'string' && Array.isArray(row.changes));
    return [...new Map(rows.map(row => [row.id, row])).values()];
  }
  const records = {feedback: data.feedback.map(row => ({...row})), whereabout: data.whereabout.map(row => ({...row})), 'cv-change-request': readCVRequests()};
  const labels = {feedback: 'Feedback', whereabout: 'Whereabout', 'cv-change-request': 'CV Change Request'};
  const cvStatusLabels = {draft: 'Draft', submitted: 'Submitted', resubmit: 'Resubmit', approved: 'Approved', rejected: 'Rejected', cancelled: 'Cancelled'};
  const defaults = {
    feedback: {from: '', to: '', type: '', category: '', status: ''},
    whereabout: {year: '', month: ''},
    'cv-change-request': {from: '', to: '', status: ''}
  };
  const filters = {feedback: {...defaults.feedback}, whereabout: {...defaults.whereabout}, 'cv-change-request': {...defaults['cv-change-request']}};
  const initialKind = new URLSearchParams(location.search).get('category');
  let kind = Object.hasOwn(records, initialKind) ? initialKind : 'feedback';
  let activeRecord = null;
  let modal = null;
  let opener = null;
  let inerted = [];
  const date = value => value ? new Date(value + 'T00:00:00').toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'}) : '\u2014';
  const months = Array.from({length:12}, (_, index) => new Date(2026,index,1).toLocaleDateString('en-GB',{month:'long'}));
  const status = '<span class="status-pill submitted"><i class="fa-solid fa-paper-plane" aria-hidden="true"></i>Submitted</span>';
  const whereaboutStatus = '<span class="status-pill approved"><i class="fa-solid fa-check" aria-hidden="true"></i>Pass</span>';
  const recordDate = row => {
    if (kind !== 'cv-change-request') return row.date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(row.submittedAt)) return row.submittedAt;
    const local = new Date(row.submittedAt);
    if (Number.isNaN(local.getTime())) return '';
    return [local.getFullYear(), String(local.getMonth() + 1).padStart(2, '0'), String(local.getDate()).padStart(2, '0')].join('-');
  };
  const cvStatusKey = row => {
    const value = String(row.status || 'Submitted').trim().toLowerCase();
    if (['pending', 'pending hr approval'].includes(value)) return 'submitted';
    return value === 'canceled' ? 'cancelled' : value;
  };
  const cvStatus = row => {
    const key = cvStatusKey(row);
    const icons = {draft: 'fa-file-pen', submitted: 'fa-paper-plane', resubmit: 'fa-rotate-left', approved: 'fa-check', rejected: 'fa-xmark', cancelled: 'fa-ban'};
    const label = row.status || 'Submitted';
    return `<span class="status-pill ${escape(key)}"><i class="fa-solid ${icons[key] || 'fa-file-lines'}" aria-hidden="true"></i>${escape(label)}</span>`;
  };
  const summaryRow = (label,value) => `<span class="history-card-row"><span>${escape(label)} :</span><strong>${escape(value || '\u2014')}</strong></span>`;
  const detailRow = (label,value,markup = false) => `<tr><th scope="row">${escape(label)}</th><td>${markup ? value : escape(value === '' || value == null ? '\u2014' : value)}</td></tr>`;
  const theme = () => document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';

  function render() {
    document.querySelectorAll('[data-history-kind]').forEach(button => {
      const active = button.dataset.historyKind === kind;
      button.classList.toggle('active',active);
      button.setAttribute('aria-pressed',String(active));
    });
    const label = labels[kind];
    $('historyCategoryTitle').textContent = label + ' History';
    const f = filters[kind];
    const rows = records[kind].filter(row => {
      if (kind === 'cv-change-request') return (!f.from || recordDate(row) >= f.from) && (!f.to || recordDate(row) <= f.to) && (!f.status || cvStatusKey(row) === f.status);
      if (kind === 'whereabout') return (!f.year || row.date.slice(0,4) === f.year) && (!f.month || Number(row.date.slice(5,7)) === Number(f.month));
      return (!f.from || row.feedbackDate1 >= f.from) && (!f.to || row.feedbackDate1 <= f.to) &&
        (!f.type || row.type === f.type) && (!f.category || row.category === f.category) &&
        (!f.status || f.status === 'submitted');
    });
    const summary = kind === 'feedback'
      ? [f.from ? 'From ' + date(f.from) : '', f.to ? 'To ' + date(f.to) : '', f.type, f.category, f.status ? 'Submitted' : '']
      : kind === 'whereabout' ? [f.year || 'All Years', f.month ? months[Number(f.month)-1] : 'All Months']
      : [f.from ? 'From ' + date(f.from) : '', f.to ? 'To ' + date(f.to) : '', f.status ? cvStatusLabels[f.status] : ''];
    $('historyFilterSummary').textContent = summary.filter(Boolean).join(' / ') || (kind === 'cv-change-request' ? 'All CV Change Requests' : 'All Feedback');
    $('historyRecordCount').textContent = String(rows.length);
    $('historyEmptyState').hidden = rows.length > 0;
    $('careerHistoryList').innerHTML = rows.map(row => {
      const title = kind === 'feedback' ? row.title : row.description;
      const details = kind === 'feedback'
        ? summaryRow('Feedback Date',date(row.feedbackDate1)) + summaryRow('Submit Date',date(row.submitDate)) + summaryRow('Type',row.type) + summaryRow('Category',row.category)
        : kind === 'whereabout' ? summaryRow('Date',date(row.date)) + summaryRow('Time',`${row.startTime} - ${row.endTime}`) + summaryRow('Task',row.task)
        : summaryRow('Submitted Date',date(recordDate(row)));
      const reference = kind === 'cv-change-request' ? '' : row.reference;
      const heading = kind === 'cv-change-request'
        ? `<span class="history-card-title-row"><span class="cv-history-card-employee history-card-title"><span class="history-employee-name">${escape(row.name || row.employeeName || '\u2014')}</span>${row.empNo ? `<span class="history-employee-id">#${escape(String(row.empNo).replace(/^#+/, ''))}</span>` : ''}</span></span>`
        : `<span class="history-card-title-row"><span class="history-card-title">${escape(title)}</span></span>`;
      return `<button type="button" class="history-card-item" data-status="${kind === 'cv-change-request' ? escape(cvStatusKey(row)) : kind === 'whereabout' ? 'approved' : 'submitted'}" data-record-id="${escape(row.id)}" aria-haspopup="dialog" aria-controls="historyDetailsModal">
        <span class="history-card-header"><span class="history-card-heading">${heading}${reference ? `<span class="history-card-ref">Ref: ${escape(reference)}</span>` : ''}</span>${kind === 'cv-change-request' ? cvStatus(row) : kind === 'whereabout' ? whereaboutStatus : status}</span>
        <span class="history-card-details career-history-card-rows">${details}</span>
      </button>`;
    }).join('');
  }

  function showModal(target,focusTarget) {
    opener = document.activeElement;
    modal = target;
    target.classList.add('is-open');
    target.setAttribute('aria-hidden','false');
    inerted = Array.from(document.querySelector('.career-history-phone').children).filter(node => node !== target && !node.inert);
    inerted.forEach(node => {node.inert = true;});
    focusTarget.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden','true');
    modal = null;
    inerted.forEach(node => {node.inert = false;});
    inerted = [];
    if (opener?.isConnected) opener.focus();
    else (document.querySelector(`[data-history-kind="${kind}"]`) || $('historyFilterTrigger')).focus();
  }

  function selectOptions(id,label,values) {
    const select = $(id);
    if (!select) return;
    select.replaceChildren(new Option(label,''));
    [...new Set(values)].sort().forEach(value => select.add(new Option(value,value)));
  }

  function fillFilter() {
    for (const [id, category] of [['feedbackHistoryFields', 'feedback'], ['whereaboutHistoryFields', 'whereabout'], ['cvHistoryFields', 'cv-change-request']]) {
      if ($(id)) $(id).hidden = kind !== category;
    }
    $('historyFilterTitle').textContent = 'Filter';
    $('historyFilterError').hidden = true;
    const f = filters[kind];
    if (kind === 'feedback') {
      $('historyDateFrom').value = f.from;
      $('historyDateTo').value = f.to;
      $('historyFeedbackType').value = f.type;
      $('historyFeedbackCategory').value = f.category;
      $('historyStatus').value = f.status;
    } else if (kind === 'whereabout') {
      selectOptions('historyYear','All Years',records.whereabout.map(row => row.date.slice(0,4)));
      $('historyYear').value = f.year;
      $('historyMonth').value = f.month;
    } else {
      $('cvHistoryDateFrom').value = f.from;
      $('cvHistoryDateTo').value = f.to;
      $('cvHistoryStatus').value = f.status;
    }
  }

  function renderDetails() {
    const row = activeRecord;
    $('historyDetailsModal').classList.toggle('cv-history-mobile-sheet', kind === 'cv-change-request');
    $('historyDetailTitle').textContent = kind === 'feedback' ? 'Feedback Detail' : kind === 'whereabout' ? 'Whereabout History Details' : 'CV Change Request Details';
    if (kind === 'cv-change-request') {
      $('historyDetailBody').innerHTML = window.EmployeeCareerCVHistoryDetails.render(row, cvStatus(row), date(recordDate(row)));
      return;
    }
    let content = '';
    let fields;
    if (kind === 'feedback') {
      fields = [['Emp #',String(row.empNo).replace(/^#/, '')],['Name',row.name],['Type',row.type],['Category',row.category],['Title',row.title],['Feedback Date 1',date(row.feedbackDate1)],['Feedback Date 2',date(row.feedbackDate2)],['Feedback Note',row.note],['Feedback Remarks',row.remarks],['Submit Date',date(row.submitDate)],['Reviewer Comment',row.reviewerComment],['Reviewed By',row.reviewedBy],['Reviewed Date',date(row.reviewedDate)],['Rating',row.rating],['Reward',row.reward],['Status','Submitted'],['Attachments',row.attachments?.length ? row.attachments.map(file=>file.name).join(', ') : 'No Data of Attachments']];
    } else {
      fields = [['Description',row.description],['Date',date(row.date)],['Time',`${row.startTime}-${row.endTime}`],['Status','Pass'],['Project',row.project],['Task',row.task],['State',row.state],['Remarks',row.remarks]];
    }
    $('historyDetailBody').innerHTML = content + `<table class="history-detail-table"><tbody>${fields.map(([key,value]) => {
      if (key === 'Emp #') return detailRow(key,`<span class="career-history-employee-id">#${escape(value)}</span>`,true);
      return detailRow(key,key === 'Status' ? (kind === 'whereabout' ? whereaboutStatus : status) : value,key === 'Status');
    }).join('')}</tbody></table>`;
  }

  function init() {
    $('careerHistoryBack').href = `../index.html?scope=individual&theme=${theme()}`;
    new MutationObserver(() => {$('careerHistoryBack').href = `../index.html?scope=individual&theme=${theme()}`;}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
    selectOptions('historyFeedbackType','All Types',records.feedback.map(row=>row.type));
    selectOptions('historyFeedbackCategory','All Categories',records.feedback.map(row=>row.category));
    selectOptions('historyYear','All Years',records.whereabout.map(row=>row.date.slice(0,4)));
    months.forEach((month,index)=>$('historyMonth')?.add(new Option(month,String(index+1))));
    document.querySelectorAll('[data-history-kind]').forEach(button=>button.addEventListener('click',() => {
      kind = button.dataset.historyKind;
      const url = new URL(location.href);
      url.searchParams.set('category',kind);
      history.replaceState(null,'',url);
      render();
    }));
    $('careerHistoryList').addEventListener('click',event => {
      const card = event.target.closest('[data-record-id]');
      if (!card) return;
      activeRecord = records[kind].find(row=>row.id === card.dataset.recordId);
      renderDetails();
      showModal($('historyDetailsModal'),$('closeHistoryDetails'));
    });
    $('historyFilterTrigger').addEventListener('click',() => {fillFilter(); showModal($('historyFilterModal'),$('closeHistoryFilter'));});
    $('historyDetailBody').addEventListener('click', event => {
      const tab = event.target.closest('[data-cv-tab]');
      if (tab) window.EmployeeCareerCVHistoryDetails.selectTab($('historyDetailBody'), tab.dataset.cvTab);
    });
    $('historyDetailBody').addEventListener('keydown', event => window.EmployeeCareerCVHistoryDetails.keydown(event, $('historyDetailBody')));
    $('resetHistoryFilter').addEventListener('click',() => {filters[kind] = {...defaults[kind]}; fillFilter(); render();});
    $('historyFilterForm').addEventListener('submit',event => {
      event.preventDefault();
      if (kind === 'feedback') {
        const from = $('historyDateFrom').value, to = $('historyDateTo').value;
        if (from && to && from > to) {
          $('historyFilterError').hidden = false;
          $('historyFilterError').textContent = 'End Date must be on or after Start Date.';
          $('historyDateTo').focus();
          return;
        }
        filters.feedback = {from,to,type:$('historyFeedbackType').value,category:$('historyFeedbackCategory').value,status:$('historyStatus').value};
      } else if (kind === 'whereabout') filters.whereabout = {year:$('historyYear').value,month:$('historyMonth').value};
      else {
        const from = $('cvHistoryDateFrom').value, to = $('cvHistoryDateTo').value;
        if (from && to && from > to) {
          $('historyFilterError').hidden = false;
          $('historyFilterError').textContent = 'End Date must be on or after Start Date.';
          $('cvHistoryDateTo').focus();
          return;
        }
        filters['cv-change-request'] = {from, to, status: $('cvHistoryStatus').value};
      }
      render();
      closeModal();
    });
    $('closeHistoryFilter').addEventListener('click',closeModal);
    $('closeHistoryDetails').addEventListener('click',closeModal);
    [$('historyFilterModal'),$('historyDetailsModal')].forEach(overlay=>overlay.addEventListener('click',event=>{if(event.target === overlay) closeModal();}));
    document.addEventListener('keydown',event => {
      if (!modal) return;
      if (event.key === 'Escape') {event.preventDefault(); closeModal();}
      if (event.key !== 'Tab' || !modal) return;
      const focusable = Array.from(modal.querySelectorAll('button, input, select, textarea, a[href]')).filter(node=>!node.disabled && node.tabIndex >= 0 && node.getClientRects().length);
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {event.preventDefault(); last.focus();}
      else if (!event.shiftKey && document.activeElement === last) {event.preventDefault(); first.focus();}
    });
    render();
  }
  document.addEventListener('DOMContentLoaded',init);
})();
