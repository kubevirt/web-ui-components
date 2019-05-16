import React from 'react';

import { DashboardCardActionsBody } from '../DashboardCardActionsBody';
import { Dropdown } from '../../../Form/Dropdown';
import { default as dropdownFixture } from '../../../Form/fixtures/Dropdown.fixture';

export default [
  {
    component: DashboardCardActionsBody,
    props: {
      children: <Dropdown {...dropdownFixture[0].props} />,
    },
  },
];
