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
  PROVIDER_KEY,
  PROVIDER_VMWARE,
  PROVIDER_VMWARE_VCENTER_KEY,
  PROVIDER_VMWARE_USER_PWD_AND_CHECK_KEY,
  PROVIDER_VMWARE_CONNECTION,
  PROVIDER_VMWARE_USER_PWD_KEY,
  PROVIDER_VMWARE_URL_KEY,
  PROVIDER_VMWARE_USER_NAME_KEY,
  PROVIDER_VMWARE_USER_PWD_REMEMBER_KEY,
} from '../../components/Wizard/CreateVmWizard/constants';
import {
  CUSTOM_FLAVOR,
  PROVISION_SOURCE_PXE,
  PROVISION_SOURCE_URL,
  PROVISION_SOURCE_CONTAINER,
  PROVISION_SOURCE_IMPORT,
} from '../../constants';
import { urlTemplate } from '../mocks/user_template';
import { getTemplateFlavors, getTemplateOperatingSystems, getTemplateWorkloadProfiles } from '../../k8s/selectors';
import { CONNECT_TO_NEW_INSTANCE } from '../../components/Wizard/CreateVmWizard/strings';

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

export const basicSettingsImportVmwareNewConnection = {
  [NAME_KEY]: basicSettingsContainer[NAME_KEY],
  [NAMESPACE_KEY]: basicSettingsContainer[NAMESPACE_KEY],
  [PROVISION_SOURCE_TYPE_KEY]: {
    value: PROVISION_SOURCE_IMPORT,
  },
  [PROVIDER_KEY]: {
    value: PROVIDER_VMWARE,
  },
  [PROVIDER_VMWARE_VCENTER_KEY]: {
    value: CONNECT_TO_NEW_INSTANCE,
  },
  [PROVIDER_VMWARE_USER_PWD_AND_CHECK_KEY]: {
    value: {
      [PROVIDER_VMWARE_CONNECTION]: {
        V2VVmwareName: 'v2vvmware-object-name',
      },
      [PROVIDER_VMWARE_USER_PWD_KEY]: 'password',
    },
  },
  [PROVIDER_VMWARE_USER_NAME_KEY]: {
    value: 'username',
  },
  [PROVIDER_VMWARE_URL_KEY]: {
    value: 'my.domain.com',
  },
  [PROVIDER_VMWARE_USER_PWD_REMEMBER_KEY]: {
    value: true,
  },
  [FLAVOR_KEY]: basicSettingsContainer[FLAVOR_KEY],
  [WORKLOAD_PROFILE_KEY]: basicSettingsContainer[WORKLOAD_PROFILE_KEY],
  [OPERATING_SYSTEM_KEY]: basicSettingsContainer[OPERATING_SYSTEM_KEY],
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
