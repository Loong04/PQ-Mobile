/**
 * Complete, repeatable source inventory. No dependencies or source mutations.
 * Run: node tooling/migration/inventory.mjs [mobile-source-root]
 * HTML tag extraction is intentionally conservative: it includes form markup
 * inside JavaScript templates as well as DOM-created controls in linked scripts.
 */
import fs from 'node:fs';
import path from 'node:path';
import { PROJECT_ROOT } from '../shared/paths.mjs';

const projectRoot = PROJECT_ROOT;
const snapshotRoot = path.join(projectRoot, 'source-snapshot');
const sourceRoot = path.resolve(process.argv[2] || (fs.existsSync(snapshotRoot) ? snapshotRoot : 'C:/Users/loong/PQ-Mobile'));
const ignored = new Set(['node_modules', 'scratch', 'no', '.agents', '.codex', '.git', '.claude', '.gemini', '.pnpm-store']);
const slash = value => value.replaceAll('\\', '/');
const relative = file => slash(path.relative(sourceRoot, file));
const read = file => fs.readFileSync(file, 'utf8');
function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (ignored.has(entry.name)) return [];
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}
function decode(value = '') {
  return value.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)));
}
function plain(value = '') { return decode(value.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim(); }
function attrs(tag) {
  const result = {};
  const expression = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  for (const match of tag.matchAll(expression)) result[match[1].toLowerCase()] = decode(match[2] ?? match[3] ?? match[4] ?? '');
  for (const name of ['required', 'disabled', 'readonly', 'multiple', 'checked', 'selected']) {
    if (new RegExp(`\\s${name}(?:\\s|=|/?>)`, 'i').test(tag)) result[name] = true;
  }
  return result;
}
const lineAt = (text, index) => text.slice(0, index).split('\n').length;
function extractFields(text, source) {
  const result = [];
  const labels = [...text.matchAll(/<label\b([^>]*)>([\s\S]*?)<\/label>/gi)]
    .map(match => ({ id: attrs(match[1]).for, text: plain(match[2]), index: match.index }));
  for (const match of text.matchAll(/<(input|select|textarea)\b[^>]*>/gi)) {
    const tag = match[1].toLowerCase();
    const attributes = attrs(match[0]);
    let label = labels.find(item => item.id && item.id === attributes.id)?.text;
    if (!label) label = labels.filter(item => item.index < match.index && match.index - item.index < 600).at(-1)?.text;
    const field = {
      tag, type: attributes.type || (tag === 'input' ? 'text' : tag),
      id: attributes.id || '', name: attributes.name || '', label: label || attributes['aria-label'] || '',
      source, line: lineAt(text, match.index), attributes,
      dynamicTemplate: /\$\{/.test(match[0]) || text.slice(Math.max(0, match.index - 250), match.index).includes('innerHTML'),
    };
    if (tag === 'select') {
      const body = text.slice(match.index + match[0].length).split(/<\/select>/i)[0];
      field.options = [...body.matchAll(/<option\b([^>]*)>([\s\S]*?)<\/option>/gi)]
        .map(option => ({ ...attrs(option[1]), label: plain(option[2]) }));
    }
    if (tag === 'textarea') field.value = plain(text.slice(match.index + match[0].length).split(/<\/textarea>/i)[0]);
    result.push(field);
  }
  // Report fields created with document.createElement/node rather than HTML.
  for (const match of text.matchAll(/(?:const|let|var)\s+(\w+)\s*=\s*(?:document\.createElement|node)\(\s*['"](input|select|textarea)['"]/g)) {
    const identifier = match[1];
    const nearby = text.slice(match.index, match.index + 1800);
    const property = key => nearby.match(new RegExp(`\\b${identifier}\\.${key}\\s*=\\s*(['"])(.*?)\\1`))?.[2] || '';
    result.push({ tag: match[2], type: property('type') || match[2], id: property('id'), name: property('name'),
      label: '', source, line: lineAt(text, match.index), dynamicDom: true,
      attributes: { placeholder: property('placeholder') },
      definition: plain(nearby.slice(0, 250)), options: match[2] === 'select' ? [] : undefined });
  }
  return result;
}
function localReference(from, value) {
  if (!value || /^(?:[a-z]+:|\/\/|#)/i.test(value) || /\$\{|\+/.test(value)) return null;
  const clean = decode(value).split(/[?#]/)[0];
  if (!clean) return null;
  return slash(path.relative(sourceRoot, path.resolve(path.dirname(path.join(sourceRoot, from)), clean)));
}
function references(text, source) {
  const result = [];
  for (const match of text.matchAll(/\b(href|src)\s*=\s*(['"])(.*?)\2/gi)) {
    const target = localReference(source, match[3]);
    if (target) result.push({ kind: match[1].toLowerCase(), raw: match[3], target, line: lineAt(text, match.index) });
  }
  for (const match of text.matchAll(/(?:(?:window\.)?location(?:\.href)?\s*=|(?:window\.)?location\.(?:assign|replace)\(|window\.open\()\s*(['"])([^'"\n]+)\1/g)) {
    const target = localReference(source, match[2]);
    if (target) result.push({ kind: 'navigation', raw: match[2], target, line: lineAt(text, match.index) });
  }
  return result;
}
const moduleTitles = {
  attendance: ['Attendance & Shift Planning', '考勤与排班'], leave: ['Leave Management', '休假管理'],
  claims: ['Claims & Expenses', '报销与费用'], payroll: ['Payroll', '薪资管理'],
  'employee-career': ['Employee & Career', '员工与职业发展'], 'project-task': ['Projects & Tasks', '项目与任务'],
  admin: ['Workplace', '行政事务'], profile: ['Employee Profile', '员工档案'], home: ['Overview', '总览'],
  team: ['My Team', '我的团队'], calendar: ['My Calendar', '我的日历'], other: ['Workspace', '工作台'],
};
const zhTitles = {
  'app': '应用中心', 'appdark': '应用中心（深色）', 'applight': '应用中心（浅色）',
  'attendance': '考勤', 'leave': '休假申请', 'bonus-history': '奖金记录', 'calendar': '我的日历', 'change-request': '资料变更申请',
  'favourite': '我的收藏', 'homedark': '数据总览（深色）', 'homelight': '数据总览（浅色）',
  'light': '数据总览（浅色）', 'me': '员工档案', 'me-accordion': '员工档案（展开视图）',
  'medark': '员工档案（深色）', 'melight': '员工档案（浅色）', 'payslip': '工资单',
  'salary-history': '薪资记录', 'subordinates': '组织架构', 'team': '我的团队', 'team-v2': '我的团队（矩阵视图）',
  'work-behaviour': '工作表现与绩效分析', 'asset-highlight': '资产分析', 'book-resource': '资源预订',
  'guest-visit': '访客登记', 'history': '申请历史', 'inventory-request': '物品申请', 'letter-request': '证明函申请',
  'news-detail': '新闻详情', 'news': '公司新闻', 'pending-approval': '待审批', 'policy-document': '政策文件',
  'policy-sop': '政策与标准流程', 'attendance-highlight': '考勤分析', 'attendance-performance': '考勤表现',
  'clocking-history': '打卡记录', 'clocking-summary': '打卡汇总', 'clocking': '上班／下班打卡',
  'daily-manpower': '每日人力汇总', 'daily-ot-details': '每日加班审批详情', 'daily-ot': '每日加班',
  'feedback-history': '考勤建议审批', 'hours-costing': '工时成本', 'hours-summary': '工时汇总',
  'individual': '个人考勤', 'ot-plan': '加班计划', 'overtime-costing': '加班成本', 'overtime-highlight': '加班分析',
  'overtime': '加班申请', 'shift-plan': '排班计划', 'shift-roster': '班次表', 'shift-summary': '班次汇总',
  'staff-attendance': '员工考勤', 'staff-hours-summary': '员工工时汇总', 'work-hour-violation': '工时违规',
  'advance-claim': '预支申请', 'benefit-claim': '福利报销', 'benefit-highlight': '福利分析',
  'entertainment-claim': '招待费报销', 'expenses-claim': '费用报销', 'expenses-highlight': '费用分析',
  'medical-claim': '医疗报销', 'ot-claim': '加班补贴申请', 'staff-entitlement': '员工福利额度',
  'staff-summary': '员工报销汇总', 'submit-claim': '提交报销', 'summary': '报销汇总',
  'travel-claim': '差旅里程报销', 'travel-request': '差旅申请', 'feedback': '员工反馈', 'my-event': '我的活动',
  'onboard-activity': '入职活动', 'whereabout': '行踪登记', 'confirm-new-user-details': '新用户详情',
  'confirm-new-user': '确认新用户', 'confirm-staff': '员工转正', 'key-staff-nomination': '关键员工提名',
  'manpower-stats': '人力统计', 'staff-attrition': '员工流失分析', 'staff-engagement': '员工参与度',
  'staff-events': '员工活动', 'staff-exit': '员工离职', 'staff-feedback': '员工反馈', 'staff-list': '员工列表',
  'staff-onboard': '员工入职', 'staff-request': '人员申请', 'staff-retention': '员工留任',
  'staff-whereabout': '员工行踪', 'deduction-request': '扣款申请', 'ea-form': 'EA 税务表',
  'prior-pay-data': '前期薪资资料', 'tax-relief-request': '税务减免申请', 'tax-relief': '团队税务减免',
  'time-sheet': '工时填报', 'timesheet-highlight': '工时分析', 'work-assignment': '工作指派', 'work-plan': '工作计划',
};
const themeVariants = new Set(['appdark.html', 'applight.html', 'homedark.html', 'homelight.html', 'light.html', 'medark.html', 'melight.html']);
const designVariants = new Set(['me-accordion.html', 'team-v2.html']);
function moduleOf(file) {
  const segments = file.split('/');
  if (segments[0] === 'modules') return segments[1] === 'me' ? 'profile' : segments[1];
  if (/^(me(?:light|dark|-accordion)?|salary-history|bonus-history|payslip|change-request)\.html$/.test(file)) return 'profile';
  if (/^(team(?:-v2)?|subordinates)\.html$/.test(file)) return 'team';
  if (file === 'leave.html') return 'leave';
  if (file === 'attendance.html') return 'attendance';
  if (file === 'calendar.html') return 'calendar';
  if (/^(index|home(?:dark|light)|light|app(?:dark|light)?|favourite)\.html$/.test(file)) return 'home';
  return 'other';
}
function kindOf(file) {
  if (themeVariants.has(file)) return 'theme-variant';
  if (designVariants.has(file)) return 'design-variant';
  if (file.startsWith('modules/') && file.endsWith('/index.html')) return 'module';
  if (/pending-approval|daily-ot-details|feedback-history/.test(file)) return 'approval';
  if (/history/.test(file)) return 'history';
  if (/summary|highlight|costing|performance|stats|attrition|retention|engagement|violation|work-behaviour/.test(file)) return 'report';
  if (/request|claim\.html|shift-plan|ot-plan|overtime\.html|time-sheet|work-plan|work-assignment|feedback\.html|whereabout|confirm|nomination|book-resource|guest-visit|clocking\.html|^leave\.html/.test(file)) return 'form';
  if (/details?\.html|policy-document/.test(file)) return 'detail';
  if (/^me\.html|modules\/me\//.test(file)) return 'profile';
  return 'dashboard';
}

const files = walk(sourceRoot).map(relative).sort();
const fileSet = new Set(files);
const htmlFiles = files.filter(file => file.endsWith('.html'));
const sourceCache = new Map();
const source = file => {
  if (!sourceCache.has(file)) sourceCache.set(file, read(path.join(sourceRoot, file)));
  return sourceCache.get(file);
};
const inventory = htmlFiles.map(file => {
  const text = source(file);
  const sourceTitle = plain(text.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || path.basename(file, '.html'));
  const module = moduleOf(file);
  const basename = path.basename(file, '.html');
  const isModuleIndex = file.startsWith('modules/') && basename === 'index';
  const title = isModuleIndex ? moduleTitles[module][0] : file === 'index.html' ? 'Overview'
    : sourceTitle.replace(/^(?:PeopleHCM|Claims)\s*-\s*/i, '').replace(/\s*-\s*PeopleHCM$/i, '')
      .replace(/^EBB\d+\s+/, '').replace(/Employee Profile\s*\(.+\)$/, 'Employee Profile');
  const titleZh = isModuleIndex || file === 'index.html' ? moduleTitles[module][1]
    : basename === 'team' && file.startsWith('modules/attendance/') ? '团队考勤'
    : basename === 'team' && file.startsWith('modules/claims/') ? '团队报销管理'
    : zhTitles[basename] || title;
  const dependencies = references(text, file);
  const linkedScripts = dependencies.filter(item => item.kind === 'src' && item.target.endsWith('.js') && fileSet.has(item.target)).map(item => item.target);
  const fields = extractFields(text, file);
  const linkedScriptFields = [...new Set(linkedScripts)].flatMap(script => extractFields(source(script), script));
  const externalDependencies = [...text.matchAll(/\b(?:src|href)\s*=\s*(['"])(https?:\/\/[^'"\s]+)\1/gi)].map(match => decode(match[2]));
  const actionHandlers = [...text.matchAll(/\bon(?:click|submit|change|input)\s*=\s*(['"])(.*?)\1/gi)]
    .map(match => ({ handler: decode(match[2]), line: lineAt(text, match.index) }));
  const storageKeys = [...new Set([text, ...linkedScripts.map(source)].flatMap(script =>
    [...script.matchAll(/(?:localStorage|sessionStorage)\.(?:getItem|setItem|removeItem)\(\s*(['"])(.*?)\1/g)].map(match => match[2])))];
  return { path: file, title, titleZh, sourceTitle, module, kind: kindOf(file), fields, linkedScriptFields,
    navigation: dependencies.filter(item => /\.html$/.test(item.target)), linkedScripts: [...new Set(linkedScripts)],
    dependencies, externalDependencies: [...new Set(externalDependencies)], actionHandlers, storageKeys };
});
const pages = inventory.map(page => ({ path: page.path, title: page.title, titleZh: page.titleZh, module: page.module,
  kind: page.kind, fields: page.fields.length + page.linkedScriptFields.length }));
const missingReferences = inventory.flatMap(page => page.dependencies.filter(item => !fileSet.has(item.target))
  .map(item => ({ source: page.path, ...item }))).filter(item => !/\$\{|\}|\$|<|>|\\/.test(item.raw));
const sourceLimitations = files.filter(file => /\.(?:html|js)$/.test(file) && !file.endsWith('.min.js')).flatMap(file => {
  const text = source(file);
  return text.split('\n').flatMap((line, index) => /coming soon|not implemented|under development|until .*API|until .*connected|alert\([^)]*(?:submitted|draft saved|Generating .*export)/i.test(line)
    ? [{ source: file, line: index + 1, excerpt: line.trim().slice(0, 300) }] : []);
});
const summary = {
  sourceRoot: slash(sourceRoot), htmlPages: pages.length,
  canonicalPages: pages.filter(page => !['theme-variant', 'design-variant'].includes(page.kind)).length,
  themeVariants: pages.filter(page => page.kind === 'theme-variant').length,
  designVariants: pages.filter(page => page.kind === 'design-variant').length,
  inputOccurrences: inventory.reduce((count, page) => count + page.fields.length, 0),
  scriptControlOccurrences: inventory.reduce((count, page) => count + page.linkedScriptFields.length, 0),
  scriptFiles: files.filter(file => file.endsWith('.js')).length,
  moduleCounts: Object.fromEntries(Object.keys(moduleTitles).map(module => [module, pages.filter(page => page.module === module).length])),
  missingReferenceCount: missingReferences.length, sourceLimitationCount: sourceLimitations.length,
};
function save(relativeFile, value) {
  const target = path.join(projectRoot, relativeFile);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, typeof value === 'string' ? value : JSON.stringify(value, null, 2) + '\n', 'utf8');
}
save('src/app/generated/pages.json', pages);
save('docs/generated/page-inventory.json', { summary, extraction: {
  method: 'Static HTML and JavaScript template/DOM field extraction; source line references included. Runtime-generated option values remain in their preserved source scripts.',
  fields: 'Includes hidden fields, filters, repeated templates, modal forms, readonly fields, validation attributes, and static select options.',
  limitation: 'An occurrence count is not a count of distinct business fields. JavaScript conditionals and interpolation can produce additional runtime controls or options.',
}, missingReferences, sourceLimitations, pages: inventory });

const table = pages.map(page => `| \`${page.path}\` | ${page.title.replaceAll('|', '/')} | ${page.module} | ${page.kind} | ${page.fields} |`).join('\n');
const moduleTable = Object.entries(summary.moduleCounts).filter(([, count]) => count > 0)
  .map(([module, count]) => `| ${moduleTitles[module][0]} | ${count} |`).join('\n');
const limitationsTable = sourceLimitations.map(item => `| \`${item.source}:${item.line}\` | ${item.excerpt.replaceAll('|', '/').replaceAll('`', "'")} |`).join('\n');
const parityDoc = `# Mobile-to-web feature parity inventory

This inventory was generated directly from the original PeopleHCM project. Run \`node tooling/migration/inventory.mjs <mobile-source-root>\` to regenerate it. Detailed field labels, attributes, select options, handlers, local links and script dependencies are in \`docs/generated/page-inventory.json\`. The shell route registry is \`src/app/generated/pages.json\`.

## Coverage

- ${summary.htmlPages} source HTML pages remain addressable, comprising ${summary.canonicalPages} canonical pages, ${summary.themeVariants} theme variants and ${summary.designVariants} alternate designs.
- ${summary.inputOccurrences} form-control occurrences are present in source HTML (including JavaScript templates embedded in those files).
- ${summary.scriptControlOccurrences} linked-script control occurrences are associated with their pages. Shared scripts can contribute the same control to more than one route.
- ${summary.scriptFiles} JavaScript source files were inventoried. Every original business screen, its handlers, datasets and attachments are preserved in the workspace copy.
- No backend is implemented. Original local-storage, client-side validation, calculations, approvals, history and demo responses run with the same original scripts. A preserved alert-only source action is not a server transaction.

| Module | Source pages |
| --- | ---: |
${moduleTable}

## Business flows preserved in source

| Area | Included processes |
| --- | --- |
| Attendance & Shift Planning | Individual attendance; clock in/out; clocking history/summary; team attendance; shift planning and roster; shift/work/no-work summaries; OT planning, final OT and daily OT approvals; attendance advice; hours and overtime highlight/costing; manpower and work-hour violation reports; employee drill-downs. |
| Leave | Leave application, cancellation, time-off, medical details, attachments, entitlement and history; individual/team views; staff/calendar/summary drill-downs; multi-level pending approvals and approver comments. The main leave screen contains multiple views in one source document. |
| Claims & Expenses | Medical, entertainment, travel mileage, travel request, expenses, benefits, advance and OT claims; receipts, line items and attachment controls; draft/submit actions; team approvals; history, entitlement and summary; benefit and expense analysis. |
| Payroll | Payslip, salary/bonus history and EA form; deduction requests; prior pay data; tax relief requests, team relief, pending approvals and history. |
| Employee & Career | Personal whereabouts, feedback, onboarding and events; staff lists, confirmations/new users, nominations, staffing requests/onboarding/exits; feedback/events/whereabouts; manpower, attrition, retention and engagement analysis; request history. |
| Projects & Tasks | Work plan, assignment, timesheet, highlights, pending approvals and history; project/task/category selectors; durations, attachments and local persistence. |
| Workplace | Resource booking, guest visit, inventory and letter requests; policy/SOP/document screens; news/feedback; assets, approvals, history and calendar integration. |
| Shared | Overview, application launcher, favourites, employee dossier/profile, organisation/subordinates, team dashboards, calendar and work behaviour analytics. |

## Shared presentation and web architecture

The enterprise shell loads the copied source screens through one workspace route and applies the shared desktop/neumorphic adapter. It preserves original field IDs, event handlers, relative URLs, shared modules and data structures. Branding is configured with semantic CSS tokens and one theme setting; shell locale labels live in translation dictionaries. Source business data such as employee names, reference numbers and codes remains unchanged. Chinese route titles are included for every source page in the route registry.

Employee IDs must remain directly beneath employee names with a leading \`#\`. View Chart controls must use a pie-chart icon and visible \`View Chart\` text. Attendance approval titles are \`OT Plan Approval\`, \`Attendance Advice Approval\` and \`Final OT Approval\`. Attendance summary/detail cards follow the rounded history-card treatment without a redundant date badge.

## Source limitations retained and documented

These are existing mobile-source behaviours, not guarantees of backend functionality. The inventory records alert-only submission/export actions and explicit API/coming-soon notes so frontend parity is not confused with a completed server integration.

| Source | Existing behaviour or note |
| --- | --- |
${limitationsTable || '| — | No matching source limitation markers found. |'}

The machine-readable report also records ${missingReferences.length} references that do not resolve to inventoried source files. Some are JavaScript-generated paths; these require runtime review rather than automatic deletion or invented screens.

## Complete route list

| Original route | Title | Module | Kind | Control occurrences |
| --- | --- | --- | --- | ---: |
${table}

## Manual parity checklist

For each form route, exercise all section tabs and expandable rows, required-field errors, date/time/number constraints, select options, add/remove line items, attachments, draft/submit behaviour and return navigation. For approvals, exercise View Details, attachments, comments, approval/rejection and result/history refresh. For summaries/reports, exercise all date filters, employee drill-downs, charts, export actions and empty states. Compare data, calculated totals and status labels to the original source screen. Frontend-only demo responses must be described accurately.

Static source extraction identifies existing controls but does not prove runtime behaviour. Browser verification and parity checks complement this inventory.
`;
save('docs/reports/feature-parity.md', parityDoc);
console.log(JSON.stringify(summary, null, 2));
if (missingReferences.length) console.log('Missing references (first 15):', JSON.stringify(missingReferences.slice(0, 15), null, 2));
