import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans]
      },
      colors: {
        postit: {
          lemon: "#FFF9C4",
          mint: "#DFFFD6",
          peach: "#FFE0B2",
          lilac: "#E1D5FF",
          sky: "#D0F0FD"
        }
      },
      boxShadow: {
        postit: "0 10px 25px -15px rgba(0,0,0,0.4)"
      }
    }
  },
  plugins: []
};

export default config;
