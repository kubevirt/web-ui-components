import React from 'react';

import { get, isEmpty } from 'lodash';

import PropTypes from 'prop-types';

import { Button } from 'patternfly-react';

import { PROVIDERS_DATA_KEY } from '../../constants';

import { Checkbox, Dropdown, PASSWORD, Text } from '../../../../Form';
import { objectMerge } from '../../../../../utils';

import {
  getDefaultValue,
  getFieldHelp,
  getFieldId,
  getFieldTitle,
} from '../../initialState/providers/vmWareInitialState';
import { isFieldDisabled, isFieldHidden, isFieldRequired } from '../../utils/vmSettingsTabUtils';
import { getName } from '../../../../../selectors';
import { getLoadedVm, getThumbprint, getVms } from '../../../../../selectors/v2v';

import { FormRow } from '../../../../Form/FormRow';

import { CONNECT_TO_NEW_INSTANCE } from '../../strings';
import {
  PROVIDER_VMWARE,
  PROVIDER_VMWARE_CHECK_CONNECTION_BTN_TEXT_KEY,
  PROVIDER_VMWARE_CHECK_CONNECTION_KEY,
  PROVIDER_VMWARE_HOSTNAME_KEY,
  PROVIDER_VMWARE_REMEMBER_PASSWORD_KEY,
  PROVIDER_VMWARE_STATUS_KEY,
  PROVIDER_VMWARE_USER_NAME_KEY,
  PROVIDER_VMWARE_USER_PASSWORD_KEY,
  PROVIDER_VMWARE_V2V_LAST_ERROR,
  PROVIDER_VMWARE_VCENTER_KEY,
  PROVIDER_VMWARE_VM_KEY,
} from './constants';
import VMWareObjectStatus from './VMWareObjectStatus';
import { getSimpleV2vVMwareStatus } from '../../../../../utils/status/v2vVMware/v2vVMwareStatus';
import { V2V_WMWARE_STATUS_UNKNOWN } from '../../../../../utils/status/v2vVMware';
import { getVmwareField } from './selectors';
import VMWareControllerErrors from './VMWareControllerErrors';
import VMWareControllerStatusRow from './VMWareControllerStatusRow';

export class VMWareImportProvider extends React.Component {
  state = {
    prevLoadedVmName: null,
  };

  onDataChange = data => {
    this.props.onChange(
      objectMerge({}, this.props.vmSettings, {
        [PROVIDERS_DATA_KEY]: {
          [PROVIDER_VMWARE]: data,
        },
      })
    );
  };

  onChange = (key, value, attribute = 'value') => {
    this.onDataChange({ [key]: { [attribute]: value } });
  };

  onSecretChange = value => {
    const secret = value === CONNECT_TO_NEW_INSTANCE ? null : this.props.vCenterSecrets.find(s => getName(s) === value);
    this.onDataChange({
      [PROVIDER_VMWARE_VCENTER_KEY]: {
        value,
        secret,
      },
    });
  };

  // helpers
  getField = key => getVmwareField(this.props.vmSettings, key);

  getFieldAttribute = (key, attribute) => get(this.getField(key), attribute);

  getValue = key => this.getFieldAttribute(key, 'value');

  getRowMetadata = key => ({
    key,
    title: getFieldTitle(key),
    help: getFieldHelp(key, this.getValue(key)),
    validation: this.getFieldAttribute(key, 'validation'),
    isHidden: isFieldHidden(this.getField(key)),
    isRequired: isFieldRequired(this.getField(key)),
  });

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

  componentDidUpdate() {
    const { vmwareToKubevirtOsConfigMap, v2vvmware } = this.props;

    const { prevLoadedVmName } = this.state;

    const selectedVmName = this.getValue(PROVIDER_VMWARE_VM_KEY);
    const status = this.getValue(PROVIDER_VMWARE_STATUS_KEY);

    const newStatus = getSimpleV2vVMwareStatus(v2vvmware);

    const hasStatusChanged = newStatus !== status;

    if (selectedVmName && prevLoadedVmName !== selectedVmName) {
      const vm = getLoadedVm(this.props.v2vvmware, selectedVmName);
      if (vm) {
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({ prevLoadedVmName: selectedVmName });
        this.onDataChange({
          [PROVIDER_VMWARE_VM_KEY]: {
            vm,
            vmwareToKubevirtOsConfigMap,
            thumbprint: getThumbprint(v2vvmware),
          },
          [PROVIDER_VMWARE_STATUS_KEY]: {
            value: hasStatusChanged ? newStatus : undefined,
          },
        });
        return;
      }
    }
    if (hasStatusChanged && newStatus !== V2V_WMWARE_STATUS_UNKNOWN) {
      this.onChange(PROVIDER_VMWARE_STATUS_KEY, newStatus);
    }
  }

  render() {
    const { vCenterSecrets, v2vvmware, deployment, deploymentPods } = this.props;

    const secrets = [CONNECT_TO_NEW_INSTANCE, ...vCenterSecrets.map(getName)];

    const vms = getVms(v2vvmware);
    let vmNames = [];
    if (vms) {
      vmNames = Array.from(new Set(vms.map(vm => vm.name))).sort((a, b) =>
        a.toLowerCase().localeCompare(b.toLowerCase())
      );
    }

    const hasDeployment = !(!deployment || isEmpty(deployment));

    const errors = this.getFieldAttribute(PROVIDER_VMWARE_V2V_LAST_ERROR, 'errors');

    return (
      <React.Fragment>
        <FormRow isHidden={hasDeployment || isFieldHidden(this.getField(PROVIDER_VMWARE_V2V_LAST_ERROR))}>
          <VMWareControllerErrors id={getFieldId(PROVIDER_VMWARE_V2V_LAST_ERROR)} errors={errors} />
        </FormRow>
        <VMWareControllerStatusRow
          id="v2v-vmware-status"
          hasErrors={!!errors}
          deployment={deployment}
          deploymentPods={deploymentPods}
        />
        <FormRow {...this.getRowMetadata(PROVIDER_VMWARE_VCENTER_KEY)}>
          <Dropdown
            {...this.getFieldData(PROVIDER_VMWARE_VCENTER_KEY)}
            disabled={!hasDeployment || isFieldDisabled(this.getField(PROVIDER_VMWARE_VCENTER_KEY))}
            onChange={this.onSecretChange}
            choices={secrets}
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
        <FormRow isHidden={isFieldHidden(this.getField(PROVIDER_VMWARE_CHECK_CONNECTION_KEY))}>
          <Button
            id={getFieldId(PROVIDER_VMWARE_CHECK_CONNECTION_KEY)}
            className="kubevirt-create-vm-wizard__import-vmware-passwordcheck-button"
            disabled={isFieldDisabled(this.getField(PROVIDER_VMWARE_CHECK_CONNECTION_KEY))}
            onClick={() => this.onChange(PROVIDER_VMWARE_CHECK_CONNECTION_KEY, true)}
          >
            {this.getField(PROVIDER_VMWARE_CHECK_CONNECTION_BTN_TEXT_KEY)}
          </Button>
        </FormRow>
        <FormRow isHidden={isFieldHidden(this.getField(PROVIDER_VMWARE_STATUS_KEY))}>
          <VMWareObjectStatus status={this.getValue(PROVIDER_VMWARE_STATUS_KEY)} />
        </FormRow>
        <FormRow {...this.getRowMetadata(PROVIDER_VMWARE_VM_KEY)}>
          <Dropdown {...this.getFieldData(PROVIDER_VMWARE_VM_KEY)} choices={vmNames} />
        </FormRow>
      </React.Fragment>
    );
  }
}

VMWareImportProvider.defaultProps = {
  deployment: null,
  deploymentPods: null,
  vCenterSecrets: [], // TODO: add loading when undefined
  v2vvmware: null,
  vmwareToKubevirtOsConfigMap: null,
};

VMWareImportProvider.propTypes = {
  deployment: PropTypes.object,
  deploymentPods: PropTypes.array,
  vmSettings: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  vCenterSecrets: PropTypes.array,
  v2vvmware: PropTypes.object,
  vmwareToKubevirtOsConfigMap: PropTypes.object,
};
