import React from 'react';
import PropTypes from 'prop-types';

import { getCpuSockets, getFlavor, getMemory, retrieveVmTemplate } from '../../../utils';
import { InlineEdit } from '../../InlineEdit/InlineEdit';
import { CUSTOM_FLAVOR } from '../../../constants';
import { getTemplateFlavors, settingsValue } from '../../../k8s/selectors';
import { Loading } from '../../Loading/Loading';
import { validateForm } from '../../Form/FormFactory';
import { CPU_SOCKETS_KEY, FLAVOR_KEY, MEMORY_KEY } from '../../Wizard/CreateVmWizard/constants';

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
    const cpuSockets = getCpuSockets(this.props.vm);
    const memory = getMemory(this.props.vm);
    const memoryInt = memory ? parseInt(memory, 10) : undefined;
    this.props.onFormChange({ value: flavor }, FLAVOR_KEY, flavor !== CUSTOM_FLAVOR);
    if (flavor === CUSTOM_FLAVOR) {
      this.props.onFormChange({ value: cpuSockets }, CPU_SOCKETS_KEY, !!cpuSockets);
      this.props.onFormChange({ value: memoryInt }, MEMORY_KEY, !!memoryInt);
    }
  };

  componentDidMount() {
    this.setState({
      loadingTemplate: true,
    });
    const promise = retrieveVmTemplate(this.props.k8sGet, this.props.vm);
    promise
      .then(result => {
        this.props.onFormChange(result, 'template', validateForm(this.flavorFormFields(), this.props.formValues));
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
    const cpuSockets = getCpuSockets(this.props.vm);
    const memory = getMemory(this.props.vm);
    const cpuStr = cpuSockets ? `${cpuSockets} CPU Sockets` : '';
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
    [FLAVOR_KEY]: {
      id: 'flavor-dropdown',
      type: 'dropdown',
      choices: this.getFlavorChoices(),
    },
    [CPU_SOCKETS_KEY]: {
      id: 'flavor-cpu',
      title: 'CPU Sockets',
      type: 'positive-number',
      required: true,
      isVisible: formValues => settingsValue(formValues, 'flavor') === CUSTOM_FLAVOR,
    },
    [MEMORY_KEY]: {
      id: 'flavor-memory',
      title: 'Memory (GB)',
      type: 'positive-number',
      required: true,
      isVisible: formValues => settingsValue(formValues, 'flavor') === CUSTOM_FLAVOR,
    },
  });

  render() {
    const { editing, updating, LoadingComponent, onFormChange } = this.props;
    const formFields = this.flavorFormFields();

    return (
      <InlineEdit
        formFields={formFields}
        editing={editing}
        updating={updating || (editing && this.state.loadingTemplate)}
        LoadingComponent={LoadingComponent}
        onFormChange={onFormChange}
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
