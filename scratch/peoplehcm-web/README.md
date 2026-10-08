# PeopleHCM Web

PeopleHCM Mobile 的企业 Web 前端，使用 React、TypeScript、Vite。默认珍珠灰与岩灰蓝 Neumorphism 设计，深色模式使用石墨灰。8 个模块提供 115 个真实个人／团队功能入口，保留全部 118 个业务页面的原有字段、脚本、计算、审批和本地记录流程。MySQL 8 导出另包含 4 个旧版存档页。

## 启动与构建

需要 Node.js **22.18 或以上**，以支持测试直接加载 TypeScript。交付目录已有依赖；换电脑时先运行 `npm.cmd ci`。

```powershell
cd C:\Users\loong\Documents\PeopleHCM-Web
npm.cmd run dev
```

打开 http://127.0.0.1:5173 。也可以使用 `Start-Web.cmd`。业务路由和本地资源需要 HTTP 服务，请使用启动命令打开项目。

```powershell
npm.cmd run build
npm.cmd run preview
```

生产预览为 http://127.0.0.1:4173 。`dist/` 可部署到静态 Web 服务器的站点根目录。

## 目录与职责

```text
src/
  app/                 应用入口、布局、路由、模块注册、业务文档挂载
  features/            按业务职责管理功能
    attendance/        考勤菜单
    leave/             请假菜单
    claims/            报销菜单
    payroll/           薪资菜单
    employee-career/   员工发展菜单
    project-task/      项目任务菜单
    admin/             行政办公菜单
    profile/           个人资料菜单
    overview/          首页
    application-directory/  功能目录、搜索、收藏
    preferences/       主题与语言设置
  shared/              通用类型、配置、主题、语言、存储、路径与设计变量
public/
  workspace/           原业务页面及依赖，保持原相对网址
  web-adapter/         业务页面桌面布局、主题、语言适配
  vendor/              本地字体和图标
  data/                完整导出资料目录
source-snapshot/       冻结原项目，迁移与数据导出的共同基线
database/              MySQL 8 SQL、导出清单、数据库说明
tooling/
  migration/           页面清点、迁移、SQL 导出
  verification/        SQL 校验与浏览器检查工具
  shared/              工具专用项目路径
tests/
  unit/                纯逻辑测试
  integration/         菜单、原始数据、控件保留、目录依赖检查
  e2e/                 真实浏览器流程测试
docs/
  architecture/        当前架构与维护规则
  generated/           自动生成清单
  plans/               实施记录
  reports/             当前验证报告与截图
  archive/             被替代方案和历史证据
```

依赖方向为 `app → features → shared`，应用可以直接使用公共代码。每个功能模块只依赖自己的文件和公共代码；公共代码不能依赖应用或业务模块。`npm.cmd test` 会检查越层依赖、循环引用和入口文件一致性。

业务菜单由各模块的 `navigation.ts` 维护，再由 `src/app/navigation/module-registry.ts` 统一装配。布局位于 `src/app/layout/`；首页、目录和偏好页面各归所属功能。样式按布局与功能归属拆分，由 `src/app/styles/application.css` 按原顺序组合。

详细规则见 [项目结构](docs/architecture/project-structure.md)，完整文档入口见 [docs/README.md](docs/README.md)。生成清单与冻结快照不应手工修改；新增功能应放入对应业务目录，在应用层注册，并维护中英文标签与实际业务地址。

## 主题与语言

左侧 Preferences / 偏好设置可切换浅色／深色、中英文和主色，一次设置应用到所有页面并保存在浏览器。支持岩灰蓝、灰绿、森林绿、古铜和自定义颜色。

| 修改内容 | 位置 |
| --- | --- |
| 默认主色与偏好 | `src/shared/theme/preferences.ts` |
| 颜色、阴影、字体、圆角变量 | `src/shared/styles/tokens.css` |
| Web 外壳文案 | `src/shared/i18n/catalogue.ts` |
| 原业务页面文案 | `public/web-adapter/translations.js` |
| 原业务页面桌面样式 | `public/web-adapter/desktop.css` |

员工资料、用户输入、数据和下拉框业务选项保留原值。原业务部分直接使用选项文字计算或保存，因此这些业务选项保留原文；界面字段标签、按钮和提示使用集中语言表。

## 业务与数据边界

首页、菜单和企业工作区使用 React/TypeScript。原业务页面通过正常网页导航进入独立顶层文档，共用桌面外壳，长表单由浏览器页面滚动。原始 DOM 控件、监听器和脚本保留在 `public/workspace/`，尚未逐页面改写为 React；这是明确的迁移兼容边界，后续可逐模块替换。详见 [业务文档边界](docs/architecture/business-document-boundary.md)。

按要求未新增后端或数据库连接。原浏览器草稿和记录继续使用本地存储；原项目的模拟提交、提示和附件文件名展示保留其原行为。SQL 保存项目实际存在的数据、字段定义及原文件，不包含未提供的生产数据库资料。MySQL 导入与表结构说明见 [database/README.md](database/README.md)。SQL 字节和 JSON 已校验，当前环境没有 MySQL 服务，未执行真实数据库导入。

## 验证与重新生成

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run verify:sql
npm.cmd run build
npm.cmd run preview
# 另开终端运行真实浏览器检查：
npm.cmd run test:e2e
npm.cmd run review:options
```

`test:unit`、`test:integration` 可独立运行；`test:browser` 与 `test:e2e` 是同一浏览器流程命令。浏览器工具默认使用本地 Google Chrome，支持 `CHROME_PATH` 和 `WEB_URL`。SQL 导出支持 `--chrome`、`--date`，其他参数见数据库说明。

```powershell
# 从交付项目的冻结快照重新生成：
npm.cmd run inventory
npm.cmd run migrate
npm.cmd run export:sql
```

更新 Mobile 来源时，先建立完整新快照，再从同一快照重新生成页面、清单和 SQL，避免混合版本。所有相对路径由工具统一解析到项目根目录。
