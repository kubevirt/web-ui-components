import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import { prefixedId } from '../../../utils';
import { getCpu, getMemory, getFlavorDescription } from '../../../selectors';
import { InlineEdit } from '../../InlineEdit/InlineEdit';
import { CUSTOM_FLAVOR } from '../../../constants';
import { getTemplateFlavors, settingsValue } from '../../../k8s/selectors';
import { Loading } from '../../Loading/Loading';
import { DROPDOWN, POSITIVE_NUMBER } from '../../Form';

export class Flavor extends React.Component {
  constructor(props) {
    super(props);
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

  getFlavorChoices = () => {
    const flavors = [];
    if (this.props.template) {
      flavors.push(...getTemplateFlavors([this.props.template]));
    }
    if (!flavors.some(flavor => flavor === CUSTOM_FLAVOR)) {
      flavors.push(CUSTOM_FLAVOR);
    }
    if (!flavors.some(flavor => flavor === this.props.flavor)) {
      flavors.push(this.props.flavor);
    }
    return flavors;
  };

  flavorFormFields = () => {
    const { id } = this.props;
    const choices = this.getFlavorChoices();

    return {
      flavor: {
        id: prefixedId(id, 'flavor-dropdown'),
        type: DROPDOWN,
        choices,
        isVisible: () => choices.length > 1,
      },
      cpu: {
        id: prefixedId(id, 'flavor-cpu'),
        title: 'CPU',
        type: POSITIVE_NUMBER,
        required: true,
        isVisible: formValues => settingsValue(formValues, 'flavor') === CUSTOM_FLAVOR,
      },
      memory: {
        id: prefixedId(id, 'flavor-memory'),
        title: 'Memory (GB)',
        type: POSITIVE_NUMBER,
        required: true,
        isVisible: formValues => settingsValue(formValues, 'flavor') === CUSTOM_FLAVOR,
      },
    };
  };

  render() {
    const { id, editing, updating, LoadingComponent, onFormChange, flavor, formValues, vm } = this.props;
    const formFields = this.flavorFormFields();
    const choices = this.getFlavorChoices();

    return (
      <Fragment>
        {choices.length === 1 && editing ? <div className="kubevirt-flavor__label">{flavor}</div> : ''}
        <InlineEdit
          formFields={formFields}
          editing={editing}
          updating={updating}
          LoadingComponent={LoadingComponent}
          onFormChange={onFormChange}
          fieldsValues={formValues}
          showLabels
        >
          <div id={prefixedId(id, 'flavor')}>{flavor}</div>
          <div id={prefixedId(id, 'flavor-description')}>{getFlavorDescription(vm)}</div>
        </InlineEdit>
      </Fragment>
    );
  }
}

Flavor.propTypes = {
  flavor: PropTypes.string,
  id: PropTypes.string.isRequired,
  vm: PropTypes.object.isRequired,
  onFormChange: PropTypes.func.isRequired,
  updating: PropTypes.bool,
  editing: PropTypes.bool,
  LoadingComponent: PropTypes.func,
  formValues: PropTypes.object,
  template: PropTypes.object,
};

Flavor.defaultProps = {
  flavor: CUSTOM_FLAVOR,
  updating: false,
  editing: false,
  LoadingComponent: Loading,
  formValues: undefined,
  template: null,
};
