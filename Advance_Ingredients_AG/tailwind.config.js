/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 专业商务版配色方案
        primary: {
          DEFAULT: '#D32F2F', // 主红色 - 强调色
          hover: '#B71C1C',   // 悬停深色
        },
        bg: {
          DEFAULT: '#FFFFFF',      // 主背景
          secondary: '#F8F8F8',    // 次级背景
        },
        text: {
          primary: '#000000',      // 主文字
          secondary: '#666666',    // 次级文字
          muted: '#999999',        // 弱化文字
        },
        // 保留原有品牌色（用于子品牌）
        brand: {
          red: '#D32F2F',
          peach: '#FFE0B2',
          orange: '#FF9800',
          green: '#2D5F3E',
          blue: '#1E3A5F',
          dark: '#1A1A1A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Arial', 'sans-serif'],
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
    },
  },
  plugins: [],
}
