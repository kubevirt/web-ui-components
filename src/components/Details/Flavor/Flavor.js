import React from 'react';
import PropTypes from 'prop-types';

import { getCpu, getFlavor, getMemory, getVmTemplate } from '../../../utils';
import { InlineEdit } from '../../InlineEdit/InlineEdit';
import { TemplateModel } from '../../../models';
import { CUSTOM_FLAVOR, VALIDATION_ERROR_TYPE } from '../../../constants';
import { getTemplateFlavors, settingsValue } from '../../../k8s/selectors';
import { Loading } from '../../Loading/Loading';

export class Flavor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingTemplate: false,
      template: null,
    };
    this.resolveInitialValues();
  }

  resolveInitialValues = () => {
    const flavor = getFlavor(this.props.vm) || CUSTOM_FLAVOR;
    const cpu = getCpu(this.props.vm);
    const memory = getMemory(this.props.vm);
    const memoryInt = memory ? parseInt(memory, 10) : undefined;
    this.props.onFormChange({ value: flavor }, 'flavor');
    if (flavor === CUSTOM_FLAVOR) {
      this.props.onFormChange({ value: cpu }, 'cpu', !!cpu);
      this.props.onFormChange({ value: memoryInt }, 'memory', !!memoryInt);
    }
  };

  componentDidMount() {
    const template = getVmTemplate(this.props.vm);
    if (template) {
      this.setState({
        loadingTemplate: true,
      });
      const getTemplatePromise = this.props.k8sGet(TemplateModel, template.name, template.namespace);
      getTemplatePromise
        .then(result => {
          this.props.onFormChange(result, 'template');
          return this.setState({
            loadingTemplate: false,
            template: result,
          });
        })
        .catch(error => {
          this.props.onLoadError(error.message || 'An error occurred while loading vm flavors. Please try again.');
          this.setState({
            loadingTemplate: false,
            template: null,
          });
        });
    }
  }

  getFlavorDescription = () => {
    const cpu = getCpu(this.props.vm);
    const memory = getMemory(this.props.vm);
    const cpuStr = cpu ? `${cpu} CPU` : '';
    const memoryStr = memory ? `${memory} Memory` : '';
    const resourceStr = cpuStr && memoryStr ? `${cpuStr}, ${memoryStr}` : `${cpuStr}${memoryStr}`;
    return resourceStr ? <div>{resourceStr}</div> : undefined;
  };

  getFlavorChoices = () => {
    const flavors = [];
    if (this.state.template) {
      flavors.push(...getTemplateFlavors([this.state.template]));
    }
    if (!flavors.some(flavor => flavor === CUSTOM_FLAVOR)) {
      flavors.push(CUSTOM_FLAVOR);
    }
    return flavors;
  };

  flavorFormFields = () => ({
    flavor: {
      id: 'flavor-dropdown',
      type: 'dropdown',
      choices: this.getFlavorChoices(),
    },
    cpu: {
      id: 'flavor-cpu',
      title: 'CPU',
      type: 'positive-number',
      required: true,
      isVisible: formFields => settingsValue(formFields, 'flavor') === CUSTOM_FLAVOR,
    },
    memory: {
      id: 'flavor-memory',
      title: 'Memory (GB)',
      type: 'positive-number',
      required: true,
      isVisible: formFields => settingsValue(formFields, 'flavor') === CUSTOM_FLAVOR,
    },
  });

  onFormChange = (newValue, key) => {
    let valid = true;
    if (this.props.formValues) {
      valid =
        valid &&
        !Object.keys(this.props.formValues)
          .filter(formValueKey => formValueKey !== key)
          .some(formValueKey => formValueKey.validation && formValueKey.validation.type === VALIDATION_ERROR_TYPE);
    }
    valid = valid && newValue.validation ? newValue.validation.type !== VALIDATION_ERROR_TYPE : true;
    this.props.onFormChange(newValue, key, valid);
  };

  render() {
    const { editing, updating, LoadingComponent } = this.props;
    const formFields = this.flavorFormFields();

    return (
      <InlineEdit
        formFields={formFields}
        editing={editing}
        updating={updating || (editing && this.state.loadingTemplate)}
        LoadingComponent={LoadingComponent}
        onFormChange={this.onFormChange}
        fieldsValues={this.props.formValues}
      >
        <div>{settingsValue(this.props.formValues, 'flavor')}</div>
        {this.getFlavorDescription()}
      </InlineEdit>
    );
  }
}

Flavor.propTypes = {
  vm: PropTypes.object.isRequired,
  onFormChange: PropTypes.func.isRequired,
  updating: PropTypes.bool,
  editing: PropTypes.bool,
  k8sGet: PropTypes.func.isRequired,
  LoadingComponent: PropTypes.func,
  formValues: PropTypes.object,
  onLoadError: PropTypes.func,
};

Flavor.defaultProps = {
  updating: false,
  editing: false,
  LoadingComponent: Loading,
  formValues: undefined,
  onLoadError: () => {},
};
