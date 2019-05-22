import { findIndex } from 'lodash';

import { CUSTOM_FLAVOR, PROVISION_SOURCE_CONTAINER, PROVISION_SOURCE_URL } from '../../../../../../constants';
import {
  selectVm,
  getTemplateFlavors,
  getTemplateOperatingSystems,
  getTemplateWorkloadProfiles,
} from '../../../../../../k8s/selectors';
import { getCloudInitUserData, getCpu, getMemory, getName } from '../../../../../../selectors';
import {
  getTemplateProvisionSource,
  getTemplateInterfaces,
  hasAutoAttachPodInterface,
  getTemplateStorages,
} from '../../../../../../utils';

import {
  CLOUD_INIT_CUSTOM_SCRIPT_KEY,
  CONTAINER_IMAGE_KEY,
  CPU_KEY,
  FLAVOR_KEY,
  IMAGE_URL_KEY,
  MEMORY_KEY,
  OPERATING_SYSTEM_KEY,
  PROVISION_SOURCE_TYPE_KEY,
  USE_CLOUD_INIT_CUSTOM_SCRIPT_KEY,
  USE_CLOUD_INIT_KEY,
  USER_TEMPLATE_KEY,
  WORKLOAD_PROFILE_KEY,
} from '../../../constants';
import { getVmSettingValue } from '../../../utils/vmSettingsTabUtils';
import { vmWizardInternalActions, internalTypes, vmWizardActions, types } from '../../actions';
import { immutableListToShallowJS } from '../../../../../../utils/immutable';
import { podNetwork } from '../../initialState/networksTabInitialState';
import { getNetworks } from '../../../utils/networksTabUtils';
import { getStorages } from '../../../utils/storageTabUtils';

// used by user template; currently we do not support PROVISION_SOURCE_IMPORT
const provisionSourceDataFieldResolver = {
  [PROVISION_SOURCE_CONTAINER]: CONTAINER_IMAGE_KEY,
  [PROVISION_SOURCE_URL]: IMAGE_URL_KEY,
};

export const prefillVmTemplateUpdater = ({ id, props, prevState, changedProps, dispatch, getState }) => {
  const state = getState();
  const { userTemplates, dataVolumes } = props;

  const userTemplateName = getVmSettingValue(state, id, USER_TEMPLATE_KEY);
  const userTemplateImmutable = userTemplateName
    ? userTemplates.find(template => getName(template) === userTemplateName)
    : null;

  const vmSettingsUpdate = {};

  // filter out oldTemplates
  const networkRowsUpdate = immutableListToShallowJS(getNetworks(state, id)).filter(
    network => !network.templateNetwork
  );
  const storageRowsUpdate = immutableListToShallowJS(getStorages(state, id)).filter(
    storage => !(storage.templateStorage || storage.rootStorage)
  );

  if (!networkRowsUpdate.find(row => row.rootNetwork)) {
    networkRowsUpdate.push(podNetwork);
  }

  if (userTemplateImmutable) {
    const userTemplate = userTemplateImmutable.toJS();

    const vm = selectVm(userTemplate.objects);

    // update flavor
    const [flavor] = getTemplateFlavors([userTemplate]);
    vmSettingsUpdate[FLAVOR_KEY] = { value: flavor };
    if (flavor === CUSTOM_FLAVOR) {
      vmSettingsUpdate[CPU_KEY] = { value: getCpu(vm) };
      const memory = getMemory(vm);
      vmSettingsUpdate[MEMORY_KEY] = { value: memory ? parseInt(memory, 10) : null };
    }

    // update os
    const [os] = getTemplateOperatingSystems([userTemplate]);
    vmSettingsUpdate[OPERATING_SYSTEM_KEY] = { value: os };

    // update workload profile
    const [workload] = getTemplateWorkloadProfiles([userTemplate]);
    vmSettingsUpdate[WORKLOAD_PROFILE_KEY] = { value: workload };

    // update cloud-init
    const cloudInitUserData = getCloudInitUserData(vm);
    if (cloudInitUserData) {
      vmSettingsUpdate[USE_CLOUD_INIT_KEY] = { value: true };
      vmSettingsUpdate[USE_CLOUD_INIT_CUSTOM_SCRIPT_KEY] = { value: true };
      vmSettingsUpdate[CLOUD_INIT_CUSTOM_SCRIPT_KEY] = { value: cloudInitUserData || '' };
    }

    // update provision source
    const provisionSource = getTemplateProvisionSource(userTemplate, dataVolumes);
    if (provisionSource) {
      vmSettingsUpdate[PROVISION_SOURCE_TYPE_KEY] = { value: provisionSource.type };
      const dataFieldName = provisionSourceDataFieldResolver[provisionSource.type];
      if (dataFieldName) {
        vmSettingsUpdate[dataFieldName] = { value: provisionSource.source };
      }
    }

    // prefill networks
    const templateInterfaces = getTemplateInterfaces(userTemplate);
    const templateNetworks = templateInterfaces.map(i => ({
      templateNetwork: i,
    }));

    // do not add root interface if there already is one or autoAttachPodInterface is set to false
    if (
      templateNetworks.some(network => network.templateNetwork.network.pod) ||
      !hasAutoAttachPodInterface(userTemplate)
    ) {
      const index = findIndex(networkRowsUpdate, network => network.rootNetwork);
      networkRowsUpdate.splice(index, 1);
    }

    networkRowsUpdate.push(...templateNetworks);

    // prefill storage
    const templateStorages = getTemplateStorages(userTemplate, dataVolumes).map(storage => ({
      templateStorage: storage,
      rootStorage: storage.disk.bootOrder === 1 ? {} : undefined,
    }));
    storageRowsUpdate.push(...templateStorages);
  }

  dispatch(vmWizardInternalActions[internalTypes.updateVmSettingsInternal](id, vmSettingsUpdate));
  dispatch(vmWizardActions[types.setNetworks](id, networkRowsUpdate));
  dispatch(vmWizardActions[types.setStorages](id, storageRowsUpdate));
};
