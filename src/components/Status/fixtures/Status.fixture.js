import React from 'react';
import { Popover } from 'patternfly-react';

import { Status, OverlayStatus } from '../Status';

export default [
  {
    component: Status,
    name: 'Off status',
    props: {
      icon: 'off',
      children: 'off status',
    },
  },
  {
    component: OverlayStatus,
    name: 'Status with overlay',
    props: {
      icon: 'off',
      text: 'status text',
      overlay: (
        <Popover id="status-popover" title="popover">
          <div>some content</div>
        </Popover>
      ),
    },
  },
];
