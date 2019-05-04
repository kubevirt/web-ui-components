import React from 'react';

import { ConsumersResults } from '../ConsumersResults';
import { default as ConsumerItemFixtures } from './ConsumerItem.fixture';
import { ConsumerItem } from '../ConsumerItem';

export default [
  {
    component: ConsumersResults,
    name: 'Consumer results',
    props: {
      children: [
        <ConsumerItem key="0" {...ConsumerItemFixtures.props} />,
        <ConsumerItem key="1" {...ConsumerItemFixtures.props} />,
      ],
    },
  },
  {
    component: ConsumersResults,
    name: 'Loading Consumers',
    props: {
      isLoading: true,
    },
  },
  {
    component: ConsumersResults,
    name: 'Not available Consumers',
    props: {
      isLoading: false,
    },
  },
];
