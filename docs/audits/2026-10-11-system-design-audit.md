# PeopleHCM 全系统设计一致性审查

日期：2026-10-11。基准：当前 Leave 主表单、Leave History、Leave Detail、Leave Highlight，Benefit 使用当前 Benefit Entitlement 的专属设计。

当前系统仍有 **19 类可定位的设计差异**，集中在手机页面框架、Form、状态卡、History Card、Summary、Filter，以及少数详情与报表字号。优先处理手机框架差异、Shift Summary 缺少 chevron、Benefit 金额溢出。大多数普通详情弹窗与 View Chart 已经统一，不需要全部重做。

本次为审查：没有修改应用 HTML、CSS、JS。产出为报告、覆盖清单、截图和审查工具。

## 检查范围与证据

- 274 个应用源码文件：123 HTML、67 CSS、84 JS。排除 node_modules、工具配置目录及 scratch 中的备份项目；旧入口另行标记。
- 123 个 HTML 入口均在本地浏览器打开；每页检查 360px / 420px × dark / light，共 492 个整页状态。旧入口也纳入检查。
- 136 个 Form、Leave 子视图、Detail、Filter、Highlight、Benefit、Chart 重点案例，每例四种组合，共 544 个状态；实际字体与 FontAwesome 字体检查均通过。
- 184 张 390×844 截图。采集时暂停 CSS transition，避免把切换主题的中间画面误当作配色错误。
- 整页与重点案例没有记录到浏览器 JavaScript 错误；这不等于所有业务流程已验证。
- 整页扫描为加速而阻挡外部字体请求。Daily OT 的初扫宽度信号在实际字体下消失，已经排除，不计入问题。

[截图对照页](./2026-10-11-system-design-gallery.html) 可搜索模块与页面，切换深浅主题，点击图片放大。[逐页覆盖清单](./2026-10-11-system-design-coverage.csv) 列出全部 123 个入口及相关发现。原始测量放在 [审查证据目录](../../scratch/system-design-audit-20261011)。

## 按组件分别使用基准

| 组件 | 基准与统一规则 | 不应混用的另一种设计 |
| --- | --- | --- |
| Form | Apply Leave 主表单：24px card、20px section title、14px controls、muted labels、共用附件与动作 | Filter 的 16px controls；详情只读表格 |
| 普通 Detail Popout | Leave Detail：18px panel、50px 紫色 header、16px / 800 title、白色圆形 close、key-value table、滚动内容 | Highlight 的 24px record dialog；编辑用的全页 Form |
| Dashboard Status Card | Leave 80px、16px radius、数字 18px / 900、状态 11px、说明 9.5px | History record card；带业务总数的 summary |
| 有状态 History Record | Leave History 20px、状态左色条与 badge、标题 reference、details box、按状态显示动作 | 无状态 summary 的 18px 与 chevron |
| 无状态 Summary Card | AGENTS.md 的 18px history-card-item、标题和右 chevron、下方 key-value；上方已经筛选日期就不放左日期 badge | 为无状态数据人为加审批色条或状态 badge |
| Highlight Detail | Leave Highlight：24px dialog，员工姓名下方 #ID，紫色日期或期间栏，下方描述和数值小格 | 普通 Detail 的整张 key-value table |
| Benefit Entitlement | 紫色员工 header、benefit type pill、Claimed / Pending / Entitled / Usable 余额布局 | 把余额卡改成申请状态卡 |
| Filter | Leave 的 standard-filter：28px 顶角、18px 标题、16px controls、Reset / close / Apply | 普通 form 的容器与 section title |
| Report Table | Leave Highlight 的紫色 header、zebra rows、横向滚动、数字右对齐与统一 density | 详情的两列表格；工资与税务文件原有文档格式 |
| Chart | 按图表用途统一容器、标题、总数、legend；View Chart 一律 pie icon + text + nowrap pill | 为了统一外观强行将所有条图改成 donut、删除 Benefit 分类色 |

## 发现清单

P1 为影响布局或违反明确仓库规则的项；P2 为主要组件视觉差异；P3 为细节差异或源码确认的待归一规格。

| 编号 | 类别 | 优先级 | 差异 |
| --- | --- | --- | --- |
| G01 | 共用页面框架 | P1 | 手机画面与外部预览控件不一致 |
| F01 | Form | P2 | Leave 自身仍有两套表单标题 |
| F02 | Form | P2 | 多种 Claim Form 沿用另一套容器与输入框 |
| F03 | Form | P2 | Payroll Request Form 标题与控件偏小 |
| F04 | Form | P2 | Project Form 的移动端密度与 Leave 差距较大 |
| F05 | Form | P2 | Career Individual 与 Team Form 规格分裂 |
| F06 | Form | P2 | Guest Visit 与同模块其他 Form 规格不同 |
| F07 | Form | P3 | 附件行仍有独立规格 |
| S01 | Dashboard Status Card | P2 | Career 和 Workplace 的状态卡尺寸不同 |
| HC01 | 有状态 Record Card | P2 | History Card 外框存在 18px 与 20px 两套规格 |
| HC02 | 有状态 Record Card | P2 | Project History 的卡片留白偏紧 |
| D01 | Detail Popout | P2 | Career 详情标题覆盖了共用规格 |
| N01 | 无状态 Summary Card | P1 | Shift Planning 四种 Summary 缺少右侧 chevron |
| H01 | Highlight Detail | P2 | Benefit 与 Expense 动态详情丢失日期栏字体规格 |
| B01 | Benefit Entitlement | P1 | 四列 Benefit 金额超出栏位 |
| FL01 | Filter | P2 | 三个 History Filter 的日期输入与其他筛选项不一致 |
| FL02 | Filter | P2 | 四个 Pending Approval Filter 使用另一套规格 |
| T01 | Table | P3 | 同类报表表格仍有几种密度 |
| C01 | Chart | P3 | 同类分析图表标题与中心数字不完全一致 |

## G01 手机画面与外部预览控件不一致

类别：共用页面框架。优先级：P1。

位置：Leave 对照，以及逐页覆盖清单中标记 G01 的当前入口。覆盖 Home / App / Me / Team、各业务模块主页与多个 option 页面，具体到文件的范围见 coverage.csv。

**基准：** Leave 在 500px 以下隐藏 preview-top-bar，手机内容占满 viewport，外框圆角归零。

**当前差异：** 360px 下 Leave 为 360×844、起点 (0,0)；Work Plan 为 336×754、起点 (12,71)；Career 为 360×793、起点 (0,51)。其他页面仍显示页面外的 Dark Mode / Light Mode 预览开关和手机框，实际可用高度不同。

**统一方向：** 将 Leave 的 mobile breakpoint、外部预览控件显示规则、容器高度和页面留白收进共用框架。桌面预览可以继续保留手机框。

源码：[leave.html:1737](C:/Users/loong/PQ-Mobile/leave.html:1737)；[css/app.css:251](C:/Users/loong/PQ-Mobile/css/app.css:251)；[css/project-task-forms.css:2](C:/Users/loong/PQ-Mobile/css/project-task-forms.css:2)。 截图案例：[003](./2026-10-11-system-design-gallery.html#case-3)、[071](./2026-10-11-system-design-gallery.html#case-71)、[081](./2026-10-11-system-design-gallery.html#case-81)。

## F01 Leave 自身仍有两套表单标题

类别：Form。优先级：P2。

位置：`leave.html`。

**基准：** Apply Leave 主表单：section title 20px / 800，container 24px radius、20px padding。

**当前差异：** Credit Leave 与 Time Off 用 form-section-heading--new，标题为 13px uppercase；因此不能将 leave.html 中所有表单都当成同一个已统一的样板。

**统一方向：** 以 Apply Leave 主表单作为默认 form；Credit Leave、Time Off 的 section title 和信息层级跟它统一。

源码：[leave.html:3233](C:/Users/loong/PQ-Mobile/leave.html:3233)；[leave.html:3594](C:/Users/loong/PQ-Mobile/leave.html:3594)；[leave.html:4271](C:/Users/loong/PQ-Mobile/leave.html:4271)；[css/form-section-headings.css:19](C:/Users/loong/PQ-Mobile/css/form-section-headings.css:19)。 截图案例：[003](./2026-10-11-system-design-gallery.html#case-3)、[005](./2026-10-11-system-design-gallery.html#case-5)、[006](./2026-10-11-system-design-gallery.html#case-6)。

## F02 多种 Claim Form 沿用另一套容器与输入框

类别：Form。优先级：P2。

位置：`modules/claims/options/advance-claim.html`、`modules/claims/options/travel-claim.html`、`modules/claims/options/travel-request.html`、`modules/claims/options/entertainment-claim.html`、`modules/claims/options/expenses-claim.html`、`modules/claims/options/ot-claim.html`、`modules/claims/options/medical-claim.html`。

**基准：** Apply Leave：24px container、20px section title、14px control radius，普通控制项使用较重的 700 字重。

**当前差异：** Advance、Travel、Travel Request、Entertainment、Expense、Medical 等采用 22px form-card 与 12px form-ctrl，控制项普遍 600 字重；OT Details 标题为 15px。相同层级的表单明显比 Apply Leave 小一档。

**统一方向：** 统一 form container、section heading、field label、control 的视觉规格；多步骤流程与费用业务字段继续保留。

源码：[modules/claims/options/advance-claim.html:76](C:/Users/loong/PQ-Mobile/modules/claims/options/advance-claim.html:76)；[modules/claims/options/advance-claim.html:150](C:/Users/loong/PQ-Mobile/modules/claims/options/advance-claim.html:150)；[modules/claims/options/ot-claim.html:636](C:/Users/loong/PQ-Mobile/modules/claims/options/ot-claim.html:636)。 截图案例：[003](./2026-10-11-system-design-gallery.html#case-3)、[067](./2026-10-11-system-design-gallery.html#case-67)、[068](./2026-10-11-system-design-gallery.html#case-68)、[131](./2026-10-11-system-design-gallery.html#case-131)。

## F03 Payroll Request Form 标题与控件偏小

类别：Form。优先级：P2。

位置：`modules/payroll/options/tax-relief-request.html`、`modules/payroll/options/deduction-request.html`。

**基准：** Apply Leave 主表单的 section title 20px、control radius 14px。

**当前差异：** Payroll 容器已是 24px，但 section title 为 16px；输入框仍是 12px radius、13px 字号、600 字重，padding 11px 13px。

**统一方向：** 保留现有业务布局，统一 section title 和 control 到 Apply Leave 的规格。

源码：[css/payroll-request-forms.css:15](C:/Users/loong/PQ-Mobile/css/payroll-request-forms.css:15)；[css/payroll-request-forms.css:16](C:/Users/loong/PQ-Mobile/css/payroll-request-forms.css:16)；[css/claim-forms.css:584](C:/Users/loong/PQ-Mobile/css/claim-forms.css:584)。 截图案例：[003](./2026-10-11-system-design-gallery.html#case-3)、[070](./2026-10-11-system-design-gallery.html#case-70)。

## F04 Project Form 的移动端密度与 Leave 差距较大

类别：Form。优先级：P2。

位置：`modules/project-task/options/work-plan.html`、`modules/project-task/options/work-assignment.html`、`modules/project-task/options/time-sheet.html`。

**基准：** Apply Leave：20px title、14px control radius、13.5px select、12px 14px padding。

**当前差异：** Work Plan、Work Assignment、Time Sheet 使用 13px uppercase section title、22px card、12px controls；360px 实测控制项为 12.5px、padding 12px 10px、600 字重。

**统一方向：** 统一标题层级和控制项；将窄屏的缩小规则改成仅处理必要的多列内容。

源码：[css/project-task-forms.css:6](C:/Users/loong/PQ-Mobile/css/project-task-forms.css:6)；[css/project-task-forms.css:11](C:/Users/loong/PQ-Mobile/css/project-task-forms.css:11)；[css/project-task-forms.css:191](C:/Users/loong/PQ-Mobile/css/project-task-forms.css:191)。 截图案例：[003](./2026-10-11-system-design-gallery.html#case-3)、[071](./2026-10-11-system-design-gallery.html#case-71)。

## F05 Career Individual 与 Team Form 规格分裂

类别：Form。优先级：P2。

位置：`modules/employee-career/options/individual/feedback.html`、`modules/employee-career/options/individual/whereabout.html`。

**基准：** Apply Leave 主表单；Career 的 Confirm Staff 等 Team Form 已使用 24px card、20px title、14px control。

**当前差异：** Feedback、Whereabout 使用 22px card、13px uppercase title、12px control radius 和 600 字重。一个模块内 Individual / Team 的视觉层级不同。

**统一方向：** Individual 复用已接近 Apply Leave 的 Team Form 规格；保留不同的业务字段。

源码：[modules/employee-career/css/employee-career-forms.css:24](C:/Users/loong/PQ-Mobile/modules/employee-career/css/employee-career-forms.css:24)；[modules/employee-career/css/employee-career-forms.css:32](C:/Users/loong/PQ-Mobile/modules/employee-career/css/employee-career-forms.css:32)；[modules/employee-career/css/employee-career-forms.css:75](C:/Users/loong/PQ-Mobile/modules/employee-career/css/employee-career-forms.css:75)。 截图案例：[003](./2026-10-11-system-design-gallery.html#case-3)、[072](./2026-10-11-system-design-gallery.html#case-72)、[073](./2026-10-11-system-design-gallery.html#case-73)。

## F06 Guest Visit 与同模块其他 Form 规格不同

类别：Form。优先级：P2。

位置：`modules/admin/options/guest-visit.html`。

**基准：** Apply Leave、Inventory Request、Letter Request：24px container、20px section title、14px controls。

**当前差异：** Guest Visit 的 container 为 22px、Visit Details 为 18px、control radius 为 13px。

**统一方向：** 统一 form 外观；保留 Guest Information、Internal Attendee 等多步骤结构。

源码：[modules/admin/css/guest-visit.css:3](C:/Users/loong/PQ-Mobile/modules/admin/css/guest-visit.css:3)；[modules/admin/css/guest-visit.css:4](C:/Users/loong/PQ-Mobile/modules/admin/css/guest-visit.css:4)；[modules/admin/css/letter-request.css:3](C:/Users/loong/PQ-Mobile/modules/admin/css/letter-request.css:3)。 截图案例：[003](./2026-10-11-system-design-gallery.html#case-3)、[074](./2026-10-11-system-design-gallery.html#case-74)、[075](./2026-10-11-system-design-gallery.html#case-75)。

## F07 附件行仍有独立规格

类别：Form。优先级：P3。

位置：`modules/project-task/options/work-plan.html`、`modules/project-task/options/work-assignment.html`、`modules/project-task/options/time-sheet.html`。

**基准：** Leave 已使用共用 form-attachment-item：9px 10px padding、30px file icon、11.5px filename。

**当前差异：** Project 的 attachment-upload-item 使用 8px 10px padding、28px icon，保留独立附件样式。此项由源码确认，未逐个上传文件来检查所有上传后状态。

**统一方向：** 复用同一套附件行 token 或组件，统一 icon 尺寸和行高。

源码：[css/app.css:9121](C:/Users/loong/PQ-Mobile/css/app.css:9121)；[css/app.css:9133](C:/Users/loong/PQ-Mobile/css/app.css:9133)；[css/project-task-forms.css:36](C:/Users/loong/PQ-Mobile/css/project-task-forms.css:36)；[css/project-task-forms.css:37](C:/Users/loong/PQ-Mobile/css/project-task-forms.css:37)。

## S01 Career 和 Workplace 的状态卡尺寸不同

类别：Dashboard Status Card。优先级：P2。

位置：`modules/employee-career/index.html`、`modules/admin/index.html`。

**基准：** Leave：height 80px；数字 18px / 900；状态 11px；说明 9.5px / 600；radius 16px。

**当前差异：** Career / Workplace 为 76px；数字 18px / 800；状态 10.5px；说明 9px / 700；padding 11px 3px。Attendance、Claims、Payroll、Project 的视觉尺寸与 Leave 基本一致。

**统一方向：** 把 Career / Workplace 的 status card 转为共用 work-status 规格；模块自己的状态和数值继续保留。

源码：[css/work-status.css:25](C:/Users/loong/PQ-Mobile/css/work-status.css:25)；[modules/employee-career/css/employee-career.css:17](C:/Users/loong/PQ-Mobile/modules/employee-career/css/employee-career.css:17)；[modules/admin/css/admin.css:60](C:/Users/loong/PQ-Mobile/modules/admin/css/admin.css:60)。 截图案例：[001](./2026-10-11-system-design-gallery.html#case-1)、[079](./2026-10-11-system-design-gallery.html#case-79)、[080](./2026-10-11-system-design-gallery.html#case-80)、[081](./2026-10-11-system-design-gallery.html#case-81)、[082](./2026-10-11-system-design-gallery.html#case-82)。

## HC01 History Card 外框存在 18px 与 20px 两套规格

类别：有状态 Record Card。优先级：P2。

位置：`modules/payroll/options/history.html`、`modules/admin/options/history.html`、`modules/employee-career/options/history.html`。

**基准：** Leave History 有状态 record card 为 20px；这与 AGENTS.md 指定的无状态 Summary Card 18px 是两种用途。

**当前差异：** Payroll、Workplace、Career History 实测为 18px；Leave、Claims、Attendance History 为 20px。外观接近但有状态记录卡的外框规格仍不同。

**统一方向：** 有状态 History Record 统一到 Leave 的 20px；无状态 Summary 继续遵守 18px 的仓库规范。

源码：[leave.html:544](C:/Users/loong/PQ-Mobile/leave.html:544)；[css/payroll-history.css:26](C:/Users/loong/PQ-Mobile/css/payroll-history.css:26)；[modules/admin/css/workplace-history.css:5](C:/Users/loong/PQ-Mobile/modules/admin/css/workplace-history.css:5)；[modules/employee-career/options/history.html:25](C:/Users/loong/PQ-Mobile/modules/employee-career/options/history.html:25)。 截图案例：[008](./2026-10-11-system-design-gallery.html#case-8)、[095](./2026-10-11-system-design-gallery.html#case-95)、[097](./2026-10-11-system-design-gallery.html#case-97)。

## HC02 Project History 的卡片留白偏紧

类别：有状态 Record Card。优先级：P2。

位置：`modules/project-task/options/history.html`。

**基准：** Leave History 外层 padding 16px 18px，内层 details box 保留独立留白。

**当前差异：** Project 的窄屏 History Card 外层 padding 为 13px，内容更密；即使同为 20px 外框，标题、reference、details 与动作的呼吸空间不同。

**统一方向：** 复用 Leave Record Card 的外层 spacing token，业务独有的 Work Plan 与 Timesheet 字段继续保留。

源码：[css/project-task.css:2187](C:/Users/loong/PQ-Mobile/css/project-task.css:2187)；[css/project-task.css:1709](C:/Users/loong/PQ-Mobile/css/project-task.css:1709)。 截图案例：[008](./2026-10-11-system-design-gallery.html#case-8)、[058](./2026-10-11-system-design-gallery.html#case-58)、[059](./2026-10-11-system-design-gallery.html#case-59)。

## D01 Career 详情标题覆盖了共用规格

类别：Detail Popout。优先级：P2。

位置：`modules/employee-career/options/team/staff-feedback.html`、`modules/employee-career/options/team/staff-whereabout.html`。

**基准：** Leave Detail：18px panel、50px purple header、16px / 800 uppercase title、白色圆形 close。

**当前差异：** 这两个页面已经使用共用 detail-popout-panel，但各自 CSS 用 !important 把标题改成 14px、text-transform:none、letter-spacing:0。共用外壳已一致，标题仍是局部例外。

**统一方向：** 移除局部标题视觉覆盖，复用共用 detail-popout-title；允许业务标题文本不同。

源码：[css/detail-popout.css:74](C:/Users/loong/PQ-Mobile/css/detail-popout.css:74)；[modules/employee-career/css/staff-feedback.css:40](C:/Users/loong/PQ-Mobile/modules/employee-career/css/staff-feedback.css:40)；[modules/employee-career/css/staff-whereabout.css:37](C:/Users/loong/PQ-Mobile/modules/employee-career/css/staff-whereabout.css:37)。 截图案例：[037](./2026-10-11-system-design-gallery.html#case-37)、[099](./2026-10-11-system-design-gallery.html#case-99)、[100](./2026-10-11-system-design-gallery.html#case-100)。

## N01 Shift Planning 四种 Summary 缺少右侧 chevron

类别：无状态 Summary Card。优先级：P1。

位置：`modules/attendance/options/shift-plan.html`。

**基准：** AGENTS.md：18px history-card-item、无左日期 badge、标题左侧、fa-chevron-right 右侧、下面为 key-value rows。

**当前差异：** Work Shift、No Work、OT Plan、Leave Summary 的 calendar-purple-card 均为 18px，且没有左日期 badge；但当前四种卡都没有 fa-chevron-right。标题使用独立紫色满宽 header，细项为小格子，没有完整跟随规定的 History top row。

**统一方向：** 统一四种 summary 的 top row 和 detail rows，补上右侧 chevron；保留 18px 外框与上方日期筛选。

源码：[modules/attendance/options/shift-plan.html:588](C:/Users/loong/PQ-Mobile/modules/attendance/options/shift-plan.html:588)；[modules/attendance/options/shift-plan.html:2833](C:/Users/loong/PQ-Mobile/modules/attendance/options/shift-plan.html:2833)；[modules/attendance/options/shift-plan.html:1320](C:/Users/loong/PQ-Mobile/modules/attendance/options/shift-plan.html:1320)；[modules/attendance/options/shift-plan.html:1391](C:/Users/loong/PQ-Mobile/modules/attendance/options/shift-plan.html:1391)。 截图案例：[127](./2026-10-11-system-design-gallery.html#case-127)、[128](./2026-10-11-system-design-gallery.html#case-128)、[129](./2026-10-11-system-design-gallery.html#case-129)、[130](./2026-10-11-system-design-gallery.html#case-130)。

## H01 Benefit 与 Expense 动态详情丢失日期栏字体规格

类别：Highlight Detail。优先级：P2。

位置：`modules/claims/options/benefit-highlight.html`、`modules/claims/options/expenses-highlight.html`。

**基准：** Leave Highlight Detail 的日期栏为 12.5px / 800 monospace；highlight panel 为 24px，内部记录上方紫色日期栏、下方明细小格。

**当前差异：** Benefit / Expense 同样保留了正确的 Highlight 卡片结构，但实际动态渲染的 period 值继承 16px 普通字体。HTML 旧模板原本有 12.5px / 800 inline style，claims-highlight-shared.js 的动态模板没有带上。

**统一方向：** 将 period value 的 font-family、font-size、font-weight 写入共用 CSS；不要依赖旧静态模板的 inline style。

源码：[js/claims/claims-highlight-shared.js:68](C:/Users/loong/PQ-Mobile/js/claims/claims-highlight-shared.js:68)；[modules/claims/options/benefit-highlight.html:141](C:/Users/loong/PQ-Mobile/modules/claims/options/benefit-highlight.html:141)；[modules/claims/options/expenses-highlight.html:141](C:/Users/loong/PQ-Mobile/modules/claims/options/expenses-highlight.html:141)；[leave.html:12717](C:/Users/loong/PQ-Mobile/leave.html:12717)。 截图案例：[018](./2026-10-11-system-design-gallery.html#case-18)、[019](./2026-10-11-system-design-gallery.html#case-19)、[020](./2026-10-11-system-design-gallery.html#case-20)。

## B01 四列 Benefit 金额超出栏位

类别：Benefit Entitlement。优先级：P1。

位置：`modules/claims/options/staff-entitlement.html`。

**基准：** Benefit Entitlement 保留自己的紫色员工 header、benefit type pill 和四项余额设计；Leave Staff Entitlement 是相近的参照。

**当前差异：** 360px 下 RM 1,000.00 的内容宽 77px、栏位只有 57px；420px 下栏位 72px，仍装不下 77px 的内容。RM 197.00、RM 803.00 等在 360px 也超出栏位。white-space:nowrap 加四等列使数字挤在一起，外围 overflow:hidden 还可能裁掉内容。

**统一方向：** 保留 Benefit 设计，给金额可容纳的宽度；窄屏使用合理的两列或调整数值布局。不要单纯隐藏溢出。

源码：[modules/claims/options/staff-entitlement.html:127](C:/Users/loong/PQ-Mobile/modules/claims/options/staff-entitlement.html:127)；[modules/claims/options/staff-entitlement.html:150](C:/Users/loong/PQ-Mobile/modules/claims/options/staff-entitlement.html:150)；[js/claims/staff-entitlement.js:15](C:/Users/loong/PQ-Mobile/js/claims/staff-entitlement.js:15)。 截图案例：[014](./2026-10-11-system-design-gallery.html#case-14)、[133](./2026-10-11-system-design-gallery.html#case-133)。

## FL01 三个 History Filter 的日期输入与其他筛选项不一致

类别：Filter。优先级：P2。

位置：`modules/admin/options/history.html`、`modules/employee-career/options/history.html`、`modules/payroll/options/history.html`。

**基准：** Leave 与当前 Claim History Filter：28px 顶部圆角；controls 16px radius、13.5px、700、padding 12px 16px。

**当前差异：** Workplace、Career、Payroll History 的日期输入实测为 13px radius、12px、padding 12px 10px。Career / Payroll 同一张 filter 中的 select 又是 16px / 13.5px，因此 panel 内部也混了两套 control。Claim History 本次打开后是正确规格，不能仅按 CSS 类名把它误记成不一致。

**统一方向：** 统一这三个 History Filter 的日期、搜索和 select 控制项；让打开后的 panel 使用同一套 standard-filter 规格。

源码：[modules/admin/options/history.html:64](C:/Users/loong/PQ-Mobile/modules/admin/options/history.html:64)；[modules/employee-career/options/history.html:67](C:/Users/loong/PQ-Mobile/modules/employee-career/options/history.html:67)；[modules/payroll/options/history.html:70](C:/Users/loong/PQ-Mobile/modules/payroll/options/history.html:70)；[css/app.css:152](C:/Users/loong/PQ-Mobile/css/app.css:152)。 截图案例：[016](./2026-10-11-system-design-gallery.html#case-16)、[096](./2026-10-11-system-design-gallery.html#case-96)、[098](./2026-10-11-system-design-gallery.html#case-98)、[134](./2026-10-11-system-design-gallery.html#case-134)、[135](./2026-10-11-system-design-gallery.html#case-135)。

## FL02 四个 Pending Approval Filter 使用另一套规格

类别：Filter。优先级：P2。

位置：`modules/claims/options/pending-approval.html`、`modules/payroll/options/pending-approval.html`、`modules/admin/options/pending-approval.html`、`modules/employee-career/options/pending-approval.html`。

**基准：** Leave standard-filter：28px 顶角、18px heading、13.5px control、48px apply、18px apply radius。

**当前差异：** 共用 approval-filter-panel 为 26px 顶角、16px heading、12px / 600 controls；Apply Filter 为 46px 高、13px 字号、14px radius。Reset / close 的样式也与 standard-filter 不同。

**统一方向：** Pending 的特殊字段继续保留，将容器、标题、Reset、close、control 和 Apply 的视觉统一到 standard-filter。

源码：[css/pending-approval-filter.css:14](C:/Users/loong/PQ-Mobile/css/pending-approval-filter.css:14)；[css/pending-approval-filter.css:28](C:/Users/loong/PQ-Mobile/css/pending-approval-filter.css:28)；[css/pending-approval-filter.css:53](C:/Users/loong/PQ-Mobile/css/pending-approval-filter.css:53)；[css/app.css:191](C:/Users/loong/PQ-Mobile/css/app.css:191)。 截图案例：[016](./2026-10-11-system-design-gallery.html#case-16)、[123](./2026-10-11-system-design-gallery.html#case-123)、[124](./2026-10-11-system-design-gallery.html#case-124)、[125](./2026-10-11-system-design-gallery.html#case-125)、[126](./2026-10-11-system-design-gallery.html#case-126)。

## T01 同类报表表格仍有几种密度

类别：Table。优先级：P3。

位置：`modules/claims/options/benefit-highlight.html`、`modules/claims/options/expenses-highlight.html`、`modules/project-task/options/timesheet-highlight.html`、`modules/admin/options/asset-highlight.html`。

**基准：** Leave Highlight 的 table header 为 11px / 800、padding 14px 16px；Attendance Highlight、Staff List、Staff Attrition 基本跟随这套规格。

**当前差异：** Benefit / Expense 为 12px 14px padding；Timesheet 为 12px 10px；Asset 为 10.5px 和 12px 8px。颜色与基本层级已接近，主要是同类报表的字号、行高、横向密度不同。

**统一方向：** 设定一个默认 report-table density；需要紧凑版的页面显式使用统一 compact variant。业务表格的列数和字段不必相同。

源码：[modules/claims/options/benefit-highlight.html:325](C:/Users/loong/PQ-Mobile/modules/claims/options/benefit-highlight.html:325)；[css/timesheet-highlight.css:1](C:/Users/loong/PQ-Mobile/css/timesheet-highlight.css:1)；[modules/admin/css/asset-highlight.css:1](C:/Users/loong/PQ-Mobile/modules/admin/css/asset-highlight.css:1)。 截图案例：[010](./2026-10-11-system-design-gallery.html#case-10)、[083](./2026-10-11-system-design-gallery.html#case-83)、[084](./2026-10-11-system-design-gallery.html#case-84)、[090](./2026-10-11-system-design-gallery.html#case-90)、[091](./2026-10-11-system-design-gallery.html#case-91)、[092](./2026-10-11-system-design-gallery.html#case-92)。

## C01 同类分析图表标题与中心数字不完全一致

类别：Chart。优先级：P3。

位置：`modules/claims/options/benefit-highlight.html`、`modules/claims/options/expenses-highlight.html`、`modules/project-task/options/timesheet-highlight.html`。

**基准：** Leave 的 Breakdown selector → donut card → legend table 结构；chart heading 为 18px。

**当前差异：** Benefit / Expense / Timesheet 的整体分析结构已接近，但 heading 为 17px，中心总数也各自定义字号与字重。Benefit 的紫色分类色系属于已有业务设计，本次不把它和 Leave 多色图的区别判为错误。

**统一方向：** 统一同类分析图的 heading、总数与 caption token；保留不同数据维度、单位、分类色及横向条图。

源码：[modules/claims/options/benefit-highlight.html:443](C:/Users/loong/PQ-Mobile/modules/claims/options/benefit-highlight.html:443)；[modules/claims/options/expenses-highlight.html:446](C:/Users/loong/PQ-Mobile/modules/claims/options/expenses-highlight.html:446)；[css/timesheet-highlight.css:50](C:/Users/loong/PQ-Mobile/css/timesheet-highlight.css:50)。 截图案例：[117](./2026-10-11-system-design-gallery.html#case-117)、[109](./2026-10-11-system-design-gallery.html#case-109)、[110](./2026-10-11-system-design-gallery.html#case-110)、[116](./2026-10-11-system-design-gallery.html#case-116)。

## 已经符合或应保留的设计

- View Chart：整页扫描中所有找到的控件均有 fa-chart-pie、View Chart 文本和 nowrap；重点 Chart 案例也可以打开。不需要再修成文字按钮。
- 普通详情：Claims 八种 History 和八种 Pending、Leave 三种 History、Payroll 两种 History / Pending、Project History / Pending、Workplace / Career History，以及多种 Attendance Detail 已使用共用 detail-popout 外壳。D01 只针对已确认的 Career 标题覆盖。
- Attendance Pending 的三种详情名称为 OT Plan Approval、Attendance Advice Approval、Final OT Approval，符合仓库规定。
- 已检查的 employee / user card 中，ID 基本采用姓名下方 #ID 和 muted monospace；员工表格中的独立 Emp# 列与详情 key-value 的 Employee # 行不属于卡片的姓名布局，不据此误报。
- Leave、Benefit、Expense Highlight 已具有自己的日期或期间 header 与明细格；不要把整类 Highlight 改成普通 Detail。H01 只修 period 字体。
- Staff Benefit Entitlement 与 Leave Staff Entitlement 已共享紫色员工 header / type pill 的视觉方向。B01 只处理金额空间，不重做 Benefit 身份。
- Attendance Highlight / Clocking Summary / Staff List / Staff Attrition 的 table header 基本接近 Leave；不同业务的字段、列数、图表类型和货币单位不是视觉缺陷。
- Shift Summary 的 18px container 与去除左日期 badge 已符合要求；N01 处理缺少 chevron 及内容结构。
- Career Team 的 Confirm Staff、Staff Exit、Staff Request、Key Staff Nomination 与 Workplace 的 Inventory Request、Letter Request 比较接近 Apply Leave Form，可作为迁移时的参考。

## 模块检查结论

| 模块 | 本次结论 | 主要发现 |
| --- | --- | --- |
| Leave | 主基准可用，但 Credit Leave / Time Off 的标题仍与主 form 不同 | F01；G01 用 Leave 作对照 |
| Attendance 与 Shift Planning | 多数详情、Highlight、View Chart 已统一；Shift 四种 Summary 需按规范处理 | G01、N01 |
| Claims 与 Benefits | 普通 Detail / History Filter 已接近基准；多种 form、Highlight period 字体和 Benefit 金额空间有差异 | F02、H01、B01、FL02、T01、C01 |
| Payroll | Dashboard Status 已跟随 Leave；request form 与 History card / filter 还有局部差异 | G01、F03、HC01、FL01、FL02 |
| Project 与 Task | Status 与普通 Detail 基本统一；form、History density、报表字号需统一 | G01、F04、F07、HC02、T01、C01 |
| Employee 与 Career | Team form 接近基准；Individual form、status、History Filter、两种 Detail 标题不同 | G01、F05、S01、HC01、D01、FL01、FL02 |
| Workplace 与 Admin | Letter / Inventory Form 接近基准；Guest Visit、Status、History、Pending Filter、Asset Table 有差异 | G01、F06、S01、HC01、FL01、FL02、T01 |
| Home、App、Team、Me、Calendar、Favourite、Organization、Change Request、Salary / Bonus | 纳入逐页检查；Profile、Organization、inline edit、工资文件属于专属业务设计，未强行套 Leave form | 共用手机框架按 G01 核对；详见 coverage.csv |

## 未完成页面与旧入口

Career 的 Onboard Activity、Staff Onboard、Staff Engagement 当前仍显示 next workflow design 的占位内容。这是尚未实现的工作流，不算已通过对应 Form / Detail 的设计检查，也不在本次审查中替它们新增功能。

no/ 四个页面、light.html、modules/leave/index.html、modules/me/index.html、me-accordion.html 保留旧设计，已标记为旧入口。me.html 和 team.html 仍在当前 APP_ROUTES 中，纳入当前系统；不会沿用旧审查对它们的排除结论。

## 建议统一顺序

1. 处理 G01、N01、B01：手机可用空间、明确的 Summary 结构、实际金额溢出。
2. 将 Apply Leave Form 的 container / title / control / label / attachment / action 规格收为共用组件，再迁移 F01 至 F06。
3. 统一 Status、History Card、Filter，保留有状态 / 无状态 / Benefit 三类不同语义。
4. 修复 D01 和 H01，最后归一 Table 与 Chart 的细节 token。

本次不是逐个提交、批准、删除或上传附件的业务回归；动态重点检查覆盖这里列出的 136 个案例，无法据此宣称每个数据状态和嵌套操作都已穷尽。后续改动应以受影响页面及动作的回归为验收依据。
