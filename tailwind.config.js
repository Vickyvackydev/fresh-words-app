/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/app/**/*.{js,jsx,ts,tsx}", "./src/components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ["QuickSand-Regular", "sans-serif"],
        serif: ["QuickSand-Regular", "serif"],
        "quicksand-bold": ["QuickSand-Bold"],
        "quicksand-semibold": ["QuickSand-Semibold"],
        "quicksand-medium": ["QuickSand-Medium"],
        "quicksand-light": ["QuickSand-Light"],
      },
      fontSize: {
        xs: ["14px", { lineHeight: "20px" }],
        sm: ["16px", { lineHeight: "24px" }],
        base: ["18px", { lineHeight: "28px" }],
        lg: ["20px", { lineHeight: "28px" }],
        xl: ["24px", { lineHeight: "32px" }],
        "2xl": ["28px", { lineHeight: "36px" }],
        "3xl": ["36px", { lineHeight: "44px" }],
      },
    },
  },
  plugins: [],
}
