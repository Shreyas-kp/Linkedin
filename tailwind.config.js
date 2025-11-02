/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        success: {
          light: '#86efac',
          DEFAULT: '#22c55e',
          dark: '#15803d',
        },
        warning: {
          light: '#fde047',
          DEFAULT: '#eab308',
          dark: '#a16207',
        },
        error: {
          light: '#fca5a5',
          DEFAULT: '#ef4444',
          dark: '#b91c1c',
        },
        surface: {
          light: '#ffffff',
          dark: '#1a1a1a',
          elevated: {
            light: '#ffffff',
            dark: '#2d2d2d'
          }
        }
      },
      fontFamily: {
        sans: [
          'Plus Jakarta Sans',
          'Inter',
          'system-ui',
          'sans-serif'
        ],
        display: [
          'Cal Sans',
          'Plus Jakarta Sans',
          'system-ui',
          'sans-serif'
        ],
        mono: [
          'JetBrains Mono',
          'SF Mono',
          'monospace'
        ]
      },
      fontSize: {
        'heading-1': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'heading-2': ['2rem', { lineHeight: '1.25', letterSpacing: '-0.02em', fontWeight: '600' }],
        'heading-3': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.5' }],
        'body': ['1rem', { lineHeight: '1.5' }],
        'small': ['0.875rem', { lineHeight: '1.4' }],
        'xs': ['0.75rem', { lineHeight: '1.3' }],
      },
      spacing: {
        'header': '4rem',
        'sidebar': '18rem',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient': 'gradient 8s linear infinite',
        'shine': 'shine 1.5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        shine: {
          '0%': { backgroundPosition: '200% center' },
          '100%': { backgroundPosition: '-200% center' },
        },
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px rgba(0, 0, 0, 0.03)',
        'soft-lg': '0 4px 25px rgba(0, 0, 0, 0.05)',
        'elevation': '0 1px 3px rgba(0, 0, 0, 0.05), 0 8px 24px rgba(0, 0, 0, 0.08)',
        'elevation-lg': '0 1px 3px rgba(0, 0, 0, 0.05), 0 16px 48px rgba(0, 0, 0, 0.12)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.15)',
        'glow-success': '0 0 20px rgba(34, 197, 94, 0.15)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
        'gradient-success': 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
        'shine': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
      }
    },
  },
  plugins: [],
}