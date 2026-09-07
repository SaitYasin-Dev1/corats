import { heroui } from "@heroui/react";

export default heroui({
  defaultTheme: "dark",
  layout: {
    radius: {
      small: "5px",
      large: "20px",
    },
  },
  themes: {
    // NOTE: the theme is still *named* "dark" (the class the app mounts), but
    // its values now carry the warm ivory light world. Renaming the theme would
    // mean touching every provider/class reference for zero visual gain.
    dark: {
      colors: {
        primary: "#C6613F", // terracotta accent

        // Map HeroUI's zinc-based semantic colours to our warm ivory palette.
        // This ensures every HeroUI component that uses bg-default, bg-content*,
        // etc. stays within the same colour family as the rest of the UI.

        background: {
          DEFAULT: "#FAF9F5", // warm-950 — app shell base
          foreground: "#1F1D17", // warm-50 ink
        },

        foreground: {
          DEFAULT: "#5D594A", // warm-300 — primary readable text
          "50": "#EFEDE3", // warm-975
          "100": "#FAF9F5", // warm-950
          "200": "#F2F0E7", // warm-925
          "300": "#EBE8DC", // warm-900
          "400": "#E3E0D3", // warm-800
          "500": "#D6D3C6", // warm-700
          "600": "#9C9889", // warm-600
          "700": "#878378", // warm-500
          "800": "#6E6B5C", // warm-400
          "900": "#5D594A", // warm-300
        },

        // Surface layers: panel → card → inner card → inset
        content1: { DEFAULT: "#F2F0E7", foreground: "#3D3929" }, // warm-925 / 100
        content2: { DEFAULT: "#EBE8DC", foreground: "#4A4638" }, // warm-900 / 200
        content3: { DEFAULT: "#E3E0D3", foreground: "#5D594A" }, // warm-800 / 300
        content4: { DEFAULT: "#D6D3C6", foreground: "#6E6B5C" }, // warm-700 / 400

        focus: {
          DEFAULT: "#C6613F", // terracotta focus ring — visible on all warm surfaces
        },
        default: {
          "50": "#EFEDE3", // warm-975
          "100": "#FAF9F5", // warm-950
          "200": "#F2F0E7", // warm-925
          "300": "#EBE8DC", // warm-900
          "400": "#E3E0D3", // warm-800
          "500": "#D6D3C6", // warm-700
          "600": "#9C9889", // warm-600
          "700": "#878378", // warm-500
          "800": "#6E6B5C", // warm-400
          "900": "#5D594A", // warm-300
          DEFAULT: "#E3E0D3", // warm-800 — hover/selected tint
          foreground: "#1F1D17", // warm-50 — text on default bg
        },
      },
    },
  },
});
