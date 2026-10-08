(() => {
  const records = [
    {
      id: '0000101', name: 'Lee Soon Hock', shift: '8.30AM-5.30PM (W01)', clockTime: '0740,1756',
      actualHours: '0.50', approvedHours: '0.50', unapprovedHours: '0.00', section: 'production', job: 'technician',
      items: [{ description: 'OT 1.5 BEFORE WORK', actual: '0030', approve: '0030' }]
    },
    {
      id: '000016', name: 'Raju kumar', shift: '8.30AM-5.30PM (W01)', clockTime: '0750,1906',
      actualHours: '2.00', approvedHours: '2.00', unapprovedHours: '0.00', section: 'assembly', job: 'operator',
      items: [{ description: '1.5 OT', actual: '0200', approve: '0200' }]
    },
    {
      id: '000020', name: 'Tay siow kung', shift: '8.30AM-5.30PM (W01)', clockTime: '0741,1757',
      actualHours: '0.50', approvedHours: '0.50', unapprovedHours: '0.00', section: 'qc', job: 'technician',
      items: [{ description: 'OT 1.5 BEFORE WORK', actual: '0030', approve: '0030' }]
    },
    {
      id: '000022', name: 'Tan siow soon', shift: '8.30AM-5.30PM (W01)', clockTime: '0745,1915',
      actualHours: '8.50', approvedHours: '0.00', unapprovedHours: '8.50', section: 'production', job: 'operator',
      items: [
        { description: 'OT 1.5 BEFORE WORK', actual: '0030', approve: '0030' },
        { description: '1.5 OT', actual: '0200', approve: '0200' },
        { description: 'OT 2.0 AFTER WORK', actual: '0130', approve: '0130' },
        { description: 'REST DAY OT 1.5', actual: '0100', approve: '0100' },
        { description: 'REST DAY OT 2.0', actual: '0100', approve: '0100' },
        { description: 'PUBLIC HOLIDAY OT 1.5', actual: '0100', approve: '0100' },
        { description: 'PUBLIC HOLIDAY OT 2.0', actual: '0030', approve: '0030' },
        { description: 'NIGHT SHIFT OT 1.5', actual: '0030', approve: '0030' }
      ]
    },
    {
      id: '000088', name: 'David Wong', shift: '8.30AM-5.30PM (W01)', clockTime: '0715,2030',
      actualHours: '7.75', approvedHours: '0.00', unapprovedHours: '7.75', section: 'production', job: 'supervisor',
      items: [
        { description: 'OT 1.5 BEFORE WORK', actual: '0030', approve: '0000' },
        { description: '1.5 OT AFTER WORK', actual: '0200', approve: '0000' },
        { description: '2.0 OT RESTDAY', actual: '0130', approve: '0000' },
        { description: 'OT 1.5 MEAL BREAK', actual: '0045', approve: '0000' },
        { description: '3.0 OT HOLIDAY', actual: '0100', approve: '0000' },
        { description: 'OT SHIFT OVERTIME A', actual: '0030', approve: '0000' },
        { description: 'OT SHIFT OVERTIME B', actual: '0100', approve: '0000' },
        { description: 'OT EMERGENCY STANDBY', actual: '0030', approve: '0000' }
      ]
    },
    {
      id: '000035', name: 'Ahmad Bin Zulkifli', shift: '8.30AM-5.30PM (W01)', clockTime: '0730,1830',
      actualHours: '1.50', approvedHours: '0.00', unapprovedHours: '1.50', section: 'assembly', job: 'supervisor',
      items: [
        { description: 'OT 1.5 BEFORE WORK', actual: '0030', approve: '0000' },
        { description: '1.5 OT', actual: '0100', approve: '0000' }
      ]
    }
  ].map(record => Object.freeze({ ...record, items: Object.freeze(record.items.map(item => Object.freeze({ ...item }))) }));

  const source = Object.freeze(records);
  const storageKey = 'peoplehcm-daily-ot-overrides';

  function readOverrides() {
    try {
      return JSON.parse(sessionStorage.getItem(storageKey) || '{}');
    } catch {
      return {};
    }
  }

  window.DAILY_OT_STAFF_RECORDS = source;
  window.createDailyOtRecords = () => {
    const overrides = readOverrides();
    return source.map(record => {
      const override = overrides[record.id] || {};
      return {
        ...record,
        ...override,
        items: record.items.map((item, index) => ({ ...item, ...(override.items?.[index] || {}) }))
      };
    });
  };
  window.saveDailyOtRecord = record => {
    try {
      const overrides = readOverrides();
      overrides[record.id] = {
        actualHours: record.actualHours,
        approvedHours: record.approvedHours,
        unapprovedHours: record.unapprovedHours,
        items: record.items.map(item => ({ approve: item.approve, voided: Boolean(item.voided) }))
      };
      sessionStorage.setItem(storageKey, JSON.stringify(overrides));
    } catch {
      // The in-page record still updates when storage is unavailable.
    }
  };
})();
