import BasicSettingsTab from '../BasicSettingsTab';
import { namespaces } from '../../NewVmWizard/fixtures/NewVmWizard.fixture';
import { templates } from '../../../../constants';

export const basicSettings = {
  name: {
    value: null,
  },
  namespace: {
    value: null,
  },
  imageSourceType: {
    value: null,
  },
  operatingSystem: {
    value: null,
  },
  flavor: {
    value: null,
  },
  workloadProfile: {
    value: null,
  },
};

export const validBasicSettings = {
  name: {
    value: 'name',
  },
  namespace: {
    value: 'namespace',
  },
  imageSourceType: {
    value: 'PXE',
  },
  operatingSystem: {
    value: 'operatingSystem',
  },
  flavor: {
    value: 'flavor',
  },
  workloadProfile: {
    value: 'workloadProfile',
  },
};

export default {
  component: BasicSettingsTab,
  props: {
    templates,
    namespaces,
    basicSettings,
    onChange: () => {},
  },
};
