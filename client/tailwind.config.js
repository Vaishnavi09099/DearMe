/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bg: {
          primary:   '#0a0a0f',
          secondary: '#111118',
          tertiary:  '#1a1a24',
          quad:      '#22222e',
          five:      '#2a2a38',
        },
        accent: {
          DEFAULT: '#7c6af7',
          light:   '#9d8fff',
          muted:   'rgba(124,106,247,0.15)',
        },
      },
    },
  },
  plugins: [],
}
