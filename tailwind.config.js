/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'cuc-red': {
          50: '#FFF1F1',
          100: '#FFE0E0',
          200: '#FFC8C8',
          300: '#FFA0A0',
          400: '#FF7171',
          500: '#FF4141',
          600: '#E60000', // Primary CUC red
          700: '#CC0000',
          800: '#A80000',
          900: '#8A0000',
        },
        'cuc-gold': {
          50: '#FFFAEB',
          100: '#FFF2C5',
          200: '#FFE99D',
          300: '#FFD966',
          400: '#FFC61A',
          500: '#FFB800', // Primary CUC gold
          600: '#E5A800',
          700: '#CC9600',
          800: '#A67C00',
          900: '#806000',
        },
        twitter: {
          blue: '#1DA1F2',
          black: '#14171A',
          dark: '#657786',
          light: '#AAB8C2',
          extraLight: '#E1E8ED',
          extraExtraLight: '#F5F8FA',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Noto Serif', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'card': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 10px 30px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}