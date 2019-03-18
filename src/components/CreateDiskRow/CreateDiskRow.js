import React from 'react';
import PropTypes from 'prop-types';

import { CreateDeviceRow } from '../CreateDeviceRow';
import { getName } from '../../selectors';
import { validateDNS1123SubdomainValue } from '../../utils/validations';
import { settingsValue } from '../../k8s/selectors';
import { NAME_KEY } from '../Wizard/CreateVmWizard/constants';
import { DROPDOWN, CUSTOM } from '../Form';

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
      type: DROPDOWN,
      defaultValue: storageClasses.length === 0 ? '--- No Storage Class Available ---' : '--- Select Storage Class ---',
      choices: storageClasses.map(sc => getName(sc)),
      disabled: storage.creating || storageClasses.length === 0,
    };
  } else {
    storageClass = {
      id: 'disk-storage-class-loading',
      type: CUSTOM,
      CustomComponent: LoadingComponent,
    };
  }

  return {
    [NAME_KEY]: {
      id: 'disk-name',
      validate: settings => validateDNS1123SubdomainValue(settingsValue(settings, NAME_KEY)),
      required: true,
      title: 'Name',
      disabled: storage.creating,
    },
    size: {
      id: 'disk-size',
      type: 'positive-number',
      required: true,
      title: 'Size',
      disabled: storage.creating,
      addendum: 'Gi',
    },
    bus: {
      id: 'disk-bus',
      type: 'label',
    },
    storageClass,
  };
};

export const CreateDiskRow = ({ storage, onAccept, onChange, onCancel, storageClasses, LoadingComponent }) => (
  <CreateDeviceRow
    onAccept={onAccept}
    onCancel={onCancel}
    onChange={onChange}
    LoadingComponent={LoadingComponent}
    device={storage}
    columnSizes={columnSizes}
    deviceFields={getDiskColumns(storage, storageClasses, LoadingComponent)}
  />
);

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
