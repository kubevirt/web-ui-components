import React from 'react';

import PropTypes from 'prop-types';

import { Button } from 'patternfly-react';

import { connect } from 'react-redux';

import { PROVIDERS_DATA_KEY } from '../../constants';

import { Checkbox, Dropdown, PASSWORD, Text } from '../../../../Form';

import {
  getDefaultValue,
  getFieldHelp,
  getFieldId,
  getFieldTitle,
} from '../../redux/initialState/providers/vmWareInitialState';
import { getVmSettings, isFieldDisabled, isFieldHidden, isFieldRequired } from '../../utils/vmSettingsTabUtils';
import { get, getName } from '../../../../../selectors';
import { getVms } from '../../../../../selectors/v2v';

import { FormRow } from '../../../../Form/FormRow';

import { CONNECT_TO_NEW_INSTANCE } from '../../strings';
import {
  PROVIDER_VMWARE,
  PROVIDER_VMWARE_CHECK_CONNECTION_KEY,
  PROVIDER_VMWARE_HOSTNAME_KEY,
  PROVIDER_VMWARE_REMEMBER_PASSWORD_KEY,
  PROVIDER_VMWARE_STATUS_KEY,
  PROVIDER_VMWARE_USER_NAME_KEY,
  PROVIDER_VMWARE_USER_PASSWORD_KEY,
  PROVIDER_VMWARE_VCENTER_KEY,
  PROVIDER_VMWARE_VM_KEY,
} from './constants';
import VMWareProviderStatus from './VMWareProviderStatus';
import { types, vmWizardActions } from '../../redux/actions';
import { getCheckConnectionAction } from '../../redux/stateUpdate/vmSettings/providers/vmWareStateUpdate';

const DETECT_VMWARE_PROVIDER_PROP_CHANGES = ['v2vvmware', 'vmwareToKubevirtOsConfigMap'];

const VMWareVms = ({ v2vvmware, ...props }) => {
  const vms = getVms(v2vvmware);
  let vmNames;
  if (vms) {
    vmNames = vms
      .map(vm => vm.get('name'))
      .toSetSeq()
      .toArray()
      .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  }

  return <Dropdown {...props} choices={vmNames} />;
};

VMWareVms.defaultProps = {
  v2vvmware: null,
};

VMWareVms.propTypes = {
  v2vvmware: PropTypes.object,
};

const VMWareSecrets = ({ vCenterSecrets, ...props }) => {
  const secrets = [CONNECT_TO_NEW_INSTANCE, ...(vCenterSecrets ? vCenterSecrets.map(getName).toArray() : [])];

  return <Dropdown {...props} choices={secrets} />;
};

VMWareSecrets.defaultProps = {
  vCenterSecrets: null,
};

VMWareSecrets.propTypes = {
  vCenterSecrets: PropTypes.object,
};

export class VMWareImportProvider extends React.Component {
  onChange = (key, value) => {
    this.props.onFieldChange(key, { value });
  };

  onSecretChange = value => {
    const secret = value === CONNECT_TO_NEW_INSTANCE ? null : this.props.vCenterSecrets.find(s => getName(s) === value);
    this.props.onFieldChange(PROVIDER_VMWARE_VCENTER_KEY, {
      value,
      secret,
    });
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    let somePropChanged = false;
    const changedProps = DETECT_VMWARE_PROVIDER_PROP_CHANGES.reduce((changedPropsAcc, propName) => {
      const propChanged = prevProps[propName] !== this.props[propName];
      changedPropsAcc[propName] = propChanged;

      if (!somePropChanged && propChanged) {
        somePropChanged = true;
      }
      return changedPropsAcc;
    }, {});

    if (somePropChanged) {
      this.props.onPropsDataChanged(changedProps);
    }
  }

  // helpers
  getField = key => get(this.props.vmWareData, key);

  getFieldAttribute = (key, attribute) => get(this.props.vmWareData, [key, attribute]);

  getValue = key => get(this.props.vmWareData, [key, 'value']);

  getRowMetadata = key => {
    const field = this.getField(key);
    return {
      key,
      title: getFieldTitle(key),
      help: getFieldHelp(key, this.getValue(key)),
      validation: this.getFieldAttribute(key, 'validation'),
      isHidden: isFieldHidden(field),
      isRequired: isFieldRequired(field),
      field, // for component prop changed compare
    };
  };

  getHiddenMetadata = key => {
    const field = this.getField(key);
    return {
      key,
      isHidden: isFieldHidden(field),
      field, // for component prop changed compare
    };
  };

  getFieldData = key => ({
    id: getFieldId(key),
    disabled: isFieldDisabled(this.getField(key)),
    value: this.getValue(key) || getDefaultValue(key),
    onChange: value => this.onChange(key, value),
  });

  getCheckboxFieldData = key => ({
    id: getFieldId(key),
    title: getFieldTitle(key),
    disabled: isFieldDisabled(this.getField(key)),
    checked: this.getValue(key),
    onChange: value => this.onChange(key, value),
  });

  render() {
    const { vCenterSecrets, v2vvmware } = this.props;

    return (
      <React.Fragment>
        {/* vCenterSecrets for prop changed compare */}
        <FormRow {...this.getRowMetadata(PROVIDER_VMWARE_VCENTER_KEY)} vCenterSecrets={vCenterSecrets}>
          <VMWareSecrets
            {...this.getFieldData(PROVIDER_VMWARE_VCENTER_KEY)}
            onChange={this.onSecretChange}
            vCenterSecrets={vCenterSecrets}
          />
        </FormRow>
        <FormRow {...this.getRowMetadata(PROVIDER_VMWARE_HOSTNAME_KEY)}>
          <Text {...this.getFieldData(PROVIDER_VMWARE_HOSTNAME_KEY)} />
        </FormRow>
        <FormRow {...this.getRowMetadata(PROVIDER_VMWARE_USER_NAME_KEY)}>
          <Text {...this.getFieldData(PROVIDER_VMWARE_USER_NAME_KEY)} />
        </FormRow>
        <FormRow {...this.getRowMetadata(PROVIDER_VMWARE_USER_PASSWORD_KEY)}>
          <Text {...this.getFieldData(PROVIDER_VMWARE_USER_PASSWORD_KEY)} type={PASSWORD} />
        </FormRow>
        <FormRow
          {...this.getRowMetadata(PROVIDER_VMWARE_REMEMBER_PASSWORD_KEY)}
          title=""
          className="kubevirt-create-vm-wizard__import-vmware-password"
        >
          <Checkbox {...this.getCheckboxFieldData(PROVIDER_VMWARE_REMEMBER_PASSWORD_KEY)} />
        </FormRow>
        <FormRow {...this.getHiddenMetadata(PROVIDER_VMWARE_CHECK_CONNECTION_KEY)}>
          <Button
            id={getFieldId(PROVIDER_VMWARE_CHECK_CONNECTION_KEY)}
            className="kubevirt-create-vm-wizard__import-vmware-passwordcheck-button"
            disabled={isFieldDisabled(this.getField(PROVIDER_VMWARE_CHECK_CONNECTION_KEY))}
            onClick={this.props.onCheckConnection}
          >
            Check
          </Button>
        </FormRow>
        <FormRow {...this.getHiddenMetadata(PROVIDER_VMWARE_STATUS_KEY)}>
          <VMWareProviderStatus status={this.getValue(PROVIDER_VMWARE_STATUS_KEY)} />
        </FormRow>
        {/* v2vvmware for prop changed compare */}
        <FormRow {...this.getRowMetadata(PROVIDER_VMWARE_VM_KEY)} v2vvmware={v2vvmware}>
          <VMWareVms {...this.getFieldData(PROVIDER_VMWARE_VM_KEY)} v2vvmware={v2vvmware} />
        </FormRow>
      </React.Fragment>
    );
  }
}

VMWareImportProvider.defaultProps = {
  vCenterSecrets: null, // TODO: add loading when null
  v2vvmware: null,
  vmwareToKubevirtOsConfigMap: null,
};

VMWareImportProvider.propTypes = {
  vCenterSecrets: PropTypes.object,
  v2vvmware: PropTypes.object,
  vmwareToKubevirtOsConfigMap: PropTypes.object,
  // from connect
  vmWareData: PropTypes.object.isRequired,
  wizardReduxId: PropTypes.string.isRequired,
  dispatchUpdateContext: PropTypes.object.isRequired,
  onFieldChange: PropTypes.func.isRequired,
  onPropsDataChanged: PropTypes.func.isRequired,
  onCheckConnection: PropTypes.func.isRequired,
};

const stateToProps = (state, props) => ({
  vmWareData: getVmSettings(state, props.wizardReduxId).getIn([PROVIDERS_DATA_KEY, PROVIDER_VMWARE]),
});

const dispatchToProps = (dispatch, props) => ({
  onFieldChange: (key, value) =>
    dispatch(
      vmWizardActions[types.updateVmSettingsProviderField](props.wizardReduxId, PROVIDER_VMWARE, key, value, {
        ...props,
        ...props.dispatchUpdateContext,
      })
    ),
  onCheckConnection: () =>
    dispatch(
      getCheckConnectionAction(props.wizardReduxId, {
        ...props,
        ...props.dispatchUpdateContext,
      })
    ),
  onPropsDataChanged: changedProps => {
    dispatch(
      vmWizardActions[types.propsDataChanged](
        props.wizardReduxId,
        { ...props, ...props.dispatchUpdateContext },
        changedProps
      )
    );
  },
});

export const ConnectedVMWareImportProvider = connect(
  stateToProps,
  dispatchToProps
)(VMWareImportProvider);
