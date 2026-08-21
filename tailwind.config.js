/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:            'rgb(var(--color-bg) / <alpha-value>)',
        surface:       'rgb(var(--color-surface) / <alpha-value>)',
        'surface-2':   'rgb(var(--color-surface-2) / <alpha-value>)',
        border:        'rgb(var(--color-border) / <alpha-value>)',
        text:          'rgb(var(--color-text) / <alpha-value>)',
        'text-muted':  'rgb(var(--color-text-muted) / <alpha-value>)',
        accent:        'rgb(var(--color-accent) / <alpha-value>)',
        'accent-fill': 'rgb(var(--color-accent-fill) / <alpha-value>)',
      },
      borderColor: { DEFAULT: 'rgb(var(--color-border) / <alpha-value>)' },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans:    ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
