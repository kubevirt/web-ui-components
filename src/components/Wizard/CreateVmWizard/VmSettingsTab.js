import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'patternfly-react';
import { get } from 'lodash';

import { Checkbox, Dropdown, Integer, Text, TextArea } from '../../Form';
import { getName } from '../../../selectors';
import { getTemplate } from '../../../utils/templates';

import { NO_TEMPLATE } from './strings';

import { TEMPLATE_TYPE_VM } from '../../../constants';

import {
  AUTHKEYS_KEY,
  CLOUD_INIT_CUSTOM_SCRIPT_KEY,
  CONTAINER_IMAGE_KEY,
  CPU_KEY,
  DESCRIPTION_KEY,
  FLAVOR_KEY,
  HOST_NAME_KEY,
  IMAGE_URL_KEY,
  MEMORY_KEY,
  NAME_KEY,
  NAMESPACE_KEY,
  OPERATING_SYSTEM_KEY,
  PROVIDER_KEY,
  PROVISION_SOURCE_TYPE_KEY,
  START_VM_KEY,
  USE_CLOUD_INIT_CUSTOM_SCRIPT_KEY,
  USE_CLOUD_INIT_KEY,
  USER_TEMPLATE_KEY,
  WORKLOAD_PROFILE_KEY,
} from './constants';
import { FormRow } from '../../Form/FormRow';
import { isFieldDisabled, isFieldHidden, isFieldRequired } from './utils/vmSettingsTabUtils';
import { getDefaultValue, getFieldHelp, getFieldId, getFieldTitle } from './initialState/vmSettingsTabInitialState';
import { ImportProvider } from './providers/ImportProvider/ImportProvider';
import { objectMerge } from '../../../utils';

export class VmSettingsTab extends React.Component {
  onChange = (key, value) => {
    this.props.onChange(
      objectMerge({}, this.props.vmSettings, {
        [key]: { value },
      })
    );
  };

  onUserTemplateChange = userTemplate => {
    this.onChange(USER_TEMPLATE_KEY, userTemplate === NO_TEMPLATE ? null : userTemplate);
  };

  // helpers
  getField = key => get(this.props.vmSettings, key);

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

  render() {
    const { namespaces, templates, children } = this.props;
    const namespaceNames = namespaces.map(getName);
    const userTemplateNames = getTemplate(templates, TEMPLATE_TYPE_VM).map(getName);
    userTemplateNames.push(NO_TEMPLATE);

    return (
      <Form horizontal>
        <FormRow {...this.getRowMetadata(NAME_KEY)}>
          <Text {...this.getFieldData(NAME_KEY)} />
        </FormRow>
        <FormRow {...this.getRowMetadata(DESCRIPTION_KEY)}>
          <TextArea {...this.getFieldData(DESCRIPTION_KEY)} />
        </FormRow>
        <FormRow {...this.getRowMetadata(NAMESPACE_KEY)}>
          <Dropdown {...this.getFieldData(NAMESPACE_KEY)} choices={namespaceNames} />
        </FormRow>
        <FormRow {...this.getRowMetadata(USER_TEMPLATE_KEY)}>
          <Dropdown
            {...this.getFieldData(USER_TEMPLATE_KEY)}
            choices={userTemplateNames}
            onChange={this.onUserTemplateChange}
          />
        </FormRow>
        <FormRow {...this.getRowMetadata(PROVISION_SOURCE_TYPE_KEY)}>
          <Dropdown
            {...this.getFieldData(PROVISION_SOURCE_TYPE_KEY)}
            choices={this.getFieldAttribute(PROVISION_SOURCE_TYPE_KEY, 'sources')}
          />
        </FormRow>
        <FormRow {...this.getRowMetadata(PROVIDER_KEY)}>
          <Dropdown {...this.getFieldData(PROVIDER_KEY)} choices={this.getFieldAttribute(PROVIDER_KEY, 'providers')} />
        </FormRow>
        {React.Children.toArray(children).filter(child => child.type.displayName === ImportProvider.displayName)}
        <FormRow {...this.getRowMetadata(CONTAINER_IMAGE_KEY)}>
          <TextArea {...this.getFieldData(CONTAINER_IMAGE_KEY)} />
        </FormRow>
        <FormRow {...this.getRowMetadata(IMAGE_URL_KEY)}>
          <TextArea {...this.getFieldData(IMAGE_URL_KEY)} />
        </FormRow>
        <FormRow {...this.getRowMetadata(OPERATING_SYSTEM_KEY)}>
          <Dropdown
            {...this.getFieldData(OPERATING_SYSTEM_KEY)}
            choices={this.getFieldAttribute(OPERATING_SYSTEM_KEY, 'operatingSystems')}
          />
        </FormRow>
        <FormRow {...this.getRowMetadata(FLAVOR_KEY)}>
          <Dropdown {...this.getFieldData(FLAVOR_KEY)} choices={this.getFieldAttribute(FLAVOR_KEY, 'flavors')} />
        </FormRow>
        <FormRow {...this.getRowMetadata(MEMORY_KEY)}>
          <Integer {...this.getFieldData(MEMORY_KEY)} positive />
        </FormRow>
        <FormRow {...this.getRowMetadata(CPU_KEY)}>
          <Integer {...this.getFieldData(CPU_KEY)} positive />
        </FormRow>
        <FormRow {...this.getRowMetadata(WORKLOAD_PROFILE_KEY)}>
          <Dropdown
            {...this.getFieldData(WORKLOAD_PROFILE_KEY)}
            choices={this.getFieldAttribute(WORKLOAD_PROFILE_KEY, 'workloadProfiles')}
          />
        </FormRow>
        <FormRow {...this.getRowMetadata(START_VM_KEY)} title="" className="kubevirt-form-group--no-bottom">
          <Checkbox {...this.getCheckboxFieldData(START_VM_KEY)} />
        </FormRow>
        <FormRow {...this.getRowMetadata(USE_CLOUD_INIT_KEY)} title="">
          <Checkbox {...this.getCheckboxFieldData(USE_CLOUD_INIT_KEY)} />
        </FormRow>
        <FormRow {...this.getRowMetadata(USE_CLOUD_INIT_CUSTOM_SCRIPT_KEY)} title="">
          <Checkbox {...this.getCheckboxFieldData(USE_CLOUD_INIT_CUSTOM_SCRIPT_KEY)} />
        </FormRow>
        <FormRow {...this.getRowMetadata(HOST_NAME_KEY)}>
          <Text {...this.getFieldData(HOST_NAME_KEY)} />
        </FormRow>
        <FormRow {...this.getRowMetadata(AUTHKEYS_KEY)}>
          <TextArea {...this.getFieldData(AUTHKEYS_KEY)} />
        </FormRow>
        <FormRow {...this.getRowMetadata(CLOUD_INIT_CUSTOM_SCRIPT_KEY)}>
          <TextArea
            {...this.getFieldData(CLOUD_INIT_CUSTOM_SCRIPT_KEY)}
            className="kubevirt-create-vm-wizard__custom-cloud-script-textarea"
          />
        </FormRow>
      </Form>
    );
  }
}

VmSettingsTab.defaultProps = {
  children: null,
  templates: null,
  namespaces: null,
  dataVolumes: null,
};

VmSettingsTab.propTypes = {
  vmSettings: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  templates: PropTypes.array,
  namespaces: PropTypes.array,
  // eslint-disable-next-line react/no-unused-prop-types
  dataVolumes: PropTypes.array,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};
