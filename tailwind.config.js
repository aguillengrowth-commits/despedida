/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        night: { 950: '#05030a', 900: '#0b0814', 800: '#14101f', 700: '#1e1830', 600: '#2b2342' },
        fuchsia: { neon: '#ff2bd6' },
        electric: '#2fa8ff',
        gold: '#ffc83d',
      },
      fontFamily: {
        display: ['Unbounded', 'system-ui', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        pink: '0 0 24px -4px rgba(255,43,214,.65)',
        blue: '0 0 24px -4px rgba(47,168,255,.65)',
        gold: '0 0 28px -4px rgba(255,200,61,.7)',
      },
      keyframes: {
        rise: { '0%': { opacity: '0', transform: 'translateY(14px) scale(.98)' }, '100%': { opacity: '1', transform: 'none' } },
        pop: { '0%': { transform: 'scale(.6)', opacity: '0' }, '60%': { transform: 'scale(1.08)', opacity: '1' }, '100%': { transform: 'scale(1)' } },
        flicker: { '0%,19%,21%,23%,55%,57%,100%': { opacity: '1' }, '20%,22%,56%': { opacity: '.55' } },
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        sheen: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        pulseRing: { '0%': { boxShadow: '0 0 0 0 rgba(255,43,214,.6)' }, '100%': { boxShadow: '0 0 0 18px rgba(255,43,214,0)' } },
      },
      animation: {
        rise: 'rise .45s cubic-bezier(.2,.8,.2,1) both',
        pop: 'pop .5s cubic-bezier(.2,.9,.3,1.3) both',
        flicker: 'flicker 4s linear infinite',
        floaty: 'floaty 4s ease-in-out infinite',
        sheen: 'sheen 3s linear infinite',
        pulseRing: 'pulseRing 1.6s ease-out infinite',
      },
    },
  },
  plugins: [],
}
