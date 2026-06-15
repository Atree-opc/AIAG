# Logo Implementation Guide

## Neulink VI.svg Logo Usage

**Logo File Location**: `/home/lu/Desktop/Advance Ingredients AG/Neulink VI.svg`

## How to Implement in Code

### Option 1: Direct SVG Embedding (Recommended)
```html
<a href="/" class="logo-container">
  <img src="/home/lu/Desktop/Advance Ingredients AG/Neulink VI.svg"
       alt="Neulink Logo"
       class="logo-graphic">
  <span class="logo-text">ADVANCE INGREDIENTS AG</span>
</a>
```

### Option 2: Inline SVG
```html
<a href="/" class="logo-container">
  <!-- Embed the SVG content directly -->
  <svg viewBox="0 0 800 450" class="logo-graphic">
    <!-- SVG content from Neulink VI.svg -->
  </svg>
  <span class="logo-text">ADVANCE INGREDIENTS AG</span>
</a>
```

### CSS Styling
```css
.logo-container {
  display: flex;
  align-items: center;
  gap: 16px;
  text-decoration: none;
}

.logo-graphic {
  width: 40px;
  height: 40px;
  /* Adjust size as needed */
}

.logo-text {
  font-family: 'Inter', Arial, sans-serif;
  font-size: 18px;
  font-weight: bold;
  color: #000000;
}
```

## Design Specification

- **Logo Container Width**: 320px
- **Logo Graphic Size**: 40x40px (adjustable)
- **Gap**: 16px between logo and text
- **Company Name**: ADVANCE INGREDIENTS AG
- **Font**: Inter, 18px, Bold
- **Color**: #000000

## Logo Color Scheme

From Neulink VI.svg:
- **Primary Red**: #d42f19, #d51b1a, #e7311b
- **Peach/Beige**: #fad4b5, #ffd7b6
- **Text**: #000000, #000100

These colors are already used throughout the website design.

## Pages Requiring Logo Update

All 7 pages have consistent Header with logo:
1. ✅ Home (VDOpU) - Updated
2. ✅ Who We Are (GIhNn)
3. ✅ Brands (8hc4y)
4. ✅ Products (ISl5O)
5. ✅ Capabilities (dkXWW)
6. ✅ Markets (Kv6lE)
7. ✅ Contact (KyVHs)

## Note

The current design shows a **red circle placeholder** (40x40px) where the Neulink logo graphic should be placed. In the actual implementation, replace this placeholder with the actual Neulink VI.svg image.

The Neulink logo consists of 4 interlocking curved shapes (2 red, 2 peach) arranged in a symmetrical pattern, which represents the "Linking" concept in the brand name.
