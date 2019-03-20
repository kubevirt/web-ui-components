import React from 'react';

import { ConsumersResults } from '../ConsumersResults';
import { default as ConsumerItemFixtures } from './ConsumerItem.fixture';
import { ConsumerItem } from '../ConsumerItem';

export default {
  component: ConsumersResults,
  props: {
    children: [
      <ConsumerItem key="0" {...ConsumerItemFixtures.props} />,
      <ConsumerItem key="1" {...ConsumerItemFixtures.props} />,
    ],
  },
};
