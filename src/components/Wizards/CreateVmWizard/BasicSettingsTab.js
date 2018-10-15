import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { FormFactory } from '../../Form/FormFactory';
import { isPositiveNumber } from '../../../utils/validation';
import { getName } from '../../../utils/selectors';
import {
  CUSTOM_FLAVOR,
  PROVISION_SOURCE_PXE,
  PROVISION_SOURCE_URL,
  PROVISION_SOURCE_REGISTRY,
  PROVISION_SOURCE_TEMPLATE,
  TEMPLATE_TYPE_VM
} from '../../../constants';
import {
  getOperatingSystems,
  getWorkloadProfiles,
  getFlavors,
  isImageSourceType,
  isFlavorType,
  getTemplate
} from '../../../k8s/selectors';

const NAMESPACE_KEY = 'namespace';

export const getFormFields = (basicSettings, namespaces, templates, selectedNamespace) => {
  const workloadProfiles = getWorkloadProfiles(basicSettings, templates);
  const operatingSystems = getOperatingSystems(basicSettings, templates);
  const flavors = getFlavors(basicSettings, templates);

  let namespaceDropdown;

  if (!selectedNamespace) {
    namespaceDropdown = {
      id: 'namespace-dropdown',
      title: 'Namespace',
      type: 'dropdown',
      defaultValue: '--- Select Namespace ---',
      choices: namespaces.map(getName),
      required: true
    };
  }

  return {
    name: {
      title: 'Name',
      required: true
    },
    description: {
      title: 'Description',
      type: 'textarea'
    },
    [NAMESPACE_KEY]: namespaceDropdown,
    imageSourceType: {
      id: 'image-source-type-dropdown',
      title: 'Provision Source',
      type: 'dropdown',
      defaultValue: '--- Select Provision Source ---',
      choices: [PROVISION_SOURCE_PXE, PROVISION_SOURCE_URL, PROVISION_SOURCE_REGISTRY, PROVISION_SOURCE_TEMPLATE],
      required: true
    },
    registryImage: {
      title: 'Registry Image',
      required: true,
      isVisible: basicVmSettings => isImageSourceType(basicVmSettings, PROVISION_SOURCE_REGISTRY)
    },
    imageURL: {
      title: 'URL',
      required: true,
      isVisible: basicVmSettings => isImageSourceType(basicVmSettings, PROVISION_SOURCE_URL)
    },
    userTemplate: {
      title: 'Template',
      type: 'dropdown',
      defaultValue: '--- Select Template ---',
      choices: getTemplate(templates, TEMPLATE_TYPE_VM).map(getName),
      isVisible: basicVmSettings => isImageSourceType(basicVmSettings, PROVISION_SOURCE_TEMPLATE),
      required: true
    },
    operatingSystem: {
      id: 'operating-system-dropdown',
      title: 'Operating System',
      type: 'dropdown',
      defaultValue: '--- Select Operating System ---',
      choices: operatingSystems,
      required: true,
      isVisible: basicVmSettings => !isImageSourceType(basicVmSettings, PROVISION_SOURCE_TEMPLATE)
    },
    flavor: {
      id: 'flavor-dropdown',
      title: 'Flavor',
      type: 'dropdown',
      defaultValue: '--- Select Flavor ---',
      choices: flavors,
      required: true,
      isVisible: basicVmSettings => !isImageSourceType(basicVmSettings, PROVISION_SOURCE_TEMPLATE)
    },
    memory: {
      title: 'Memory (GB)',
      required: true,
      isVisible: basicVmSettings =>
        isFlavorType(basicVmSettings, CUSTOM_FLAVOR) || isImageSourceType(basicVmSettings, PROVISION_SOURCE_TEMPLATE),
      validate: currentValue => (isPositiveNumber(currentValue) ? undefined : 'must be a number')
    },
    cpu: {
      title: 'CPUs',
      required: true,
      isVisible: basicVmSettings =>
        isFlavorType(basicVmSettings, CUSTOM_FLAVOR) || isImageSourceType(basicVmSettings, PROVISION_SOURCE_TEMPLATE),
      validate: currentValue => (isPositiveNumber(currentValue) ? undefined : 'must be a number')
    },
    workloadProfile: {
      id: 'workload-profile-dropdown',
      title: 'Workload Profile',
      type: 'dropdown',
      defaultValue: '--- Select Workload Profile ---',
      choices: workloadProfiles,
      required: true,
      isVisible: basicVmSettings => !isImageSourceType(basicVmSettings, PROVISION_SOURCE_TEMPLATE),
      help: () =>
        workloadProfiles.map(profile => (
          <p key={profile}>
            <b>{profile}</b>: {profile}
          </p>
        ))
    },
    startVM: {
      title: 'Start virtual machine on creation',
      type: 'checkbox',
      noBottom: true
    },
    /*
      createTemplate: {
        title: 'Create new template from configuration',
        type: 'checkbox',
        noBottom: true
      },
      */
    cloudInit: {
      title: 'Use cloud-init',
      type: 'checkbox'
    },
    hostname: {
      title: 'Hostname',
      isVisible: basicVmSettings => get(basicVmSettings, 'cloudInit.value', false),
      required: true
    },
    authKeys: {
      title: 'Authenticated SSH Keys',
      type: 'textarea',
      isVisible: basicVmSettings => get(basicVmSettings, 'cloudInit.value', false),
      required: true
    }
  };
};

const isFieldRequired = (formFields, key, basicVmSettings) => {
  const field = formFields[key];
  if (field && field.required) {
    return field.isVisible ? field.isVisible(basicVmSettings) : true;
  }
  return false;
};

const validateWizard = (formFields, values) => {
  let wizardValid = true;

  // check if all required fields are defined
  const requiredKeys = Object.keys(formFields).filter(key => isFieldRequired(formFields, key, values));
  const requiredKeysInValues = Object.keys(values).filter(key => isFieldRequired(formFields, key, values));

  if (requiredKeys.length !== requiredKeysInValues.length) {
    wizardValid = false;
  }

  // check if all fields are valid
  for (const key in values) {
    if (get(values[key], 'validMsg') && (formFields[key].isVisible ? formFields[key].isVisible(values) : true)) {
      wizardValid = false;
      break;
    }
  }

  return wizardValid;
};

const asValueObject = (value, validMsg) => ({
  value,
  validMsg
});

const publish = ({ basicSettings, namespaces, templates, selectedNamespace, onChange }, value, target, formFields) => {
  if (!formFields) {
    formFields = getFormFields(basicSettings, namespaces, templates, selectedNamespace);
  }

  const newBasicSettings = {
    ...basicSettings,
    [target]: value
  };

  onChange(newBasicSettings, validateWizard(formFields, newBasicSettings)); // not valid
};

class BasicSettingsTab extends React.Component {
  constructor(props) {
    super(props);
    if (props.selectedNamespace) {
      publish(props, asValueObject(getName(props.selectedNamespace)), NAMESPACE_KEY);
    }
  }

  componentDidUpdate(prevProps) {
    const newNamespace = this.props.selectedNamespace;
    const oldNamespace = prevProps.selectedNamespace;

    if (newNamespace && getName(newNamespace) !== getName(oldNamespace)) {
      publish(this.props, asValueObject(getName(newNamespace)), NAMESPACE_KEY);
    }
  }

  onFormChange = (formFields, newValue, target) => {
    let validMsg;

    if (formFields[target].validate) {
      validMsg = formFields[target].validate(newValue);
    }
    if (formFields[target].required && newValue.trim().length === 0) {
      validMsg = 'is required';
    }

    if (validMsg) {
      validMsg = `${formFields[target].title} ${validMsg}`;
    }

    publish(this.props, asValueObject(newValue, validMsg), target, formFields);
  };

  render() {
    const { basicSettings, namespaces, templates, selectedNamespace } = this.props;
    const formFields = getFormFields(basicSettings, namespaces, templates, selectedNamespace);

    return (
      <FormFactory
        fields={formFields}
        fieldsValues={basicSettings}
        onFormChange={(newValue, target) => this.onFormChange(formFields, newValue, target)}
      />
    );
  }
}

BasicSettingsTab.defaultProps = {
  selectedNamespace: undefined
};

BasicSettingsTab.propTypes = {
  templates: PropTypes.array.isRequired,
  namespaces: PropTypes.array.isRequired,
  selectedNamespace: PropTypes.object, // used only in initialization
  basicSettings: PropTypes.object.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  onChange: PropTypes.func.isRequired
};

export default BasicSettingsTab;
