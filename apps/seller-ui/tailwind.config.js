
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "../../packages/components/**/*.{js,ts,tsx,jsx}",
    './{src,pages,components,app}/**/*.{ts,tsx,js,jsx,html}',
    '../seller-ui/src/**/*.{ts,tsx,js,jsx,html}',
    '!./{src,pages,components,app}/**/*.{stories,spec}.{ts,tsx,js,jsx,html}',
    //     ...createGlobPatternsForDependencies(__dirname)
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
