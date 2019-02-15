import React from 'react';
import PropTypes from 'prop-types';

import { getCpu, getMemory, getFlavorDescription } from '../../../utils';
import { InlineEdit } from '../../InlineEdit/InlineEdit';
import { CUSTOM_FLAVOR } from '../../../constants';
import { getTemplateFlavors, settingsValue } from '../../../k8s/selectors';
import { Loading } from '../../Loading/Loading';
import { validateForm, DROPDOWN, POSITIVE_NUMBER } from '../../Form';

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
    const { flavor, vm } = this.props;
    const cpu = getCpu(vm);
    const memory = getMemory(vm);
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
    this.props
      .retrieveVmTemplate()
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
      type: DROPDOWN,
      choices: this.getFlavorChoices(),
    },
    cpu: {
      id: 'flavor-cpu',
      title: 'CPU',
      type: POSITIVE_NUMBER,
      required: true,
      isVisible: formValues => settingsValue(formValues, 'flavor') === CUSTOM_FLAVOR,
    },
    memory: {
      id: 'flavor-memory',
      title: 'Memory (GB)',
      type: POSITIVE_NUMBER,
      required: true,
      isVisible: formValues => settingsValue(formValues, 'flavor') === CUSTOM_FLAVOR,
    },
  });

  render() {
    const { editing, updating, LoadingComponent, onFormChange, flavor } = this.props;
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
        <div>{flavor}</div>
        <div>{getFlavorDescription(this.props.vm)}</div>
      </InlineEdit>
    );
  }
}

Flavor.propTypes = {
  flavor: PropTypes.string,
  vm: PropTypes.object.isRequired,
  onFormChange: PropTypes.func.isRequired,
  updating: PropTypes.bool,
  editing: PropTypes.bool,
  retrieveVmTemplate: PropTypes.func.isRequired,
  LoadingComponent: PropTypes.func,
  formValues: PropTypes.object,
  onLoadError: PropTypes.func,
};

Flavor.defaultProps = {
  flavor: CUSTOM_FLAVOR,
  updating: false,
  editing: false,
  LoadingComponent: Loading,
  formValues: undefined,
  onLoadError: () => {},
};
