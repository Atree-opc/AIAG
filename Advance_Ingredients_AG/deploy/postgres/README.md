# Docker PostgreSQL 一键部署说明

## 目录内容

- `docker-compose.yml`: PostgreSQL 容器定义，包含端口映射、数据卷、健康检查和自启策略
- `.env.example`: 可直接复制为 `.env` 的参数模板
- `init/10-bootstrap-users.sql`: 基础系统账号初始化 SQL
- `deploy-postgres.sh`: 一键安装 Docker、启动容器、导入 schema 和初始化数据、生成状态报告

## 使用前准备

1. 将整个项目目录上传到服务器
2. 进入项目根目录
3. 根据需要调整数据库账号和端口

```bash
cd /path/to/Advance_Ingredients_AG
cp deploy/postgres/.env.example deploy/postgres/.env
vi deploy/postgres/.env
chmod +x deploy/postgres/deploy-postgres.sh
```

## 一键部署命令

```bash
bash deploy/postgres/deploy-postgres.sh
```

脚本会自动完成:

1. 安装 Docker Engine 与 Docker Compose Plugin
2. 拉取 `postgres:16` 镜像
3. 启动带持久化卷的 PostgreSQL 容器
4. 等待健康检查通过
5. 导入 `db/schema.sql`
6. 导入基础账号初始化 SQL
7. 输出连接信息和部署状态报告

## 默认初始化账号

- `admin / admin123`
- `staff / staff123`
- `accountant / accountant123`
- `dairyfood / supplier123`
- `nongdu / customer123`

## 部署成功后的报告文件

默认输出到:

```text
deploy/postgres/deployment-report.txt
```

其中包含:

- 容器名与容器 ID
- 数据库名、用户名、主机端口
- 挂载数据卷名
- PostgreSQL 版本
- `public` schema 表数量
- 推荐连接命令

## 回滚机制

如果部署中途失败，脚本会自动:

1. 停止并移除本次创建的 PostgreSQL 容器
2. 删除本次创建的数据卷
3. 输出失败状态报告

## 可选增强

如果你还需要把当前项目里的完整核心业务备份恢复到新容器，可在应用依赖安装完成后执行:

```bash
DB_HOST=127.0.0.1 \
DB_PORT=5432 \
DB_NAME=project_db \
DB_USER=project_user \
DB_PASSWORD='<your-password>' \
node scripts/restore-core-data.js --skip-storage backups/core-data/latest
```

这一步不是基础建库必需项，但适合迁移已有业务数据。
