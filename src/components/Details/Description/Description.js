import React from 'react';
import PropTypes from 'prop-types';

import { getDescription } from '../../../utils';
import { InlineEdit } from '../../InlineEdit';
import { Loading } from '../../Loading';
import { DASHES } from '../../../constants';

const descriptionFormFields = {
  description: {
    id: 'description-textarea',
    type: 'textarea',
  },
};

export const Description = ({ formValues, obj, editing, updating, LoadingComponent, onFormChange }) => {
  if (!(formValues && formValues.description)) {
    onFormChange({ value: getDescription(obj) }, 'description', true);
  }

  return (
    <InlineEdit
      formFields={descriptionFormFields}
      fieldsValues={formValues}
      editing={editing}
      updating={updating}
      LoadingComponent={LoadingComponent}
      onFormChange={onFormChange}
    >
      {getDescription(obj) || DASHES}
    </InlineEdit>
  );
};

Description.propTypes = {
  formValues: PropTypes.object,
  obj: PropTypes.object.isRequired, // vm, vmTemplate
  editing: PropTypes.bool,
  updating: PropTypes.bool,
  LoadingComponent: PropTypes.func,
  onFormChange: PropTypes.func,
};

Description.defaultProps = {
  formValues: undefined,
  editing: false,
  updating: false,
  LoadingComponent: Loading,
  onFormChange: () => {},
};
