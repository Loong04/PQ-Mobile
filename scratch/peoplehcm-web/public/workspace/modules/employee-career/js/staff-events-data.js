// Reference totals and the complete employee rows visible in the supplied screenshots.
// Unknown rows are not generated to fill the source totals.
window.EMPLOYEE_CAREER_STAFF_EVENTS = [
  { id: 'active', title: 'Active', total: 282, icon: 'fa-users', description: 'Active employees', records: [
    ['EBB22', 'Fisha bte aidit'], ['EBB23', 'Hatta bin roslan'], ['EBB17', 'Chan shu leng'], ['EBB19', 'Goh siew teng'], ['EBB16', 'Justine ee su may'], ['EBB29', 'Sivasangaran krishnan'], ['EBB76', 'Paul simon'], ['EBB32', 'Hew chin hong'], ['EBB06', 'Wang chiin chin'], ['EBB25', 'Chin shi jil'], ['EBB26', 'Carlos']
  ] },
  { id: 'retirement', title: 'Retirement Past Due', total: 80, icon: 'fa-user-clock', description: 'Staff retirement review', records: [
    ['EBB203', 'Ahmad bin sulong', '1949-06-27'], ['77799', 'Khoo tien hock', '1955-01-01'], ['11333', 'Neo soon siak', '1958-01-01'], ['EBB76', 'Paul simon', '1960-07-16'], ['EBB79', 'Katrina', '1960-07-16'], ['EBB77', 'Azmin mansor', '1960-07-16'], ['EBB204', 'Juliana binti othman', '1964-01-18'], ['EBB202', 'Mohd adli bin yahya', '1964-11-11'], ['EAC0763', 'Nasri bin razak', '1965-02-25'], ['EBB208', 'Zuraina binti harun', '1965-08-14'], ['EBB226', 'Azhar bin omar', '1968-02-04']
  ] },
  { id: 'birthday', title: 'Birthday', total: 28, icon: 'fa-cake-candles', description: 'Birth dates in October', records: [
    ['EBB04', 'Angeline loren alan', '1966-10-13'], ['P02919', 'AHMAD NIZAMUDDIN BIN MUHAMAD', '1971-10-17'], ['EBB19', 'Goh siew teng', '1972-10-13'], ['EBB224', 'Fazilah binti tajudin', '1974-10-19'], ['EBB15', 'Asmawi idris', '1978-10-06'], ['620717', 'MD SHOHEL', '1978-10-11'], ['M0844', 'AMIERUL AIZAT BIN AHMAD', '1978-10-18'], ['P02804', 'YAKPANGDEN UGAL', '1981-10-18'], ['M0908', 'WAHYU BASOVI', '1988-10-15'], ['001988', 'Sazali Samad', '1990-10-15']
  ] },
  { id: 'confirmation-past', title: 'Confirmation Past Due', total: 237, icon: 'fa-user-check', description: 'Confirmation dates to review', records: [
    ['EBB06', 'Wang chiin chin', '2007-04-01'], ['EBB17', 'Chan shu leng', '2007-08-01'], ['EBB31', 'Lim chee sheng', '2008-04-01'], ['EBB76', 'Paul simon', '2008-05-01'], ['EBB72', 'Norzal bin razak', '2008-10-01'], ['EBB75', 'Jim low', '2009-02-06'], ['EBB209', 'Hew meow yee', '2009-02-21'], ['EBB205', 'Haslina binti hamim', '2009-02-21'], ['EBB208', 'Zuraina binti harun', '2009-02-21'], ['EBB207', 'Nurul wahidah binti baharun', '2009-02-21'], ['EBB204', 'Juliana binti othman', '2009-02-21']
  ] },
  { id: 'contract', title: 'Contract Expiry Past Due', total: 29, icon: 'fa-file-contract', description: 'Expired contracts to review', records: [
    ['EBB02', 'Ahmad bin musa', '2009-11-30'], ['EBB204', 'Juliana binti othman', '2009-12-31'], ['EBB35', 'Sam cheng kong', '2011-03-31'], ['EBB29', 'Sivasangaran krishnan', '2011-06-30'], ['EBB28', 'Atir bin razak', '2011-10-31'], ['CJ007', 'Stephanie chow su ling', '2016-02-29'], ['EBB01', 'Muhammad ali bin man', '2018-03-31'], ['EBB19', 'Goh siew teng', '2023-02-28'], ['EBB32', 'Hew chin hong', '2023-03-31'], ['EBB25', 'Chin shi jil', '2023-03-31'], ['EBB62', 'Aswan bin yaakob', '2023-03-31']
  ] },
  { id: 'medical', title: 'Medical Check', total: 6, icon: 'fa-notes-medical', description: 'Employee medical checks', records: [
    ['EBB01', 'Muhammad ali bin man', '2013-09-15'], ['EBB24', 'Mong mei ling', '2013-09-18'], ['EBB21', 'Kathleen lee chee dee', '2013-09-20'], ['EBB12', 'Farhan binti rahmat', '2013-10-01'], ['EBB22', 'Fisha bte aidit', '2023-12-07'], ['A0001', 'Natasha thean mei hoi', '2024-10-01']
  ] },
  { id: 'confirmation', title: 'Confirmation Due', total: 2, icon: 'fa-calendar-check', description: 'Upcoming confirmation dates', records: [
    ['P0000018', 'PETER PARKER', '2026-10-12'], ['001988', 'Sazali Samad', '2026-10-13']
  ] }
].map(category => ({ ...category, records: category.records.map(([empNo, name, date = '']) => ({ empNo, name, date })) }));
