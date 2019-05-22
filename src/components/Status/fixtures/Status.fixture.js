import React from 'react';

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
      header: 'status text',
      children: <div>some content</div>,
    },
  },
];
