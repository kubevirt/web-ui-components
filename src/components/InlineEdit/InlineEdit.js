import React from 'react';
import PropTypes from 'prop-types';

import { InlineFormFactory } from '../Form';
import { Loading } from '../Loading/Loading';

export const InlineEdit = ({
  updating,
  editing,
  formFields,
  LoadingComponent,
  children,
  onFormChange,
  fieldsValues,
  id,
  showLabels,
}) => {
  if (updating) {
    return <LoadingComponent id={id} />;
  }
  if (editing) {
    return (
      <InlineFormFactory
        fields={formFields}
        fieldsValues={fieldsValues}
        onFormChange={onFormChange}
        showLabels={showLabels}
      />
    );
  }
  return <div id={id}>{children}</div>;
};

InlineEdit.propTypes = {
  updating: PropTypes.bool,
  editing: PropTypes.bool,
  formFields: PropTypes.object,
  LoadingComponent: PropTypes.func,
  children: PropTypes.node.isRequired,
  onFormChange: PropTypes.func,
  fieldsValues: PropTypes.object,
  id: PropTypes.string,
  showLabels: PropTypes.bool,
};

InlineEdit.defaultProps = {
  updating: false,
  editing: false,
  formFields: {},
  LoadingComponent: Loading,
  onFormChange: () => {},
  fieldsValues: {},
  id: undefined,
  showLabels: false,
};
