// https://stylelint.io/user-guide/configuration/

// This project uses the BEM (Block Element Modifier) convention for CSS classes:
// http://getbem.com/naming/
//
// Note that the "kubevirt" prefix is enforced to avoid potential conflicts with
// the consuming application.
//
// For example, a "FancyForm" component could use the following class names:
// - kubevirt-fancy-form
// - kubevirt-fancy-form__submit-button
// - kubevirt-fancy-form__submit-button--disabled

const fragment = '[a-z-]+';
const prefix = 'kubevirt-';

module.exports = {
  extends: 'stylelint-config-standard',
  plugins: ['stylelint-scss', 'stylelint-selector-bem-pattern'],
  rules: {
    'plugin/selector-bem-pattern': {
      implicitComponents: 'sass/components/**/*.scss',
      componentName: new RegExp(`^${fragment}$`),
      componentSelectors: {
        // validate CSS selector sequences that occur before combinators,
        // for example: ".foo .bar > .baz" => validate ".foo"
        initial: componentName => {
          const word = `${fragment}(?:--${fragment})*`;
          const element = `(?:__${word})?`;
          const modifier = `(?:--${word})?`;
          return new RegExp(`^\\.${prefix}${componentName}${element}${modifier}$`);
        },
        // validate CSS selector sequences that occur after combinators,
        // for example: ".foo .bar > .baz" => validate ".bar" and ".baz"
        combined: () => new RegExp(`^\\.${fragment}(?:\\.${fragment})*$`),
      },
    },
  },
};
