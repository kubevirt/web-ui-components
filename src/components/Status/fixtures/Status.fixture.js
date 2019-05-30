import React from 'react';

import { Status, PopoverStatus, StatusDescriptionField, StatusLinkField, StatusProgressField } from '../Status';

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
    component: PopoverStatus,
    name: 'Status with overlay',
    props: {
      icon: 'off',
      header: 'status text',
      children: <div>some content</div>,
    },
  },
  {
    component: StatusDescriptionField,
    name: 'Status description field with title',
    props: {
      title: 'important',
      children: <div>some important content</div>,
    },
  },
  {
    component: StatusDescriptionField,
    name: 'Status description field without title',
    props: {
      children: <div>some less important content</div>,
    },
  },
  {
    component: StatusLinkField,
    name: 'Status link field with title',
    props: {
      title: 'example',
      linkTo: 'http://example.com',
    },
  },
  {
    component: StatusLinkField,
    name: 'Status link field without title',
    props: {
      linkTo: 'http://example.com',
    },
  },
  {
    component: StatusProgressField,
    name: 'Status progress bar',
    props: {
      title: 'Completeness',
      progress: 42,
    },
  },
];
