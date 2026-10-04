# People Mobile 全系统一致性验收

日期：2026-10-04  
范围：`C:\Users\loong\PQ-Mobile` 当前正式 Mobile 路由。  
排除：`C:\Users\loong\Documents\PeopleHCM-Web`、`no/**`、未被当前 router 使用的旧入口。

## 结果

三个领域审计最初确认 33 项问题：Attendance/Leave 6 项、Claims/Benefits/Travel 14 项、Payroll/Project/Me/Shared 13 项。运行时扫描另外发现并修复了未定义动作处理器、View Chart nowrap、Pending Approval filter、phantom draft 与用户可见乱码。

当前正式 Mobile 路由在本次覆盖范围内没有遗留的已知一致性问题。

## 已完成的主要修复

- Employee ID 在员工卡片中统一为姓名正下方的 `#...` muted monospace 行。
- 当前登录员工统一为 Sarah Jenkins / `#EBB01`；Payroll 文件、Me、Home、drawer、Salary 与 Bonus 不再互相冲突。
- View Chart 统一为 pie-chart icon + `View Chart` 的单行 pill，并为原本无动作的图表按钮补上真实 chart modal。
- Attendance 三种审批标题保持精确规范，详情改为读取被选中的真实记录。
- Attendance、Leave、Claims、Payroll 的 pending/count/KPI 改为从当前记录计算。
- Benefit 类别标签与图表使用统一紫色体系；`Benefit Highlight` 标题统一为单数。
- Claims 的 Highlight、Entitlement、Summary、History、Travel、Benefit Claim 共用一致的数据来源；筛选会真实更新记录、KPI 与详情。
- Project/Team/Payroll 的 Approve、Reject、Resubmit、Submit、Cancel、Discard 等动作会真实改变并保存状态。
- Project History 保留全部同状态记录并正确读取 draft；phantom draft 已修复。
- Calendar 会按选择的年月生成正确天数和日期详情。
- Change Request edit/delete/toggle/save/submit 使用同一份 draft/history 状态。
- EA Print、Salary/Bonus export 与 audit 已从 toast stub 改为真实输出或对话框。
- Favourite、Team Home、theme query persistence 与 filter contract 已统一。
- 当前正式代码的 mojibake 静态扫描为 0 命中。

## 最终 fresh verification

- 全项目审计：88 个 HTML 页面完成运行时扫描；0 syntax error、0 page error、0 duplicate ID、0 View Chart violation。
- Attendance/Leave focused suites：全部通过。
- Claims consistency：16/16。
- Detail pop-out：92/92。
- Payroll/Project/Me focused suite：通过。
- Pending Approval filters：Claims、Attendance、Leave、Payroll 全部通过；dark/light mobile panel 无浏览器错误。
- 现有 Leave/Benefit/Expense/Project/Payroll/dashboard/history-card 回归在最终相关运行中通过。
- 正式代码 mojibake scan：0 files / 0 matches。

## 旧入口说明

完整扫描仍会列出 `light.html`、`modules/leave/index.html`、`modules/me/index.html` 和 `no/**` 的旧链接或旧处理器。这些页面不在当前 `APP_ROUTES` 正式流程中，因此没有计入当前 Mobile 缺陷。它们可在后续清理任务中删除或重定向，避免未来误用。

## 详细报告

- `docs/audits/attendance-leave-consistency.md`
- `docs/audits/claims-benefits-travel-consistency.md`
- `docs/audits/payroll-project-me-consistency.md`

本次没有执行 Git commit、Git add、Git push，也没有读取或修改 PeopleHCM-Web。
