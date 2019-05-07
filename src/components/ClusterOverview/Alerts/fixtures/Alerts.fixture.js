import { Alerts } from '../Alerts';
import {
  criticalAlert,
  unknownTypeAlert,
  warningAlert,
  watchDogAlert,
} from '../../../Dashboard/Alert/fixtures/AlertItem.fixture';

export default [
  {
    component: Alerts,
    name: 'Alerts',
    props: {
      alertsResponse: [criticalAlert, unknownTypeAlert, warningAlert, watchDogAlert],
    },
  },
  {
    component: Alerts,
    name: 'watchog alert',
    props: {
      alertsResponse: [watchDogAlert],
    },
  },
  {
    component: Alerts,
    name: 'empty alerts',
    props: {
      alertsResponse: [],
    },
  },
];
