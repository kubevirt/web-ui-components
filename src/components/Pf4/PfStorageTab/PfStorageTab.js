import React from 'react';
import PropTypes from 'prop-types';
import { TableVariant, Table, TableHeader, TableBody, cellWidth } from '@patternfly/react-table';
import { Button, ButtonVariant } from '@patternfly/react-core';

import {
  STORAGE_TYPE_PVC,
  STORAGE_TYPE_DATAVOLUME,
  STORAGE_TYPE_CONTAINER,
} from '../../Wizard/CreateVmWizard/constants';

import {
  getName,
  getGibStorageSize,
  getPvcStorageClassName,
  getDataVolumeStorageClassName,
  getPvcResources,
  getDataVolumeResources,
} from '../../../utils/selectors';

import {
  HEADER_NAME,
  HEADER_SIZE,
  HEADER_STORAGE_CLASS,
  REMOVE_DISK_BUTTON,
  ATTACH_DISK_BUTTON,
  CREATE_DISK_BUTTON,
} from '../../Wizard/CreateVmWizard/strings';

const resolvePvcStorage = (storage, persistentVolumeClaims, storageClasses, units) => {
  const pvcStorage = persistentVolumeClaims.find(pvc => getName(pvc) === storage.name);
  const pvcStorageClassName = getPvcStorageClassName(pvcStorage);

  return {
    ...storage,
    name: getName(pvcStorage),
    size: getGibStorageSize(units, getPvcResources(pvcStorage)),
    storageClass: getName(storageClasses.find(clazz => getName(clazz) === pvcStorageClassName)),
    storageType: STORAGE_TYPE_PVC,
  };
};

const resolveTemplateStorage = (storage, persistentVolumeClaims, storageClasses, units, sourceType) => {
  const templateStorage = {
    ...storage,
  };

  if (!templateStorage.name) {
    templateStorage.name = storage.templateStorage.disk.name;
  }

  if (storage.templateStorage.volume.persistentVolumeClaim) {
    const pvc = persistentVolumeClaims.find(
      p => getName(p) === storage.templateStorage.volume.persistentVolumeClaim.claimName
    );

    if (!templateStorage.size) {
      templateStorage.size = getGibStorageSize(units, getPvcResources(pvc));
    }
    if (!templateStorage.storageClass) {
      templateStorage.storageClass = getName(
        storageClasses.find(clazz => getName(clazz) === pvc.spec.storageClassName)
      );
    }
    templateStorage.storageType = STORAGE_TYPE_PVC;
  } else if (storage.templateStorage.volume.dataVolume) {
    const dataVolume = storage.templateStorage.dataVolume || storage.templateStorage.dataVolumeTemplate;
    if (!templateStorage.size) {
      templateStorage.size = getGibStorageSize(units, getDataVolumeResources(dataVolume));
    }
    if (!templateStorage.storageClass) {
      templateStorage.storageClass = getDataVolumeStorageClassName(dataVolume);
    }
    templateStorage.storageType = STORAGE_TYPE_DATAVOLUME;
  } else if (storage.templateStorage.volume.containerDisk) {
    templateStorage.storageType = STORAGE_TYPE_CONTAINER;
  }
  return templateStorage;
};

const resolveInitialStorages = (
  initialStorages,
  persistentVolumeClaims,
  storageClasses,
  units,
  sourceType,
  namespace
) => {
  const storages = initialStorages.map(({ data: storage, ...rest }) => {
    let result;

    if (storage.templateStorage) {
      result = resolveTemplateStorage(storage, persistentVolumeClaims, storageClasses, units, sourceType);
    } else {
      switch (storage.storageType) {
        case STORAGE_TYPE_CONTAINER:
        case STORAGE_TYPE_DATAVOLUME:
          result = storage;
          break;
        case STORAGE_TYPE_PVC:
        default:
          result = resolvePvcStorage(storage, persistentVolumeClaims, storageClasses, units);
      }
    }
    return {
      ...rest,
      data: {
        editable: true,
        ...result,
      },
    };
  });

  return storages;
};

export class PfStorageTab extends React.Component {
  constructor(props) {
    super(props);
    const rows = resolveInitialStorages(
      props.initialStorages,
      props.persistentVolumeClaims,
      props.storageClasses,
      props.units,
      props.sourceType,
      props.namespace
    );

    this.state = {
      rows: rows.filter(row => row.data.storageType),
      // eslint-disable-next-line react/no-unused-state
      otherStorages: rows.filter(row => !row.data.storageType),
    };
  }

  create = storageType => {
    this.setState(({ rows }) => ({
      rows: [
        ...rows,
        {
          data: {
            editable: true,
            isBootable: false,
            name: `test-${rows.length + 1}`,
            size: rows.length + 1,
            storageType,
          },
          cells: ['', '', ''],
        },
      ],
    }));
  };

  remove = idx =>
    this.setState(({ rows }) => ({
      rows: rows.filter((row, index) => index !== idx),
    }));

  getColumns = () => [
    {
      title: HEADER_NAME,
      cellFormatters: [(value, { rowData }) => rowData.data.name],
      transforms: [cellWidth(50)],
    },
    {
      title: HEADER_SIZE,
      cellFormatters: [(value, { rowData }) => rowData.data.size],
      transforms: [cellWidth(23)],
    },
    {
      title: HEADER_STORAGE_CLASS,
      cellFormatters: [(value, { rowData }) => rowData.data.storageClass],
      transforms: [cellWidth(23)],
    },
  ];

  getActions = () => [
    {
      title: REMOVE_DISK_BUTTON,
      onClick: (event, rowId) => this.remove(rowId),
    },
  ];

  render() {
    const columns = this.getColumns();
    const actions = this.getActions();
    const { editing, rows } = this.state;

    return (
      <React.Fragment>
        <div className="kubevirt-pf-storage-tab__buttons">
          <Button
            className="kubevirt-pf-storage-tab__button-create-disk"
            onClick={() => this.create(STORAGE_TYPE_DATAVOLUME)}
            id="create-storage-btn"
            isDisabled={editing}
          >
            {CREATE_DISK_BUTTON}
          </Button>
          <Button
            onClick={() => this.create(STORAGE_TYPE_PVC)}
            id="attach-disk-btn"
            isDisabled={editing}
            variant={ButtonVariant.secondary}
          >
            {ATTACH_DISK_BUTTON}
          </Button>
        </div>
        <Table cells={columns} variant={TableVariant.compact} rows={rows} actions={actions}>
          <TableHeader />
          <TableBody />
        </Table>
      </React.Fragment>
    );
  }
}

PfStorageTab.defaultProps = {
  initialStorages: [],
};

PfStorageTab.propTypes = {
  storageClasses: PropTypes.array.isRequired,
  persistentVolumeClaims: PropTypes.array.isRequired,
  initialStorages: PropTypes.array, // StorageTab keeps it's own state
  // eslint-disable-next-line react/no-unused-prop-types
  onChange: PropTypes.func.isRequired,
  units: PropTypes.object.isRequired,
  sourceType: PropTypes.string.isRequired,
  namespace: PropTypes.string.isRequired,
};
