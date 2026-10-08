# PeopleHCM Web

原有 PeopleHCM Mobile 的企业 Web 前端，使用 React、TypeScript、Vite，默认珍珠灰与岩灰蓝 Neumorphism 设计，深色模式使用石墨灰。点击模块会显示原有个人／团队功能菜单；8 个模块提供 115 个真实功能入口。项目保留全部 118 个在用及替代业务页面，原有字段、业务脚本、计算、审批和本地记录流程保持在浏览器整页中运行。数据库导出另外包含 4 个 `no/` 目录的旧版存档页。

## 启动

需要 Node.js 22.12 或以上。已安装的依赖包含在当前交付目录中；换电脑或依赖不存在时先运行 `npm.cmd ci`。

```powershell
cd C:\Users\loong\Documents\PeopleHCM-Web
npm.cmd run dev
```

浏览器打开 http://127.0.0.1:5173 。不要直接双击 `index.html`，业务文档、路由和字体需要 HTTP 静态服务。

```powershell
npm.cmd run build
npm.cmd run preview
```

生产预览地址为 http://127.0.0.1:4173 。`dist/` 可交给静态 Web 服务器，以站点根目录部署。所有业务资料仍保留在项目内，未部署到外部服务。

## 统一主题与语言

左侧“Preferences / 偏好设置”可以切换浅色/深色、中英文和主色。岩灰蓝、灰绿、森林绿、古铜为现成选项，也支持任意自定义颜色。一次设置应用到所有业务页面，浏览器会记住选择。旧版本的默认深青主色会一次性升级为岩灰蓝；其他自定义主色和语言选择保留。

- 默认主色与偏好：`src/lib/core.ts` 的 `defaultPreferences`。
- 设计变量、阴影、字体、圆角：`src/styles/tokens.css`。
- Web 外壳文案：`src/i18n/catalogue.ts`。
- 原有业务页面文案：`public/web-adapter/translations.js`。
- 业务页面统一桌面样式：`public/web-adapter/desktop.css`。

员工姓名、编号、用户输入、数据记录和下拉框业务选项保留原文。部分原代码直接读取选项显示文字进行计算或保存，因此业务选项不作翻译；字段标签、按钮、提示等界面文案使用集中语言表。新增文案请在两个集中语言文件中补齐。

## 维护结构

| 位置 | 用途 |
| --- | --- |
| `src/` | 类型化 Web 外壳、首页、导航、全局搜索、收藏和偏好设置 |
| `src/config/moduleNavigation.ts` | 115 个原有功能选项的类型化配置、个人／团队范围和真实业务地址 |
| `src/components/EnterpriseShell.tsx` | 首页、模块入口和所有业务页面共用的桌面侧栏、导航与工具栏 |
| `src/business.tsx` | 在顶层业务文档中挂载统一桌面工作区，并保留原 DOM 和事件处理 |
| `src/generated/pages.json` | 全部业务页面的中英文标题和路由清单 |
| `public/workspace/` | 118 个源业务页面及完整 CSS/JS/附件依赖；另有 11 个修复失效链接的跳转页 |
| `public/web-adapter/` | 通用桌面布局、主题与语言适配，不替换业务计算或状态流程 |
| `public/vendor/` | 本地字体和图标，常用字体/图标无需依赖原 CDN |
| `source-snapshot/` | 本次迁移的原项目冻结快照；SQL 和页面迁移共同使用这份基线 |
| `database/peoplehcm-source.sql` | MySQL 8 可导入的全部来源资料、字段、数据快照及原始文件档案 |
| `docs/page-inventory.json` | 页面、字段、选项、处理函数、依赖和本地存储键的清单 |
| `docs/feature-parity.md` | 模块和流程覆盖、源项目既有未接通功能 |
| `docs/verification/` | 浏览器测试报告和桌面/移动截图 |

首页和模块功能菜单是 React 页面；每个业务功能通过正常网页导航进入独立的顶层文档，共用同一套 React 桌面工作区。没有业务 iframe，没有固定高度手机容器，长表单使用浏览器页面滚动。独立文档隔离原有全局脚本，保留原始控件节点、事件、数据和流程。业务脚本仍来自冻结快照，尚未逐个改写为 React；这保证现有流程可继续运行，也允许后续逐模块重构。开发与生产环境均加载 `web-entry.js`，生产构建会自动生成业务入口和样式引用。

## 数据与后端边界

按要求没有新增后端或 MySQL 连接。原项目保存到浏览器的草稿、预约、审批等继续使用本地存储；原项目仅显示提示、模拟提交或附件文件名的地方保留其原行为，不代表已经上传、发送或写入服务器。

MySQL 导入方式、数据表说明、查询示例和导出限制见 `database/README.md`。SQL 导出保留原来源，不擅自合并不同示例中的员工资料；源代码中无法在初始状态求值的表达式已标记 `source_only`，完整表达式和原文件均保存。未提供原生产数据库，交付数据范围为项目中实际存在的资料。

## 检查与重新生成

```powershell
npm.cmd test
node database/verify-export.mjs
npm.cmd run build
npm.cmd run preview
# 另开一个终端，运行真实浏览器检查：
npm.cmd run test:browser
```

浏览器测试默认使用已安装的 Google Chrome，可设置 `CHROME_PATH`。`WEB_URL` 可更改测试地址。数据导出可传 `--chrome` 指定 Chrome。

```powershell
# 默认使用 source-snapshot；脚本可重复运行：
npm.cmd run inventory
npm.cmd run migrate
npm.cmd run export:sql
```

要迁移原 Mobile 的后续修改，应先更新一份完整快照，再从同一份快照重新生成页面清单、Web 文件和 SQL，避免混合不同版本。原 Mobile 项目没有被本次迁移修改。

SQL 原始字节与 JSON 校验已经执行；当前环境没有 MySQL 服务，因此没有执行实际 MySQL 导入。生产认证、权限和服务端校验留待后续后端实施。
