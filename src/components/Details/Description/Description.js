import React from 'react';
import PropTypes from 'prop-types';

import { getDescription, prefixedId } from '../../../utils';
import { InlineEdit } from '../../InlineEdit';
import { Loading } from '../../Loading';
import { TEXT_AREA } from '../../Form';
import { DASHES } from '../../../constants';

const getDescriptionFormFields = id => ({
  description: {
    id: prefixedId(id, 'textarea'),
    type: TEXT_AREA,
  },
});

export const Description = ({ formValues, obj, editing, updating, LoadingComponent, onFormChange, id }) => {
  if (!(formValues && formValues.description)) {
    onFormChange({ value: getDescription(obj) }, 'description', true);
  }

  return (
    <InlineEdit
      id={id}
      formFields={getDescriptionFormFields(id)}
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
  id: PropTypes.string,
};

Description.defaultProps = {
  formValues: undefined,
  editing: false,
  updating: false,
  LoadingComponent: Loading,
  onFormChange: () => {},
  id: undefined,
};
