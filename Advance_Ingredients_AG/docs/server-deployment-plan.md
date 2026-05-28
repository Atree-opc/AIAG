# Advance Ingredients AG 服务器部署运行方案

## 1. 目标架构

- 应用层: `Next.js 14` + `Node.js 22 LTS`
- 数据层: `PostgreSQL 16+`，建议独立实例或独立容器，不与应用进程混布
- 反向代理: `Nginx`
- 进程守护: 优先 `systemd`，也可选 `PM2`
- 文件存储:
  - 订单附件目录: `UPLOAD_ROOT`
  - 财务附件目录: `ACCOUNTANT_ROOT`

推荐生产拓扑:

1. `Nginx` 监听 `80/443`
2. `Next.js` 应用监听 `127.0.0.1:3050`
3. `PostgreSQL` 监听内网地址或本机回环地址
4. 附件存储挂载到独立数据盘，避免与代码目录同盘

## 2. 服务器环境要求

### 基础配置

- 操作系统: `Ubuntu 24.04 LTS`
- CPU: `2 vCPU` 起步，建议 `4 vCPU`
- 内存: `4 GB` 起步，建议 `8 GB`
- 磁盘:
  - 系统盘 `40 GB+`
  - 数据盘 `100 GB+`，用于数据库与上传文件
- 时区: 统一设为 `UTC` 或业务统一时区

### 软件版本

- `Node.js 22 LTS`
- `npm 10+`
- `PostgreSQL 16+`
- `Nginx 1.24+`
- `git`
- `rsync`
- `tar`
- `openssl`
- `logrotate`

### 网络与安全

- 仅开放 `80/443`
- `3050` 仅允许本机访问
- `5432` 仅允许应用服务器或堡垒机访问
- 启用主机防火墙
- 数据库密码、`JWT_SECRET` 必须使用强随机值

## 3. 目录规划

建议目录:

```text
/srv/advance-ingredients/app              代码目录
/srv/advance-ingredients/releases         发布目录
/srv/advance-ingredients/shared/.env.local
/srv/advance-ingredients/shared/storage/orders
/srv/advance-ingredients/shared/storage/accountant
/srv/advance-ingredients/backups/core-data
/var/log/advance-ingredients
```

说明:

- `.env.local` 放在共享目录，不随发布包覆盖
- `UPLOAD_ROOT` 指向共享订单文件目录
- `ACCOUNTANT_ROOT` 指向共享财务文件目录
- 备份目录与运行目录分离

## 4. 环境变量配置

生产环境至少配置:

```env
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=project_db
DB_USER=project_user
DB_PASSWORD=<strong-password>
JWT_SECRET=<64-byte-random-secret>
JWT_EXPIRES_IN=8h
UPLOAD_ROOT=/srv/advance-ingredients/shared/storage/orders
ACCOUNTANT_ROOT=/srv/advance-ingredients/shared/storage/accountant
NODE_ENV=production
PORT=3050
```

检查要点:

- `UPLOAD_ROOT` 和 `ACCOUNTANT_ROOT` 对应用运行用户可读写
- `JWT_SECRET` 不得与开发环境复用
- 生产环境数据库账户建议仅授予业务库最小权限

## 5. 部署步骤

### 5.1 初始化服务器

```bash
sudo apt update
sudo apt install -y nginx postgresql postgresql-client git rsync tar logrotate
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

### 5.2 创建运行用户与目录

```bash
sudo useradd --system --create-home --shell /bin/bash aiag
sudo mkdir -p /srv/advance-ingredients/{releases,shared/storage/orders,shared/storage/accountant,backups/core-data}
sudo chown -R aiag:aiag /srv/advance-ingredients
sudo mkdir -p /var/log/advance-ingredients
sudo chown -R aiag:aiag /var/log/advance-ingredients
```

### 5.3 发布代码

```bash
sudo -u aiag git clone <repo-url> /srv/advance-ingredients/releases/current
cd /srv/advance-ingredients/releases/current
sudo -u aiag npm ci
sudo -u aiag npm run build
```

### 5.4 配置共享环境文件

将 `.env.local` 放到:

```text
/srv/advance-ingredients/shared/.env.local
```

再建立软链接:

```bash
cd /srv/advance-ingredients/releases/current
ln -sf /srv/advance-ingredients/shared/.env.local .env.local
```

### 5.5 数据库初始化

```bash
psql -h 127.0.0.1 -U postgres -c "CREATE DATABASE project_db WITH ENCODING='UTF8' TEMPLATE=template0;"
psql -h 127.0.0.1 -U postgres -c "CREATE USER project_user WITH ENCRYPTED PASSWORD '<strong-password>';"
psql -h 127.0.0.1 -U postgres -c "GRANT CONNECT ON DATABASE project_db TO project_user;"
psql -h 127.0.0.1 -U postgres -d project_db -c "GRANT USAGE, CREATE ON SCHEMA public TO project_user;"
psql -h 127.0.0.1 -U project_user -d project_db -f db/schema.sql
```

如需导入已有业务数据:

```bash
npm run restore:core-data -- /srv/advance-ingredients/backups/core-data/latest
```

## 6. 服务启动与守护

### 6.1 systemd 服务

创建 `/etc/systemd/system/advance-ingredients.service`:

```ini
[Unit]
Description=Advance Ingredients AG Next.js Service
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=aiag
WorkingDirectory=/srv/advance-ingredients/releases/current
Environment=NODE_ENV=production
Environment=PORT=3050
ExecStart=/usr/bin/npm run start -- --hostname 127.0.0.1 --port 3050
Restart=always
RestartSec=5
StandardOutput=append:/var/log/advance-ingredients/app.log
StandardError=append:/var/log/advance-ingredients/app-error.log

[Install]
WantedBy=multi-user.target
```

启用服务:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now advance-ingredients
sudo systemctl status advance-ingredients
```

### 6.2 Nginx 反向代理

示例 `/etc/nginx/sites-available/advance-ingredients.conf`:

```nginx
server {
    listen 80;
    server_name example.com;

    client_max_body_size 50m;

    location / {
        proxy_pass http://127.0.0.1:3050;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 300;
    }
}
```

启用配置:

```bash
sudo ln -sf /etc/nginx/sites-available/advance-ingredients.conf /etc/nginx/sites-enabled/advance-ingredients.conf
sudo nginx -t
sudo systemctl reload nginx
```

### 6.3 HTTPS

推荐使用 `Let's Encrypt`:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d example.com
```

## 7. 数据备份与恢复

### 7.1 备份内容

项目必须同时备份三类数据:

1. 数据库核心业务快照
2. 上传附件目录
3. 环境变量与部署配置

本项目已提供以下脚本:

- `npm run backup:core-data`
- `npm run verify:core-backup -- <backup-dir>`
- `npm run restore:core-data -- <backup-dir>`

### 7.2 备份产物

每次执行会生成:

```text
backups/core-data/<timestamp>/
  backup.manifest.json
  db.core.bundle.json
  storage.manifest.json
  CHECKSUMS.txt
  storage/orders/...
  storage/accountant/...
backups/core-data/latest/
```

### 7.3 备份策略

- 每日增量: 文件目录用 `rsync` 同步到备份机
- 每日快照: 执行 `npm run backup:core-data`
- 每周全量: 将 `backups/core-data/<timestamp>` 打包并异地存储
- 每月演练: 在预发布环境执行一次恢复演练

### 7.4 恢复流程

```bash
cd /srv/advance-ingredients/releases/current
npm run verify:core-backup -- /srv/advance-ingredients/backups/core-data/latest
npm run restore:core-data -- /srv/advance-ingredients/backups/core-data/latest
sudo systemctl restart advance-ingredients
```

恢复机制说明:

- 恢复前先做 SHA-256 校验
- 数据库按固定顺序事务性重建
- 文件目录会生成 `*.pre-restore-<timestamp>` 旧快照，便于回滚

## 8. 监控与告警

### 8.1 基础监控

至少监控以下指标:

- 应用进程存活状态
- `HTTP 200/4xx/5xx` 比例
- 页面与 API 响应时间
- 数据库连接数
- PostgreSQL 慢查询
- 磁盘可用空间
- `UPLOAD_ROOT` 与 `ACCOUNTANT_ROOT` 容量增长
- 内存占用与 OOM

### 8.2 日志建议

- 应用日志输出到 `/var/log/advance-ingredients`
- Nginx 访问日志和错误日志分开
- PostgreSQL 开启慢查询日志
- 建议接入以下任一方案:
  - `Prometheus + Grafana + Loki`
  - `Zabbix`
  - 云厂商原生日志与监控

### 8.3 告警阈值

- `5xx` 错误率连续 `5` 分钟超过 `2%`
- 磁盘使用率超过 `80%`
- 数据库连接数达到上限的 `70%`
- 应用进程重启次数异常
- 备份任务连续失败 `2` 次

## 9. 日常运维注意事项

- 不要直接在生产环境运行 `next dev`
- 任何权限配置变更后，立即执行一次 `npm run backup:core-data`
- 所有上传目录必须使用持久化磁盘，不得使用临时盘
- 发布前先执行:

```bash
npm ci
npm run build
```

- 发布后检查:
  - 登录接口是否正常
  - `/` 是否返回 `200`
  - 数据库连接是否成功
  - 附件上传和下载是否正常

## 10. 推荐发布流程

1. 备份当前生产数据
2. 拉取新版本代码
3. 安装依赖并构建
4. 验证环境变量与目录权限
5. 执行数据库恢复或迁移
6. 重启 `systemd` 服务
7. 运行健康检查与登录验证
8. 观察日志 `15-30` 分钟后再完成切换

## 11. 回滚方案

当新版本异常时，按以下顺序回滚:

1. 切回上一版代码目录
2. 还原 `.env.local`
3. 使用最近一次 `core-data` 备份执行恢复
4. 恢复 `UPLOAD_ROOT` 与 `ACCOUNTANT_ROOT` 的旧快照
5. 重启应用并做登录与订单查询验证

## 12. 交付建议

正式上线前建议完成以下动作:

- 在预发布环境完整演练一次备份恢复
- 为 `admin`、`staff`、`supplier`、`customer`、`accountant` 五类账号分别做登录验证
- 验证订单导入、附件上传、合同生成、发票生成链路
- 将 `backups/core-data/latest` 同步到异地对象存储或备份服务器
