# Advance Ingredients AG Website

## Project Setup

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Project Structure

```
website/
├── app/
│   ├── layout.tsx         # Root layout with fonts and metadata
│   ├── page.tsx           # Home page
│   ├── globals.css        # Global styles and Tailwind imports
│   ├── who-we-are/
│   │   └── page.tsx       # Who We Are page
│   ├── brands/
│   │   └── page.tsx       # Brands page
│   ├── products/
│   │   └── page.tsx       # Products page
│   ├── capabilities/
│   │   └── page.tsx       # Capabilities page
│   ├── markets/
│   │   └── page.tsx       # Markets page
│   └── contact/
│       └── page.tsx       # Contact page
├── components/
│   ├── Header.tsx         # Shared header component
│   └── Footer.tsx         # Shared footer component
├── lib/
│   └── utils.ts          # Utility functions (cn helper)
├── public/
│   └── Neulink VI.svg     # Logo file
├── tailwind.config.js     # Tailwind configuration with brand colors
├── next.config.js        # Next.js configuration
└── package.json          # Dependencies

```

## Brand Colors

- **Primary Red**: #d42f19
- **Peach**: #fad4b5
- **Green (FOONEXUS)**: #2D5F3E
- **Blue (LVEO)**: #1E3A5F
- **Dark**: #1A1A1A

## Pages

1. **Home** (`/`) - Landing page with hero, brands overview, and key information
2. **Who We Are** (`/who-we-are`) - Company background, culture, and values
3. **Brands** (`/brands`) - Detailed information about NEULINK, FOONEXUS, and LVEO
4. **Products** (`/products`) - Product categories and portfolio
5. **Capabilities** (`/capabilities`) - R&D, supply chain, and quality control
6. **Markets** (`/markets`) - Regions and industries served
7. **Contact** (`/contact`) - Contact form and company information

## Features

- ✅ Responsive design
- ✅ Tailwind CSS for styling
- ✅ TypeScript for type safety
- ✅ Modern React with Next.js 14 App Router
- ✅ SEO optimized
- ✅ Fast page loads with SSR/SSG

## Contact Form

The contact form includes:
- Name
- Company
- Email
- Country/Region
- Interested Brand
- Product/Requirement
- Volume/Timeline (optional)
- Message

## Deploy

Build for production:

```bash
npm run build
npm run start
```

The site will be available at port 3000.

## License

© 2025 Advance Ingredients AG. All rights reserved.
