/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sidebar: {
          bg: '#1C1C1E',
          surface: '#2C2C2E',
          'surface-hover': '#3A3A3C',
          text: '#E5E5EA',
          'text-dim': '#8E8E93',
          accent: '#7B7CFF',
          border: '#48484A',
        },
        canvas: {
          bg: '#F2F2F7',
          dot: '#E0E0E8',
        },
        brand: {
          accent: '#5E5CE6',
          'accent-hover': '#4B49D6',
        },
      },
      fontFamily: {
        sans: ['"PingFang SC"', '"Microsoft YaHei"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // 避免与 Ant Design 样式冲突
  },
};
