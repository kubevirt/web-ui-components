import BasicSettingsTab from '../BasicSettingsTab';
import { namespaces } from './CreateVmWizard.fixture';
import { templates, PROVISION_SOURCE_REGISTRY } from '../../../../constants';
import { REGISTRY_IMAGE_KEY } from '../constants';

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
    value: PROVISION_SOURCE_REGISTRY,
  },
  [REGISTRY_IMAGE_KEY]: {
    value: 'pathtoimage',
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
