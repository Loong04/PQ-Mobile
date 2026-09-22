/**
 * PeopleHCM - Claims Options Schema & Configuration
 * Exact field structure matching screenshot specifications (Benefits Claim & Claim Form).
 */

window.CURRENCIES = [
  'MALAYSIAN RINGGIT (MYR)',
  'US DOLLAR (USD)',
  'SINGAPORE DOLLAR (SGD)',
  'EURO (EUR)'
];

window.CLAIM_PERIOD_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

window.CLAIM_OPTIONS = [
  {
    id: 'benefit',
    name: 'Benefit Claim',
    icon: '🎁',
    entitlementYear: '2026',
    subCategories: [
      {
        id: 'car_maint',
        name: 'CAR MAINTENANCE',
        entitled: 1000.00,
        claimed: 0.00,
        pending: 197.00,
        usable: 803.00
      },
      {
        id: 'personal_allow',
        name: 'PERSONAL ALLOWANCE',
        entitled: 1000.00,
        claimed: 0.00,
        pending: 530.00,
        usable: 470.00
      },
      {
        id: 'mobile_phone',
        name: 'MOBILE PHONE',
        entitled: 900.00,
        claimed: 0.00,
        pending: 120.00,
        usable: 780.00
      },
      {
        id: 'optical_dental',
        name: 'OPTICAL & DENTAL',
        entitled: 1000.00,
        claimed: 250.00,
        pending: 0.00,
        usable: 750.00
      }
    ]
  },
  {
    id: 'medical',
    name: 'Medical Claim',
    icon: '🏥',
    entitlementYear: '2026',
    subCategories: [
      {
        id: 'gp_clinic',
        name: 'OUTPATIENT GP CLINIC',
        entitled: 800.00,
        claimed: 300.00,
        pending: 0.00,
        usable: 500.00
      },
      {
        id: 'specialist',
        name: 'SPECIALIST CONSULTATION',
        entitled: 500.00,
        claimed: 150.00,
        pending: 0.00,
        usable: 350.00
      },
      {
        id: 'pharmacy',
        name: 'PHARMACY & MEDICATION',
        entitled: 300.00,
        claimed: 0.00,
        pending: 50.00,
        usable: 250.00
      }
    ]
  },
  {
    id: 'ot',
    name: 'OT Claim',
    icon: '⏰',
    entitlementYear: '2026',
    subCategories: [
      {
        id: 'ot_meal',
        name: 'OVERTIME MEAL ALLOWANCE',
        entitled: 400.00,
        claimed: 180.00,
        pending: 35.00,
        usable: 185.00
      },
      {
        id: 'ot_transport',
        name: 'NIGHT TRANSPORT & TAXI',
        entitled: 400.00,
        claimed: 160.00,
        pending: 42.00,
        usable: 198.00
      }
    ]
  },
  {
    id: 'travel',
    name: 'Travel Mileage',
    icon: '🚗',
    entitlementYear: '2026',
    subCategories: [
      {
        id: 'mileage',
        name: 'MILEAGE (RM0.80/KM)',
        entitled: 1000.00,
        claimed: 420.00,
        pending: 45.00,
        usable: 535.00
      },
      {
        id: 'tolls_parking',
        name: 'PARKING & TOLL RECEIPTS',
        entitled: 300.00,
        claimed: 80.00,
        pending: 24.00,
        usable: 196.00
      }
    ]
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: '🍽️',
    entitlementYear: '2026',
    subCategories: [
      {
        id: 'client_dining',
        name: 'CLIENT DINING & LUNCH',
        entitled: 500.00,
        claimed: 110.00,
        pending: 0.00,
        usable: 390.00
      }
    ]
  },
  {
    id: 'advance',
    name: 'Cash Advance',
    icon: '💵',
    entitlementYear: '2026',
    subCategories: [
      {
        id: 'travel_adv',
        name: 'OVERSEAS TRAVEL ADVANCE',
        entitled: 2000.00,
        claimed: 500.00,
        pending: 0.00,
        usable: 1500.00
      }
    ]
  },
  {
    id: 'expenses',
    name: 'Expenses Claim',
    icon: '🧾',
    entitlementYear: '2026',
    subCategories: [
      {
        id: 'office_supplies',
        name: 'OFFICE SUPPLIES & PRINTING',
        entitled: 400.00,
        claimed: 120.00,
        pending: 0.00,
        usable: 280.00
      }
    ]
  },
  {
    id: 'summary',
    name: 'Claim Summary',
    icon: '📊',
    entitlementYear: '2026',
    subCategories: []
  }
];

// Manager Specific Options
window.MANAGER_OPTIONS = [
  { id: 'benefit_highlight', name: 'Benefit Highlight', icon: '🌟' },
  { id: 'staff_entitlement', name: 'Staff Benefit Entitlement', icon: '💳' },
  { id: 'expenses_highlight', name: 'Expenses Highlight', icon: '📈' },
  { id: 'staff_summary', name: 'Staff Claim Summary', icon: '📋' }
];

window.MOCK_STAFF_ENTITLEMENTS = [
  { name: 'Sarah Chen', empNo: 'EBB01', dept: 'Marketing Lead', entitlement: 3800.00, used: 1250.00, balance: 2550.00, pct: '32.9%' },
  { name: 'Marcus Tan', empNo: '004177', dept: 'Senior Engineer', entitlement: 3800.00, used: 950.00, balance: 2850.00, pct: '25.0%' },
  { name: 'Aisha Omar', empNo: '0000101', dept: 'Product Designer', entitlement: 3800.00, used: 680.00, balance: 3120.00, pct: '17.8%' },
  { name: 'Daniel Lee', empNo: '000582', dept: 'Operations Specialist', entitlement: 3800.00, used: 1420.00, balance: 2380.00, pct: '37.4%' },
  { name: 'Ahmad Razali', empNo: '001290', dept: 'Account Manager', entitlement: 4500.00, used: 1890.00, balance: 2610.00, pct: '42.0%' }
];

window.MOCK_TEAM_APPROVALS = [
  {
    id: 1,
    userName: 'Sarah Chen',
    empNo: 'EBB01',
    dept: 'Marketing Lead • Digital Team',
    avatar: 'SC',
    avatarBg: 'rgba(124, 58, 237, 0.15)',
    avatarColor: '#7c3aed',
    title: 'Client Entertainment Lunch @ Nobu',
    optionName: 'Entertainment Claim',
    subCatName: 'Client Lunch',
    date: '13 Sep 2026',
    amount: 320.00,
    receipt: 'Nobu Invoice #1029',
    status: 'pending'
  },
  {
    id: 2,
    userName: 'Marcus Tan',
    empNo: '004177',
    dept: 'Senior Frontend Engineer',
    avatar: 'MT',
    avatarBg: 'rgba(16, 185, 129, 0.15)',
    avatarColor: '#10b981',
    title: 'Weekend Project OT Meal Allowance',
    optionName: 'OT Claim',
    subCatName: 'OT Meal Subsidy',
    date: '11 Sep 2026',
    amount: 65.00,
    receipt: 'KFC E-Receipt',
    status: 'pending'
  },
  {
    id: 3,
    userName: 'Daniel Lee',
    empNo: '000582',
    dept: 'Operations Specialist • Logistics',
    avatar: 'DL',
    avatarBg: 'rgba(59, 130, 246, 0.15)',
    avatarColor: '#3b82f6',
    title: 'Site Inspection Travel Mileage (120km)',
    optionName: 'Travel Mileage',
    subCatName: 'Mileage Claim',
    date: '14 Sep 2026',
    amount: 96.00,
    receipt: 'GPS Log & Toll Receipt',
    status: 'pending'
  },
  {
    id: 4,
    userName: 'Ahmad Razali',
    empNo: '001290',
    dept: 'Account Manager • Enterprise Sales',
    avatar: 'AR',
    avatarBg: 'rgba(245, 158, 11, 0.15)',
    avatarColor: '#f59e0b',
    title: 'Penang Client Trip Flight & Hotel',
    optionName: 'Travel Mileage',
    subCatName: 'Overseas & Domestic Travel',
    date: '10 Sep 2026',
    amount: 890.00,
    receipt: 'AirAsia & Concorde Invoice',
    status: 'pending'
  }
];

window.MOCK_MY_SUBMISSIONS = [
  {
    id: 'CLM-2026-0901',
    category: 'CAR MAINTENANCE',
    optionName: 'Benefit Claim',
    date: '12 Sep 2026',
    amount: 197.00,
    status: 'pending',
    statusText: 'Pending Approval',
    merchant: 'Teo Seng Car Workshop',
    receipt: 'Receipt #9821',
    icon: '🚗'
  },
  {
    id: 'CLM-2026-0888',
    category: 'OPTICAL & DENTAL',
    optionName: 'Benefit Claim',
    date: '05 Sep 2026',
    amount: 250.00,
    status: 'approved',
    statusText: 'Approved',
    merchant: 'Owndays Optical Store',
    receipt: 'Inv #OW-5510',
    icon: '👓'
  },
  {
    id: 'CLM-2026-0850',
    category: 'TRAVEL MILEAGE',
    optionName: 'Travel Mileage',
    date: '01 Sep 2026',
    amount: 85.50,
    status: 'approved',
    statusText: 'Approved',
    merchant: 'PLUS Expressway Toll',
    receipt: 'Touch n Go e-Wallet Statement',
    icon: '🚗'
  },
  {
    id: 'CLM-2026-0820',
    category: 'OUTPATIENT GP CLINIC',
    optionName: 'Medical Claim',
    date: '28 Aug 2026',
    amount: 120.00,
    status: 'approved',
    statusText: 'Approved',
    merchant: 'Qualitas Clinic Cyberjaya',
    receipt: 'Rec #QC-1120',
    icon: '🏥'
  },
  {
    id: 'CLM-2026-0790',
    category: 'CLIENT DINING',
    optionName: 'Entertainment',
    date: '20 Aug 2026',
    amount: 350.00,
    status: 'rejected',
    statusText: 'Rejected',
    merchant: 'The Steakhouse KL',
    receipt: 'Rec #SH-9012',
    icon: '🍽️',
    rejectReason: 'Exceeded maximum entertainment limit without pre-approval.'
  }
];


