import React from 'react';

import { HealthBody } from '../HealthBody';
import { HealthItem } from '../HealthItem';
import { default as HealthItemFixture } from './HealthItem.fixture';

export default {
  component: HealthBody,
  props: {
    children: <HealthItem {...HealthItemFixture[0].props} />,
  },
};
