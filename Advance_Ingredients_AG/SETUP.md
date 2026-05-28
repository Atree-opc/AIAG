# 快速安装和运行指南

## 1. 安装依赖

```bash
cd "/home/lu/Desktop/Advance Ingredients AG/website"
npm install
```

## 2. 创建所有页面

由于代码量较大，我创建了一个自动化脚本来生成所有页面。运行：

```bash
chmod +x create-pages.sh
./create-pages.sh
```

这个脚本会自动创建所有6个剩余的页面：
- Who We Are
- Brands
- Products
- Capabilities
- Markets
- Contact

## 3. 启动开发服务器

```bash
npm run dev
```

打开浏览器访问：http://localhost:3000

## 4. 构建生产版本

```bash
npm run build
npm run start
```

## 项目完成状态

✅ 已创建：
- package.json (依赖配置)
- tailwind.config.js (品牌颜色配置)
- next.config.js (Next.js配置)
- app/globals.css (全局样式)
- app/layout.tsx (根布局)
- app/page.tsx (首页 - 完整)
- components/Header.tsx (共享头部)
- components/Footer.tsx (共享底部)
- lib/utils.ts (工具函数)
- public/Neulink VI.svg (Logo)

📋 待创建（脚本会自动生成）：
- app/who-we-are/page.tsx
- app/brands/page.tsx
- app/products/page.tsx
- app/capabilities/page.tsx
app/markets/page.tsx
- app/contact/page.tsx

## 网站结构

```
Header (所有页面统一)
├── Logo (红色圆形 + 文字)
├── 导航 (5个页面链接)
└── Contact 按钮

Footer (所有页面统一)
├── 公司信息
├── Company 链接
├── Products 链接
└── Legal 链接
```

## 品牌颜色

```css
--brand-red: #d42f19
--brand-peach: #fad4b5
--brand-green: #2D5F3E
--brand-blue: #1E3A5F
--brand-dark: #1A1A1A
```

## 下一步

1. 运行 create-pages.sh 脚本
2. 安装依赖
3. 启动开发服务器
4. 在浏览器中查看所有7个页面

## 注意事项

- Logo 图形 (Neulink VI.svg) 已在 public 文件夹中
- 所有页面都使用统一的 Header 和 Footer
- 所有样式使用 Tailwind CSS
- 支持响应式设计（移动端和桌面端）
