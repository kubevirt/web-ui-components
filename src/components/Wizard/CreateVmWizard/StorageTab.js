import React from 'react';
import PropTypes from 'prop-types';
import { get, findIndex } from 'lodash';

import {
  PROVISION_SOURCE_PXE,
  PROVISION_SOURCE_CONTAINER,
  PROVISION_SOURCE_URL,
  VALIDATION_ERROR_TYPE,
} from '../../../constants';
import { TableFactory } from '../../Table/TableFactory';
import { FormFactory } from '../../Form/FormFactory';
import { getValidationObject, validateDNS1123SubdomainValue } from '../../../utils/validations';
import { ACTIONS_TYPE, DELETE_ACTION } from '../../Table/constants';
import { STORAGE_TYPE_PVC, STORAGE_TYPE_DATAVOLUME, STORAGE_TYPE_CONTAINER } from './constants';

import {
  getName,
  getGibStorageSize,
  getPvcStorageClassName,
  getDataVolumeStorageClassName,
  getPvcResources,
  getDataVolumeResources,
} from '../../../utils/selectors';

import {
  ERROR_NO_BOOTABLE_DISK,
  ERROR_EMPTY_ENTITY,
  ERROR_POSITIVE_SIZE,
  ERROR_DISK_NOT_FOUND,
  HEADER_NAME,
  HEADER_SIZE,
  HEADER_STORAGE_CLASS,
  REMOVE_DISK_BUTTON,
  ATTACH_DISK_BUTTON,
  CREATE_DISK_BUTTON,
  BOOTABLE_DISK,
  SELECT_BOOTABLE_DISK,
} from './strings';

const validateDataVolumeStorage = storage => {
  const errors = Array(4).fill(null);

  if (!storage || storage.id == null) {
    errors[0] = ERROR_EMPTY_ENTITY; // row error on index 0
  }

  const nameValidation = validateDNS1123SubdomainValue(storage.name);
  if (get(nameValidation, 'type') === VALIDATION_ERROR_TYPE) {
    errors[1] = `Name ${nameValidation.message}`;
  }

  if (!storage.size || storage.size <= 0) {
    errors[2] = ERROR_POSITIVE_SIZE;
  }

  return errors;
};

const validatePvcStorage = storage => {
  const errors = Array(4).fill(null);
  if (!storage || storage.id == null) {
    errors[0] = ERROR_EMPTY_ENTITY; // row error on index 0
  }

  const nameValidation = validateDNS1123SubdomainValue(storage.name);
  if (get(nameValidation, 'type') === VALIDATION_ERROR_TYPE) {
    errors[1] = `Name ${nameValidation.message}`;
  }

  return errors;
};

const validateContainerStorage = storage => {
  const errors = Array(4).fill(null);
  if (!storage || storage.id == null) {
    errors[0] = ERROR_EMPTY_ENTITY; // row error on index 0
  }

  const nameValidation = validateDNS1123SubdomainValue(storage.name);
  if (get(nameValidation, 'type') === VALIDATION_ERROR_TYPE) {
    errors[1] = `Name ${nameValidation.message}`;
  }

  return errors;
};

const validateDiskNamespace = (storages, pvcs, namespace) => {
  const availablePvcs = pvcs.filter(pvc => pvc.metadata.namespace === namespace);
  storages.filter(storage => storage.storageType === STORAGE_TYPE_PVC).forEach(storage => {
    if (!storage.errors) {
      storage.errors = new Array(4).fill(null);
    }
    storage.errors[1] = availablePvcs.some(pvc => pvc.metadata.name === storage.name) ? null : ERROR_DISK_NOT_FOUND;
  });
};

const setBootableDisk = (disks, bootDisk) => {
  disks.forEach(disk => {
    disk.isBootable = false;
  });
  if (bootDisk) {
    bootDisk.isBootable = true;
  }
};

const findBootDisk = bootableDisks => {
  let bootDisk;

  // lets check template storage boot order
  bootableDisks.filter(disk => disk.templateStorage).forEach(disk => {
    const bootOrder = get(disk.templateStorage, 'disk.bootOrder');
    if (bootOrder && (!bootDisk || bootOrder < bootDisk.templateStorage.disk.bootOrder)) {
      bootDisk = disk;
    }
  });

  // if we still did not find any boot disk, lets mark the first one
  if (!bootDisk && bootableDisks.length > 0) {
    [bootDisk] = bootableDisks;
  }

  return bootDisk;
};

const hasError = disk => (disk.errors ? disk.errors.some(error => !!error) : false);

const resolveBootability = (rows, sourceType) => {
  const rootStorage = rows.find(row => row.rootStorage);
  if (rootStorage) {
    setBootableDisk(rows, rootStorage);
  } else if (!rows.some(row => row.isBootable && !hasError(row))) {
    let bootableDisks;
    switch (sourceType) {
      case PROVISION_SOURCE_CONTAINER:
        bootableDisks = rows.filter(row => row.storageType === STORAGE_TYPE_CONTAINER);
        break;
      case PROVISION_SOURCE_URL:
        bootableDisks = rows.filter(row => row.storageType === STORAGE_TYPE_DATAVOLUME);
        break;
      case PROVISION_SOURCE_PXE:
        bootableDisks = rows.filter(
          row => row.storageType === STORAGE_TYPE_PVC || row.storageType === STORAGE_TYPE_DATAVOLUME
        );
        break;
      default:
        break;
    }
    const bootDisk = findBootDisk(bootableDisks);
    setBootableDisk(rows, bootDisk);
  }
  return rows;
};

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
    // TODO if PVC not found add error
    // TODO also check other possible incorrect things in template storage definition
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
    if (!templateStorage.size) {
      templateStorage.size = getGibStorageSize(units, getDataVolumeResources(storage.templateStorage.dataVolume));
    }
    if (!templateStorage.storageClass) {
      templateStorage.storageClass = getDataVolumeStorageClassName(storage.templateStorage.dataVolume);
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
  let nextId = Math.max(...initialStorages.map(storage => storage.id || 0), 0) + 1;

  const storages = initialStorages.map(storage => {
    let result = {
      id: nextId++,
      editable: true,
    };
    if (storage.templateStorage) {
      result = {
        ...result,
        ...resolveTemplateStorage(storage, persistentVolumeClaims, storageClasses, units, sourceType),
      };
    } else {
      switch (storage.storageType) {
        case STORAGE_TYPE_CONTAINER:
          result = {
            ...result,
            ...storage,
          };
          break;
        case STORAGE_TYPE_DATAVOLUME:
          result = {
            ...result,
            ...storage,
          };
          break;
        case STORAGE_TYPE_PVC:
        default:
          result = {
            ...result,
            ...resolvePvcStorage(storage, persistentVolumeClaims, storageClasses, units),
          };
      }
    }
    return result;
  });

  validateDiskNamespace(storages, persistentVolumeClaims, namespace);
  resolveBootability(storages, sourceType);
  return storages;
};

const validateStorage = row => {
  switch (row.storageType) {
    case STORAGE_TYPE_PVC:
      return validatePvcStorage(row);
    case STORAGE_TYPE_DATAVOLUME:
      return validateDataVolumeStorage(row);
    case STORAGE_TYPE_CONTAINER:
      return validateContainerStorage(row);
    default:
      return Array(4).fill(null);
  }
};

const publishResults = (rows, otherStorages, publish) => {
  // TODO bootable device is required for URL, Container
  let valid = true;
  const storages = rows.map(
    ({ templateStorage, rootStorage, storageType, id, name, size, storageClass, isBootable, errors }) => {
      const result = {
        rootStorage,
        storageType,
        id,
        name,
        size,
        storageClass,
        isBootable,
        errors,
      };

      if (templateStorage) {
        result.templateStorage = templateStorage;
      }

      if (valid && errors) {
        for (const error of errors) {
          if (error) {
            valid = false;
            break;
          }
        }
      }
      return result;
    }
  );
  storages.push(...otherStorages);

  publish(storages, valid);
};

export class StorageTab extends React.Component {
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
      // eslint-disable-next-line react/no-unused-state
      nextId: Math.max(...rows.map(disk => disk.id || 0), 0) + 1,
      rows: rows.filter(row => row.storageType),
      otherStorages: rows.filter(row => !row.storageType),
      editing: false,
    };

    publishResults(this.state.rows, this.state.otherStorages, this.props.onChange);
  }

  onRowActivate = rows => {
    this.setState({ rows, editing: true });
  };

  onRowUpdate = (rows, updatedRowId, editing) => {
    const index = findIndex(rows, row => row.id === updatedRowId);
    if (rows[index].storageType === STORAGE_TYPE_PVC) {
      rows[index] = resolvePvcStorage(
        rows[index],
        this.props.persistentVolumeClaims,
        this.props.storageClasses,
        this.props.units
      );
    }
    const updatedRow = rows[index];
    updatedRow.errors = validateStorage(updatedRow);
    this.rowsChanged(rows, editing);
  };

  rowsChanged = (rows, editing) => {
    resolveBootability(rows, this.props.sourceType);
    publishResults(rows, this.state.otherStorages, this.props.onChange);
    this.setState({ rows, editing });
  };

  create = storageType => {
    this.setState(state => ({
      nextId: state.nextId + 1,
      rows: [
        ...state.rows,
        {
          id: state.nextId,
          isBootable: false,
          editable: true,
          edit: true, // trigger immediate edit
          storageType,
        },
      ],
    }));
  };

  getColumns = () => [
    {
      header: {
        label: HEADER_NAME,
        props: {
          style: {
            width: '50%',
          },
        },
      },
      property: 'name',
      renderConfig: storage =>
        storage.storageType === STORAGE_TYPE_PVC
          ? {
              id: 'name-attach-edit',
              type: 'dropdown',
              choices: this.props.persistentVolumeClaims
                .filter(pvc => pvc.metadata.namespace === this.props.namespace)
                .map(getName)
                .filter(pvc => !this.state.rows.some(row => row.name === pvc)),
              initialValue: '--- Select Storage ---',
            }
          : {
              id: 'name-edit',
              type: 'text',
            },
    },
    {
      header: {
        label: HEADER_SIZE,
        props: {
          style: {
            width: '23%',
          },
        },
      },
      property: 'size',
      renderConfig: storage =>
        storage.storageType === STORAGE_TYPE_DATAVOLUME
          ? {
              id: 'size-edit',
              type: 'positive-number',
            }
          : null,
    },
    {
      header: {
        label: HEADER_STORAGE_CLASS,
        props: {
          style: {
            width: '23%',
          },
        },
      },
      property: 'storageClass',

      renderConfig: storage =>
        storage.storageType === STORAGE_TYPE_DATAVOLUME
          ? {
              id: 'storage-edit',
              type: 'dropdown',
              choices: this.props.storageClasses.map(getName),
              initialValue: '--- Select ---',
            }
          : null,
    },
    {
      header: {
        props: {
          style: {
            width: '4%',
          },
        },
      },
      type: ACTIONS_TYPE,
      renderConfig: storage =>
        storage.rootStorage
          ? null
          : {
              id: 'actions',
              actions: [
                {
                  actionType: DELETE_ACTION,
                  text: REMOVE_DISK_BUTTON,
                },
              ],
              visibleOnEdit: false,
            },
    },
  ];

  getActionButtons = () => [
    {
      className: 'kubevirt-create-vm-wizard__button-create-disk',
      onClick: () => this.create(STORAGE_TYPE_DATAVOLUME),
      id: 'create-storage-btn',
      text: CREATE_DISK_BUTTON,
      disabled: this.state.editing,
    },
    {
      className: 'kubevirt-create-vm-wizard__button-attach-disk',
      onClick: () => this.create(STORAGE_TYPE_PVC),
      id: 'attach-disk-btn',
      text: ATTACH_DISK_BUTTON,
      disabled: this.state.editing,
    },
  ];

  getFormFields = (disks, sourceType) => ({
    bootableDisk: {
      id: 'bootable-disk-dropdown',
      title: BOOTABLE_DISK,
      type: 'dropdown',
      defaultValue: SELECT_BOOTABLE_DISK,
      choices: disks.filter(disk => !hasError(disk)).map(disk => ({
        name: disk.name,
        id: disk.id,
      })),
      disabled: sourceType === PROVISION_SOURCE_CONTAINER || sourceType === PROVISION_SOURCE_URL,
      required: sourceType === PROVISION_SOURCE_CONTAINER || sourceType === PROVISION_SOURCE_URL,
    },
  });

  onFormChange = newValue => {
    this.setState(state => {
      state.rows.forEach(row => {
        row.isBootable = row.id === newValue.value.id;
      });
      publishResults(state.rows, state.otherStorages, this.props.onChange);
      return state.rows;
    });
  };

  render() {
    const columns = this.getColumns();
    const actionButtons = this.getActionButtons();

    const bootableDisk = this.state.rows.find(row => row.isBootable);
    const values = {
      bootableDisk: {
        value: bootableDisk ? bootableDisk.name : undefined,
        validation:
          this.props.sourceType !== PROVISION_SOURCE_PXE && this.state.rows.length === 0
            ? getValidationObject(ERROR_NO_BOOTABLE_DISK)
            : undefined,
      },
    };

    const bootableForm = (
      <FormFactory
        fields={this.getFormFields(this.state.rows, this.props.sourceType)}
        fieldsValues={values}
        onFormChange={this.onFormChange}
        textPosition="text-left"
        labelSize={2}
        controlSize={10}
        formClassName="kubevirt-create-vm-wizard__pxe-form"
      />
    );

    return (
      <React.Fragment>
        <TableFactory
          actionButtons={actionButtons}
          columns={columns}
          rows={this.state.rows}
          onRowUpdate={this.onRowUpdate}
          onRowDeleteOrMove={this.rowsChanged}
          onRowActivate={this.onRowActivate}
        />
        {bootableForm}
      </React.Fragment>
    );
  }
}

StorageTab.defaultProps = {
  initialStorages: [],
};

StorageTab.propTypes = {
  storageClasses: PropTypes.array.isRequired,
  persistentVolumeClaims: PropTypes.array.isRequired,
  initialStorages: PropTypes.array, // StorageTab keeps it's own state
  onChange: PropTypes.func.isRequired,
  units: PropTypes.object.isRequired,
  sourceType: PropTypes.string.isRequired,
  namespace: PropTypes.string.isRequired,
};
