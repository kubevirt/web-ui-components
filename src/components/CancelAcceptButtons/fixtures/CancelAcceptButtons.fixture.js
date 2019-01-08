import { noop } from 'patternfly-react';

import { CancelAcceptButtons } from '..';

export default [
  {
    component: CancelAcceptButtons,
    name: 'Enabled Cancel Accept Buttons',
    props: {
      onAccept: noop,
      onCancel: noop,
      disabled: false,
    },
  },
  {
    component: CancelAcceptButtons,
    name: 'Disabled Cancel Accept Buttons',
    props: {
      onAccept: noop,
      onCancel: noop,
      disabled: true,
    },
  },
];
