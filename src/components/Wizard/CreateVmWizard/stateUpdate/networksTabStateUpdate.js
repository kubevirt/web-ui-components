import { findIndex } from 'lodash';

import { VM_SETTINGS_TAB_KEY, NETWORKS_TAB_KEY, USER_TEMPLATE_KEY } from '../constants';
import { getTemplateInterfaces, getUserTemplate, hasAutoAttachPodInterface, objectMerge } from '../../../../utils';
import { podNetwork } from '../initialState/networksTabInitialState';
import { settingsValue } from '../../../../k8s/selectors';
import { hasVmSettingsChanged } from '../utils/vmSettingsTabUtils';

export const getNetworksTabStateUpdate = (prevProps, prevState, props, state) => {
  const networksTabData = state.stepData[NETWORKS_TAB_KEY];

  let resultRows;

  if (hasVmSettingsChanged(prevState, state, USER_TEMPLATE_KEY)) {
    const rows = networksTabData.value;
    resultRows = onUserTemplateChanged(prevProps, prevState, props, state, rows);
  }

  if (!resultRows) {
    return null;
  }

  return objectMerge({}, state, {
    stepData: {
      [NETWORKS_TAB_KEY]: {
        ...networksTabData,
        value: resultRows,
      },
    },
  });
};

const onUserTemplateChanged = (prevProps, prevState, props, state, oldRows) => {
  const newUserTemplateName = settingsValue(state.stepData[VM_SETTINGS_TAB_KEY].value, USER_TEMPLATE_KEY);
  const newUserTemplate = newUserTemplateName ? getUserTemplate(props.templates, newUserTemplateName) : null;

  const withoutDiscardedTemplateNetworks = oldRows.filter(network => !network.templateNetwork);

  const rows = [...withoutDiscardedTemplateNetworks];
  if (!rows.find(row => row.rootNetwork)) {
    rows.push(podNetwork);
  }

  if (newUserTemplate) {
    const templateInterfaces = getTemplateInterfaces(newUserTemplate);
    const networks = templateInterfaces.map(i => ({
      templateNetwork: i,
    }));

    // do not add root interface if there already is one or autoAttachPodInterface is set to false
    if (networks.some(network => network.templateNetwork.network.pod) || !hasAutoAttachPodInterface(newUserTemplate)) {
      const index = findIndex(rows, network => network.rootNetwork);
      rows.splice(index, 1);
    }

    rows.push(...networks);
  }

  return rows;
};
