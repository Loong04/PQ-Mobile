/* Pending approval reference rows supplied for the Payroll Team preview. */
(function () {
  const taxRows = [
    [32, '99104', 'James yong xian', 'TXR01', 'MEDICAL EXPENSES OF PARENTS', 'for parent', '2024-09-06', 500, '2024-09-06'],
    [35, 'EBB12', 'Farhan binti rahmat', 'TXR05', 'COMPLETE MEDICAL EXAMINATION', 'jdjdjdjd', '2024-09-26', 200, '2024-09-26'],
    [48, 'EBB12', 'Farhan binti rahmat', 'TXR13', 'CONTRIBUTION TO RETIREMENT SCHM AND ANNUITY', 'Ndjjx', '2025-12-31', 600, '2025-12-31'],
    [39, 'EBB12', 'Farhan binti rahmat', 'TXR02', 'BASIC SUPPORTING EQUIPMENT', 'Medical Relief', '2025-08-14', 100, '2026-01-07'],
    [49, 'EBB12', 'Farhan binti rahmat', 'TXR02', 'BASIC SUPPORTING EQUIPMENT', 'bdbdb', '2026-03-19', 12, '2026-03-19'],
    [50, 'EBB12', 'Farhan binti rahmat', 'TXR05', 'COMPLETE MEDICAL EXAMINATION', 'vhbhh', '2026-03-19', 14, '2026-03-19'],
    [36, 'EBB01', 'Muhammad ali bin man', 'TXR11', 'LIFE INSURANCE', 'Life Insurance', '2025-03-28', 2500, '2025-03-28'],
    [37, 'EBB12', 'Farhan binti rahmat', 'TXR01', 'MEDICAL EXPENSES OF PARENTS', 'Testing', '2025-07-18', 23, '2025-07-18'],
    [38, 'EBB12', 'Farhan binti rahmat', 'TXR01', 'MEDICAL EXPENSES OF PARENTS', 'Test', '2025-07-25', 1, '2025-07-25'],
    [42, 'EBB12', 'Farhan binti rahmat', 'TXR11', 'LIFE INSURANCE', 'Medical Benefit', '2025-08-14', 100, '2025-08-14']
  ];
  const deductionRows = [
    [62, '+ UNIFORM ALLOWANCE', '2025-07-01', '2025-07-31', 31, 0, '202507', '2025-07-03'],
    [63, '+ UNIFORM ALLOWANCE', '2025-06-11', '2025-06-30', 20, 0, '202507', '2025-07-25'],
    [64, '+ UNIFORM ALLOWANCE', '2020-07-05', '2020-07-08', 4, 0, '202507', '2025-07-25'],
    [65, '+ UNIFORM ALLOWANCE', '2020-07-01', '2020-07-04', 4, 0, '202507', '2025-07-25'],
    [66, '+ UNIFORM ALLOWANCE', '2015-07-05', '2015-07-07', 3, 0, '202507', '2025-07-25'],
    [67, '+ UNIFORM ALLOWANCE', '2015-07-01', '2015-07-04', 4, 0, '202507', '2025-07-25'],
    [70, '+ BACK PAY', '2025-08-15', '2025-08-15', 0, 100, '202508', '2025-08-15'],
    [71, '+ BACKPAY', '2025-08-15', '2025-08-15', 0, 200, '202508', '2025-08-15'],
    [72, '+ BASIC PAY', '2025-08-15', '2025-08-15', 0, 200, '202508', '2025-08-15'],
    [77, '+ BASIC PAY', '2025-09-04', '2025-09-09', 0, 50, '202509', '2025-09-24']
  ];
  const reference = (prefix, number) => prefix + String(number).padStart(12, '0');
  window.PAYROLL_PENDING_DATA = {
    tax: taxRows.map(([number, empNo, employeeName, rebateCode, rebateItem, description, transactionDate, amount, submitDate]) => ({
      id: reference('RBT', number), category: 'tax', empNo, employeeName, rebateCode, rebateItem, description, transactionDate, amount, submitDate,
      process: false, status: 'Submitted'
    })),
    deduction: deductionRows.map(([number, deductionType, dateFrom, dateTo, days, amount, period, requestDate]) => ({
      id: reference('PDR', number), category: 'deduction', empNo: 'EBB12', employeeName: 'Farhan binti rahmat', department: 'HUMAN RESOURCE',
      deductionType, requestType: 'Start Allowance', dateFrom, dateTo, days, amount, period, cycle: 'MONTH END', requestDate, status: 'Submitted'
    }))
  };

  // Approval actions are retained locally for the preview; no payroll API is called.
  const storageKey = 'pq_payroll_pending_decisions';
  function decisions() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      return Array.isArray(saved) ? saved.filter(item => item && typeof item.id === 'string' && ['approve', 'resubmit', 'reject'].includes(item.action)) : [];
    } catch { return []; }
  }
  function getPending() {
    const handled = new Set(decisions().map(item => item.id));
    return [...window.PAYROLL_PENDING_DATA.tax, ...window.PAYROLL_PENDING_DATA.deduction].filter(item => !handled.has(item.id));
  }
  function act(ids, action) {
    if (!['approve', 'resubmit', 'reject'].includes(action)) throw new Error('Unknown approval action');
    const selected = new Set(ids);
    const changes = getPending().filter(item => selected.has(item.id)).map(item => ({ id: item.id, action, decidedAt: new Date().toISOString() }));
    localStorage.setItem(storageKey, JSON.stringify([...decisions(), ...changes]));
    return changes.length;
  }
  window.PayrollPendingStore = { getPending, act };
})();
