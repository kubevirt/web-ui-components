import { updateAndValidateState, cleanup } from './utils';
import { ALL_TAB_KEYS } from '../constants';
import { getTabInitialState } from './initialState';

export const types = {
  create: 'create',
  propsDataChanged: 'propsDataChanged',
  setVmSettingsFieldValue: 'setVmSettingsFieldValue',
  updateVmSettingsProviderField: 'updateVmSettingsProviderField',
  setNetworks: 'setNetworks',
  setStorages: 'setStorages',
  setResults: 'setResults',
  dispose: 'dispose',
};

// should not be called directly from outside redux code (e.g. stateUpdate)
export const internalTypes = {
  updateInternal: 'updateInternal',
  setTabValidityInternal: 'setTabValidityInternal',
  setVmSettingsFieldValueInternal: 'setVmSettingsFieldValueInternal',
  setInVmSettingsInternal: 'setVmSettingsPathInternal',
  setInVmSettingsBatchInternal: 'setVmSettingsPathBatchInternal',
  updateVmSettingsFieldInternal: 'updateVmSettingsFieldInternal',
  updateVmSettingsInternal: 'updateVmSettingsInternal',
  updateVmSettingsProviderFieldInternal: 'updateVmSettingsProviderFieldInternal',
  updateVmSettingsProviderInternal: 'updateVmSettingsProviderInternal',
};

// add provider props if needed
export const DETECT_PROP_CHANGES = [
  'selectedNamespace',
  'virtualMachines',
  'dataVolumes',
  'userTemplates',
  'commonTemplates',
];

const PROPS_NOT_CHANGED = DETECT_PROP_CHANGES.reduce((acc, propName) => {
  acc[propName] = false;
  return acc;
}, {});

const ALL_PROPS_CHANGED = DETECT_PROP_CHANGES.reduce((acc, propName) => {
  acc[propName] = true;
  return acc;
}, {});

export const vmWizardActions = {
  [types.setVmSettingsFieldValue]: (id, key, value, props) => (dispatch, getState) => {
    const prevState = getState(); // must be called before dispatch
    dispatch(vmWizardInternalActions[internalTypes.setVmSettingsFieldValueInternal](id, key, value));

    updateAndValidateState({
      id,
      props,
      dispatch,
      changedProps: PROPS_NOT_CHANGED,
      getState,
      prevState,
    });
  },
  [types.propsDataChanged]: (id, props, changedProps) => (dispatch, getState) => {
    updateAndValidateState({ id, props, dispatch, changedProps, getState, prevState: getState() });
  },
  [types.create]: (id, props) => (dispatch, getState) => {
    const prevState = getState(); // must be called before dispatch

    dispatch({
      id,
      type: types.create,
      value: ALL_TAB_KEYS.reduce((initial, tabKey) => {
        initial[tabKey] = getTabInitialState(tabKey, props);
        return initial;
      }, {}),
    });

    updateAndValidateState({
      id,
      props,
      changedProps: ALL_PROPS_CHANGED,
      dispatch,
      getState,
      prevState,
    });
  },
  [types.dispose]: (id, props) => (dispatch, getState) => {
    cleanup({ id, props, dispatch, getState });
    dispatch({
      id,
      type: types.dispose,
    });
  },
  [types.updateVmSettingsProviderField]: (id, provider, key, value, props) => (dispatch, getState) => {
    const prevState = getState(); // must be called before dispatch
    dispatch(vmWizardInternalActions[internalTypes.updateVmSettingsProviderFieldInternal](id, provider, key, value));

    updateAndValidateState({
      id,
      props,
      dispatch,
      changedProps: PROPS_NOT_CHANGED,
      getState,
      prevState,
    });
  },
  [types.setNetworks]: (id, value, valid, locked) => ({ id, value, valid, locked, type: types.setNetworks }),
  [types.setStorages]: (id, value, valid, locked) => ({ id, value, valid, locked, type: types.setStorages }),
  [types.setResults]: (id, value, valid) => ({ id, value, valid, type: types.setResults }),
};

export const vmWizardInternalActions = {
  [internalTypes.updateInternal]: (id, value) => ({
    id,
    value,
    type: internalTypes.updateInternal,
  }),
  [internalTypes.setTabValidityInternal]: (id, tab, valid) => ({
    id,
    tab,
    valid,
    type: internalTypes.setTabValidityInternal,
  }),
  [internalTypes.setVmSettingsFieldValueInternal]: (id, key, value) => ({
    id,
    key,
    value,
    type: internalTypes.setVmSettingsFieldValueInternal,
  }),
  [internalTypes.updateVmSettingsFieldInternal]: (id, key, value) => ({
    id,
    key,
    value,
    type: internalTypes.updateVmSettingsFieldInternal,
  }),
  [internalTypes.setInVmSettingsInternal]: (id, path, value) => ({
    id,
    path,
    value,
    type: internalTypes.setInVmSettingsInternal,
  }),
  [internalTypes.setInVmSettingsBatchInternal]: (id, batch) => ({
    id,
    batch,
    type: internalTypes.setInVmSettingsBatchInternal,
  }),
  [internalTypes.updateVmSettingsInternal]: (id, value) => ({
    id,
    value,
    type: internalTypes.updateVmSettingsInternal,
  }),
  [internalTypes.updateVmSettingsProviderFieldInternal]: (id, provider, key, value) => ({
    id,
    provider,
    key,
    value,
    type: internalTypes.updateVmSettingsProviderFieldInternal,
  }),
  [internalTypes.updateVmSettingsProviderInternal]: (id, provider, value) => ({
    id,
    provider,
    value,
    type: internalTypes.updateVmSettingsProviderInternal,
  }),
};
