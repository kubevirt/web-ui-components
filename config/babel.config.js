// https://babeljs.io/docs/en/next/options
// ignore: [] is not respected here for some reason when used with @babel/cli

module.exports = {
  presets: ['@babel/react'],
  plugins: ['@babel/plugin-proposal-class-properties'],
};
