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
  USE_CLOUD_INIT_KEY,
  IMAGE_URL_KEY,
  CONTAINER_IMAGE_KEY,
  PROVIDER_KEY,
  PROVIDERS_DATA_KEY,
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
import {
  PROVIDER_VMWARE,
  PROVIDER_VMWARE_HOSTNAME_KEY,
  PROVIDER_VMWARE_USER_NAME_KEY,
  PROVIDER_VMWARE_REMEMBER_PASSWORD_KEY,
  PROVIDER_VMWARE_VCENTER_KEY,
  PROVIDER_VMWARE_V2V_NAME_KEY,
  PROVIDER_VMWARE_USER_PASSWORD_KEY,
  PROVIDER_VMWARE_VM_KEY,
} from '../../components/Wizard/CreateVmWizard/providers/VMwareImportProvider/constants';

export const vmSettingsContainer = {
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

export const vmSettingsUrl = {
  ...vmSettingsContainer,
  [PROVISION_SOURCE_TYPE_KEY]: {
    value: PROVISION_SOURCE_URL,
  },
  [IMAGE_URL_KEY]: {
    value: 'httpURL',
  },
};

export const vmSettingsPxe = {
  ...vmSettingsContainer,
  [PROVISION_SOURCE_TYPE_KEY]: {
    value: PROVISION_SOURCE_PXE,
  },
};

export const vmSettingsCloudInit = {
  ...vmSettingsContainer,
  [USE_CLOUD_INIT_KEY]: {
    value: true,
  },
  [HOST_NAME_KEY]: {
    value: 'hostname',
  },
  [AUTHKEYS_KEY]: {
    value: 'keys',
  },
};

export const vmSettingsCustomFlavor = {
  ...vmSettingsContainer,
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

export const vmSettingsUserTemplate = {
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

// TODO repair
export const vmSettingsImportVmwareNewConnection = {
  [NAME_KEY]: vmSettingsContainer[NAME_KEY],
  [NAMESPACE_KEY]: vmSettingsContainer[NAMESPACE_KEY],
  [PROVISION_SOURCE_TYPE_KEY]: {
    value: PROVISION_SOURCE_IMPORT,
  },
  [PROVIDER_KEY]: {
    value: PROVIDER_VMWARE,
  },
  [PROVIDER_VMWARE_VCENTER_KEY]: {
    value: CONNECT_TO_NEW_INSTANCE,
  },
  [PROVIDERS_DATA_KEY]: {
    [PROVIDER_VMWARE]: {
      [PROVIDER_VMWARE_V2V_NAME_KEY]: 'v2vvmware-object-name',
      [PROVIDER_VMWARE_USER_NAME_KEY]: {
        value: 'username',
      },
      [PROVIDER_VMWARE_HOSTNAME_KEY]: {
        value: 'my.domain.com',
      },
      [PROVIDER_VMWARE_USER_PASSWORD_KEY]: {
        value: 'password',
      },
      [PROVIDER_VMWARE_REMEMBER_PASSWORD_KEY]: {
        value: true,
      },
      [PROVIDER_VMWARE_VM_KEY]: {
        value: 'vm',
        vm: {
          name: 'vm',
          detail: {
            hostPath: 'hostpath',
          },
        },
      },
    },
  },
  [FLAVOR_KEY]: vmSettingsContainer[FLAVOR_KEY],
  [WORKLOAD_PROFILE_KEY]: vmSettingsContainer[WORKLOAD_PROFILE_KEY],
  [OPERATING_SYSTEM_KEY]: vmSettingsContainer[OPERATING_SYSTEM_KEY],
};

export const vmSettingsContainerWindows = {
  ...vmSettingsContainer,
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
