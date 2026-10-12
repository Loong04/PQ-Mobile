# 全应用组件一致性审查：以 Leave 为基准

日期：2026-10-12。共确认 **29 类差异**，分为 P1（内容可读性 / 导航 / 明确规则）、P2（主要组件视觉或状态语义）、P3（较小的规格差异）。本次审查没有批量修改应用设计。

检查 276 个源码文件、123 个 HTML 入口（492 个尺寸 / 主题状态），另检查 142 个组件视图（568 状态）及 8 个补查案例（32 状态）；共 204 张截图。所有已执行浏览器案例没有捕获 JavaScript 错误。初扫为速度屏蔽外部字体，重点视图及补查使用实际字体；初扫的 Daily OT overflow 信号在重点视图中未复现，因此不计为缺陷。

[截图对照页](./2026-10-12-leave-baseline-gallery.html) · [逐页覆盖清单](./2026-10-12-leave-baseline-coverage.csv) · [审查证据](../../scratch/leave-baseline-audit-20261012/)

## 组件基准

| 组件 | 当前 Leave 基准 |
| --- | --- |
| 普通申请表单 | Apply Leave：card 24px / padding 20px，section 20px / 800，label 13px / 700，control 13–13.5px / radius 14px |
| Dashboard 状态卡 | 80px 高 / radius 16px，数字 18px / 900，状态 11px，说明 9.5px / 600 |
| 有状态 History | radius 20px，padding 16px 18px，左状态色条、reference、details、按状态显示动作 |
| 无状态 Summary | AGENTS.md：radius 18px，左标题 / 右 chevron，key-value；上方已筛日期就不放左日期 badge |
| 普通 Detail | radius 18px，50px 紫色 header，16px / 800 title，30px 白色圆形 close，滚动 key-value 内容 |
| Highlight Detail | 24px dialog，姓名下 #ID，紫色日期 / 期间栏，下方记录细项 |
| Filter | 顶角 28px，title 18px，controls 13.5px / 700 / radius 16px / min-height 48px，Reset / close / Apply |
| 员工身份 | 姓名下方 muted monospace #empNo；NRIC/Passport 及报表独立 ID 列不是员工卡 ID |
| View Chart | fa-chart-pie + 可见 View Chart 文案 + nowrap 横向 pill |
| 附件、报表、图表、导航 | 按同用途比较共用文字、间距、动作与主题；保留业务数据结构 |

Leave 本身仍有标题 / card 不同的 Credit Leave、Time Off 子表单，因此“以 Leave 为标准”在本报告中明确指向对应组件，不把 Leave 中所有旧样式都当成统一标准。

## 差异清单

| 编号 | 优先级 | 差异 |
| --- | --- | --- |
| G01 | P1 | 手机页面框架与可用高度不同 |
| G02 | P1 | Team Tax Relief 底部导航没有渲染 |
| G03 | P2 | 当前 My Team 路由仍使用独立浅色页面 |
| G04 | P1 | My Team 审批组件的 Review 与状态反馈不同 |
| F01 | P2 | Leave 自身及 Attendance 有两套表单标题 |
| F02 | P2 | 八类 Claim Form 的标题和输入框规格偏小 |
| F03 | P2 | Payroll Request 与 Prior Pay 编辑表单使用较小规格 |
| F04 | P2 | Project 表单在窄屏进一步缩小 |
| F05 | P2 | Career Individual 与 Team 表单规格分裂 |
| F06 | P2 | Guest Visit 与其他 Workplace 表单不同 |
| F07 | P2 | Final OT Request 表单仍使用旧规格 |
| F08 | P3 | New User Details 的字体与表单容器较小 |
| F09 | P2 | Change Request 表单及 History 使用另一套组件 |
| A01 | P3 | 上传后的附件行仍有独立规格 |
| S01 | P2 | Career / Workplace 文档状态卡尺寸不同 |
| HC01 | P2 | 有状态记录卡的 18px / 20px 圆角混用 |
| HC02 | P3 | Project History 的手机留白更紧 |
| HC03 | P2 | Cancelled 状态在 CV History 使用红色 |
| D01 | P2 | Career Team 普通详情标题仍有局部覆盖 |
| D02 | P2 | Career / Workplace 审批详情未完全采用共用 header |
| D03 | P3 | Project Calendar Timesheet 详情的 header / close 不同 |
| N01 | P1 | Shift Planning 四种 Summary 不符合规定的标题行 |
| H01 | P2 | Benefit / Expense Highlight 的动态期间字体丢失 |
| B01 | P1 | Benefit Entitlement 金额超出四列栏位 |
| FL01 | P2 | Payroll / Career / Workplace History Filter 混用输入框 |
| FL02 | P2 | 动态 Pending Approval Filter 使用另一套规格 |
| FL03 | P3 | Team Tax Relief 筛选摘要没有采用共用摘要栏 |
| T01 | P3 | 同类报表表格的文字与行密度不同 |
| C01 | P3 | 部分同类主图表的标题及中心数值略有不同 |

### G01 手机页面框架与可用高度不同

**P1 · 源码及浏览器**

当前：Leave 在小屏占满 viewport；Career 等仍保留外部主题开关，Project Form 在 360px 还保留左右留白。

统一方向：统一小屏容器、preview-top-bar 的显示条件及可用高度；保留桌面手机预览。

位置：[leave.html:1737](/C:/Users/loong/PQ-Mobile/leave.html:1737)；[css/app.css:251](/C:/Users/loong/PQ-Mobile/css/app.css:251)；[css/project-task-forms.css:2](/C:/Users/loong/PQ-Mobile/css/project-task-forms.css:2)。 对照：[案例 3](./2026-10-12-leave-baseline-gallery.html#case-3)、[案例 71](./2026-10-12-leave-baseline-gallery.html#case-71)、[案例 81](./2026-10-12-leave-baseline-gallery.html#case-81)。

### G02 Team Tax Relief 底部导航没有渲染

**P1 · 源码及浏览器**

当前：页面使用未注册的 app-bottom-nav；浏览器中该元素高度 0、没有导航内容。

统一方向：使用系统已注册的 phone-bottom-nav，提供 Home / Notification / Apps / Favourite / Me。

位置：[modules/payroll/options/tax-relief.html:122](/C:/Users/loong/PQ-Mobile/modules/payroll/options/tax-relief.html:122)；[js/components.js:450](/C:/Users/loong/PQ-Mobile/js/components.js:450)。

### G03 当前 My Team 路由仍使用独立浅色页面

**P2 · 源码及浏览器**

当前：APP_ROUTES 指向 team.html；此页面使用硬编码浅色和独立 Inbox / More 导航，不能跟随 Leave 的主题及共享导航。

统一方向：让当前 Team 路由采用相同主题变量与共用导航组件。

位置：[js/app.js:21](/C:/Users/loong/PQ-Mobile/js/app.js:21)；[team.html:21](/C:/Users/loong/PQ-Mobile/team.html:21)；[team.html:1073](/C:/Users/loong/PQ-Mobile/team.html:1073)。

### G04 My Team 审批组件的 Review 与状态反馈不同

**P1 · 源码确认；页面外观已浏览器验证，未执行审批决定**

当前：Review 写入 reviewed 后直接移除卡片；View all 3 没有动作，数量仍是静态值，清空后没有空状态。

统一方向：Review 打开可审查的详情；数量及空状态随队列变化，与 Leave 审批组件一致。

位置：[team.html:876](/C:/Users/loong/PQ-Mobile/team.html:876)；[team.html:1116](/C:/Users/loong/PQ-Mobile/team.html:1116)。

### F01 Leave 自身及 Attendance 有两套表单标题

**P2 · 源码及浏览器**

当前：Apply Leave 标题 20px / 800、外框 24px；Credit Leave / Time Off 标题 13px、外框 20px。Attendance Shift Change 也使用较小标题。

统一方向：明确以 Apply Leave 主表单为普通申请表单基准，再统一同用途标题和外框。

位置：[leave.html:3227](/C:/Users/loong/PQ-Mobile/leave.html:3227)；[leave.html:3594](/C:/Users/loong/PQ-Mobile/leave.html:3594)；[leave.html:4271](/C:/Users/loong/PQ-Mobile/leave.html:4271)；[css/form-section-headings.css:19](/C:/Users/loong/PQ-Mobile/css/form-section-headings.css:19)；[modules/attendance/options/attendance.html:1623](/C:/Users/loong/PQ-Mobile/modules/attendance/options/attendance.html:1623)。 对照：[案例 3](./2026-10-12-leave-baseline-gallery.html#case-3)、[案例 5](./2026-10-12-leave-baseline-gallery.html#case-5)、[案例 6](./2026-10-12-leave-baseline-gallery.html#case-6)。

### F02 八类 Claim Form 的标题和输入框规格偏小

**P2 · 源码及浏览器**

当前：Advance、Travel、Travel Request、Entertainment、Expense、Medical、OT、Benefit 仍主要使用 22px card、13px uppercase section、12px control radius 和 600 字重；OT Details 实测标题 15px。

统一方向：普通表单使用 24px card / 20px padding、20px section、14px control radius、13–13.5px / 700；保留各表单步骤与字段。

位置：[modules/claims/options/advance-claim.html:76](/C:/Users/loong/PQ-Mobile/modules/claims/options/advance-claim.html:76)；[modules/claims/options/advance-claim.html:126](/C:/Users/loong/PQ-Mobile/modules/claims/options/advance-claim.html:126)；[modules/claims/options/advance-claim.html:150](/C:/Users/loong/PQ-Mobile/modules/claims/options/advance-claim.html:150)；[css/claim-forms.css:584](/C:/Users/loong/PQ-Mobile/css/claim-forms.css:584)。 对照：[案例 67](./2026-10-12-leave-baseline-gallery.html#case-67)、[案例 68](./2026-10-12-leave-baseline-gallery.html#case-68)、[案例 131](./2026-10-12-leave-baseline-gallery.html#case-131)、[案例 132](./2026-10-12-leave-baseline-gallery.html#case-132)。

### F03 Payroll Request 与 Prior Pay 编辑表单使用较小规格

**P2 · 源码及浏览器**

当前：Tax Relief / Deduction 标题 16px、输入框 12px radius / 13px / 600；Prior Pay General 标题 13px uppercase、外框 22px。

统一方向：统一普通编辑字段的标题、标签、输入框规格；保留 Prior Pay 的 General / YTD / Tax Reliefs 步骤。

位置：[css/payroll-request-forms.css:14](/C:/Users/loong/PQ-Mobile/css/payroll-request-forms.css:14)；[css/prior-pay-data.css:48](/C:/Users/loong/PQ-Mobile/css/prior-pay-data.css:48)。 对照：[案例 70](./2026-10-12-leave-baseline-gallery.html#case-70)。

### F04 Project 表单在窄屏进一步缩小

**P2 · 源码及浏览器**

当前：Work Plan / Work Assignment / Time Sheet 使用 22px card、13px section、12px control radius / 600；360px 下输入文字实测 12.5px、card padding 18px 14px。

统一方向：普通表单采用 Apply Leave 的字体、圆角与留白，保留项目与活动字段。

位置：[css/project-task-forms.css:3](/C:/Users/loong/PQ-Mobile/css/project-task-forms.css:3)；[css/project-task-forms.css:6](/C:/Users/loong/PQ-Mobile/css/project-task-forms.css:6)；[css/project-task-forms.css:227](/C:/Users/loong/PQ-Mobile/css/project-task-forms.css:227)。 对照：[案例 71](./2026-10-12-leave-baseline-gallery.html#case-71)。

### F05 Career Individual 与 Team 表单规格分裂

**P2 · 源码及浏览器**

当前：Feedback / Whereabout 为 22px card、13px uppercase section、12px controls / 600；Confirm Staff 等 Team 表单已接近 Leave。

统一方向：让同模块 Individual 表单采用 Team 已使用的 24px / 20px / 14px 标准。

位置：[modules/employee-career/css/employee-career-forms.css:24](/C:/Users/loong/PQ-Mobile/modules/employee-career/css/employee-career-forms.css:24)；[modules/employee-career/css/employee-career-forms.css:75](/C:/Users/loong/PQ-Mobile/modules/employee-career/css/employee-career-forms.css:75)。 对照：[案例 72](./2026-10-12-leave-baseline-gallery.html#case-72)、[案例 73](./2026-10-12-leave-baseline-gallery.html#case-73)。

### F06 Guest Visit 与其他 Workplace 表单不同

**P2 · 源码及浏览器**

当前：Guest Visit card 22px、Visit Details 标题 18px、control radius 13px；Letter / Inventory / Booking 已接近 Leave。

统一方向：同用途表单采用 card 24px、section 20px、control radius 14px；保留访客及内部出席者流程。

位置：[modules/admin/css/guest-visit.css:3](/C:/Users/loong/PQ-Mobile/modules/admin/css/guest-visit.css:3)；[css/claim-forms.css:584](/C:/Users/loong/PQ-Mobile/css/claim-forms.css:584)。 对照：[案例 74](./2026-10-12-leave-baseline-gallery.html#case-74)、[案例 75](./2026-10-12-leave-baseline-gallery.html#case-75)。

### F07 Final OT Request 表单仍使用旧规格

**P2 · 源码确认；已检查整页，未专门测量完整编辑状态**

当前：ot-form-card 为 22px；section 13px uppercase；controls radius 12px、600 字重。

统一方向：与普通 Leave 申请表单统一容器、标题和输入框规格。

位置：[css/attendance-overtime.css:46](/C:/Users/loong/PQ-Mobile/css/attendance-overtime.css:46)；[css/attendance-overtime.css:49](/C:/Users/loong/PQ-Mobile/css/attendance-overtime.css:49)；[css/attendance-overtime.css:58](/C:/Users/loong/PQ-Mobile/css/attendance-overtime.css:58)。

### F08 New User Details 的字体与表单容器较小

**P3 · 源码及浏览器**

当前：当前 card 18px、section 14px、labels 11.5px、controls 12px / radius 13px。

统一方向：后续可统一字体与留白；必须保留用户指定的所有输入一行一个，包括 Months / Days。

位置：[modules/employee-career/css/confirm-new-user-details.css:172](/C:/Users/loong/PQ-Mobile/modules/employee-career/css/confirm-new-user-details.css:172)；[modules/employee-career/css/confirm-new-user-details.css:234](/C:/Users/loong/PQ-Mobile/modules/employee-career/css/confirm-new-user-details.css:234)。 对照：[案例 138](./2026-10-12-leave-baseline-gallery.html#case-138)、[案例 139](./2026-10-12-leave-baseline-gallery.html#case-139)。

### F09 Change Request 表单及 History 使用另一套组件

**P2 · 表单源码及浏览器；History 细节为源码确认**

当前：编辑 field card 14px、controls radius 10px / padding 9px 12px；History card 12px，标题写 History CSV，但内容实际为卡片及字段差异表。

统一方向：统一可比的文字、输入框与记录卡留白，修正 History 标题；保留修改标记及新旧字段比较。

位置：[css/app.css:7396](/C:/Users/loong/PQ-Mobile/css/app.css:7396)；[css/app.css:7465](/C:/Users/loong/PQ-Mobile/css/app.css:7465)；[css/app.css:7556](/C:/Users/loong/PQ-Mobile/css/app.css:7556)；[change-request.html:865](/C:/Users/loong/PQ-Mobile/change-request.html:865)。 对照：[案例 76](./2026-10-12-leave-baseline-gallery.html#case-76)。

### A01 上传后的附件行仍有独立规格

**P3 · 源码确认；未逐页上传附件验证所有上传后状态**

当前：Project 行 padding 8px 10px / icon 28px；Payroll / Guest Visit 使用不同图标、删除按钮和文件名字号。上传动作按钮本身已被全局样式统一。

统一方向：复用 Leave 附件行 padding 9px 10px、icon 30px、filename 11.5px、remove 28px；保留下载等业务操作。

位置：[css/app.css:9121](/C:/Users/loong/PQ-Mobile/css/app.css:9121)；[css/project-task-forms.css:41](/C:/Users/loong/PQ-Mobile/css/project-task-forms.css:41)；[css/payroll-request-forms.css:39](/C:/Users/loong/PQ-Mobile/css/payroll-request-forms.css:39)；[modules/admin/css/guest-visit.css:109](/C:/Users/loong/PQ-Mobile/modules/admin/css/guest-visit.css:109)。

### S01 Career / Workplace 文档状态卡尺寸不同

**P2 · 源码及浏览器**

当前：实测 76px，数字 18px / 800、状态 10.5px、说明 9px / 700；Leave、Attendance、Claims、Payroll、Project 使用 80px 标准。

统一方向：复用 work-status：80px、16px radius、数字 18px / 900、状态 11px、说明 9.5px / 600。

位置：[css/work-status.css:25](/C:/Users/loong/PQ-Mobile/css/work-status.css:25)；[modules/employee-career/css/employee-career.css:17](/C:/Users/loong/PQ-Mobile/modules/employee-career/css/employee-career.css:17)；[modules/admin/css/admin.css:60](/C:/Users/loong/PQ-Mobile/modules/admin/css/admin.css:60)。 对照：[案例 1](./2026-10-12-leave-baseline-gallery.html#case-1)、[案例 77](./2026-10-12-leave-baseline-gallery.html#case-77)、[案例 78](./2026-10-12-leave-baseline-gallery.html#case-78)、[案例 79](./2026-10-12-leave-baseline-gallery.html#case-79)、[案例 80](./2026-10-12-leave-baseline-gallery.html#case-80)、[案例 81](./2026-10-12-leave-baseline-gallery.html#case-81)、[案例 82](./2026-10-12-leave-baseline-gallery.html#case-82)。

### HC01 有状态记录卡的 18px / 20px 圆角混用

**P2 · History 页面源码及浏览器；Booking / Final OT 为源码确认**

当前：Payroll / Career / Workplace History 使用 18px；Final OT 状态记录、Workplace Booking / Calendar 也有 18px 独立规则。

统一方向：有状态 History 按 Leave 的 20px 统一；无状态 Attendance Summary 保留仓库要求的 18px。

位置：[leave.html:544](/C:/Users/loong/PQ-Mobile/leave.html:544)；[css/payroll-history.css:26](/C:/Users/loong/PQ-Mobile/css/payroll-history.css:26)；[modules/admin/css/workplace-history.css:5](/C:/Users/loong/PQ-Mobile/modules/admin/css/workplace-history.css:5)；[css/attendance-overtime.css:21](/C:/Users/loong/PQ-Mobile/css/attendance-overtime.css:21)；[modules/admin/css/book-resource.css:26](/C:/Users/loong/PQ-Mobile/modules/admin/css/book-resource.css:26)。 对照：[案例 8](./2026-10-12-leave-baseline-gallery.html#case-8)、[案例 95](./2026-10-12-leave-baseline-gallery.html#case-95)、[案例 97](./2026-10-12-leave-baseline-gallery.html#case-97)。

### HC02 Project History 的手机留白更紧

**P3 · 源码及浏览器**

当前：<=380px 时外层 padding 13px，内层 details 11px 12px、行文字 11px。

统一方向：同用途 History 采用 Leave 外层 16px 18px、内层 12px、行文字约 11.5px。

位置：[css/project-task.css:2187](/C:/Users/loong/PQ-Mobile/css/project-task.css:2187)；[css/project-task.css:1714](/C:/Users/loong/PQ-Mobile/css/project-task.css:1714)。 对照：[案例 58](./2026-10-12-leave-baseline-gallery.html#case-58)、[案例 59](./2026-10-12-leave-baseline-gallery.html#case-59)。

### HC03 Cancelled 状态在 CV History 使用红色

**P2 · 源码确认；本轮未打开每条 CV Cancelled 记录**

当前：Career CV History cancelled border / badge 使用红色；Leave cancelled 使用灰色，rejected 才使用红色。

统一方向：统一取消 / 拒绝的状态颜色语义，保留状态文本与记录。

位置：[modules/employee-career/css/employee-career-history.css:47](/C:/Users/loong/PQ-Mobile/modules/employee-career/css/employee-career-history.css:47)；[leave.html:579](/C:/Users/loong/PQ-Mobile/leave.html:579)；[leave.html:659](/C:/Users/loong/PQ-Mobile/leave.html:659)。

### D01 Career Team 普通详情标题仍有局部覆盖

**P2 · 源码及浏览器**

当前：Staff Feedback / Whereabout / Events 用高优先级规则将标题改成 14px、非 uppercase、不同 tracking；Whereabout 实测 14px。

统一方向：使用普通 Leave Detail 的 16px / 800 标题；需要多行时统一可读性规则。

位置：[css/detail-popout.css:74](/C:/Users/loong/PQ-Mobile/css/detail-popout.css:74)；[modules/employee-career/css/staff-feedback.css:40](/C:/Users/loong/PQ-Mobile/modules/employee-career/css/staff-feedback.css:40)；[modules/employee-career/css/staff-whereabout.css:37](/C:/Users/loong/PQ-Mobile/modules/employee-career/css/staff-whereabout.css:37)；[modules/employee-career/css/staff-events.css:36](/C:/Users/loong/PQ-Mobile/modules/employee-career/css/staff-events.css:36)。 对照：[案例 99](./2026-10-12-leave-baseline-gallery.html#case-99)、[案例 100](./2026-10-12-leave-baseline-gallery.html#case-100)。

### D02 Career / Workplace 审批详情未完全采用共用 header

**P2 · Workplace 实际详情已浏览器验证；Career 当前队列为空，只打开空详情外壳测量样式**

当前：360px 下标题实测 14px，close 为 22px 透明按钮，header 高度由内容决定；共用 detail adapter 未覆盖这两个 ID。

统一方向：普通审批详情采用 50px header、16px 标题、30px 白色圆形 close，并保留现有业务资料及动作。

位置：[js/detail-popout.js:4](/C:/Users/loong/PQ-Mobile/js/detail-popout.js:4)；[css/payroll-pending-approval.css:75](/C:/Users/loong/PQ-Mobile/css/payroll-pending-approval.css:75)；[css/payroll-pending-approval.css:132](/C:/Users/loong/PQ-Mobile/css/payroll-pending-approval.css:132)；[modules/admin/css/workplace-pending-approval.css:8](/C:/Users/loong/PQ-Mobile/modules/admin/css/workplace-pending-approval.css:8)。 对照：[案例 141](./2026-10-12-leave-baseline-gallery.html#case-141)、[案例 142](./2026-10-12-leave-baseline-gallery.html#case-142)。

### D03 Project Calendar Timesheet 详情的 header / close 不同

**P3 · 源码及浏览器**

当前：Calendar detail panel 已为 18px，标题 16px；header 实测 48px、close 20px，未使用共享详情 adapter。Team Project 的 28px 底部任务列表属于不同用途。

统一方向：普通 Timesheet 详情统一 header 50px、close 30px；保留活动字段。不要仅为统一外观把专用任务列表改成普通详情表。

位置：[modules/project-task/index.html:199](/C:/Users/loong/PQ-Mobile/modules/project-task/index.html:199)；[css/project-task.css:2039](/C:/Users/loong/PQ-Mobile/css/project-task.css:2039)；[js/detail-popout.js:4](/C:/Users/loong/PQ-Mobile/js/detail-popout.js:4)。

### N01 Shift Planning 四种 Summary 不符合规定的标题行

**P1 · 源码及浏览器**

当前：Work Shift / No Work / OT Plan / Leave Summary 已有 18px 外框、无左日期 badge，但都缺右 chevron，使用满宽紫色 header 和细项格子。

统一方向：采用 history-time-row 左标题、右 fa-chevron-right、下面 key-value rows，遵守 AGENTS.md。

位置：[modules/attendance/options/shift-plan.html:588](/C:/Users/loong/PQ-Mobile/modules/attendance/options/shift-plan.html:588)；[modules/attendance/options/shift-plan.html:1320](/C:/Users/loong/PQ-Mobile/modules/attendance/options/shift-plan.html:1320)；[modules/attendance/options/shift-plan.html:1391](/C:/Users/loong/PQ-Mobile/modules/attendance/options/shift-plan.html:1391)；[modules/attendance/options/shift-plan.html:2839](/C:/Users/loong/PQ-Mobile/modules/attendance/options/shift-plan.html:2839)。 对照：[案例 127](./2026-10-12-leave-baseline-gallery.html#case-127)、[案例 128](./2026-10-12-leave-baseline-gallery.html#case-128)、[案例 129](./2026-10-12-leave-baseline-gallery.html#case-129)、[案例 130](./2026-10-12-leave-baseline-gallery.html#case-130)。

### H01 Benefit / Expense Highlight 的动态期间字体丢失

**P2 · 源码及浏览器**

当前：实测 period value 为 16px / 400 / Plus Jakarta Sans；旧静态模板样式被动态 renderer 替换。

统一方向：按 Leave Highlight 日期栏使用 12.5px / 800 / monospace，并放入共享 CSS。

位置：[js/claims/claims-highlight-shared.js:68](/C:/Users/loong/PQ-Mobile/js/claims/claims-highlight-shared.js:68)；[modules/claims/options/benefit-highlight.html:141](/C:/Users/loong/PQ-Mobile/modules/claims/options/benefit-highlight.html:141)；[leave.html:12717](/C:/Users/loong/PQ-Mobile/leave.html:12717)。 对照：[案例 18](./2026-10-12-leave-baseline-gallery.html#case-18)、[案例 19](./2026-10-12-leave-baseline-gallery.html#case-19)、[案例 20](./2026-10-12-leave-baseline-gallery.html#case-20)。

### B01 Benefit Entitlement 金额超出四列栏位

**P1 · 源码及浏览器**

当前：实际字体下，360px 的 RM 1,000.00 内容宽 77px、栏位仅 57px；420px 栏位 72px，仍装不下。多项金额被挤到相邻栏。

统一方向：保留四项余额含义，窄屏调整成能完整容纳金额的列布局；不要靠隐藏溢出或省略号掩盖金额。

位置：[modules/claims/options/staff-entitlement.html:127](/C:/Users/loong/PQ-Mobile/modules/claims/options/staff-entitlement.html:127)；[modules/claims/options/staff-entitlement.html:150](/C:/Users/loong/PQ-Mobile/modules/claims/options/staff-entitlement.html:150)。 对照：[案例 14](./2026-10-12-leave-baseline-gallery.html#case-14)、[案例 133](./2026-10-12-leave-baseline-gallery.html#case-133)。

### FL01 Payroll / Career / Workplace History Filter 混用输入框

**P2 · 源码及浏览器**

当前：日期输入实测 12px / radius 13px / padding 12px 10px，同一 panel 的 selects 却为 13.5px / radius 16px。

统一方向：日期、搜索及 selects 同用 Leave Filter 的 13.5px / 700、radius 16px、min-height 48px。

位置：[css/payroll-history.css:51](/C:/Users/loong/PQ-Mobile/css/payroll-history.css:51)；[modules/payroll/options/history.html:70](/C:/Users/loong/PQ-Mobile/modules/payroll/options/history.html:70)；[modules/employee-career/options/history.html:76](/C:/Users/loong/PQ-Mobile/modules/employee-career/options/history.html:76)；[modules/admin/options/history.html:64](/C:/Users/loong/PQ-Mobile/modules/admin/options/history.html:64)。 对照：[案例 16](./2026-10-12-leave-baseline-gallery.html#case-16)、[案例 96](./2026-10-12-leave-baseline-gallery.html#case-96)、[案例 98](./2026-10-12-leave-baseline-gallery.html#case-98)、[案例 134](./2026-10-12-leave-baseline-gallery.html#case-134)、[案例 135](./2026-10-12-leave-baseline-gallery.html#case-135)。

### FL02 动态 Pending Approval Filter 使用另一套规格

**P2 · 源码及浏览器**

当前：Workplace / Career / Payroll / Claims 实测 heading 16px、controls 12px / 600；panel 26px，Apply 46px。Attendance 使用同一动态 filter。

统一方向：采用 Leave standard-filter：panel 28px、heading 18px、controls 13.5px / 700、48px Apply、共用 Reset / close。

位置：[css/pending-approval-filter.css:14](/C:/Users/loong/PQ-Mobile/css/pending-approval-filter.css:14)；[js/pending-approval-filter.js:77](/C:/Users/loong/PQ-Mobile/js/pending-approval-filter.js:77)；[css/app.css:102](/C:/Users/loong/PQ-Mobile/css/app.css:102)；[js/app.js:1822](/C:/Users/loong/PQ-Mobile/js/app.js:1822)。 对照：[案例 123](./2026-10-12-leave-baseline-gallery.html#case-123)、[案例 124](./2026-10-12-leave-baseline-gallery.html#case-124)、[案例 125](./2026-10-12-leave-baseline-gallery.html#case-125)、[案例 126](./2026-10-12-leave-baseline-gallery.html#case-126)、[案例 140](./2026-10-12-leave-baseline-gallery.html#case-140)。

### FL03 Team Tax Relief 筛选摘要没有采用共用摘要栏

**P3 · 源码及浏览器**

当前：使用 DATA FILTER 标签及独立 trigger，没有 Current Filter 前的 fa-filter；打开后的筛选 panel 本身已标准化。

统一方向：摘要栏沿用 Leave 的 Current Filter、图标、文字及筛选按钮尺寸。

位置：[modules/payroll/options/tax-relief.html:36](/C:/Users/loong/PQ-Mobile/modules/payroll/options/tax-relief.html:36)；[css/team-tax-relief.css:84](/C:/Users/loong/PQ-Mobile/css/team-tax-relief.css:84)；[js/app.js:1606](/C:/Users/loong/PQ-Mobile/js/app.js:1606)。

### T01 同类报表表格的文字与行密度不同

**P3 · 源码及浏览器**

当前：Claims Highlight cell padding 12px 14px；My Event、Manpower、Asset 的表头 tracking、padding、字号各有独立值。紫色表头、zebra、数字对齐基本一致。

统一方向：同类 report 参考 Leave th 14px 16px、11px / 800，td 13px 16px、12px；保留业务列宽和横向滚动。

位置：[leave.html:4579](/C:/Users/loong/PQ-Mobile/leave.html:4579)；[js/claims/claims-highlight-shared.js:41](/C:/Users/loong/PQ-Mobile/js/claims/claims-highlight-shared.js:41)；[modules/employee-career/css/my-event.css:9](/C:/Users/loong/PQ-Mobile/modules/employee-career/css/my-event.css:9)；[modules/employee-career/css/manpower-statistics.css:4](/C:/Users/loong/PQ-Mobile/modules/employee-career/css/manpower-statistics.css:4)；[modules/admin/css/asset-highlight.css:18](/C:/Users/loong/PQ-Mobile/modules/admin/css/asset-highlight.css:18)。 对照：[案例 12](./2026-10-12-leave-baseline-gallery.html#case-12)、[案例 83](./2026-10-12-leave-baseline-gallery.html#case-83)、[案例 84](./2026-10-12-leave-baseline-gallery.html#case-84)、[案例 91](./2026-10-12-leave-baseline-gallery.html#case-91)、[案例 94](./2026-10-12-leave-baseline-gallery.html#case-94)。

### C01 部分同类主图表的标题及中心数值略有不同

**P3 · 当前源码确认；主图表已浏览器打开，未逐个测量所有中心数值**

当前：Claim 主 donut 标题 17px，Staff Feedback 中心 18px、Asset 中心 20px；Leave 主图表标题 18px / 中心 22px。Claim Analysis 与 Leave Analysis 已相同，不应记为差异。

统一方向：统一同用途图表的文字层级；金额长度、图表类型、分类颜色可按业务保留。

位置：[leave.html:4693](/C:/Users/loong/PQ-Mobile/leave.html:4693)；[modules/claims/options/benefit-highlight.html:443](/C:/Users/loong/PQ-Mobile/modules/claims/options/benefit-highlight.html:443)；[modules/employee-career/css/staff-feedback.css:63](/C:/Users/loong/PQ-Mobile/modules/employee-career/css/staff-feedback.css:63)；[modules/admin/css/asset-highlight.css:32](/C:/Users/loong/PQ-Mobile/modules/admin/css/asset-highlight.css:32)。

## 已一致及需要保留的差异

- 检查到的员工卡基本遵守姓名下方 #ID；View Chart 已使用 pie icon、文案及 nowrap。报表独立 Emp # / Name 列、只读表格独立字段不作为员工卡违规。
- Attendance 三种审批详情标题符合 OT Plan Approval / Attendance Advice Approval / Final OT Approval。
- Attendance、Claims、Payroll、Project Dashboard 状态卡已接近 Leave；多数普通详情已由 detail-popout adapter 统一。旧上传动作按钮大小差异也已被全局样式统一，未重复计为问题。
- Career 的固定展开 Expiry / Staff Events、新用户 Pending Approval 风格卡片与 72px 人像、新用户详情所有输入单栏，均为用户明确指定的设计，保留。新用户详情 F08 仅为文字及留白差异。
- Payslip、EA Form、新闻 / 政策文档、图表类型、Benefit 余额含义、Project 专用任务列表保留业务布局；不强行转换成 Leave 表单或普通详情。
- Claim Analysis 与 Leave Analysis 的标题及中心数字已相同；Benefit Claim 的余额采用更小字体和省略规则，与 Staff Entitlement B01 的实测金额溢出不同。

## 覆盖与限制

源码涵盖现有模块及共享组件，浏览器覆盖入口和所列条件视图；这不是对所有业务状态、后端数据或完整审批流程的验证。Career Pending Approval 当前无记录，案例 142 仅打开空详情外壳核对样式。附件上传后外观、部分 CV / Booking 状态及少量图表字体由源码确认，已在发现中注明。

旧入口及直接访问版本在 CSV 单独标记，不混入当前主路由缺陷。例如 modules/me/index.html 的缺失 option 目标、me-accordion 的旧 ID、team-v2 的浅色导航属于次级页面；team.html 因当前 router 仍使用它，纳入主要发现。Career Onboard / Staff Engagement 等占位页没有真实表单、历史或详情可比较。

主审查截图在随后 Attendance Performance 新增 Position 前采集。该独立请求已完成：12 张卡的 Branch 下一行显示 Position，当前未提供职位资料，值为 —；360 / 420px × light / dark 的卡片排版、员工 ID 和筛选检查通过。当前预览见 [Attendance Performance](../../scratch/attendance-performance-directory-dark-360.png)。

更细的模块证据：[Attendance / Claims](../../scratch/leave-baseline-audit-20261012/attendance-claims.md)、[Career / Workplace](../../scratch/leave-baseline-audit-20261012/career-workplace.md)、[Payroll / Project / Shared](../../scratch/leave-baseline-audit-20261012/payroll-project-shared.md)。这些源笔记中的可疑项以本报告的浏览器复核和适用性判断为准。
