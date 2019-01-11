import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';

import { getCpu, getFlavor, getMemory, retrieveVmTemplate } from '../../../utils';
import { InlineEdit } from '../../InlineEdit/InlineEdit';
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
    this.props.onFormChange({ value: flavor }, 'flavor', flavor !== CUSTOM_FLAVOR);
    if (flavor === CUSTOM_FLAVOR) {
      this.props.onFormChange({ value: cpu }, 'cpu', !!cpu);
      this.props.onFormChange({ value: memoryInt }, 'memory', !!memoryInt);
    }
  };

  componentDidMount() {
    this.setState({
      loadingTemplate: true,
    });
    const promise = retrieveVmTemplate(this.props.k8sGet, this.props.vm);
    promise
      .then(result => {
        this.onFormChange(this.flavorFormFields(), result, 'template');
        return this.setState({
          loadingTemplate: false,
          template: result,
        });
      })
      .catch(error => {
        this.props.onLoadError(error.message || 'An error occurred while loading vm flavors. Please try again.');
        return this.setState({
          loadingTemplate: false,
          template: null,
        });
      });
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
      isVisible: formValues => settingsValue(formValues, 'flavor') === CUSTOM_FLAVOR,
    },
    memory: {
      id: 'flavor-memory',
      title: 'Memory (GB)',
      type: 'positive-number',
      required: true,
      isVisible: formValues => settingsValue(formValues, 'flavor') === CUSTOM_FLAVOR,
    },
  });

  isFormFieldValid = (formFields, formValues) =>
    Object.keys(formFields)
      .filter(key => (formFields[key].isVisible ? formFields[key].isVisible(formValues) : true))
      .every(
        key =>
          get(formValues[key], 'validation.type') !== VALIDATION_ERROR_TYPE &&
          (formFields[key].required ? settingsValue(formValues, key) : true)
      );

  onFormChange = (formFields, newValue, key) => {
    const newFormValues = {
      ...this.props.formValues,
      [key]: newValue,
    };
    const valid = this.isFormFieldValid(formFields, newFormValues);
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
        onFormChange={(newValue, key) => this.onFormChange(formFields, newValue, key)}
        fieldsValues={this.props.formValues}
      >
        <div>{getFlavor(this.props.vm) || CUSTOM_FLAVOR}</div>
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
