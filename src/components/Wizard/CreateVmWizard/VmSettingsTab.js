import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'patternfly-react';

import { Map as ImmutableMap } from 'immutable';

import { connect } from 'react-redux';

import { Checkbox, Dropdown, Integer, Text, TextArea } from '../../Form';
import { getName, get } from '../../../selectors';

import { NO_TEMPLATE } from './strings';

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
import { getVmSettings, isFieldDisabled, isFieldHidden, isFieldRequired } from './utils/vmSettingsTabUtils';
import {
  getDefaultValue,
  getFieldHelp,
  getFieldId,
  getFieldTitle,
} from './redux/initialState/vmSettingsTabInitialState';
import { ImportProvider } from './providers/ImportProvider/ImportProvider';
import { types, vmWizardActions } from './redux/actions';

const Namespaces = ({ namespaces, ...props }) => {
  let namespaceNames;
  if (namespaces) {
    namespaceNames = namespaces
      .toIndexedSeq()
      .toArray()
      .map(getName);
  }

  return <Dropdown {...props} choices={namespaceNames} />;
};

Namespaces.defaultProps = {
  namespaces: null,
};

Namespaces.propTypes = {
  namespaces: PropTypes.object,
};

const UserTemplates = ({ value, disabled, userTemplates, ...props }) => {
  const templateNames = userTemplates
    ? userTemplates
        .toIndexedSeq()
        .toArray()
        .map(getName)
    : [];
  templateNames.push(NO_TEMPLATE);

  return <Dropdown {...props} value={value} disabled={disabled} choices={templateNames} />;
};

UserTemplates.defaultProps = {
  value: null,
  disabled: false,
  userTemplates: null,
};

UserTemplates.propTypes = {
  value: PropTypes.string,
  disabled: PropTypes.bool,
  userTemplates: PropTypes.object,
};

const OperatingSystems = ({ operatingSystems, ...props }) => {
  let osNames;
  if (operatingSystems) {
    osNames = operatingSystems.toIndexedSeq().toArray();
  }

  return <Dropdown {...props} choices={osNames} />;
};

OperatingSystems.defaultProps = {
  operatingSystems: null,
};

OperatingSystems.propTypes = {
  operatingSystems: PropTypes.object,
};

export class VmSettingsTab extends React.Component {
  onUserTemplateChange = userTemplate => {
    this.props.onFieldChange(USER_TEMPLATE_KEY, userTemplate === NO_TEMPLATE ? null : userTemplate);
  };

  // helpers
  getField = key => get(this.props.vmSettings, key);

  getFieldAttribute = (key, attribute) => get(this.props.vmSettings, [key, attribute]);

  getValue = key => get(this.props.vmSettings, [key, 'value']);

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

  getFieldData = key => ({
    id: getFieldId(key),
    disabled: isFieldDisabled(this.getField(key)),
    value: this.getValue(key) || getDefaultValue(key),
    onChange: value => this.props.onFieldChange(key, value),
  });

  getCheckboxFieldData = key => ({
    id: getFieldId(key),
    title: getFieldTitle(key),
    disabled: isFieldDisabled(this.getField(key)),
    checked: this.getValue(key),
    onChange: value => this.props.onFieldChange(key, value),
  });

  render() {
    const { namespaces, userTemplates, children } = this.props;

    return (
      <Form horizontal>
        <FormRow {...this.getRowMetadata(NAME_KEY)}>
          <Text {...this.getFieldData(NAME_KEY)} />
        </FormRow>
        <FormRow {...this.getRowMetadata(DESCRIPTION_KEY)}>
          <TextArea {...this.getFieldData(DESCRIPTION_KEY)} />
        </FormRow>
        {/* namespaces for prop changed compare */}
        <FormRow {...this.getRowMetadata(NAMESPACE_KEY)} namespaces={namespaces}>
          <Namespaces {...this.getFieldData(NAMESPACE_KEY)} namespaces={namespaces} />
        </FormRow>
        {/* userTemplates for prop changed compare */}
        <FormRow {...this.getRowMetadata(USER_TEMPLATE_KEY)} userTemplates={userTemplates}>
          <UserTemplates
            {...this.getFieldData(USER_TEMPLATE_KEY)}
            onChange={this.onUserTemplateChange}
            userTemplates={userTemplates}
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
          <OperatingSystems
            {...this.getFieldData(OPERATING_SYSTEM_KEY)}
            operatingSystems={this.getFieldAttribute(OPERATING_SYSTEM_KEY, 'operatingSystems')}
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
  userTemplates: null,
  namespaces: null,
  dataVolumes: null,
  vmSettings: new ImmutableMap(),
};

VmSettingsTab.propTypes = {
  vmSettings: PropTypes.object,
  onFieldChange: PropTypes.func.isRequired,
  templates: PropTypes.object,
  userTemplates: PropTypes.object,
  namespaces: PropTypes.object,
  // eslint-disable-next-line react/no-unused-prop-types
  dataVolumes: PropTypes.object,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  wizardReduxId: PropTypes.string.isRequired,
  dispatchUpdateContext: PropTypes.object.isRequired,
};

const stateToProps = (state, props) => ({
  vmSettings: getVmSettings(state, props.wizardReduxId) || {},
});

const dispatchToProps = (dispatch, props) => ({
  onFieldChange: (key, value) =>
    dispatch(
      vmWizardActions[types.setVmSettingsFieldValue](props.wizardReduxId, key, value, {
        templates: props.templates,
        selectedNamespace: props.selectedNamespace,
        ...props.dispatchUpdateContext,
      })
    ),
});

export const ConnectedVmSettingsTab = connect(
  stateToProps,
  dispatchToProps
)(VmSettingsTab);
