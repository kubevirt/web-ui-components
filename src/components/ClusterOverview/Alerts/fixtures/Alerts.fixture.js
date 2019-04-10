import { Alerts } from '../Alerts';
import {
  criticalAlert,
  unknownTypeAlert,
  warningAlert,
  watchDogAlert,
} from '../../../Dashboard/Alert/fixtures/AlertItem.fixture';

export default {
  component: Alerts,
  props: {
    alertsResponse: [criticalAlert, unknownTypeAlert, warningAlert, watchDogAlert],
  },
};
