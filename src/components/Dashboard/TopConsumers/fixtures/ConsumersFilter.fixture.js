import React from 'react';

import { ConsumersFilter } from '../ConsumersFilter';
import { Dropdown } from '../../../Form';

export default {
  component: ConsumersFilter,
  props: { children: <Dropdown id="id" value="fooValue" choices={['choice1', 'choice2']} /> },
};
