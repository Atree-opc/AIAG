# 部署检查清单

项目路径: `c:\临时储存\钊\Advance_Ingredients_AG\Advance_Ingredients_AG`

检查日期: `2026-05-13`

## 1. 依赖环境

- 运行时: `Node.js v22.22.0`
- 包管理器: `npm 10.9.4`
- Docker: `28.5.2`
- PostgreSQL 容器: `postgres-remote`
- 宿主机 `psql`: 未安装

## 2. 声明依赖

### dependencies

- `@types/puppeteer-core`: `^5.4.0`
- `archiver`: `^7.0.1`
- `bcrypt`: `^6.0.0`
- `clsx`: `^2.0.0`
- `jose`: `^6.1.3`
- `jsonwebtoken`: `^9.0.3`
- `next`: `^14.0.0`
- `pg`: `^8.18.0`
- `puppeteer-core`: `^24.37.5`
- `react`: `^18.0.0`
- `react-dom`: `^18.0.0`
- `tailwind-merge`: `^2.0.0`
- `xlsx`: `^0.18.5`

### devDependencies

- `@types/archiver`: `^7.0.0`
- `@types/bcrypt`: `^6.0.0`
- `@types/jsonwebtoken`: `^9.0.10`
- `@types/node`: `^20.0.0`
- `@types/pg`: `^8.16.0`
- `@types/react`: `^18.0.0`
- `@types/react-dom`: `^18.0.0`
- `autoprefixer`: `^10.0.0`
- `dotenv`: `^17.3.1`
- `eslint`: `^8.0.0`
- `eslint-config-next`: `^14.0.0`
- `postcss`: `^8.0.0`
- `tailwindcss`: `^3.3.0`
- `typescript`: `^5.0.0`

## 3. 安装与校验

- `npm install`: 成功，结果为 `up to date`
- `npm ls --depth=0`: 成功
- 已生成审计文件:
  - `deployment_logs/npm-install.log`
  - `deployment_logs/npm-ls-depth0.log`
  - `deployment_logs/npm-dependency-audit.tsv`
- 备注: `npm install` 输出 `14 vulnerabilities (4 moderate, 10 high)`，未自动执行 `npm audit fix`

## 4. 数据库准备

- 容器: `postgres-remote`
- 管理员用户: `postgres`
- 新库: `project_db`
- 新用户: `project_user`
- 口令: `Rand0mStr@ng`
- 已授权:
  - `CONNECT` on `project_db`
  - `USAGE` on schema `public`
  - `CREATE` on schema `public`
  - `CREATE` on database `project_db`
- 已收紧默认权限:
  - 撤销 `PUBLIC` 对 `postgres`、`testdb`、`project_db` 的 `CONNECT`
  - 保留 `testuser` 对 `testdb` 的连接
  - 保留 `project_user` 对 `project_db` 的连接
- 验证结果:
  - `project_user -> project_db`: 成功
  - `project_user -> postgres`: 拒绝
  - `project_user -> testdb`: 拒绝

## 5. 环境变量

- 已写入: `.env.local`
- 已生成备份: `.env.local.bak`
- 已配置变量:
  - `DATABASE_URL`
  - `DB_HOST`
  - `DB_PORT`
  - `DB_NAME`
  - `DB_USER`
  - `DB_PASSWORD`
  - `JWT_SECRET`
  - `JWT_EXPIRES_IN`
  - `UPLOAD_ROOT`
  - `ACCOUNTANT_ROOT`
- 已用 `dotenv` 验证加载结果

## 6. Schema 与初始化

- `db/schema.sql`: 执行成功
- 初始化用户: 执行成功，共 `10` 条
- 数据库版本: `PostgreSQL 18.1`
- `public` 表数量: `10`
- 表清单:
  - `accountant_files`
  - `hard_denied_info`
  - `order_files`
  - `order_month`
  - `order_options`
  - `order_quarter`
  - `order_visibility`
  - `orders`
  - `role_field_visibility`
  - `users`
- 行数统计:
  - `accountant_files`: `0`
  - `hard_denied_info`: `0`
  - `order_files`: `0`
  - `order_month`: `0`
  - `order_options`: `6`
  - `order_quarter`: `0`
  - `order_visibility`: `0`
  - `orders`: `0`
  - `role_field_visibility`: `89`
  - `users`: `10`

## 7. 启动与接口验证

- 启动方式: `start.bat`
- 实际监听地址: `http://localhost:3050/`
- 就绪时间: `4.6s`
- 监听端口: `3050`
- 进程: `node`
- 进程 ID: `38472`
- 工作集内存: `154.93 MB`
- 私有内存: `202.37 MB`
- 首页访问: `GET / -> 200`
- 登录验证: `POST /api/auth/login -> 200`
- 初始化管理员: `admin / admin123`
- 登录返回: `/portal/admin/orders`

## 8. 已知事项

- 项目不存在独立 `/health` 健康检查接口，本次使用首页 `GET /` 和登录接口替代健康验证。
- 仓库内 `db/seed.ts` 依赖 `ts-node/register`，但 `package.json` 未声明 `ts-node`；本次使用等价 Node 脚本完成初始化。
- `start.bat` 运行日志中出现一次 `The user aborted a request.`，但服务随后正常编译、首页与登录均返回 `200`。

## 9. 审计文件

- `deployment_logs/db-create-database.log`
- `deployment_logs/db-create-user.log`
- `deployment_logs/db-grant-connect.log`
- `deployment_logs/db-grant-schema.log`
- `deployment_logs/db-grant-db-create.log`
- `deployment_logs/db-restrict-connect.log`
- `deployment_logs/db-host-connectivity.log`
- `deployment_logs/db-host-connectivity-after-restrict.log`
- `deployment_logs/schema-apply.log`
- `deployment_logs/seed.log`
- `deployment_logs/db-summary.json`
- `deployment_logs/start.log`

## 10. 签字确认

- 执行人: `GPT-5.4`
- 结果: `部署流程已完成，应用可启动，数据库连接与登录链路已验证`
