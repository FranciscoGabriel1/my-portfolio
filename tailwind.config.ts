import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // ─── Color Tokens (consumed via CSS Variables) ───────────────────
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        "surface-elevated": "var(--surface-elevated)",
        border: "var(--border)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        "accent-primary": "var(--accent-primary)",
        "accent-secondary": "var(--accent-secondary)",
        "accent-success": "var(--accent-success)",
        "accent-warning": "var(--accent-warning)",
      },

      // ─── Typography ────────────────────────────────────────────────────
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-geist)", "var(--font-inter)", "sans-serif"],
      },
      fontSize: {
        display: ["4.5rem", { lineHeight: "1.05", fontWeight: "900" }],
        h1: ["3rem", { lineHeight: "1.1", fontWeight: "800" }],
        h2: ["2rem", { lineHeight: "1.2", fontWeight: "700" }],
        h3: ["1.5rem", { lineHeight: "1.3", fontWeight: "600" }],
        "body-lg": ["1.125rem", { lineHeight: "1.7", fontWeight: "400" }],
        body: ["1rem", { lineHeight: "1.6", fontWeight: "400" }],
        caption: ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }],
      },

      // ─── Spacing Scale (8px grid) ─────────────────────────────────────
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "26": "6.5rem",
        "30": "7.5rem",
      },

      // ─── Border Radius ────────────────────────────────────────────────
      borderRadius: {
        sm: "6px",
        md: "12px",
        lg: "20px",
        xl: "28px",
        "2xl": "36px",
      },

      // ─── Animations ───────────────────────────────────────────────────
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(32px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(-24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        bounce: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out forwards",
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        "slide-in-right": "slide-in-right 0.5s ease-out forwards",
        shimmer: "shimmer 1.5s infinite",
        "bounce-slow": "bounce 2s ease-in-out infinite",
      },

      // ─── Box Shadow ───────────────────────────────────────────────────
      boxShadow: {
        glass: "0 4px 40px rgba(0,0,0,0.3)",
        "glass-light": "0 4px 40px rgba(0,0,0,0.08)",
        "glow-primary": "0 0 40px rgba(10,132,255,0.35)",
        "glow-secondary": "0 0 40px rgba(6,182,212,0.3)",
        card: "0 1px 3px rgba(0,0,0,0.12), 0 8px 32px rgba(0,0,0,0.08)",
      },

      // ─── Backdrop Blur ────────────────────────────────────────────────
      backdropBlur: {
        xs: "4px",
      },
    },
  },
  plugins: [],
};

export default config;
