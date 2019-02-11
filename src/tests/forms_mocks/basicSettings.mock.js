import {
  OPERATING_SYSTEM_KEY,
  FLAVOR_KEY,
  WORKLOAD_PROFILE_KEY,
  USER_TEMPLATE_KEY,
  PROVISION_SOURCE_TYPE_KEY,
  NAMESPACE_KEY,
  NAME_KEY,
  START_VM_KEY,
  MEMORY_KEY,
  CPU_KEY,
  AUTHKEYS_KEY,
  HOST_NAME_KEY,
  CLOUD_INIT_KEY,
  IMAGE_URL_KEY,
  CONTAINER_IMAGE_KEY,
} from '../../components/Wizard/CreateVmWizard/constants';
import { CUSTOM_FLAVOR, PROVISION_SOURCE_PXE, PROVISION_SOURCE_URL, PROVISION_SOURCE_CONTAINER } from '../../constants';
import { urlTemplate } from '../mocks/user_template';
import { getTemplateFlavors, getTemplateOperatingSystems, getTemplateWorkloadProfiles } from '../../k8s/selectors';

export const basicSettingsContainer = {
  [NAME_KEY]: {
    value: 'name',
  },
  [NAMESPACE_KEY]: {
    value: 'default',
  },
  [PROVISION_SOURCE_TYPE_KEY]: {
    value: PROVISION_SOURCE_CONTAINER,
  },
  [CONTAINER_IMAGE_KEY]: {
    value: 'imageURL',
  },
  [FLAVOR_KEY]: {
    value: 'small',
  },
  [OPERATING_SYSTEM_KEY]: {
    value: {
      id: 'rhel7.0',
      name: 'Red Hat Enterprise Linux 7.0',
    },
  },
  [WORKLOAD_PROFILE_KEY]: {
    value: 'generic',
  },
};

export const basicSettingsUrl = {
  ...basicSettingsContainer,
  [PROVISION_SOURCE_TYPE_KEY]: {
    value: PROVISION_SOURCE_URL,
  },
  [IMAGE_URL_KEY]: {
    value: 'httpURL',
  },
};

export const basicSettingsPxe = {
  ...basicSettingsContainer,
  [PROVISION_SOURCE_TYPE_KEY]: {
    value: PROVISION_SOURCE_PXE,
  },
};

export const basicSettingsCloudInit = {
  ...basicSettingsContainer,
  [CLOUD_INIT_KEY]: {
    value: true,
  },
  [HOST_NAME_KEY]: {
    value: 'hostname',
  },
  [AUTHKEYS_KEY]: {
    value: 'keys',
  },
};

export const basicSettingsCustomFlavor = {
  ...basicSettingsContainer,
  [FLAVOR_KEY]: {
    value: CUSTOM_FLAVOR,
  },
  [CPU_KEY]: {
    value: '1',
  },
  [MEMORY_KEY]: {
    value: '1',
  },
  [START_VM_KEY]: {
    value: true,
  },
};

export const basicSettingsUserTemplate = {
  [NAME_KEY]: {
    value: 'name',
  },
  [NAMESPACE_KEY]: {
    value: 'default',
  },
  [PROVISION_SOURCE_TYPE_KEY]: {
    value: PROVISION_SOURCE_URL,
  },
  [USER_TEMPLATE_KEY]: {
    value: urlTemplate.metadata.name,
  },
  [FLAVOR_KEY]: {
    value: getTemplateFlavors([urlTemplate])[0],
  },
  [WORKLOAD_PROFILE_KEY]: {
    value: getTemplateWorkloadProfiles([urlTemplate])[0],
  },
  [OPERATING_SYSTEM_KEY]: {
    value: getTemplateOperatingSystems([urlTemplate])[0],
  },
};

export const basicSettingsContainerWindows = {
  ...basicSettingsContainer,
  [FLAVOR_KEY]: {
    value: 'medium',
  },
  [OPERATING_SYSTEM_KEY]: {
    value: {
      id: 'win2k12r2',
      name: 'Microsoft Windows Server 2012 R2',
    },
  },
};
