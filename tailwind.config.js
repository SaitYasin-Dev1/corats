/** @type {import('tailwindcss').Config} */
import typography from "@tailwindcss/typography";
export default {
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Source Serif 4"', "Georgia", '"Times New Roman"', "serif"],
      },
      colors: {
        // Legacy palette, retuned to the warm ivory world (claude.ai-inspired).
        modal: {
          background: "#FFFFFF",
          input: "#F2F0E7",
          primary: "#C6613F",
          secondary: "#878378",
          muted: "#6E6B5C",
        },
        surface: {
          DEFAULT: "#FAF9F5",
          card: "#F5F4EE",
          elevated: "#EFEDE3",
          outline: "#E7E4D7",
          background: "#EBE8DC",
          divider: "#D6D3C6",
          button: "#878378",
          text: "#6E6B5C",
        },
        border: {
          DEFAULT: "#E3E0D3",
          hover: "#CCC8B9",
        },
        content: {
          DEFAULT: "#3D3929",
          muted: "#6E6B5C",
          icon: "#C4C0B0",
        },
        status: {
          "success-bg": "rgba(30, 138, 74, 0.08)",
          "success-border": "rgba(30, 138, 74, 0.35)",
          "success-text": "#1E7A45",
          "success-badge-bg": "rgba(30, 138, 74, 0.12)",
          "fail-bg": "rgba(188, 75, 60, 0.08)",
          "fail-border": "rgba(188, 75, 60, 0.35)",
          "fail-text": "#B0382A",
          "fail-solid": "#BC4B3C",
          "fail-solid-hover": "#A93E30",
        },
        toggle: {
          active: "#1E8A4A",
          "active-bg": "rgba(30, 138, 74, 0.14)",
          "active-border": "rgba(30, 138, 74, 0.45)",
          inactive: "#DAD6C9",
          "inactive-knob": "#878378",
          "inactive-border": "#CCC8B9",
        },
        "muted-overlay": "rgba(61, 57, 41, 0.28)",
        "pill-bg": "rgba(61, 57, 41, 0.06)",
      },
    },
  },
  plugins: [typography],
};
