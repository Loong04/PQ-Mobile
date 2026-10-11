const fs=require('node:fs/promises');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const evidence=path.join(__dirname,'system-design-audit-20261011');
const reports=path.join(root,'docs','audits');
const prefix='2026-10-11-system-design';
const F=[];
const add=(id,category,priority,title,files,reference,difference,action,sources,cases)=>F.push({id,category,priority,title,files,reference,difference,action,sources,cases});
const claimForms=['advance-claim','travel-claim','travel-request','entertainment-claim','expenses-claim','ot-claim','medical-claim'].map(x=>'modules/claims/options/'+x+'.html');
const projectForms=['work-plan','work-assignment','time-sheet'].map(x=>'modules/project-task/options/'+x+'.html');
const careerForms=['feedback','whereabout'].map(x=>'modules/employee-career/options/individual/'+x+'.html');
add('G01','共用页面框架','P1','手机画面与外部预览控件不一致',['leave.html','modules/attendance/index.html','modules/claims/index.html','modules/payroll/index.html','modules/project-task/index.html',...projectForms,'modules/employee-career/index.html','modules/admin/index.html'],
  'Leave 在 500px 以下隐藏 preview-top-bar，手机内容占满 viewport，外框圆角归零。',
  '360px 下 Leave 为 360×844、起点 (0,0)；Work Plan 为 336×754、起点 (12,71)；Career 为 360×793、起点 (0,51)。其他页面仍显示页面外的 Dark Mode / Light Mode 预览开关和手机框，实际可用高度不同。',
  '将 Leave 的 mobile breakpoint、外部预览控件显示规则、容器高度和页面留白收进共用框架。桌面预览可以继续保留手机框。',
  [['leave.html','@media (max-width: 500px)'],['css/app.css','preview-top-bar {'],['css/project-task-forms.css','.project-form-page .project-task-content']], [3,71,81]);
add('F01','Form','P2','Leave 自身仍有两套表单标题',['leave.html'],
  'Apply Leave 主表单：section title 20px / 800，container 24px radius、20px padding。',
  'Credit Leave 与 Time Off 用 form-section-heading--new，标题为 13px uppercase；因此不能将 leave.html 中所有表单都当成同一个已统一的样板。',
  '以 Apply Leave 主表单作为默认 form；Credit Leave、Time Off 的 section title 和信息层级跟它统一。',
  [['leave.html','Leave Details (2026)'],['leave.html','Credit Leave Details'],['leave.html','Time Off Details'],['css/form-section-headings.css','.form-section-heading--new']], [3,5,6]);
add('F02','Form','P2','多种 Claim Form 沿用另一套容器与输入框',claimForms,
  'Apply Leave：24px container、20px section title、14px control radius，普通控制项使用较重的 700 字重。',
  'Advance、Travel、Travel Request、Entertainment、Expense、Medical 等采用 22px form-card 与 12px form-ctrl，控制项普遍 600 字重；OT Details 标题为 15px。相同层级的表单明显比 Apply Leave 小一档。',
  '统一 form container、section heading、field label、control 的视觉规格；多步骤流程与费用业务字段继续保留。',
  [['modules/claims/options/advance-claim.html','.form-card {'],['modules/claims/options/advance-claim.html','.form-ctrl {'],['modules/claims/options/ot-claim.html','OT Details']], [3,67,68,131]);
add('F03','Form','P2','Payroll Request Form 标题与控件偏小',['modules/payroll/options/tax-relief-request.html','modules/payroll/options/deduction-request.html'],
  'Apply Leave 主表单的 section title 20px、control radius 14px。',
  'Payroll 容器已是 24px，但 section title 为 16px；输入框仍是 12px radius、13px 字号、600 字重，padding 11px 13px。',
  '保留现有业务布局，统一 section title 和 control 到 Apply Leave 的规格。',
  [['css/payroll-request-forms.css','.payroll-form-phone .claim-section-title'],['css/payroll-request-forms.css','.payroll-form-phone .claim-control'],['css/claim-forms.css','.claim-control {']], [3,70]);
add('F04','Form','P2','Project Form 的移动端密度与 Leave 差距较大',projectForms,
  'Apply Leave：20px title、14px control radius、13.5px select、12px 14px padding。',
  'Work Plan、Work Assignment、Time Sheet 使用 13px uppercase section title、22px card、12px controls；360px 实测控制项为 12.5px、padding 12px 10px、600 字重。',
  '统一标题层级和控制项；将窄屏的缩小规则改成仅处理必要的多列内容。',
  [['css/project-task-forms.css','.project-form-page .section-title-text'],['css/project-task-forms.css','.project-form-page .form-ctrl'],['css/project-task-forms.css','font-size: 12.5px']], [3,71]);
add('F05','Form','P2','Career Individual 与 Team Form 规格分裂',careerForms,
  'Apply Leave 主表单；Career 的 Confirm Staff 等 Team Form 已使用 24px card、20px title、14px control。',
  'Feedback、Whereabout 使用 22px card、13px uppercase title、12px control radius 和 600 字重。一个模块内 Individual / Team 的视觉层级不同。',
  'Individual 复用已接近 Apply Leave 的 Team Form 规格；保留不同的业务字段。',
  [['modules/employee-career/css/employee-career-forms.css','.employee-career-form-page .employee-career-form-card'],['modules/employee-career/css/employee-career-forms.css','.employee-career-form-heading h2'],['modules/employee-career/css/employee-career-forms.css','.employee-career-team-form-page .employee-career-form-card']], [3,72,73]);
add('F06','Form','P2','Guest Visit 与同模块其他 Form 规格不同',['modules/admin/options/guest-visit.html'],
  'Apply Leave、Inventory Request、Letter Request：24px container、20px section title、14px controls。',
  'Guest Visit 的 container 为 22px、Visit Details 为 18px、control radius 为 13px。',
  '统一 form 外观；保留 Guest Information、Internal Attendee 等多步骤结构。',
  [['modules/admin/css/guest-visit.css','.guest-visit-page .claim-form-card'],['modules/admin/css/guest-visit.css','.guest-visit-page .form-section-heading'],['modules/admin/css/letter-request.css','.claim-form-card']], [3,74,75]);
add('F07','Form','P3','附件行仍有独立规格',projectForms,
  'Leave 已使用共用 form-attachment-item：9px 10px padding、30px file icon、11.5px filename。',
  'Project 的 attachment-upload-item 使用 8px 10px padding、28px icon，保留独立附件样式。此项由源码确认，未逐个上传文件来检查所有上传后状态。',
  '复用同一套附件行 token 或组件，统一 icon 尺寸和行高。',
  [['css/app.css','.form-attachment-item {'],['css/app.css','.form-attachment-file-icon {'],['css/project-task-forms.css','.project-form-page .attachment-upload-item'],['css/project-task-forms.css','.project-form-page .attachment-upload-icon']], []);
add('S01','Dashboard Status Card','P2','Career 和 Workplace 的状态卡尺寸不同',['modules/employee-career/index.html','modules/admin/index.html'],
  'Leave：height 80px；数字 18px / 900；状态 11px；说明 9.5px / 600；radius 16px。',
  'Career / Workplace 为 76px；数字 18px / 800；状态 10.5px；说明 9px / 700；padding 11px 3px。Attendance、Claims、Payroll、Project 的视觉尺寸与 Leave 基本一致。',
  '把 Career / Workplace 的 status card 转为共用 work-status 规格；模块自己的状态和数值继续保留。',
  [['css/work-status.css','.work-status-card {'],['modules/employee-career/css/employee-career.css','.employee-career-status-card{'],['modules/admin/css/admin.css','.workplace-status-card {']], [1,79,80,81,82]);
add('HC01','有状态 Record Card','P2','History Card 外框存在 18px 与 20px 两套规格',['modules/payroll/options/history.html','modules/admin/options/history.html','modules/employee-career/options/history.html'],
  'Leave History 有状态 record card 为 20px；这与 AGENTS.md 指定的无状态 Summary Card 18px 是两种用途。',
  'Payroll、Workplace、Career History 实测为 18px；Leave、Claims、Attendance History 为 20px。外观接近但有状态记录卡的外框规格仍不同。',
  '有状态 History Record 统一到 Leave 的 20px；无状态 Summary 继续遵守 18px 的仓库规范。',
  [['leave.html','.history-item-card {'],['css/payroll-history.css','.payroll-history-phone .history-card-item'],['modules/admin/css/workplace-history.css','.workplace-history-page .history-card-item'],['modules/employee-career/options/history.html','payroll-history-phone career-history-phone']], [8,95,97]);
add('HC02','有状态 Record Card','P2','Project History 的卡片留白偏紧',['modules/project-task/options/history.html'],
  'Leave History 外层 padding 16px 18px，内层 details box 保留独立留白。',
  'Project 的窄屏 History Card 外层 padding 为 13px，内容更密；即使同为 20px 外框，标题、reference、details 与动作的呼吸空间不同。',
  '复用 Leave Record Card 的外层 spacing token，业务独有的 Work Plan 与 Timesheet 字段继续保留。',
  [['css/project-task.css','.project-history-card { padding: 13px;'],['css/project-task.css','.project-history-card-details {']], [8,58,59]);
add('D01','Detail Popout','P2','Career 详情标题覆盖了共用规格',['modules/employee-career/options/team/staff-feedback.html','modules/employee-career/options/team/staff-whereabout.html'],
  'Leave Detail：18px panel、50px purple header、16px / 800 uppercase title、白色圆形 close。',
  '这两个页面已经使用共用 detail-popout-panel，但各自 CSS 用 !important 把标题改成 14px、text-transform:none、letter-spacing:0。共用外壳已一致，标题仍是局部例外。',
  '移除局部标题视觉覆盖，复用共用 detail-popout-title；允许业务标题文本不同。',
  [['css/detail-popout.css','.detail-popout-header .detail-popout-title'],['modules/employee-career/css/staff-feedback.css','.detail-popout-title'],['modules/employee-career/css/staff-whereabout.css','.detail-popout-title']], [37,99,100]);
add('N01','无状态 Summary Card','P1','Shift Planning 四种 Summary 缺少右侧 chevron',['modules/attendance/options/shift-plan.html'],
  'AGENTS.md：18px history-card-item、无左日期 badge、标题左侧、fa-chevron-right 右侧、下面为 key-value rows。',
  'Work Shift、No Work、OT Plan、Leave Summary 的 calendar-purple-card 均为 18px，且没有左日期 badge；但当前四种卡都没有 fa-chevron-right。标题使用独立紫色满宽 header，细项为小格子，没有完整跟随规定的 History top row。',
  '统一四种 summary 的 top row 和 detail rows，补上右侧 chevron；保留 18px 外框与上方日期筛选。',
  [['modules/attendance/options/shift-plan.html','.calendar-purple-card-header {'],['modules/attendance/options/shift-plan.html','function renderCalendarDrilldownSummary'],['modules/attendance/options/shift-plan.html',"openOtPlanDetail('8.30:17.30W'"],['modules/attendance/options/shift-plan.html',"openLeaveDetail('ANNUAL LEAVE'"]], [127,128,129,130]);
add('H01','Highlight Detail','P2','Benefit 与 Expense 动态详情丢失日期栏字体规格',['modules/claims/options/benefit-highlight.html','modules/claims/options/expenses-highlight.html'],
  'Leave Highlight Detail 的日期栏为 12.5px / 800 monospace；highlight panel 为 24px，内部记录上方紫色日期栏、下方明细小格。',
  'Benefit / Expense 同样保留了正确的 Highlight 卡片结构，但实际动态渲染的 period 值继承 16px 普通字体。HTML 旧模板原本有 12.5px / 800 inline style，claims-highlight-shared.js 的动态模板没有带上。',
  '将 period value 的 font-family、font-size、font-weight 写入共用 CSS；不要依赖旧静态模板的 inline style。',
  [['js/claims/claims-highlight-shared.js','detail-period-value'],['modules/claims/options/benefit-highlight.html','.benefit-detail-period-value {'],['modules/claims/options/expenses-highlight.html','.expense-detail-period-value {'],['leave.html','font-size: 12.5px; font-weight: 800; color: #ffffff']], [18,19,20]);
add('B01','Benefit Entitlement','P1','四列 Benefit 金额超出栏位',['modules/claims/options/staff-entitlement.html'],
  'Benefit Entitlement 保留自己的紫色员工 header、benefit type pill 和四项余额设计；Leave Staff Entitlement 是相近的参照。',
  '360px 下 RM 1,000.00 的内容宽 77px、栏位只有 57px；420px 下栏位 72px，仍装不下 77px 的内容。RM 197.00、RM 803.00 等在 360px 也超出栏位。white-space:nowrap 加四等列使数字挤在一起，外围 overflow:hidden 还可能裁掉内容。',
  '保留 Benefit 设计，给金额可容纳的宽度；窄屏使用合理的两列或调整数值布局。不要单纯隐藏溢出。',
  [['modules/claims/options/staff-entitlement.html','.entitlement-metrics {'],['modules/claims/options/staff-entitlement.html','.entitlement-metric-value {'],['js/claims/staff-entitlement.js','entitlement-metrics']], [14,133]);
add('FL01','Filter','P2','三个 History Filter 的日期输入与其他筛选项不一致',['modules/admin/options/history.html','modules/employee-career/options/history.html','modules/payroll/options/history.html'],
  'Leave 与当前 Claim History Filter：28px 顶部圆角；controls 16px radius、13.5px、700、padding 12px 16px。',
  'Workplace、Career、Payroll History 的日期输入实测为 13px radius、12px、padding 12px 10px。Career / Payroll 同一张 filter 中的 select 又是 16px / 13.5px，因此 panel 内部也混了两套 control。Claim History 本次打开后是正确规格，不能仅按 CSS 类名把它误记成不一致。',
  '统一这三个 History Filter 的日期、搜索和 select 控制项；让打开后的 panel 使用同一套 standard-filter 规格。',
  [['modules/admin/options/history.html','id="historyDateFrom"'],['modules/employee-career/options/history.html','id="historyDateFrom"'],['modules/payroll/options/history.html','id="historyDateFrom"'],['css/app.css','.standard-filter-panel input:not']], [16,96,98,134,135]);
add('FL02','Filter','P2','四个 Pending Approval Filter 使用另一套规格',['modules/claims/options/pending-approval.html','modules/payroll/options/pending-approval.html','modules/admin/options/pending-approval.html','modules/employee-career/options/pending-approval.html'],
  'Leave standard-filter：28px 顶角、18px heading、13.5px control、48px apply、18px apply radius。',
  '共用 approval-filter-panel 为 26px 顶角、16px heading、12px / 600 controls；Apply Filter 为 46px 高、13px 字号、14px radius。Reset / close 的样式也与 standard-filter 不同。',
  'Pending 的特殊字段继续保留，将容器、标题、Reset、close、control 和 Apply 的视觉统一到 standard-filter。',
  [['css/pending-approval-filter.css','.approval-filter-panel {'],['css/pending-approval-filter.css','.approval-filter-header h2'],['css/pending-approval-filter.css','.approval-filter-apply'],['css/app.css','.standard-filter-apply {']], [16,123,124,125,126]);
add('T01','Table','P3','同类报表表格仍有几种密度',['modules/claims/options/benefit-highlight.html','modules/claims/options/expenses-highlight.html','modules/project-task/options/timesheet-highlight.html','modules/admin/options/asset-highlight.html'],
  'Leave Highlight 的 table header 为 11px / 800、padding 14px 16px；Attendance Highlight、Staff List、Staff Attrition 基本跟随这套规格。',
  'Benefit / Expense 为 12px 14px padding；Timesheet 为 12px 10px；Asset 为 10.5px 和 12px 8px。颜色与基本层级已接近，主要是同类报表的字号、行高、横向密度不同。',
  '设定一个默认 report-table density；需要紧凑版的页面显式使用统一 compact variant。业务表格的列数和字段不必相同。',
  [['modules/claims/options/benefit-highlight.html','EMP#'],['css/timesheet-highlight.css','th'],['modules/admin/css/asset-highlight.css','th']], [10,83,84,90,91,92]);
add('C01','Chart','P3','同类分析图表标题与中心数字不完全一致',['modules/claims/options/benefit-highlight.html','modules/claims/options/expenses-highlight.html','modules/project-task/options/timesheet-highlight.html'],
  'Leave 的 Breakdown selector → donut card → legend table 结构；chart heading 为 18px。',
  'Benefit / Expense / Timesheet 的整体分析结构已接近，但 heading 为 17px，中心总数也各自定义字号与字重。Benefit 的紫色分类色系属于已有业务设计，本次不把它和 Leave 多色图的区别判为错误。',
  '统一同类分析图的 heading、总数与 caption token；保留不同数据维度、单位、分类色及横向条图。',
  [['modules/claims/options/benefit-highlight.html','Benefit claims by category'],['modules/claims/options/expenses-highlight.html','Expense spend by category'],['css/timesheet-highlight.css','.timesheet-donut-card h2']], [117,109,110,116]);
async function sourceLink(file,needle){
  const src=await fs.readFile(path.join(root,file),'utf8'),index=src.indexOf(needle);
  if(index<0)throw new Error('Missing evidence pattern: '+file+' / '+needle);
  const line=src.slice(0,index).split('\n').length;
  return {file,line,needle,markdown:`[${file}:${line}](C:/Users/loong/PQ-Mobile/${file}:${line})`};
}
const escape=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function main(){
  const inventory=JSON.parse(await fs.readFile(path.join(evidence,'source-inventory.json'),'utf8'));
  const pages=JSON.parse(await fs.readFile(path.join(evidence,'page-observations.json'),'utf8'));
  const focus=JSON.parse(await fs.readFile(path.join(evidence,'focused-observations.json'),'utf8'));
  F[0].files=[...new Set([...F[0].files,...pages.filter(x=>!x.legacy&&x.variants?.some(v=>v.width===360&&v.phone.some(p=>p.y>0||p.width<360||p.height<844))).map(x=>x.file)])];
  const sourceChanges=[];
  for(const item of inventory){const bytes=await fs.readFile(path.join(root,item.file));if(crypto.createHash('sha256').update(bytes).digest('hex')!==item.sha256)sourceChanges.push(item.file);}
  for(const f of F)f.evidence=await Promise.all(f.sources.map(([file,needle])=>sourceLink(file,needle)));
  const stale=pages.filter(x=>x.errors?.length||x.error),failed=focus.filter(x=>x.error||x.errors?.length);
  if(sourceChanges.length||stale.length||failed.length)throw new Error(JSON.stringify({sourceChanges,stale,failed}));
  const shots=focus.reduce((n,x)=>n+(x.screenshots?.length||0),0),focusVariants=focus.reduce((n,x)=>n+(x.variants?.length||0),0);
  const head=`# PeopleHCM 全系统设计一致性审查\n\n日期：2026-10-11。基准：当前 Leave 主表单、Leave History、Leave Detail、Leave Highlight，Benefit 使用当前 Benefit Entitlement 的专属设计。\n\n当前系统仍有 **${F.length} 类可定位的设计差异**，集中在手机页面框架、Form、状态卡、History Card、Summary、Filter，以及少数详情与报表字号。优先处理手机框架差异、Shift Summary 缺少 chevron、Benefit 金额溢出。大多数普通详情弹窗与 View Chart 已经统一，不需要全部重做。\n\n本次为审查：没有修改应用 HTML、CSS、JS。产出为报告、覆盖清单、截图和审查工具。\n\n## 检查范围与证据\n\n- 274 个应用源码文件：123 HTML、67 CSS、84 JS。排除 node_modules、工具配置目录及 scratch 中的备份项目；旧入口另行标记。\n- 123 个 HTML 入口均在本地浏览器打开；每页检查 360px / 420px × dark / light，共 492 个整页状态。旧入口也纳入检查。\n- 136 个 Form、Leave 子视图、Detail、Filter、Highlight、Benefit、Chart 重点案例，每例四种组合，共 ${focusVariants} 个状态；实际字体与 FontAwesome 字体检查均通过。\n- ${shots} 张 390×844 截图。采集时暂停 CSS transition，避免把切换主题的中间画面误当作配色错误。\n- 整页与重点案例没有记录到浏览器 JavaScript 错误；这不等于所有业务流程已验证。\n- 整页扫描为加速而阻挡外部字体请求。Daily OT 的初扫宽度信号在实际字体下消失，已经排除，不计入问题。\n\n[截图对照页](./${prefix}-gallery.html) 可搜索模块与页面，切换深浅主题，点击图片放大。[逐页覆盖清单](./${prefix}-coverage.csv) 列出全部 123 个入口及相关发现。原始测量放在 [审查证据目录](../../scratch/system-design-audit-20261011)。\n\n## 按组件分别使用基准\n\n| 组件 | 基准与统一规则 | 不应混用的另一种设计 |\n| --- | --- | --- |\n| Form | Apply Leave 主表单：24px card、20px section title、14px controls、muted labels、共用附件与动作 | Filter 的 16px controls；详情只读表格 |\n| 普通 Detail Popout | Leave Detail：18px panel、50px 紫色 header、16px / 800 title、白色圆形 close、key-value table、滚动内容 | Highlight 的 24px record dialog；编辑用的全页 Form |\n| Dashboard Status Card | Leave 80px、16px radius、数字 18px / 900、状态 11px、说明 9.5px | History record card；带业务总数的 summary |\n| 有状态 History Record | Leave History 20px、状态左色条与 badge、标题 reference、details box、按状态显示动作 | 无状态 summary 的 18px 与 chevron |\n| 无状态 Summary Card | AGENTS.md 的 18px history-card-item、标题和右 chevron、下方 key-value；上方已经筛选日期就不放左日期 badge | 为无状态数据人为加审批色条或状态 badge |\n| Highlight Detail | Leave Highlight：24px dialog，员工姓名下方 #ID，紫色日期或期间栏，下方描述和数值小格 | 普通 Detail 的整张 key-value table |\n| Benefit Entitlement | 紫色员工 header、benefit type pill、Claimed / Pending / Entitled / Usable 余额布局 | 把余额卡改成申请状态卡 |\n| Filter | Leave 的 standard-filter：28px 顶角、18px 标题、16px controls、Reset / close / Apply | 普通 form 的容器与 section title |\n| Report Table | Leave Highlight 的紫色 header、zebra rows、横向滚动、数字右对齐与统一 density | 详情的两列表格；工资与税务文件原有文档格式 |\n| Chart | 按图表用途统一容器、标题、总数、legend；View Chart 一律 pie icon + text + nowrap pill | 为了统一外观强行将所有条图改成 donut、删除 Benefit 分类色 |\n\n## 发现清单\n\nP1 为影响布局或违反明确仓库规则的项；P2 为主要组件视觉差异；P3 为细节差异或源码确认的待归一规格。\n\n| 编号 | 类别 | 优先级 | 差异 |\n| --- | --- | --- | --- |\n${F.map(f=>`| ${f.id} | ${f.category} | ${f.priority} | ${f.title} |`).join('\n')}\n\n`;
  const body=F.map(f=>`## ${f.id} ${f.title}\n\n类别：${f.category}。优先级：${f.priority}。\n\n位置：${f.id==='G01'?'Leave 对照，以及逐页覆盖清单中标记 G01 的当前入口。覆盖 Home / App / Me / Team、各业务模块主页与多个 option 页面，具体到文件的范围见 coverage.csv':f.files.map(x=>'`'+x+'`').join('、')}。\n\n**基准：** ${f.reference}\n\n**当前差异：** ${f.difference}\n\n**统一方向：** ${f.action}\n\n源码：${f.evidence.map(x=>x.markdown).join('；')}。${f.cases.length?' 截图案例：'+f.cases.map(n=>`[${String(n).padStart(3,'0')}](./${prefix}-gallery.html#case-${n})`).join('、')+'。':''}\n\n`).join('');
  const tail=`## 已经符合或应保留的设计\n\n- View Chart：整页扫描中所有找到的控件均有 fa-chart-pie、View Chart 文本和 nowrap；重点 Chart 案例也可以打开。不需要再修成文字按钮。\n- 普通详情：Claims 八种 History 和八种 Pending、Leave 三种 History、Payroll 两种 History / Pending、Project History / Pending、Workplace / Career History，以及多种 Attendance Detail 已使用共用 detail-popout 外壳。D01 只针对已确认的 Career 标题覆盖。\n- Attendance Pending 的三种详情名称为 OT Plan Approval、Attendance Advice Approval、Final OT Approval，符合仓库规定。\n- 已检查的 employee / user card 中，ID 基本采用姓名下方 #ID 和 muted monospace；员工表格中的独立 Emp# 列与详情 key-value 的 Employee # 行不属于卡片的姓名布局，不据此误报。\n- Leave、Benefit、Expense Highlight 已具有自己的日期或期间 header 与明细格；不要把整类 Highlight 改成普通 Detail。H01 只修 period 字体。\n- Staff Benefit Entitlement 与 Leave Staff Entitlement 已共享紫色员工 header / type pill 的视觉方向。B01 只处理金额空间，不重做 Benefit 身份。\n- Attendance Highlight / Clocking Summary / Staff List / Staff Attrition 的 table header 基本接近 Leave；不同业务的字段、列数、图表类型和货币单位不是视觉缺陷。\n- Shift Summary 的 18px container 与去除左日期 badge 已符合要求；N01 处理缺少 chevron 及内容结构。\n- Career Team 的 Confirm Staff、Staff Exit、Staff Request、Key Staff Nomination 与 Workplace 的 Inventory Request、Letter Request 比较接近 Apply Leave Form，可作为迁移时的参考。\n\n## 模块检查结论\n\n| 模块 | 本次结论 | 主要发现 |\n| --- | --- | --- |\n| Leave | 主基准可用，但 Credit Leave / Time Off 的标题仍与主 form 不同 | F01；G01 用 Leave 作对照 |\n| Attendance 与 Shift Planning | 多数详情、Highlight、View Chart 已统一；Shift 四种 Summary 需按规范处理 | G01、N01 |\n| Claims 与 Benefits | 普通 Detail / History Filter 已接近基准；多种 form、Highlight period 字体和 Benefit 金额空间有差异 | F02、H01、B01、FL02、T01、C01 |\n| Payroll | Dashboard Status 已跟随 Leave；request form 与 History card / filter 还有局部差异 | G01、F03、HC01、FL01、FL02 |\n| Project 与 Task | Status 与普通 Detail 基本统一；form、History density、报表字号需统一 | G01、F04、F07、HC02、T01、C01 |\n| Employee 与 Career | Team form 接近基准；Individual form、status、History Filter、两种 Detail 标题不同 | G01、F05、S01、HC01、D01、FL01、FL02 |\n| Workplace 与 Admin | Letter / Inventory Form 接近基准；Guest Visit、Status、History、Pending Filter、Asset Table 有差异 | G01、F06、S01、HC01、FL01、FL02、T01 |\n| Home、App、Team、Me、Calendar、Favourite、Organization、Change Request、Salary / Bonus | 纳入逐页检查；Profile、Organization、inline edit、工资文件属于专属业务设计，未强行套 Leave form | 共用手机框架按 G01 核对；详见 coverage.csv |\n\n## 未完成页面与旧入口\n\nCareer 的 Onboard Activity、Staff Onboard、Staff Engagement 当前仍显示 next workflow design 的占位内容。这是尚未实现的工作流，不算已通过对应 Form / Detail 的设计检查，也不在本次审查中替它们新增功能。\n\nno/ 四个页面、light.html、modules/leave/index.html、modules/me/index.html、me-accordion.html 保留旧设计，已标记为旧入口。me.html 和 team.html 仍在当前 APP_ROUTES 中，纳入当前系统；不会沿用旧审查对它们的排除结论。\n\n## 建议统一顺序\n\n1. 处理 G01、N01、B01：手机可用空间、明确的 Summary 结构、实际金额溢出。\n2. 将 Apply Leave Form 的 container / title / control / label / attachment / action 规格收为共用组件，再迁移 F01 至 F06。\n3. 统一 Status、History Card、Filter，保留有状态 / 无状态 / Benefit 三类不同语义。\n4. 修复 D01 和 H01，最后归一 Table 与 Chart 的细节 token。\n\n本次不是逐个提交、批准、删除或上传附件的业务回归；动态重点检查覆盖这里列出的 136 个案例，无法据此宣称每个数据状态和嵌套操作都已穷尽。后续改动应以受影响页面及动作的回归为验收依据。\n`;
  await fs.mkdir(reports,{recursive:true});
  await fs.writeFile(path.join(reports,prefix+'-audit.md'),head+body+tail,'utf8');
  const ledger=inventory.filter(x=>x.file.endsWith('.html')).map(item=>{
    const page=pages.find(x=>x.file===item.file),related=F.filter(x=>x.files.includes(item.file)).map(x=>x.id);
    const pending=/onboard-activity|staff-onboard|staff-engagement/.test(item.file);
    return {file:item.file,status:item.legacy?'旧入口 已审查':pending?'占位工作流 已检查页面外观':related.length?'已检查 有设计差异':'已检查 未登记独立差异',findingIds:related.join(' '),runtimeVariants:page?.variants?.length||0,focusedCases:focus.filter(x=>x.file.split('?')[0]===item.file).map(x=>x.index).join(' '),fields:!!page?.variants?.[0]?.fields.length,table:!!page?.variants?.[0]?.tables.length,chart:!!page?.variants?.[0]?.charts.length};
  });
  const cols=Object.keys(ledger[0]),csv='\ufeff'+cols.join(',')+'\r\n'+ledger.map(x=>cols.map(k=>'"'+String(x[k]).replace(/"/g,'""')+'"').join(',')).join('\r\n');
  await fs.writeFile(path.join(reports,prefix+'-coverage.csv'),csv,'utf8');
  await fs.writeFile(path.join(evidence,'findings.json'),JSON.stringify(F,null,2));
  const galleryCards=focus.filter(x=>x.screenshots?.length).map(x=>{
    const related=F.filter(f=>f.cases.includes(x.index)), label=related.map(f=>f.id+' '+f.title).join('；');
    return `<article class="case" id="case-${x.index}" data-search="${escape(x.name+' '+x.file+' '+label)}" data-category="${escape(related[0]?.category||'已检查的参照')}" data-theme-images="${escape(JSON.stringify(x.screenshots))}"><h2>${String(x.index).padStart(3,'0')} ${escape(x.name)}</h2><p class="path">${escape(x.file)}</p><p>${escape(label||'参照或已检查画面；未登记独立差异')}</p><button class="picture" aria-label="放大截图"><img loading="lazy" src="../../scratch/system-design-audit-20261011/${x.screenshots[1]}" alt="${escape(x.name)} light" width="390" height="844"></button></article>`;
  }).join('');
  const gallery=`<!doctype html><html lang="zh-Hans"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PeopleHCM 设计审查截图对照</title><style>body{margin:0;background:#f5f6f8;color:#1b2230;font-family:system-ui,sans-serif}header{padding:24px;position:sticky;top:0;background:#fff;z-index:2;border-bottom:1px solid #dbe0e8}h1{font-size:24px;margin:0 0 8px}p{line-height:1.5;font-size:13px}nav{display:flex;gap:12px;flex-wrap:wrap}input,select,nav button{font:inherit;padding:10px 12px;border:1px solid #ccd3df;border-radius:8px;background:#fff}input{min-width:260px}.gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:24px;padding:24px;align-items:start}.case{background:#fff;border:1px solid #dbe0e8;border-radius:12px;padding:16px;scroll-margin-top:210px}.case h2{font-size:16px;line-height:1.4}.path{font:11px ui-monospace,monospace;overflow-wrap:anywhere;color:#687183}.picture{padding:0;border:0;background:none;display:block;width:100%;cursor:zoom-in}.picture img{display:block;width:100%;height:auto;max-width:390px;margin:auto}.case[hidden]{display:none}dialog{border:0;border-radius:12px;max-height:94dvh;padding:12px}dialog::backdrop{background:#0f172ace}dialog img{display:block;max-height:84dvh;max-width:90vw;width:auto;height:auto}dialog button{display:block;margin:0 0 8px auto;padding:8px 12px;cursor:pointer}a{color:#6239d2}</style></head><body><header><h1>PeopleHCM 设计审查截图对照</h1><p>2026-10-11 · ${shots} 张截图 · ${F.length} 类设计差异 · <a href="./${prefix}-audit.md">完整报告</a> · <a href="./${prefix}-coverage.csv">全部入口清单</a></p><nav><input id="search" type="search" aria-label="搜索页面" placeholder="搜索 Leave / Payroll / Filter / 编号"><select id="category" aria-label="组件类别"><option value="">全部组件</option>${[...new Set(F.map(x=>x.category)),'已检查的参照'].map(x=>'<option>'+escape(x)+'</option>').join('')}</select><select id="theme" aria-label="截图主题"><option value="light">浅色主题</option><option value="dark">深色主题</option></select><button id="reset">重置</button></nav><p id="count"></p></header><main class="gallery">${galleryCards}</main><dialog id="zoom"><button id="close">关闭</button><img alt="放大的审查截图"></dialog><script>const cards=[...document.querySelectorAll('.case')],search=document.getElementById('search'),category=document.getElementById('category'),theme=document.getElementById('theme'),zoom=document.getElementById('zoom');function filter(){const q=search.value.trim().toLowerCase();cards.forEach(c=>c.hidden=!!((q&&!c.dataset.search.toLowerCase().includes(q))||(category.value&&c.dataset.category!==category.value)));document.getElementById('count').textContent=cards.filter(c=>!c.hidden).length+' 个画面案例';}search.addEventListener('input',filter);category.addEventListener('change',filter);theme.addEventListener('change',()=>cards.forEach(c=>{const src=JSON.parse(c.dataset.themeImages).find(x=>x.includes('-'+theme.value+'.png'));c.querySelector('img').src='../../scratch/system-design-audit-20261011/'+src;}));document.getElementById('reset').onclick=()=>{search.value='';category.value='';filter();};cards.forEach(c=>c.querySelector('.picture').onclick=()=>{const src=c.querySelector('img');zoom.querySelector('img').src=src.src;zoom.querySelector('img').alt=src.alt;zoom.showModal();});document.getElementById('close').onclick=()=>zoom.close();zoom.addEventListener('click',e=>{if(e.target===zoom)zoom.close();});filter();</script></body></html>`;
  await fs.writeFile(path.join(reports,prefix+'-gallery.html'),gallery,'utf8');
  const manifest={sourceFiles:inventory.length,pages:pages.length,pageStates:pages.reduce((n,x)=>n+(x.variants?.length||0),0),focusCases:focus.length,focusStates:focusVariants,screenshots:shots,findings:F.length,affectedPages:ledger.filter(x=>x.findingIds).length,sourceChanges,initialErrors:stale,focusErrors:failed,artifactPaths:[path.join(reports,prefix+'-audit.md'),path.join(reports,prefix+'-coverage.csv'),path.join(reports,prefix+'-gallery.html')]};
  await fs.writeFile(path.join(evidence,'verification.json'),JSON.stringify(manifest,null,2));
  console.log(JSON.stringify(manifest,null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
