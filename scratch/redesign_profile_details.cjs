const fs = require('node:fs');
const vm = require('node:vm');

const file = 'me.html';
let html = fs.readFileSync(file, 'utf8');
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const blank = '<span class="profile-missing">Not recorded</span>';
const icon = name => `<i class="fa-solid ${name}" aria-hidden="true"></i>`;
const value = entry => entry === null ? blank : escape(entry);
const field = ([label, entry, kind]) => `<div class="profile-field"><dt>${escape(label)}</dt><dd${kind === 'number' ? ' class="profile-number"' : ''}>${kind === 'html' ? entry : value(entry)}</dd></div>`;
const fields = (entries, paired = false) => `<dl class="profile-fields${paired ? ' profile-fields-paired' : ''}">${entries.map(field).join('\n')}</dl>`;
const group = (title, body) => `<div class="profile-group"><h3 class="profile-group-title">${escape(title)}</h3>${body}</div>`;
const panel = body => `<div class="profile-panel">${body}</div>`;
const heading = (id, title, glyph, count) => `<div class="profile-section-heading"><span class="profile-section-icon">${icon(glyph)}</span><h2 id="${id}-heading">${escape(title)}</h2>${count !== undefined ? `<span class="profile-count">${count}</span>` : ''}</div>`;
const section = (id, title, glyph, body, count) => `<section class="me-bento-section profile-section" id="${id}" aria-labelledby="${id}-heading">${heading(id, title, glyph, count)}${panel(body)}</section>`;
const record = body => `<article class="profile-history-record">${body}</article>`;
const recordText = (title, detail) => `<div class="profile-record-copy"><h3 class="profile-record-title">${escape(title)}</h3><p class="profile-record-meta">${escape(detail)}</p></div>`;
const status = (text, tone = '') => `<span class="profile-status${tone ? ` profile-status-${tone}` : ''}">${escape(text)}</span>`;

const work = group('Organization', fields([
  ['Company', 'PEOPLE QUEST SDN BHD'], ['Branch', 'TIMES SQUARE BRANCH'],
  ['Department', 'PRODUCT & DESIGN'], ['Position', 'SENIOR PRODUCT DESIGNER']
])) + group('Employment', fields([
  ['Grade', 'G3-EXECUTIVE'], ['Benefit scheme', 'MANAGER(LEVEL 1 & 2,M)'],
  ['Hire date', '12 Aug 2006'], ['Confirm date', '12 Nov 2006'],
  ['Years of service', '20.17 years'], ['Years in position', '9 years'],
  ['Shift group', 'GROUP A'], ['Resign date', null], ['Reason', null]
])) + group('Reporting', fields([
  ['Reporting to', '<span>Muhammad ali bin man</span><span class="profile-supervisor-id"><span class="profile-supervisor-label">Supervisor</span><span class="employee-id-standard">#EBB04</span></span>', 'html']
])) + group('Contract and permits', fields([
  ['Contract #', null], ['Contract start', null], ['Contract expiry', null],
  ['Work permit #', null], ['Work permit start', '1 Jan 2000'], ['Work permit expiry', '31 Dec 2012']
], true));

const personal = group('Personal details', fields([
  ['Name', 'Sarah Jenkins'], ['NRIC #', '600422015668', 'number'],
  ['Birth date', '22 Apr 1960'], ['Age', '66.50'], ['Gender', 'Female'],
  ['Personal email', '<a href="mailto:ebb12@gmail.com">ebb12@gmail.com</a>', 'html']
])) + group('Family status', fields([
  ['Marital status', 'Married'], ['Marriage date', '18 Jul 1984']
])) + group('Identity documents', fields([
  ['Passport #', 'A212222048'], ['Passport expiry', '25 Mar 2015'],
  ['Driving license', 'AX000234496'], ['Driving license expiry', '12 Aug 2021'],
  ['Key level', 'Key Level 2']
]));
const family = [
  { name: 'ABU KARUDDIN', relation: 'Husband', date: '17 Aug 1950', initial: 'A' },
  { name: 'a', relation: 'Daughter', date: '1 Apr 2022', initial: 'a' }
].map(member => record(`<span class="profile-person-initial" aria-hidden="true">${member.initial}</span>${recordText(member.name, `Birth date · ${member.date}`)}${status(member.relation)}`)).join('\n');

const contact = group('Contact methods', fields([
  ['Company email', '<a href="mailto:yewweijiang123@gmail.com">yewweijiang123@gmail.com</a>', 'html'],
  ['Phone #', '<a href="tel:0123456789">0123456789</a>', 'html'],
  ['Mobile #', '<a href="tel:0123456789">0123456789</a>', 'html']
])) + group('Correspondence address', '<address class="profile-address">10, JALAN UPTOWN 2<br>#05-33 JALAN 2228<br>DAMANSARA KOTA</address>' + fields([
  ['Postal code', '40862'], ['City', 'Damansara'], ['State', 'SELANGOR'], ['Country', 'MALAYSIA']
], true)) + group('Emergency contact', fields([
  ['Contact name', 'RAZALI'], ['Emergency contact #', '<a href="tel:046677778">04-6677778</a>', 'html'],
  ['Contact address', 'AS CORRESPONDENCE ADDRESS']
]) + fields([
  ['Postal code', '01920'], ['City', 'Puchong'], ['State', null], ['Country', 'MALAYSIA']
], true) + fields([['Remarks', 'FATHER']]));

const education = fields([
  ['Qualification', 'DEGREE'], ['Description', 'a'], ['Major', 'ACCOUNTING'],
  ['Institute', '- Others -'], ['Other institute name', null], ['CGPA', '0.00'],
  ['Certificate #', '3.8'], ['Year from', '2000'], ['Year to', '2002'],
  ['Highest', 'No'], ['Notes', 'a']
]);

const payroll = group('Salary account', fields([
  ['Bank', 'CIMB'],
  ['Account #', '<div class="profile-account"><span class="profile-number" id="cimbNumDisplay" data-masked="true">•••• •••• 5254</span><button type="button" class="profile-account-toggle" onclick="toggleCimbMask()" aria-pressed="false" aria-label="Reveal bank account number"><i class="fa-solid fa-eye" aria-hidden="true"></i><span>Reveal</span></button></div>', 'html']
])) + group('Statutory accounts', fields([
  ['EPF #', '636363636', 'number'], ['Socso #', '733773373', 'number'],
  ['Tax #', '377337373', 'number'], ['Tabung Haji #', '737585858', 'number'],
  ['ASB #', '747575757', 'number'], ['Spouse EPF #', '757686687', 'number'],
  ['Spouse Tax #', '988588585', 'number']
])) + group('Tax declarations', fields([
  ['Handicap?', 'No'], ['Spouse handicap?', 'Yes'], ['Spouse working?', 'No']
]));

const career = [
  ['1 Jan 2017', 'INCREMENT', 'GROUP HR MANAGER'],
  ['1 May 2012', 'PROMOTION', 'HR MANAGER'],
  ['2 Jan 2008', 'INCREMENT', 'HR MANAGER'],
  ['12 Nov 2006', 'CONFIRMATION', 'HR MANAGER'],
  ['12 Aug 2006', 'HIRED', 'BARISTA']
].map(([date, movement, position]) => record(`<span class="profile-timeline-point" aria-hidden="true"></span><div class="profile-record-copy"><p class="profile-record-meta">${date}</p><h3 class="profile-record-title">${position}</h3><span class="profile-movement">${movement}</span></div>`)).join('\n');

const performance = [
  ['FY 2026 (TSH)', 'GROUP HR MANAGER', 'A+', 77],
  ['FY 2026A', 'HR MANAGER', 'D', 67],
  ['FY 2026A', 'HR MANAGER', 'D', 0],
  ['FY 2026A', 'HR MANAGER', 'D', 37],
  ['FY 2026A', 'HR MANAGER', 'D', 37],
  ['FY 2026A', 'HR MANAGER', 'D', 31]
].map(([period, position, grade, score]) => record(`${recordText(period, position)}<div class="profile-performance-score"><span class="profile-grade${grade === 'A+' ? ' profile-grade-positive' : ''}">${grade}</span><span class="profile-record-meta">Score ${score}</span></div>`)).join('\n');

const competencies = [
  ['EFFECTIVE', 2, '25/06/2024', true], ['TUNNEL ENGINNERING', 5, '30/05/2024', true],
  ['LEADERSHIP', 3, '12/09/2027', false], ['LEARNING CAPABILITY', 4, '31/12/2029', false],
  ['CHANGE MANAGEMENT', 1, '18/09/2031', false], ['TEAMWORK', 5, '15/12/2035', false]
].map(([name, level, expiry, expired]) => record(`<div class="profile-record-copy"><h3 class="profile-record-title">${name}</h3><p class="profile-record-meta${expired ? ' profile-expired' : ''}">${expired ? 'Expired' : 'Expiry'} · ${expiry}</p></div>${status(`Level ${level}`)}`)).join('\n');

const training = '<label class="profile-search" for="dossierTrainingSearch"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i><span class="profile-sr-only">Search training courses</span><input type="search" id="dossierTrainingSearch" placeholder="Search courses or dates" oninput="filterDossierTraining(this.value)"></label><div class="profile-record-scroll" id="dossierTrainingList" role="region" aria-label="Training records" tabindex="0"></div>';

const assets = [
  ['AVANSER WAR32626', '1 Jan 2019', '96,000.00', 'fa-car'],
  ['SAMSUNG CX', '27 May 2017', '2,000.00', 'fa-mobile-screen-button'],
  ['MSI 17" LAPTOP', '27 Jul 2015', '5,000.00', 'fa-laptop'],
  ['LOCKER 003', '1 Jan 2013', '300.00', 'fa-key']
].map(([name, date, price, glyph]) => record(`<span class="profile-asset-icon">${icon(glyph)}</span>${recordText(name, `Assigned · ${date}`)}<div class="profile-asset-value"><span class="profile-record-meta">RM</span><strong>${price}</strong></div>`)).join('\n');

const letters = '<div class="profile-record-scroll" id="dossierLettersList" role="region" aria-label="HR letter records" tabindex="0"></div>';
const disciplinary = '<div class="profile-empty-schema" aria-label="Disciplinary record fields"><span>Date</span><span>Offence</span><span>Action</span></div><div class="profile-empty-state"><span class="profile-empty-icon">' + icon('fa-shield-halved') + '</span><h3>No disciplinary records</h3><p>There are no entries in this history.</p></div>';

const sections = [
  section('bento-work', 'Work information', 'fa-building', work),
  section('bento-personal', 'Personal & family', 'fa-user', personal).replace('</section>', `<div class="profile-subsection-heading"><h3>Family</h3><span class="profile-count">2</span></div>${panel(family)}</section>`),
  section('bento-contact', 'Contact & address', 'fa-address-book', contact),
  section('bento-education', 'Qualification', 'fa-graduation-cap', education),
  section('bento-finance', 'Payroll & tax', 'fa-wallet', payroll),
  section('bento-career', 'Career progression', 'fa-arrow-trend-up', `<div class="profile-timeline">${career}</div>`, 5),
  section('bento-performance', 'Performance history', 'fa-chart-column', performance, 6),
  section('bento-competency', 'Competencies', 'fa-list-check', competencies, 6),
  section('bento-training', 'Training history', 'fa-book-open', training, '<span id="dossierTrainingCount">33</span>'),
  section('bento-assets', 'Asset assignment', 'fa-laptop', `<div class="profile-asset-total"><span>Total assigned value</span><strong>RM 103,300.00</strong></div>${assets}`, 4),
  section('bento-letters', 'HR letters', 'fa-file-lines', letters, 31),
  section('bento-compliance', 'Disciplinary history', 'fa-shield-halved', disciplinary, 0),
  '<div class="profile-verification"><span class="profile-verification-icon">' + icon('fa-circle-check') + '</span><div><span>CV last verified</span><strong>29 Jan 2024</strong></div></div>'
];

const start = html.indexOf('    <!-- Scrollable Main Content -->');
const end = html.indexOf('    <!-- Floating Scroll-To-Top Button -->');
if (start < 0 || end < start) throw new Error('Profile content boundaries not found');
html = html.slice(0, start) + `    <!-- Scrollable Main Content -->\n    <main class="main-content profile-details" id="meMainScroll" style="padding-bottom: 90px;">\n${sections.join('\n\n')}\n    </main>\n\n` + html.slice(end);
if (!html.includes('css/me-profile-details.css')) html = html.replace('  <link rel="stylesheet" href="css/me-profile-header.css">', '  <link rel="stylesheet" href="css/me-profile-header.css">\n  <link rel="stylesheet" href="css/me-profile-details.css">');

const coursesMatch = html.match(/const ALL_TRAINING_COURSES = (\[[^]*?\n    \]);/);
const courses = vm.runInNewContext(coursesMatch[1]);
for (const course of courses) if (course.name === 'PROCESS IMPROVEMENT' && ['1 Aug 2019', '1 Aug 2018'].includes(course.date)) course.days = '3.00';
const coursesSource = JSON.stringify(courses, null, 6).replace(/^/gm, '    ').trimStart();
html = html.replace(coursesMatch[0], 'const ALL_TRAINING_COURSES = ' + coursesSource + ';');

const lettersMatch = html.match(/const ALL_HR_LETTERS = (\[[^]*?\n    \]);/);
const docs = vm.runInNewContext(lettersMatch[1]);
for (let index = 21; index < docs.length; index++) {
  docs[index].type = index === 21 || index === 30 ? 'Bonus Letter' : index === 29 ? 'EA 2025' : 'Letter of Guarantee';
  docs[index].date = '';
  docs[index].signed = null;
}
for (const doc of docs) if (doc.date === '—') doc.date = '';
const docsSource = JSON.stringify(docs, null, 6).replace(/^/gm, '    ').trimStart();
html = html.replace(lettersMatch[0], 'const ALL_HR_LETTERS = ' + docsSource + ';');

const renderStart = html.indexOf('    // Render Training List');
const renderEnd = html.indexOf('    // Scroll to Bento Section', renderStart);
html = html.slice(0, renderStart) + `    // Reference records use the same flat list styling as the profile details.
    function escapeProfileText(value) {
      return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
    }

    function renderTrainingList(list) {
      const container = document.getElementById('dossierTrainingList');
      if (!container) return;
      if (!list.length) {
        container.innerHTML = '<div class="profile-search-empty" role="status">No training records match your search.</div>';
        return;
      }
      container.innerHTML = list.map(course => {
        const tone = course.color === 'red' ? 'negative' : course.color === 'orange' ? 'warning' : 'positive';
        return '<article class="profile-history-record"><div class="profile-record-copy"><h3 class="profile-record-title">' + escapeProfileText(course.name) + '</h3><p class="profile-record-meta">' + escapeProfileText(course.date) + '</p></div><span class="profile-training-days profile-text-' + tone + '">' + escapeProfileText(course.days) + '<small>days</small></span></article>';
      }).join('');
    }

    function filterDossierTraining(query) {
      const text = query.trim().toLowerCase();
      const list = ALL_TRAINING_COURSES.filter(course => course.name.toLowerCase().includes(text) || course.date.toLowerCase().includes(text));
      renderTrainingList(list);
      document.getElementById('dossierTrainingCount').textContent = text ? list.length + ' / ' + ALL_TRAINING_COURSES.length : ALL_TRAINING_COURSES.length;
    }

    function renderLettersList() {
      const container = document.getElementById('dossierLettersList');
      if (!container) return;
      container.innerHTML = ALL_HR_LETTERS.map(doc => {
        const signed = doc.signed === true;
        const date = doc.date ? 'Issued · ' + escapeProfileText(doc.date) : 'Issue date not recorded';
        return '<article class="profile-history-record"><div class="profile-record-copy"><h3 class="profile-record-title">' + escapeProfileText(doc.type) + '</h3><p class="profile-record-meta">' + date + '</p></div><span class="profile-letter-status' + (signed ? ' profile-text-positive' : '') + '">' + (signed ? '<i class="fa-solid fa-check" aria-hidden="true"></i> Signed' : 'Signature not recorded') + '</span></article>';
      }).join('');
    }

` + html.slice(renderEnd);

html = html.replace("      const isMasked = el.getAttribute('data-masked') === 'true';\n      if (isMasked) {\n        el.innerText = '1044 7856 8552 54';", "      const isMasked = el.getAttribute('data-masked') === 'true';\n      const button = document.querySelector('.profile-account-toggle');\n      if (button) {\n        button.setAttribute('aria-pressed', String(isMasked));\n        button.setAttribute('aria-label', isMasked ? 'Hide bank account number' : 'Reveal bank account number');\n        button.innerHTML = '<i class=\"fa-solid ' + (isMasked ? 'fa-eye-slash' : 'fa-eye') + '\" aria-hidden=\"true\"></i><span>' + (isMasked ? 'Hide' : 'Reveal') + '</span>';\n      }\n      if (isMasked) {\n        el.innerText = '1044 7856 8552 54';");

fs.writeFileSync(file, html);
console.log('Rebuilt all 12 profile categories and CV verification; preserved header, navigation and reference records.');
