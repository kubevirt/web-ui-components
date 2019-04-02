import React from 'react';

import { CapacityBody } from '../CapacityBody';
import { CapacityItem } from '../CapacityItem';
import { default as CapacityItemFixture } from './CapacityItem.fixture';

export default {
  component: CapacityBody,
  props: {
    children: <CapacityItem {...CapacityItemFixture[0].props} />,
  },
};
