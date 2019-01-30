# Developer guideline

## Component file structure

```
src/components/
└── <GroupName>/
    ├── index.js
    ├── <Component>.js
    ├── <AnotherComponent>.js
    ├── fixtures/
    │   ├── <Component>.fixture.js
    │   └── <AnotherComponent>.fixture.js
    └── tests/
        ├── <Component>.test.js
        └── <AnotherComponent>.test.js
```

Every component group should have an `index.js` file exporting specific components which
are meant to be shipped as part of the project's npm package.

Component sub-groups can be used to represent logical hierarchies, for example:

```
src/components/
└── Dialog/
    ├── index.js
    └── FooDialog/
        ├── FooComponent.js
        ├── fixtures/
        │   └── FooComponent.fixture.js
        └── tests/
            └── FooComponent.test.js
```

For every specific component, there should be a corresponding test and a Cosmos fixture.

## Stylesheet file structure

```
sass/
├── components/
│   └── <GroupName>
│       ├── <style-block>.scss
│       └── <another-style-block>.scss
└── patternfly-tweaks/
```

Styles are grouped based on React component groups, e.g. any `Form` component related styles
should be placed under `sass/components/Form` directory. Styles in the `patternfly-tweaks`
directory should be treated as temporary until being backported to the corresponding PF-React
npm package.

This project uses the [BEM (Block Element Modifier)](http://getbem.com/naming/) convention
for CSS classes. Refer to [stylelint configuration](../config/stylelint.config.js) for details
on project-specific BEM format.

Each file at `sass/components/<GroupName>` represents a specific BEM block. For example,
`sass/components/Form/dropdown.scss` should only include CSS selectors that start with
`.kubevirt-dropdown`.

## Cosmos

Use the [Cosmos playground](https://github.com/react-cosmos/react-cosmos) to test and
experiment with React components. Each component is rendered in an `iframe` along with
dependant styling, allowing the component to be tested as a standalone, reusable unit.

Remember to add [fixtures](https://github.com/react-cosmos/react-cosmos#fixtures) to ensure
that components are properly exposed to Cosmos. Keep in mind that Cosmos is effectively the
visual component interface between developers and designers:

- it allows developers to test KubeVirt related UI bits
- it allows designers to review the current implementation
- it shields both groups from having to work with the consuming application

Think of each fixture as a distinct visual test case for the given component, with `props`
(and possibly other contextual information) used to exemplify the tested scenario. This is
similar to testing a regular function from different angles, including known edge cases.

## Jest

Jest is used to run all tests. To detect test failures early, start Jest in watch mode and
keep it open as you develop code.

At the very least, every React component should have an accompanying
[snapshot test](https://jestjs.io/docs/en/snapshot-testing) to guard against regressions
in its render output.

Avoid big `it` blocks. Prefer small, focused test cases which are easy to read and refactor.

## Validations

This project uses a simple validation mechanism driven by `tools/runValidations.js` script.
New validations can be added to `tools/validations` directory as CommonJS modules exporting
a function, for example:

```js
module.exports = () => {
  return true; // validation success
};
```

## How to

### Lint, validate and test the project in one go?

```sh
yarn test
```

### Do a development build without any pre-checks?

```sh
yarn dev
```

### Run tests without any pre-checks?

```sh
yarn jest
```

### Run specific tests?

```sh
yarn jest -t 'TestNameRegexp'
```

### Update snapshots for specific tests?

```sh
yarn jest -t 'TestNameRegexp' -u
```
