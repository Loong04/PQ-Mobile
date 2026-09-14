/**
 * PeopleHCM - Claims Options Schema & Configuration (Leave Square Grid Design)
 * Standard JS File (Compatible with file:// protocol and all browsers)
 * Uniform executive icon design system.
 */

window.CLAIM_OPTIONS = [
  {
    id: 'benefit',
    name: 'Benefit Claim',
    icon: '🎁',
    description: 'Optical, Dental, Gym & Learning',
    badgeText: 'RM 1,350 Avail',
    entitlementYearly: 2000.00,
    claimedYTD: 650.00,
    availableBalance: 1350.00,
    subCategories: [
      { id: 'optical', name: 'Optical & Eyewear', icon: '👓', limit: 500.00, used: 250.00 },
      { id: 'dental', name: 'Dental Screening', icon: '🦷', limit: 500.00, used: 200.00 },
      { id: 'wellness', name: 'Wellness & Gym', icon: '🧘', limit: 500.00, used: 200.00 },
      { id: 'learning', name: 'Professional Learning', icon: '📚', limit: 500.00, used: 0.00 }
    ]
  },
  {
    id: 'medical',
    name: 'Medical Claim',
    icon: '🏥',
    description: 'Outpatient GP, Specialist & Pharmacy',
    badgeText: 'RM 1,350 Avail',
    entitlementYearly: 1800.00,
    claimedYTD: 450.00,
    availableBalance: 1350.00,
    subCategories: [
      { id: 'outpatient', name: 'Outpatient GP', icon: '🩺', limit: 800.00, used: 300.00 },
      { id: 'specialist', name: 'Specialist Consult', icon: '👨‍⚕️', limit: 500.00, used: 150.00 },
      { id: 'pharmacy', name: 'Pharmacy & Drugs', icon: '💊', limit: 300.00, used: 0.00 },
      { id: 'hospital', name: 'Hospitalization', icon: '🏥', limit: 200.00, used: 0.00 }
    ]
  },
  {
    id: 'ot',
    name: 'OT Claim',
    icon: '⏰',
    description: 'Overtime Meal & Night Taxi',
    badgeText: '2 Pending',
    entitlementYearly: 1200.00,
    claimedYTD: 340.00,
    availableBalance: 860.00,
    subCategories: [
      { id: 'ot_meal', name: 'OT Meal Subsidy', icon: '🍱', limit: 400.00, used: 180.00 },
      { id: 'ot_transport', name: 'Night Taxi & Transport', icon: '🚕', limit: 400.00, used: 160.00 },
      { id: 'ot_allowance', name: 'Weekend OT Hourly', icon: '⏱️', limit: 400.00, used: 0.00 }
    ]
  },
  {
    id: 'travel',
    name: 'Travel Mileage',
    icon: '🚗',
    description: 'Mileage (RM 0.80/km), Grab & Tolls',
    badgeText: 'RM 880 Avail',
    entitlementYearly: 1500.00,
    claimedYTD: 620.00,
    availableBalance: 880.00,
    subCategories: [
      { id: 'mileage', name: 'Mileage (RM0.80/km)', icon: '🚗', limit: 1000.00, used: 420.00 },
      { id: 'grab', name: 'Grab / Taxi Ride', icon: '🚕', limit: 300.00, used: 120.00 },
      { id: 'parking', name: 'Parking & Tolls', icon: '🅿️', limit: 200.00, used: 80.00 }
    ]
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: '🍽️',
    description: 'Client Dining & Business Lunch',
    badgeText: 'RM 390 Avail',
    entitlementYearly: 500.00,
    claimedYTD: 110.00,
    availableBalance: 390.00,
    subCategories: [
      { id: 'client_lunch', name: 'Client Lunch / Dinner', icon: '🍷', limit: 300.00, used: 110.00 },
      { id: 'gifts', name: 'Client Gift & Courtesy', icon: '🎁', limit: 200.00, used: 0.00 }
    ]
  },
  {
    id: 'advance',
    name: 'Cash Advance',
    icon: '💵',
    description: 'Travel Advance & Event Petty Cash',
    badgeText: 'Request Cash',
    entitlementYearly: 3000.00,
    claimedYTD: 500.00,
    availableBalance: 2500.00,
    subCategories: [
      { id: 'travel_advance', name: 'Overseas Travel Advance', icon: '✈️', limit: 2000.00, used: 500.00 },
      { id: 'event_advance', name: 'Event Petty Cash', icon: '🎪', limit: 1000.00, used: 0.00 }
    ]
  },
  {
    id: 'expenses',
    name: 'Expenses Claim',
    icon: '🧾',
    description: 'Office Supplies, Printing & Courier',
    badgeText: 'RM 280 Avail',
    entitlementYearly: 400.00,
    claimedYTD: 120.00,
    availableBalance: 280.00,
    subCategories: [
      { id: 'office_supplies', name: 'Stationery & Printing', icon: '🖨️', limit: 200.00, used: 80.00 },
      { id: 'courier', name: 'Postage & Courier', icon: '📦', limit: 200.00, used: 40.00 }
    ]
  },
  {
    id: 'summary',
    name: 'Claim Summary',
    icon: '📊',
    description: 'YTD Spend Report & Statements',
    badgeText: 'View Report',
    entitlementYearly: 0.00,
    claimedYTD: 2810.00,
    availableBalance: 7610.00,
    subCategories: []
  }
];

// Manager Specific Claim Options
window.MANAGER_OPTIONS = [
  {
    id: 'benefit_highlight',
    name: 'Benefit Highlight',
    icon: '🌟',
    description: 'Team Benefit Usage Trends & Highlights',
    badgeText: 'View Insights'
  },
  {
    id: 'staff_entitlement',
    name: 'Staff Benefit Entitlement',
    icon: '💳',
    description: 'Direct Reports Benefit Balances & Entitlements',
    badgeText: '5 Staff'
  },
  {
    id: 'expenses_highlight',
    name: 'Expenses Highlight',
    icon: '📈',
    description: 'Monthly Department Expense Spikes & Analytics',
    badgeText: 'RM 4,250'
  },
  {
    id: 'staff_summary',
    name: 'Staff Claim Summary',
    icon: '📋',
    description: 'Subordinates YTD Statements & Export Reports',
    badgeText: 'Full Report'
  }
];

// Team Staff Benefit Entitlements Mock Data
window.MOCK_STAFF_ENTITLEMENTS = [
  { name: 'Sarah Chen', dept: 'Marketing Lead', entitlement: 3800.00, used: 1250.00, balance: 2550.00, pct: '32.9%' },
  { name: 'Marcus Tan', dept: 'Senior Engineer', entitlement: 3800.00, used: 950.00, balance: 2850.00, pct: '25.0%' },
  { name: 'Aisha Omar', dept: 'Product Designer', entitlement: 3800.00, used: 680.00, balance: 3120.00, pct: '17.8%' },
  { name: 'Jason Lee', dept: 'Frontend Dev', entitlement: 3800.00, used: 820.00, balance: 2980.00, pct: '21.5%' },
  { name: 'Emily Wong', dept: 'QA Engineer', entitlement: 3800.00, used: 550.00, balance: 3250.00, pct: '14.4%' }
];

window.MOCK_SUBMISSIONS = [
  {
    id: 'CLM-101',
    title: 'Optical Glasses Purchase @ Owndays',
    optionId: 'benefit',
    subCatName: 'Optical & Eyewear',
    date: '09 Sep 2026',
    amount: 250.00,
    merchant: 'Owndays TRX',
    status: 'pending',
    receipt: 'Owndays Receipt #8892'
  },
  {
    id: 'CLM-102',
    title: 'Dental Cleaning & Checkup',
    optionId: 'medical',
    subCatName: 'Dental Care',
    date: '04 Sep 2026',
    amount: 200.00,
    merchant: 'Smile Dental Clinic',
    status: 'pending',
    receipt: 'Smile Dental Receipt'
  },
  {
    id: 'CLM-103',
    title: 'OT Meal Allowance - Midnight Deployment',
    optionId: 'ot',
    subCatName: 'OT Meal Subsidy',
    date: '03 Sep 2026',
    amount: 35.00,
    merchant: 'McDonalds 24h',
    status: 'pending',
    receipt: 'McD Receipt #102'
  },
  {
    id: 'CLM-104',
    title: 'Grab Ride - Client Visit @ TRX',
    optionId: 'travel',
    subCatName: 'Grab Ride',
    date: '01 Sep 2026',
    amount: 45.00,
    merchant: 'Grab Malaysia',
    status: 'approved',
    receipt: 'Grab E-Receipt'
  },
  {
    id: 'CLM-105',
    title: 'Client Dinner @ Oriental Pavilion',
    optionId: 'entertainment',
    subCatName: 'Client Lunch / Dinner',
    date: '22 Aug 2026',
    amount: 110.00,
    merchant: 'Oriental Pavilion TRX',
    status: 'approved',
    receipt: 'Tax Invoice #9910'
  }
];

window.MOCK_TEAM_APPROVALS = [
  {
    id: 1,
    userName: 'Sarah Chen',
    dept: 'Marketing Lead • Digital Team',
    avatar: 'SC',
    avatarBg: 'rgba(124, 58, 237, 0.15)',
    avatarColor: '#7c3aed',
    title: 'Client Entertainment Lunch @ Nobu',
    optionName: 'Entertainment Claim',
    subCatName: 'Client Lunch',
    date: '13 Sep 2026',
    amount: 320.00,
    receipt: 'Nobu Invoice #1029'
  },
  {
    id: 2,
    userName: 'Marcus Tan',
    dept: 'Senior Frontend Engineer',
    avatar: 'MT',
    avatarBg: 'rgba(16, 185, 129, 0.15)',
    avatarColor: '#10b981',
    title: 'Weekend Project OT Meal Allowance',
    optionName: 'OT Claim',
    subCatName: 'OT Meal Subsidy',
    date: '11 Sep 2026',
    amount: 65.00,
    receipt: 'KFC E-Receipt'
  },
  {
    id: 3,
    userName: 'Aisha Omar',
    dept: 'UI/UX Product Designer',
    avatar: 'AO',
    avatarBg: 'rgba(245, 158, 11, 0.15)',
    avatarColor: '#f59e0b',
    title: 'Outpatient GP Specialist Visit',
    optionName: 'Medical Claim',
    subCatName: 'Specialist Consult',
    date: '08 Sep 2026',
    amount: 150.00,
    receipt: 'Qualitas Clinic Receipt'
  }
];
