/**
 * ========================================================
 * PEOPLEHCM PAYROLL MODULE CONFIGURATION & MOCK DATA
 * Scope: Individual (Payslip, EA) & Team (Tax Relief)
 * ========================================================
 */

window.PAYROLL_CONFIG = {
  employee: {
    name: 'Sarah Jenkins',
    empNo: 'EBB01',
    dept: 'Product & Design',
    role: 'Senior Product Designer',
    email: 'sarah.j@peoplequest.com',
    joinDate: '15 Mar 2021',
    nric: '920415-14-5892',
    taxNumber: 'SG 20984128030',
    epfNumber: 'EPF-88192031',
    socsoNumber: 'SOC-920415145892',
    bankName: 'Maybank Berhad',
    bankAccount: '•••• •••• 6821'
  },

  // 1. INDIVIDUAL: QUICK OPTIONS
  individualOptions: [
    {
      id: 'prior_pay',
      name: 'Prior Pay Data',
      desc: 'Previous payroll records',
      icon: '<i class="fa-solid fa-calendar-clock"></i>',
      link: 'options/payslip.html'
    },
    {
      id: 'tax_relief',
      name: 'Tax Relief',
      desc: 'Personal tax relief records',
      icon: '<i class="fa-solid fa-file-circle-check"></i>',
      action: 'tax-relief'
    },
    {
      id: 'deduction_request',
      name: 'Deduction Request',
      desc: 'Submit a payroll deduction',
      icon: '<i class="fa-solid fa-file-circle-plus"></i>',
      action: 'deduction-request'
    },
    {
      id: 'payslip',
      name: 'Payslip',
      desc: 'Monthly salary statements',
      icon: '<i class="fa-solid fa-file-invoice-dollar"></i>',
      link: 'options/payslip.html'
    },
    {
      id: 'ea',
      name: 'EA',
      desc: 'Annual tax statement',
      icon: '<i class="fa-solid fa-file-contract"></i>',
      link: 'options/ea-form.html'
    }
  ],

  // 2. TEAM: QUICK OPTIONS (User: team 有的是 tax relief 而已)
  teamOptions: [
    {
      id: 'tax_relief',
      name: 'Tax Relief',
      desc: 'Review & approve staff tax relief claims',
      icon: '<i class="fa-solid fa-hand-holding-dollar"></i>',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.14)',
      link: 'options/tax-relief.html',
      badge: '4 Pending'
    }
  ],

  // 3. INDIVIDUAL: PAYSLIP DATA BY MONTH
  payslips: {
    '2026-09': {
      monthKey: '2026-09',
      monthLabel: 'September 2026',
      shortLabel: 'Sep 2026',
      payDate: '25 Sep 2026',
      status: 'Paid',
      grossPay: 7500.00,
      totalDeductions: 1017.50,
      netPay: 6482.50,
      earnings: [
        { name: 'Basic Salary', amount: 6500.00, tag: 'Fixed' },
        { name: 'Fixed Transport Allowance', amount: 500.00, tag: 'Allowance' },
        { name: 'Mobile & Data Allowance', amount: 200.00, tag: 'Allowance' },
        { name: 'Performance Incentive', amount: 300.00, tag: 'Variable' }
      ],
      deductions: [
        { name: 'EPF Employee (11%)', amount: 825.00, note: 'Statutory' },
        { name: 'SOCSO Employee (0.5%)', amount: 36.75, note: 'Statutory' },
        { name: 'EIS Employee (0.2%)', amount: 14.70, note: 'Statutory' },
        { name: 'PCB / Monthly Tax Deduction', amount: 141.05, note: 'LHDN Tax' }
      ],
      employerStatutory: [
        { name: 'EPF Employer (13%)', amount: 975.00 },
        { name: 'SOCSO Employer (1.75%)', amount: 128.65 },
        { name: 'EIS Employer (0.2%)', amount: 14.70 },
        { name: 'HRD Corp Levy (1%)', amount: 75.00 }
      ],
      ytd: {
        gross: 67500.00,
        epf: 7425.00,
        socso: 330.75,
        eis: 132.30,
        pcb: 1269.45,
        net: 58342.50
      },
      pdfFile: 'Payslip_Sep_2026_Sarah_Jenkins.pdf'
    },
    '2026-08': {
      monthKey: '2026-08',
      monthLabel: 'August 2026',
      shortLabel: 'Aug 2026',
      payDate: '25 Aug 2026',
      status: 'Paid',
      grossPay: 7200.00,
      totalDeductions: 984.50,
      netPay: 6215.50,
      earnings: [
        { name: 'Basic Salary', amount: 6500.00, tag: 'Fixed' },
        { name: 'Fixed Transport Allowance', amount: 500.00, tag: 'Allowance' },
        { name: 'Mobile & Data Allowance', amount: 200.00, tag: 'Allowance' }
      ],
      deductions: [
        { name: 'EPF Employee (11%)', amount: 792.00, note: 'Statutory' },
        { name: 'SOCSO Employee (0.5%)', amount: 35.25, note: 'Statutory' },
        { name: 'EIS Employee (0.2%)', amount: 14.10, note: 'Statutory' },
        { name: 'PCB / Monthly Tax Deduction', amount: 143.15, note: 'LHDN Tax' }
      ],
      employerStatutory: [
        { name: 'EPF Employer (13%)', amount: 936.00 },
        { name: 'SOCSO Employer (1.75%)', amount: 123.40 },
        { name: 'EIS Employer (0.2%)', amount: 14.10 },
        { name: 'HRD Corp Levy (1%)', amount: 72.00 }
      ],
      ytd: {
        gross: 60000.00,
        epf: 6600.00,
        socso: 294.00,
        eis: 117.60,
        pcb: 1128.40,
        net: 51860.00
      },
      pdfFile: 'Payslip_Aug_2026_Sarah_Jenkins.pdf'
    },
    '2026-07': {
      monthKey: '2026-07',
      monthLabel: 'July 2026',
      shortLabel: 'Jul 2026',
      payDate: '25 Jul 2026',
      status: 'Paid',
      grossPay: 7200.00,
      totalDeductions: 984.50,
      netPay: 6215.50,
      earnings: [
        { name: 'Basic Salary', amount: 6500.00, tag: 'Fixed' },
        { name: 'Fixed Transport Allowance', amount: 500.00, tag: 'Allowance' },
        { name: 'Mobile & Data Allowance', amount: 200.00, tag: 'Allowance' }
      ],
      deductions: [
        { name: 'EPF Employee (11%)', amount: 792.00, note: 'Statutory' },
        { name: 'SOCSO Employee (0.5%)', amount: 35.25, note: 'Statutory' },
        { name: 'EIS Employee (0.2%)', amount: 14.10, note: 'Statutory' },
        { name: 'PCB / Monthly Tax Deduction', amount: 143.15, note: 'LHDN Tax' }
      ],
      employerStatutory: [
        { name: 'EPF Employer (13%)', amount: 936.00 },
        { name: 'SOCSO Employer (1.75%)', amount: 123.40 },
        { name: 'EIS Employer (0.2%)', amount: 14.10 },
        { name: 'HRD Corp Levy (1%)', amount: 72.00 }
      ],
      ytd: {
        gross: 52800.00,
        epf: 5808.00,
        socso: 258.75,
        eis: 103.50,
        pcb: 985.25,
        net: 45644.50
      },
      pdfFile: 'Payslip_Jul_2026_Sarah_Jenkins.pdf'
    },
    '2026-06': {
      monthKey: '2026-06',
      monthLabel: 'June 2026',
      shortLabel: 'Jun 2026',
      payDate: '25 Jun 2026',
      status: 'Paid',
      grossPay: 8200.00,
      totalDeductions: 1112.50,
      netPay: 7087.50,
      earnings: [
        { name: 'Basic Salary', amount: 6500.00, tag: 'Fixed' },
        { name: 'Fixed Transport Allowance', amount: 500.00, tag: 'Allowance' },
        { name: 'Mobile & Data Allowance', amount: 200.00, tag: 'Allowance' },
        { name: 'Mid-Year Bonus', amount: 1000.00, tag: 'Bonus' }
      ],
      deductions: [
        { name: 'EPF Employee (11%)', amount: 902.00, note: 'Statutory' },
        { name: 'SOCSO Employee (0.5%)', amount: 39.75, note: 'Statutory' },
        { name: 'EIS Employee (0.2%)', amount: 15.90, note: 'Statutory' },
        { name: 'PCB / Monthly Tax Deduction', amount: 154.85, note: 'LHDN Tax' }
      ],
      employerStatutory: [
        { name: 'EPF Employer (13%)', amount: 1066.00 },
        { name: 'SOCSO Employer (1.75%)', amount: 139.10 },
        { name: 'EIS Employer (0.2%)', amount: 15.90 },
        { name: 'HRD Corp Levy (1%)', amount: 82.00 }
      ],
      ytd: {
        gross: 45600.00,
        epf: 5016.00,
        socso: 223.50,
        eis: 89.40,
        pcb: 842.10,
        net: 39429.00
      },
      pdfFile: 'Payslip_Jun_2026_Sarah_Jenkins.pdf'
    }
  },

  // 4. INDIVIDUAL: BORANG EA (FORM C.P.8A) DATA
  eaForms: {
    '2025': {
      year: '2025',
      formType: 'C.P.8A [Pin. 2025]',
      serialNo: 'EA-2025-004128',
      employer: {
        name: 'PEOPLEQUEST TECHNOLOGIES SDN BHD',
        eNumber: 'E 9128374-02',
        address: 'Level 28, Menara PQ, KL Sentral, 50470 Kuala Lumpur'
      },
      partA: {
        name: 'SARAH JENKINS',
        empNo: '#EBB01',
        designation: 'Senior Product Designer',
        nric: '920415-14-5892',
        passportNo: '-',
        itn: 'SG 20984128030',
        epfNo: 'EPF-88192031',
        socsoNo: 'SOC-920415145892',
        childrenCount: 0
      },
      partB: {
        grossSalary: 86400.00,
        bonus: 10500.00,
        feesPerquisites: 8400.00,
        gratuity: 0.00,
        bik: 1200.00, // Benefits-in-kind
        vola: 0.00,   // Value of living accommodation
        refundFromUnapprovedFund: 0.00,
        compensationForLossOfEmployment: 0.00,
        totalGross: 106500.00
      },
      partC: {
        pension: 0.00,
        annuities: 0.00
      },
      partD: {
        monthlyTaxDeductionPCB: 7420.00,
        cp38Deduction: 0.00,
        zakatPaidViaPayroll: 0.00,
        totalTaxDeductions: 7420.00
      },
      partE: {
        epfTotalContribution: 11715.00,
        socsoTotalContribution: 423.00,
        eisTotalContribution: 169.20
      },
      partF: {
        exemptAllowances: 2400.00 // Petrol / travel exemption
      },
      generatedDate: '28 Feb 2026',
      officerName: 'Amanda Loo (Head of Payroll)',
      officerPhone: '+603-2788 9000'
    },
    '2024': {
      year: '2024',
      formType: 'C.P.8A [Pin. 2024]',
      serialNo: 'EA-2024-003891',
      employer: {
        name: 'PEOPLEQUEST TECHNOLOGIES SDN BHD',
        eNumber: 'E 9128374-02',
        address: 'Level 28, Menara PQ, KL Sentral, 50470 Kuala Lumpur'
      },
      partA: {
        name: 'SARAH JENKINS',
        empNo: '#EBB01',
        designation: 'Product Designer',
        nric: '920415-14-5892',
        passportNo: '-',
        itn: 'SG 20984128030',
        epfNo: 'EPF-88192031',
        socsoNo: 'SOC-920415145892',
        childrenCount: 0
      },
      partB: {
        grossSalary: 78000.00,
        bonus: 8000.00,
        feesPerquisites: 7200.00,
        gratuity: 0.00,
        bik: 800.00,
        vola: 0.00,
        refundFromUnapprovedFund: 0.00,
        compensationForLossOfEmployment: 0.00,
        totalGross: 94000.00
      },
      partC: {
        pension: 0.00,
        annuities: 0.00
      },
      partD: {
        monthlyTaxDeductionPCB: 5880.00,
        cp38Deduction: 0.00,
        zakatPaidViaPayroll: 0.00,
        totalTaxDeductions: 5880.00
      },
      partE: {
        epfTotalContribution: 10340.00,
        socsoTotalContribution: 382.50,
        eisTotalContribution: 153.00
      },
      partF: {
        exemptAllowances: 2400.00
      },
      generatedDate: '28 Feb 2025',
      officerName: 'Amanda Loo (Head of Payroll)',
      officerPhone: '+603-2788 9000'
    }
  },

  // 5. TEAM: TAX RELIEF OVERVIEW & SUBMISSIONS LIST
  teamTaxRelief: {
    year: '2026',
    totalStaff: 12,
    totalClaims: 18,
    pendingCount: 4,
    approvedCount: 13,
    rejectedCount: 1,
    totalReliefClaimed: 48250.00,
    submissions: [
      {
        id: 'TR-2026-001',
        userName: 'Aisha Tan',
        empNo: '0000101',
        dept: 'Product Design • UI/UX Team',
        avatar: 'AT',
        avatarBg: 'rgba(236, 72, 153, 0.15)',
        avatarColor: '#ec4899',
        category: 'Lifestyle',
        subCategory: 'Personal Computer / Tablet / Smartphone',
        itemTitle: 'iPad Pro 11-inch M4 for Design Work & Digital Sketching',
        amount: 2500.00,
        maxStatutoryCap: 2500.00,
        claimDate: '18 Sep 2026',
        submitDate: '19 Sep 2026',
        status: 'pending',
        receiptNumber: 'Apple Store Invoice #MY-99120',
        receiptFileName: 'Apple_Store_Invoice_Aisha.pdf',
        notes: 'Submitted for Individual Lifestyle relief (self/spouse/child).'
      },
      {
        id: 'TR-2026-002',
        userName: 'Marcus Tan',
        empNo: '004177',
        dept: 'Senior Frontend Engineer',
        avatar: 'MT',
        avatarBg: 'rgba(16, 185, 129, 0.15)',
        avatarColor: '#10b981',
        category: 'Education Fees',
        subCategory: 'Self (Postgraduate / Technical / Degree)',
        itemTitle: 'Master of Computer Science (AI & Architecture) Semester 2 Tuition',
        amount: 4200.00,
        maxStatutoryCap: 7000.00,
        claimDate: '15 Sep 2026',
        submitDate: '16 Sep 2026',
        status: 'pending',
        receiptNumber: 'Universiti Malaya Official Receipt #UM-202609',
        receiptFileName: 'UM_Tuition_Receipt_Marcus.pdf',
        notes: 'Recognized tertiary institution by Ministry of Higher Education.'
      },
      {
        id: 'TR-2026-003',
        userName: 'Daniel Lee',
        empNo: '000582',
        dept: 'Operations Specialist • Logistics',
        avatar: 'DL',
        avatarBg: 'rgba(59, 130, 246, 0.15)',
        avatarColor: '#3b82f6',
        category: 'Medical Expenses',
        subCategory: 'Medical Treatment for Parents',
        itemTitle: 'Orthopedic Joint Care & Physiotherapy Sessions for Father',
        amount: 3800.00,
        maxStatutoryCap: 8000.00,
        claimDate: '12 Sep 2026',
        submitDate: '13 Sep 2026',
        status: 'pending',
        receiptNumber: 'Pantai Hospital Receipt #HP-44120',
        receiptFileName: 'Pantai_Hospital_Bill_Daniel.pdf',
        notes: 'Includes registered medical practitioner clinical diagnosis cert.'
      },
      {
        id: 'TR-2026-004',
        userName: 'Kevin Lim',
        empNo: '002774',
        dept: 'Infrastructure Engineer',
        avatar: 'KL',
        avatarBg: 'rgba(20, 184, 166, 0.15)',
        avatarColor: '#14b8a6',
        category: 'Lifestyle',
        subCategory: 'Sports Equipment & Gym Membership',
        itemTitle: 'Annual Fitness First Gym Membership & Running Footwear',
        amount: 850.00,
        maxStatutoryCap: 1000.00,
        claimDate: '10 Sep 2026',
        submitDate: '11 Sep 2026',
        status: 'pending',
        receiptNumber: 'Fitness First Tax Invoice #FF-3302',
        receiptFileName: 'Fitness_First_Receipt_Kevin.pdf',
        notes: 'Includes gym subscription under Sports Development Act 1997.'
      },
      {
        id: 'TR-2026-005',
        userName: 'Sarah Chen',
        empNo: 'EBB01',
        dept: 'Marketing Lead • Digital Team',
        avatar: 'SC',
        avatarBg: 'rgba(124, 58, 237, 0.15)',
        avatarColor: '#7c3aed',
        category: 'Medical Expenses',
        subCategory: 'Complete Medical Examination',
        itemTitle: 'Full Comprehensive Executive Health Screening & Blood Profile',
        amount: 1000.00,
        maxStatutoryCap: 1000.00,
        claimDate: '05 Sep 2026',
        submitDate: '06 Sep 2026',
        status: 'approved',
        receiptNumber: 'Prince Court Medical Center #PC-1082',
        receiptFileName: 'Prince_Court_Receipt_Sarah.pdf',
        notes: 'Approved under complete medical examination for self/spouse.'
      },
      {
        id: 'TR-2026-006',
        userName: 'Ahmad Razali',
        empNo: '001290',
        dept: 'Enterprise Sales & Account Management',
        avatar: 'AR',
        avatarBg: 'rgba(245, 158, 11, 0.15)',
        avatarColor: '#f59e0b',
        category: 'Insurance & EPF',
        subCategory: 'Life Insurance & Takaful',
        itemTitle: 'Annual Prudential Life Insurance Policy Premium',
        amount: 3000.00,
        maxStatutoryCap: 3000.00,
        claimDate: '02 Sep 2026',
        submitDate: '03 Sep 2026',
        status: 'approved',
        receiptNumber: 'Prudential Annual Statement #PRU-9901',
        receiptFileName: 'Prudential_Policy_Ahmad.pdf',
        notes: 'Verified policy owner and premium proof.'
      },
      {
        id: 'TR-2026-007',
        userName: 'Emily Wong',
        empNo: '003319',
        dept: 'UX Research & Customer Insights',
        avatar: 'EW',
        avatarBg: 'rgba(59, 130, 246, 0.15)',
        avatarColor: '#3b82f6',
        category: 'Lifestyle',
        subCategory: 'Books, Journals & Periodicals',
        itemTitle: 'Kinokuniya Design Leadership & Technical Reference Books',
        amount: 450.00,
        maxStatutoryCap: 2500.00,
        claimDate: '28 Aug 2026',
        submitDate: '29 Aug 2026',
        status: 'approved',
        receiptNumber: 'Kinokuniya Official Tax Invoice #KN-8831',
        receiptFileName: 'Kinokuniya_Invoice_Emily.pdf',
        notes: 'Printed books and reference materials qualified under lifestyle relief.'
      },
      {
        id: 'TR-2026-008',
        userName: 'Jason Ng',
        empNo: '001552',
        dept: 'DevOps & Cloud Systems',
        avatar: 'JN',
        avatarBg: 'rgba(239, 68, 68, 0.15)',
        avatarColor: '#ef4444',
        category: 'Lifestyle',
        subCategory: 'Sports & Smart Devices',
        itemTitle: 'Luxury Smartwatch Decorative Leather Strap & Case',
        amount: 220.00,
        maxStatutoryCap: 1000.00,
        claimDate: '20 Aug 2026',
        submitDate: '21 Aug 2026',
        status: 'rejected',
        receiptNumber: 'Shopee Official Store Invoice #SP-109284',
        receiptFileName: 'Shopee_Order_Jason.pdf',
        notes: 'Disallowed: Watch accessories and aesthetic straps are excluded from LHDN lifestyle equipment deduction.'
      }
    ]
  }
};
