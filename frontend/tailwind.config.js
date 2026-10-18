/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      colors: {
        grip: {
          blue: '#1D61E7',
          'blue-hover': '#1851c4',
          'blue-light': '#EFF6FF',
          dark: '#0F172A',
          slate: '#475569',
          muted: '#64748B',
          border: '#E2E8F0',
          canvas: '#F8FAFC',
          emerald: '#10B981',
          'emerald-soft': '#ECFDF5',
          amber: '#F59E0B',
          'amber-soft': '#FEF3C7',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#1D61E7',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#0f2771',
          navy: '#0f172a',
        },
        status: {
          success: {
            bg: '#ecfdf5',
            border: '#a7f3d0',
            text: '#065f46',
            dot: '#10b981',
          },
          warning: {
            bg: '#fffbeb',
            border: '#fde68a',
            text: '#92400e',
            dot: '#f59e0b',
          },
          danger: {
            bg: '#fff1f2',
            border: '#fecdd3',
            text: '#9f1239',
            dot: '#ef4444',
          },
          info: {
            bg: '#eff6ff',
            border: '#bfdbfe',
            text: '#1e40af',
            dot: '#3b82f6',
          },
          tier1: {
            bg: '#f5f3ff',
            border: '#ddd6fe',
            text: '#5b21b6',
            dot: '#7c3aed',
          },
        }
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 10px 15px -3px rgba(15, 23, 42, 0.06), 0 4px 6px -4px rgba(15, 23, 42, 0.04)',
        'glow': '0 0 20px -3px rgba(37, 99, 235, 0.15)',
        'glow-success': '0 0 20px -3px rgba(16, 185, 129, 0.15)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
};
