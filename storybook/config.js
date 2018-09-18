import { configure } from '@storybook/react';
import { setOptions } from '@storybook/addon-options';
import 'patternfly-react/dist/css/patternfly-react.css';
import 'patternfly/dist/css/patternfly.css';
import 'patternfly/dist/css/patternfly-additions.css';

const storyContext = require.context('../src', true, /\.stories\.js$/);

function loadStories() {
  storyContext.keys().forEach(storyContext);
}

setOptions({
  name: 'kubevirt-web-ui',
  sortStoriesByKind: true
});

configure(loadStories, module);
