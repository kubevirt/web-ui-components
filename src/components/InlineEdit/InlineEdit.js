import React from 'react';
import PropTypes from 'prop-types';

import { InlineFormFactory } from '../Form/FormFactory';
import { Loading } from '../Loading/Loading';

export const InlineEdit = ({
  updating,
  editing,
  formFields,
  LoadingComponent,
  children,
  onFormChange,
  fieldsValues,
}) => {
  if (updating) {
    return <LoadingComponent />;
  }
  if (editing) {
    return <InlineFormFactory fields={formFields} fieldsValues={fieldsValues} onFormChange={onFormChange} />;
  }
  return <div>{children}</div>;
};

InlineEdit.propTypes = {
  updating: PropTypes.bool,
  editing: PropTypes.bool,
  formFields: PropTypes.object,
  LoadingComponent: PropTypes.func,
  children: PropTypes.node.isRequired,
  onFormChange: PropTypes.func,
  fieldsValues: PropTypes.object,
};

InlineEdit.defaultProps = {
  updating: false,
  editing: false,
  formFields: {},
  LoadingComponent: Loading,
  onFormChange: () => {},
  fieldsValues: {},
};
