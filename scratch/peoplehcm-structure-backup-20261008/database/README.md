# MySQL 8 数据导出

`peoplehcm-source.sql` 保存原项目已有的数据、表单定义及原始文件快照。Web 前端不连接 MySQL；这个 SQL 文件是后续接入后台时可导入的数据交付物。

| 内容 | 数量 |
| --- | ---: |
| 原始文件，含 HTML / JS / CSS / 图片 | 276 |
| 原始文件字节，逐字节保留 | 9,179,114 |
| 页面，含原项目保留的旧版本 | 122 |
| input / select / textarea 实例 | 1,166 |
| select 选项 | 1,671 |
| 数据及初始化状态快照 | 6,671 |
| 已求值快照 | 6,414 |
| 需要用户输入等条件的原表达式 | 257 |
| 带 JSON 路径的数组记录 | 30,867 |
| 员工引用 / 不重复员工编号 | 2,836 / 194 |

这些数量包含原项目的重复页面、各页面共享数据及界面状态，不能当作生产业务记录或员工人数。不同来源中相同员工编号的资料分别保留，不擅自合并。

## 导入

先启动 MySQL 8 命令行客户端；在客户端内执行以下命令。这样在 Windows PowerShell 中无需使用不支持的 `<` 重定向。

```sql
CREATE DATABASE peoplehcm_web CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE peoplehcm_web;
SOURCE database/peoplehcm-source.sql;
```

`SOURCE` 路径相对于客户端启动目录，也可以改成 SQL 文件的绝对路径。请导入空数据库。脚本使用 InnoDB，建表后将所有数据插入放在同一个事务中；DDL 本身不属于这个事务。脚本不会删除已有表或数据。重复导入到同一数据库会触发主键冲突。

## 查询示例

```sql
-- 原始 fixture，而非页面重复加载的快照。
SELECT source_path, dataset_name, data_json
FROM datasets
WHERE extraction_phase = 'static_evaluation'
  AND dataset_name = 'window.HOURS_COSTING_REPORT';

-- 查看某页面所有字段和选项。
SELECT f.element_id, f.input_type, f.definition
FROM form_fields f
JOIN source_pages p ON p.id = f.page_id
WHERE p.page_path = 'modules/employee-career/options/team/confirm-new-user-details.html'
ORDER BY f.ordinal;

-- 员工引用按来源保留，编号仍为字符串，保留前导零。
SELECT d.source_path, e.emp_no, e.employee_name, e.source_record
FROM employee_references e
JOIN datasets d ON d.id = e.dataset_id
WHERE e.emp_no = 'EBB01';
```

## 重建及验证

在 Web 项目根目录运行。默认读取交付项目内的 `source-snapshot`，与 Web 迁移使用相同的原项目冻结版本：

```text
node scripts/export-data.mjs
node database/verify-export.mjs
```

需要 Node.js、安装好的 `acorn` / `puppeteer` 以及本地 Chrome。Windows 默认使用 `C:/Program Files/Google/Chrome/Application/chrome.exe`；可传 `--chrome` 修改。数据快照默认日期为 `2026-10-08T00:00:00+08:00`，可用 `--date` 修改。要从后续版本重新导出，可传 `--source C:/Users/loong/PQ-Mobile`，并将相同路径传给验证脚本；不要直接修改交付基线。

验证会逐个比对原始文件的 SHA-256 和 SQL 内的文件字节，校验 41,540 行 JSON 的有效性及与导出数据一致性，并检查关键业务 fixture。原始页面在本地浏览器初始化时没有 JavaScript 错误；所有脚本均成功解析。当前环境没有 MySQL 服务，因此未执行真实数据库导入。

完整清单在 `export-manifest.json`；数据说明在 `../docs/data-model.md`；前端可读取的完整目录在 `../public/data/seed.json`。完整目录约 11 MB，应按需读取。

## 范围

只导出项目中实际存在的示例与资料。没有提供生产数据库，因此不生成缺失的员工、交易或附件内容。原项目仅列出附件文件名时，保留文件名；不会伪造附件文件。

所有业务公式、延迟调用的数据构造函数、动态表单模板及未满足输入条件的表达式保存在 `source_assets` 的完整原文件中。它们不是已计算的业务行。`source_only` 数据集另外保留表达式及求值失败原因。动态表单后来新增的字段继续由原前端逻辑生成，其模板同时保留在原文件快照中。

不导出依赖安装目录、Git 历史、开发工具配置、Android/iOS 原生目录或签名密钥。保留了提供的五个图片文件，包括 EA Form 预览；图片内容没有 OCR 转写或改写。
