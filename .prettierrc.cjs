module.exports = {
    semi: true,
    trailingComma: "es5",
    singleQuote: false,
    printWidth: 80,
    tabWidth: 4,
    useTabs: false,
    bracketSpacing: true,
    bracketSameLine: false,
    arrowParens: "avoid",
    endOfLine: "lf",
    plugins: ["prettier-plugin-tailwindcss"],
    tailwindStylesheet: "./app/styles/global.css",
};
