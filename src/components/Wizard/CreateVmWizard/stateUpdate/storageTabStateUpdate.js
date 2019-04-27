import {
  VM_SETTINGS_TAB_KEY,
  PROVISION_SOURCE_TYPE_KEY,
  STORAGE_TAB_KEY,
  STORAGE_TYPE_CONTAINER,
  STORAGE_TYPE_DATAVOLUME,
  USER_TEMPLATE_KEY,
} from '../constants';
import { getTemplateStorages, getUserTemplate, objectMerge } from '../../../../utils';
import {
  PROVISION_SOURCE_CLONED_DISK,
  PROVISION_SOURCE_CONTAINER,
  PROVISION_SOURCE_IMPORT,
  PROVISION_SOURCE_PXE,
  PROVISION_SOURCE_URL,
} from '../../../../constants';
import { settingsValue } from '../../../../k8s/selectors';
import { hasVmSettingsChanged } from '../utils/vmSettingsTabUtils';

// left intentionally empty
const TEMPLATE_ROOT_STORAGE = {};

const rootDisk = {
  rootStorage: {},
  name: 'rootdisk',
  isBootable: true,
};
export const rootContainerDisk = {
  ...rootDisk,
  storageType: STORAGE_TYPE_CONTAINER,
};
export const rootDataVolumeDisk = {
  ...rootDisk,
  storageType: STORAGE_TYPE_DATAVOLUME,
  size: 10,
};
const getInitialDisk = provisionSource => {
  switch (provisionSource) {
    case PROVISION_SOURCE_URL:
      return rootDataVolumeDisk;
    case PROVISION_SOURCE_CONTAINER:
      return rootContainerDisk;
    case PROVISION_SOURCE_PXE:
    case PROVISION_SOURCE_CLONED_DISK:
    case PROVISION_SOURCE_IMPORT:
      return null;
    default:
      // eslint-disable-next-line
      console.warn(`Unknown provision source ${provisionSource}`);
      return null;
  }
};

export const geStorageTabStateUpdate = (prevProps, prevState, props, state) => {
  const storageTabData = state.stepData[STORAGE_TAB_KEY];

  let resultRows;

  if (hasVmSettingsChanged(prevState, state, USER_TEMPLATE_KEY)) {
    const rows = storageTabData.value;
    resultRows = onUserTemplateChanged(prevProps, prevState, props, state, rows);
  }

  if (hasVmSettingsChanged(prevState, state, PROVISION_SOURCE_TYPE_KEY)) {
    const rows = storageTabData.value;
    resultRows = onProvisionSourceTypeChanged(prevProps, prevState, props, state, resultRows || rows);
  }

  if (!resultRows) {
    return null;
  }

  return objectMerge({}, state, {
    stepData: {
      [STORAGE_TAB_KEY]: {
        ...storageTabData,
        value: resultRows,
      },
    },
  });
};

const onUserTemplateChanged = (prevProps, prevState, props, state, oldRows) => {
  const vmSettings = state.stepData[VM_SETTINGS_TAB_KEY].value;
  const { dataVolumes } = props;

  const newUserTemplateName = settingsValue(vmSettings, USER_TEMPLATE_KEY);
  const newUserTemplate = newUserTemplateName ? getUserTemplate(props.templates, newUserTemplateName) : null;

  const withoutDiscardedTemplateStorage = oldRows.filter(storage => !(storage.templateStorage || storage.rootStorage));

  const rows = [...withoutDiscardedTemplateStorage];

  if (newUserTemplate) {
    const templateStorages = getTemplateStorages(newUserTemplate, dataVolumes).map(storage => ({
      templateStorage: storage,
      rootStorage: storage.disk.bootOrder === 1 ? TEMPLATE_ROOT_STORAGE : undefined,
    }));
    rows.push(...templateStorages);
  } else {
    const storage = getInitialDisk(settingsValue(vmSettings, PROVISION_SOURCE_TYPE_KEY));
    if (storage) {
      rows.push(storage);
    }
  }

  return rows;
};

const onProvisionSourceTypeChanged = (prevProps, prevState, props, state, oldRows) => {
  const filteredStorage = oldRows.filter(storage => storage.templateStorage || !storage.rootStorage);

  const rows = [...filteredStorage];
  const vmSettings = state.stepData[VM_SETTINGS_TAB_KEY].value;

  if (!settingsValue(vmSettings, USER_TEMPLATE_KEY)) {
    const storage = getInitialDisk(settingsValue(vmSettings, PROVISION_SOURCE_TYPE_KEY));
    if (storage) {
      rows.push(storage);
    }
  }
  return rows;
};
