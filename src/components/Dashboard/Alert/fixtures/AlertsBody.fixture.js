import React from 'react';

import { AlertsBody } from '../AlertsBody';
import { criticalAlert, unknownTypeAlert, warningAlert } from './AlertItem.fixture';
import { AlertItem } from '../AlertItem';

export default {
  component: AlertsBody,
  props: {
    children: [
      <AlertItem key="1" alert={criticalAlert} />,
      <AlertItem key="2" alert={unknownTypeAlert} />,
      <AlertItem key="3" alert={warningAlert} />,
    ],
  },
};
