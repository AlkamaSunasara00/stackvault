/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--notion-bg)',
        sidebar: 'var(--notion-bg-sidebar)',
        card: 'var(--notion-bg-card)',
        primary: 'var(--notion-accent)',
        secondary: 'var(--notion-accent-soft)',
        muted: 'var(--notion-text-2)',
        danger: 'var(--notion-red)',
        warning: 'var(--notion-yellow)',
        success: 'var(--notion-green)',
        border: 'var(--notion-border)',
      },
      fontFamily: {
        sans: ['var(--notion-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--notion-mono)', 'monospace'],
        serif: ['var(--notion-serif)', 'serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-mesh': 'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(92,124,250,0.06), transparent)',
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(92, 124, 250, 0.12)',
        'glow-secondary': '0 0 20px rgba(52, 211, 153, 0.12)',
        'card': 'var(--notion-shadow-sm)',
        'modal': 'var(--notion-shadow-lg)',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'count-up': 'countUp 1.5s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      borderColor: {
        DEFAULT: 'var(--notion-border)',
      },
    },
  },
  plugins: [],
}
