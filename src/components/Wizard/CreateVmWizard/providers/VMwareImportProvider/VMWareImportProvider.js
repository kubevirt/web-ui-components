import React from 'react';

import { get } from 'lodash';

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
  PROVIDER_VMWARE_CHECK_CONNECTION_BTN_DONT_SAVE,
  PROVIDER_VMWARE_CHECK_CONNECTION_BTN_SAVE,
} from '../../initialState/providers/vmWareInitialState';
import { isFieldDisabled, isFieldHidden, isFieldRequired } from '../../utils/vmSettingsTabUtils';
import { getName } from '../../../../../selectors';
import { getLoadedVm, getThumbprint, getVms } from '../../../../../selectors/v2v';

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
import { getSimpleV2vVMwareStatus } from '../../../../../utils/status/v2vVMware/v2vVMwareStatus';
import {
  V2V_WMWARE_STATUS_CONNECTION_SUCCESSFUL,
  V2V_WMWARE_STATUS_UNKNOWN,
} from '../../../../../utils/status/v2vVMware';
import { getVmwareField } from './selectors';
import { correctVCenterSecretLabels } from '../../../../../k8s/requests/v2v/correctVCenterSecretLabels';
import { flatten } from '../../../../../k8s/util/k8sMethodsUtils';

export class VMWareImportProvider extends React.Component {
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
    const secret =
      value === CONNECT_TO_NEW_INSTANCE ? null : this.getFlattenVCenterSecrets().find(s => getName(s) === value);
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

  getFlattenVCenterSecrets = () => flatten(this.props, 'vCenterSecrets', []);

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
    const v2vvmware = flatten(this.props, 'v2vvmware', {});

    const savedVM = this.getFieldAttribute(PROVIDER_VMWARE_VM_KEY, 'vm');
    const selectedVmName = this.getValue(PROVIDER_VMWARE_VM_KEY);
    const status = this.getValue(PROVIDER_VMWARE_STATUS_KEY);

    const newStatus = getSimpleV2vVMwareStatus(v2vvmware);

    const hasStatusChanged = newStatus !== status;

    let update;

    if (selectedVmName && get(savedVM, 'name') !== selectedVmName) {
      const vm = getLoadedVm(v2vvmware, selectedVmName);
      if (vm) {
        update = {
          [PROVIDER_VMWARE_VM_KEY]: {
            vm,
            vmwareToKubevirtOsConfigMap: flatten(this.props, 'vmwareToKubevirtOsConfigMap'),
            thumbprint: getThumbprint(v2vvmware),
          },
          [PROVIDER_VMWARE_STATUS_KEY]: {
            value: hasStatusChanged ? newStatus : undefined,
          },
        };
      }
    }
    if (!update && hasStatusChanged && newStatus !== V2V_WMWARE_STATUS_UNKNOWN) {
      update = {
        [PROVIDER_VMWARE_STATUS_KEY]: {
          value: newStatus,
        },
      };
    }

    if (update) {
      this.onDataChange(update);
    }

    if (hasStatusChanged && newStatus === V2V_WMWARE_STATUS_CONNECTION_SUCCESSFUL) {
      correctVCenterSecretLabels(
        {
          secret: flatten(this.props, 'activeVcenterSecret'),
          saveCredentialsRequested: this.getValue(PROVIDER_VMWARE_REMEMBER_PASSWORD_KEY),
        },
        { k8sPatch: this.props.k8sPatch }
      );
    }
  }

  render() {
    const { loadError } = this.props;

    if (loadError) {
      // TODO: notify the user better
      // Reuse https://github.com/kubevirt/web-ui-components/pull/503 when merged
      // eslint-disable-next-line no-console
      console.warn('VMWareImportProvider failed to load data: ', loadError.message);
    }

    const vCenterSecrets = this.getFlattenVCenterSecrets();
    const secretNames = vCenterSecrets.map(getName);
    const secrets = [CONNECT_TO_NEW_INSTANCE, ...secretNames];
    const v2vvmware = flatten(this.props, 'v2vvmware', {});

    const vms = getVms(v2vvmware);
    let vmNames = [];
    if (vms) {
      vmNames = Array.from(new Set(vms.map(vm => vm.name))).sort((a, b) =>
        a.toLowerCase().localeCompare(b.toLowerCase())
      );
    }

    return (
      <React.Fragment>
        <FormRow {...this.getRowMetadata(PROVIDER_VMWARE_VCENTER_KEY)}>
          <Dropdown
            {...this.getFieldData(PROVIDER_VMWARE_VCENTER_KEY)}
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
            {this.getValue(PROVIDER_VMWARE_REMEMBER_PASSWORD_KEY)
              ? PROVIDER_VMWARE_CHECK_CONNECTION_BTN_SAVE
              : PROVIDER_VMWARE_CHECK_CONNECTION_BTN_DONT_SAVE}
          </Button>
        </FormRow>
        <FormRow isHidden={isFieldHidden(this.getField(PROVIDER_VMWARE_STATUS_KEY))}>
          <VMWareProviderStatus status={this.getValue(PROVIDER_VMWARE_STATUS_KEY)} />
        </FormRow>
        <FormRow {...this.getRowMetadata(PROVIDER_VMWARE_VM_KEY)}>
          <Dropdown {...this.getFieldData(PROVIDER_VMWARE_VM_KEY)} choices={vmNames} />
        </FormRow>
      </React.Fragment>
    );
  }
}

VMWareImportProvider.defaultProps = {
  vCenterSecrets: null, // TODO: add loading when undefined
  v2vvmware: null,
  vmwareToKubevirtOsConfigMap: null,
  activeVcenterSecret: null,
  loadError: undefined,
};

VMWareImportProvider.propTypes = {
  vmSettings: PropTypes.object.isRequired,
  k8sPatch: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  vCenterSecrets: PropTypes.object,
  v2vvmware: PropTypes.object,
  vmwareToKubevirtOsConfigMap: PropTypes.object,
  activeVcenterSecret: PropTypes.object,
  loadError: PropTypes.object,
};
