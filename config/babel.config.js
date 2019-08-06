// https://babeljs.io/docs/en/next/options

module.exports = {
  presets: ['@babel/react'],
  ignore: ['src/jest', 'src/cosmos', '**/tests/**', '**/fixtures/**'],
  plugins: ['@babel/plugin-proposal-class-properties'],
};
