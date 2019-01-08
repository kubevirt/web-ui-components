import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';

import { ListFormFactory } from '../Form/FormFactory';
import { getName } from '../../utils/selectors';
import { validateDNS1123SubdomainValue } from '../../utils/validations';
import { VALIDATION_ERROR_TYPE } from '../../constants';
import { CancelAcceptButtons } from '../CancelAcceptButtons';

const columnSizes = {
  lg: 3,
  md: 3,
  sm: 3,
  xs: 3,
};

const getDiskColumns = (storage, storageClasses, LoadingComponent) => {
  let storageClass;
  if (storageClasses) {
    storageClass = {
      id: 'disk-storage-class',
      type: 'dropdown',
      defaultValue: storageClasses.length === 0 ? '--- No Storage Class Available ---' : '--- Select Storage Class ---',
      value: get(storage, 'storageClass.value'),
      choices: storageClasses.map(sc => getName(sc)),
      disabled: storage.creating || storageClasses.length === 0,
    };
  } else {
    storageClass = {
      id: 'disk-storage-class-loading',
      type: 'loading',
      LoadingComponent,
    };
  }

  return {
    name: {
      id: 'disk-name',
      value: get(storage, 'name.value'),
      validate: validateDNS1123SubdomainValue,
      required: true,
      title: 'Name',
      disabled: storage.creating,
    },
    size: {
      id: 'disk-size',
      type: 'positive-number',
      value: get(storage, 'size.value'),
      required: true,
      title: 'Size',
      disabled: storage.creating,
    },
    bus: {
      id: 'disk-bus',
      type: 'label',
      value: get(storage.bus, 'value'),
    },
    storageClass,
  };
};

const isValid = (columns, storage) =>
  Object.keys(columns).every(
    column =>
      get(storage[column], 'validation.type') !== VALIDATION_ERROR_TYPE &&
      (columns[column].required ? get(storage[column], 'value') : true)
  );

const getActions = (diskColumns, storage, LoadingComponent, onAccept, onCancel) =>
  storage.creating ? (
    <LoadingComponent />
  ) : (
    <CancelAcceptButtons onAccept={onAccept} onCancel={onCancel} disabled={!isValid(diskColumns, storage)} />
  );

export const CreateDiskRow = ({ storage, onChange, onAccept, onCancel, storageClasses, LoadingComponent }) => {
  const diskColumns = getDiskColumns(storage, storageClasses, LoadingComponent);
  const actions = getActions(diskColumns, storage, LoadingComponent, onAccept, onCancel);
  return (
    <ListFormFactory
      fields={diskColumns}
      fieldsValues={storage}
      actions={actions}
      onFormChange={onChange}
      columnSizes={columnSizes}
    />
  );
};

CreateDiskRow.propTypes = {
  storage: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onAccept: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  storageClasses: PropTypes.array,
  LoadingComponent: PropTypes.func.isRequired,
};

CreateDiskRow.defaultProps = {
  storageClasses: undefined,
};
