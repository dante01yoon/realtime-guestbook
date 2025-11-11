import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        "postit-yellow": "#FEF08A",
        "postit-pink": "#FBCFE8",
        "postit-green": "#BBF7D0",
        "postit-blue": "#BAE6FD"
      },
      boxShadow: {
        postit: "0 10px 25px -15px rgba(0,0,0,0.45)"
      }
    }
  },
  plugins: []
};

export default config;
