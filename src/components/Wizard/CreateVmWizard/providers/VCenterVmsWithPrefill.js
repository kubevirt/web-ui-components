import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';

import { Dropdown } from '../../../Form';
import { settingsValue } from '../../../../k8s/selectors';

import { BATCH_CHANGES_KEY, DESCRIPTION_KEY, NAME_KEY, PROVIDER_VMWARE_VM_KEY } from '../constants';

class VCenterVmsWithPrefill extends React.Component {
  state = {
    lastName: undefined, // last prefilled VM name value
    lastDescription: undefined,
  };

  prefillVmName(basicSettings, onFormChange, vmVmware) {
    const value = get(vmVmware, ['Config', 'Name']);
    const formName = settingsValue(basicSettings, NAME_KEY);
    if (!formName || formName === this.state.lastName) {
      if (this.state.lastName !== value) {
        // avoid infinite loop
        this.setState({ lastName: value });
        return { value, target: NAME_KEY };
      }
    }
    return undefined;
  }

  prefillVmDescription(basicSettings, onFormChange, vmVmware) {
    const value = get(vmVmware, ['Config', 'Annotation']);
    const formValue = settingsValue(basicSettings, DESCRIPTION_KEY);
    if (!formValue || formValue === this.state.lastDescription) {
      if (this.state.lastDescription !== value) {
        // avoid infinite loop
        this.setState({ lastDescription: value });
        return { value, target: DESCRIPTION_KEY };
      }
    }
    return undefined;
  }

  prefillValues(basicSettings, onFormChange, vmVmware) {
    const result = [];

    const namePair = this.prefillVmName(basicSettings, onFormChange, vmVmware);
    if (namePair) {
      result.push(namePair);
    }

    const descrPair = this.prefillVmDescription(basicSettings, onFormChange, vmVmware);
    if (descrPair) {
      result.push(descrPair);
    }

    if (result.length > 0) {
      onFormChange({ value: result }, BATCH_CHANGES_KEY);
    }
  }

  componentDidUpdate() {
    const { onFormChange, v2vvmware, basicSettings } = this.props;

    if (v2vvmware) {
      const selectedVmName = settingsValue(basicSettings, PROVIDER_VMWARE_VM_KEY);
      if (this.state.lastName !== selectedVmName) {
        // just once
        const vms = get(v2vvmware, 'spec.vms');
        const vmWithDetail = (vms || []).find(vm => vm.name === selectedVmName && vm.detail && vm.detail.raw);
        if (vmWithDetail) {
          const vmVmware = JSON.parse(vmWithDetail.detail.raw);
          this.prefillValues(basicSettings, onFormChange, vmVmware);
        }
      }
    }
  }

  render() {
    const { id, value, onChange, choices, disabled } = this.props;
    return <Dropdown id={id} value={value} onChange={onChange} choices={choices} disabled={disabled} />;
  }
}
VCenterVmsWithPrefill.defaultProps = {
  value: undefined,
  choices: [],
  disabled: true,
  v2vvmware: undefined,
};
VCenterVmsWithPrefill.propTypes = {
  id: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onFormChange: PropTypes.func.isRequired,
  basicSettings: PropTypes.object.isRequired,
  v2vvmware: PropTypes.object,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  choices: PropTypes.array,
  disabled: PropTypes.bool,
};

export default VCenterVmsWithPrefill;
