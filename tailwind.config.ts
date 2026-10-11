import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    screens: {
      // Mirrors the reference site's layout breakpoints.
      xs: "550px",
      sm: "744px",
      md: "950px",
      lg: "1128px",
      xl: "1440px",
      "2xl": "1640px",
      "3xl": "1880px",
    },
    extend: {
      colors: {
        ink: "#222222",
        muted: "#6A6A6A",
        hairline: "#DDDDDD",
        divider: "#EBEBEB",
        faint: "#F7F7F7",
        disabled: "#B0B0B0",
        brand: {
          DEFAULT: "#6B4EFF",
          dark: "#5534E8",
          light: "#F1EEFF",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "sans-serif"],
      },
      boxShadow: {
        pill: "0 3px 12px 0 rgba(0,0,0,0.1)",
        "pill-hover": "0 2px 4px rgba(0,0,0,0.18)",
        float: "0 6px 20px rgba(0,0,0,0.2)",
        card: "rgba(0,0,0,0.12) 0px 6px 16px",
        menu: "0 2px 16px rgba(0,0,0,0.12)",
        modal: "rgba(0,0,0,0.28) 0px 8px 28px",
        ring: "0 0 0 2px #222222",
      },
      borderRadius: {
        card: "12px",
        modal: "12px",
      },
      transitionTimingFunction: {
        abnb: "cubic-bezier(0.2, 0, 0, 1)",
      },
      keyframes: {
        "slide-up": { from: { transform: "translateY(100%)" }, to: { transform: "translateY(0)" } },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "modal-in": {
          from: { transform: "translateY(100%)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "pop-in": {
          from: { transform: "scale(0.96)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        shimmer: { "0%": { backgroundPosition: "-468px 0" }, "100%": { backgroundPosition: "468px 0" } },
        "heart-pop": {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.25)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "slide-up": "slide-up 400ms cubic-bezier(0.2,0,0,1)",
        "fade-in": "fade-in 200ms ease-out",
        "modal-in": "modal-in 400ms cubic-bezier(0.2,0,0,1)",
        "pop-in": "pop-in 200ms cubic-bezier(0.2,0,0,1)",
        shimmer: "shimmer 1.3s linear infinite",
        "heart-pop": "heart-pop 300ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
