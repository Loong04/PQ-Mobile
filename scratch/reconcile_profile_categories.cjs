const fs = require('node:fs');
const assert = require('node:assert/strict');
let html = fs.readFileSync('me.html', 'utf8');
fs.writeFileSync('scratch/profile-audit-before.html', html);
function divAt(source, start) {
  const tags=/<div\b[^>]*>|<\/div>/g;
  tags.lastIndex=start;
  let depth=0;
  for(let tag;(tag=tags.exec(source));) {
    depth+=tag[0].startsWith('</')?-1:1;
    if(!depth)return {end:tags.lastIndex,text:source.slice(start,tags.lastIndex)};
  }
  throw new Error('Unclosed div');
}
html=html.replace('<div class="me-pass-title">Senior Product Designer</div>','<div class="me-pass-title">Group HR Manager</div>')
  .replace('<dd>Product &amp; Design</dd>','<dd>Human Resource</dd>')
  .replace('<dd>Senior Product Designer</dd>','<dd>Group HR Manager</dd>')
  .replace('Role: SENIOR PRODUCT DESIGNER (Grade G3-EXEC)','Role: GROUP HR MANAGER (Grade G3-EXEC)');
const personalStart=html.indexOf('<section class="me-bento-section profile-section" id="bento-personal"');
const familyStart=html.indexOf('<div class="profile-panel">',personalStart);
const family=divAt(html,familyStart);
assert.ok(family.text.includes('<h3>Family</h3>'));
let familyPanel=family.text.replace(/<div class="profile-subsection-heading">[^]*?<\/div>/,
  '<div class="profile-section-heading"><span class="profile-section-icon"><i class="fa-solid fa-people-roof" aria-hidden="true"></i></span><h2 id="bento-family-heading">Family</h2><span class="profile-count">2</span></div>');
html=html.slice(0,familyStart)+html.slice(family.end);
const personalEnd=html.indexOf('</section>',personalStart)+'</section>'.length;
html=html.slice(0,personalEnd)+'\n      <section class="me-bento-section profile-section" id="bento-family" aria-labelledby="bento-family-heading">\n        '+familyPanel+'\n      </section>'+html.slice(personalEnd);
html=html.replace('id="bento-personal-heading">Personal &amp; family','id="bento-personal-heading">Personal information');
const barStart=html.indexOf('<div class="me-jump-bar" id="meJumpBar"');
const bar=divAt(html,barStart);
html=html.slice(0,barStart)+'<div class="me-jump-bar" id="meJumpBar" role="tablist" aria-label="Profile categories" onscroll="handleJumpBarScroll(this)"></div>'+html.slice(bar.end);
const sheetStart=html.indexOf('<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">',html.indexOf('id="meCatSheet"'));
const sheet=divAt(html,sheetStart);
html=html.slice(0,sheetStart)+'<div class="me-category-grid" id="meCategoryGrid"></div>'+html.slice(sheet.end);
const categories=[
  ['work','Work','fa-building',false],['personal','Personal','fa-user',false],['education','Qualification','fa-graduation-cap',false],
  ['family','Family','fa-people-roof',true],['contact','Contact','fa-address-book',false],['finance','Payroll & Tax','fa-wallet',false],
  ['career','Career','fa-arrow-trend-up',true],['competency','Competencies','fa-list-check',true],['performance','Performance','fa-chart-column',true],
  ['training','Training','fa-book-open',true],['compliance','Disciplinary','fa-shield-halved',true],['assets','Assets','fa-laptop',true],['letters','HR Letters','fa-file-lines',true]
];
const config='    // One category definition supplies both the tabs and the category sheet.\n    const PROFILE_CATEGORIES = [\n'+categories.map(([id,label,icon,count])=>'      '+JSON.stringify({id:'bento-'+id,label,icon,count})).join(',\n')+'\n    ];\n\n';
html=html.replace('    // All 33 Training Courses exactly matching user specifications',config+'    // All 33 Training Courses exactly matching user specifications');
const functions=`    function renderProfileCategories() {
      const labels = PROFILE_CATEGORIES.map(category => {
        const count = document.querySelectorAll('#' + category.id + ' .profile-history-record').length;
        return { ...category, text: category.label + (category.count ? ' (' + count + ')' : '') };
      });
      document.getElementById('meJumpBar').innerHTML = labels.map(category =>
        '<button type="button" class="me-jump-pill" id="profile-tab-' + category.id + '" role="tab" aria-controls="' + category.id + '" aria-selected="false" tabindex="-1" onclick="scrollToBento(\'' + category.id + '\', this)" onkeydown="handleProfileTabKey(event)">' + escapeProfileText(category.text) + '</button>'
      ).join('');
      document.getElementById('meCategoryGrid').innerHTML = labels.map(category =>
        '<button type="button" class="me-category-option" data-category="' + category.id + '" onclick="selectCategoryFromSheet(\'' + category.id + '\')"><i class="fa-solid ' + category.icon + ' me-category-icon" aria-hidden="true"></i><span class="me-category-label">' + escapeProfileText(category.text) + '</span></button>'
      ).join('');
      labels.forEach(category => {
        const section = document.getElementById(category.id);
        section.setAttribute('role', 'tabpanel');
        section.setAttribute('aria-labelledby', 'profile-tab-' + category.id);
      });
    }

    // Filter the page to the chosen category; all records remain in the document.
    function scrollToBento(bentoId, btn, instant = false) {
      const target = document.getElementById(bentoId);
      const scrollContainer = document.getElementById('meMainScroll');
      if (!target || !scrollContainer || !target.classList.contains('profile-section')) return;
      const changed = target.hidden;
      scrollContainer.querySelectorAll(':scope > .profile-section').forEach(section => {
        section.hidden = section !== target;
      });
      if (bentoId === 'bento-training' && changed) {
        document.getElementById('dossierTrainingSearch').value = '';
        filterDossierTraining('');
      }
      let activeButton;
      document.querySelectorAll('.me-jump-pill').forEach(button => {
        const active = button.getAttribute('aria-controls') === bentoId;
        button.classList.toggle('active', active);
        button.setAttribute('aria-selected', String(active));
        button.tabIndex = active ? 0 : -1;
        if (active) activeButton = button;
      });
      document.querySelectorAll('#meCategoryGrid [data-category]').forEach(button => {
        button.classList.toggle('is-active', button.dataset.category === bentoId);
      });
      scrollContainer.scrollTo({ top: 0, behavior: 'instant' });
      activeButton?.scrollIntoView({ behavior: instant ? 'instant' : 'smooth', inline: 'center', block: 'nearest' });
    }

    function handleProfileTabKey(event) {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      const buttons = [...document.querySelectorAll('.me-jump-pill')];
      const index = buttons.indexOf(event.currentTarget);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 :
        (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
      event.preventDefault();
      buttons[next].click();
      buttons[next].focus({ preventScroll: true });
    }

    function scrollToTop() {
      scrollToBento('bento-work', null, true);
    }

`;
// Quote the generated onclick attributes safely within JavaScript string literals.
const correctedFunctions=functions.replaceAll("onclick=\"scrollToBento('" , "onclick=\"scrollToBento(\\'")
  .replaceAll("onclick=\"selectCategoryFromSheet('", "onclick=\"selectCategoryFromSheet(\\'");
const jsStart=html.indexOf('    // Scroll to Bento Section');
const jsEnd=html.indexOf('    // Category Sheet Modal',jsStart);
assert.ok(jsStart>0 && jsEnd>jsStart);
html=html.slice(0,jsStart)+functions+html.slice(jsEnd);
const initStart=html.indexOf('    // Initialize lists');
const initEnd=html.indexOf('  </script>',initStart);
const init=`    function initProfile() {
      renderTrainingList(ALL_TRAINING_COURSES);
      renderLettersList();
      renderProfileCategories();
      const requested = new URLSearchParams(window.location.search).get('scroll');
      const initial = PROFILE_CATEGORIES.some(category => category.id === requested) ? requested : 'bento-work';
      scrollToBento(initial, null, true);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initProfile, { once: true });
    else initProfile();
`;
html=html.slice(0,initStart)+init+html.slice(initEnd);
fs.writeFileSync('me.html',html);
console.log('Reconciled photo role, separate Family category, 13 shared category labels, filtering and initialization.');
