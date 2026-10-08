/* Guest Visit approvals for the local Workplace preview. */
(() => {
  const key = 'peoplehcm:workplace:pending-approval:v1';
  const statuses = ['submitted', 'approved', 'resubmit', 'rejected', 'cancelled'];
  const initial = () => [{
    id: 'guest-visit-0013', reference: 'FGV0000000000013', kind: 'guest-visit',
    employeeName: 'Farhan binti rahmat', empNo: 'EBB12', status: 'submitted',
    submitDate: '2024-08-16', requestDate: '2024-08-16', visitDate: '2026-10-08',
    startTime: '00:00', endTime: '00:00', totalGuest: 0, location: '', meal: false,
    guests: [], attendees: [{ empNo: '000001', name: 'Ram chhabila', department: 'ACCOUNTS', position: 'ACCOUNT EXECUTIVE' }],
    otherRequests: [], attachments: [], approverComments: '',
    audit: [{ action: 'submitted', at: '2024-08-16', comments: '' }]
  }];
  function list() {
    const raw = localStorage.getItem(key);
    if (raw === null) {
      const rows = initial();
      localStorage.setItem(key, JSON.stringify(rows));
      return rows;
    }
    const rows = JSON.parse(raw);
    if (!Array.isArray(rows) || rows.some(row => !row || typeof row.id !== 'string'
      || typeof row.reference !== 'string' || typeof row.employeeName !== 'string' || typeof row.empNo !== 'string'
      || !statuses.includes(row.status) || !Array.isArray(row.guests) || !Array.isArray(row.attendees)
      || !Array.isArray(row.otherRequests) || !Array.isArray(row.attachments) || !Array.isArray(row.audit))) {
      throw new Error('Invalid Workplace approval data.');
    }
    if (new Set(rows.map(row => row.id)).size !== rows.length) throw new Error('Duplicate Workplace approval requests.');
    return rows;
  }
  function act(ids, action, options = {}) {
    const status = { approve: 'approved', resubmit: 'resubmit', reject: 'rejected', cancel: 'cancelled' }[action];
    if (!status) throw new Error('Unsupported approval action.');
    if (!Array.isArray(ids) || !ids.length || new Set(ids).size !== ids.length) throw new Error('Please select a request.');
    const rows = list();
    const targets = ids.map(id => rows.find(row => row.id === id && row.status === 'submitted'));
    if (targets.some(row => !row)) throw new Error('This request is no longer pending.');
    const comments = String(options.comments || '').trim();
    const at = new Date().toISOString();
    targets.forEach(row => {
      row.status = status;
      row.approverComments = comments;
      row.audit.push({ action, at, comments });
    });
    localStorage.setItem(key, JSON.stringify(rows));
    return targets.length;
  }
  window.WorkplacePendingStore = { list, getPending: () => list().filter(row => row.status === 'submitted'), act };
})();
