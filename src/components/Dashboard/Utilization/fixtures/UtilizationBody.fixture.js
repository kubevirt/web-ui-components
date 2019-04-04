import React from 'react';

import { UtilizationBody } from '../UtilizationBody';
import { UtilizationItem } from '../UtilizationItem';
import { default as UtlizationItemFixture } from './UtilizationItem.fixture';

export default [
  {
    component: UtilizationBody,
    props: {
      children: <UtilizationItem {...UtlizationItemFixture[0].props} />,
    },
  },
];
