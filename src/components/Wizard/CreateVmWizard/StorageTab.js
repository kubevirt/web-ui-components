import React from 'react';
import PropTypes from 'prop-types';
import { get, findIndex } from 'lodash';

import {
  PROVISION_SOURCE_CONTAINER,
  PROVISION_SOURCE_URL,
  PROVISION_SOURCE_CLONED_DISK,
  VALIDATION_ERROR_TYPE,
} from '../../../constants';
import { TableFactory } from '../../Table/TableFactory';
import { FormFactory, DROPDOWN, POSITIVE_NUMBER, TEXT } from '../../Form';
import { getValidationObject, validateDNS1123SubdomainValue } from '../../../utils/validations';
import { ACTIONS_TYPE, DELETE_ACTION } from '../../Table/constants';
import {
  STORAGE_TYPE_PVC,
  STORAGE_TYPE_DATAVOLUME,
  STORAGE_TYPE_CONTAINER,
  STORAGE_TYPE_EXTERNAL_IMPORT,
  STORAGE_TYPE_EXTERNAL_V2V_TEMP,
  STORAGE_TYPE_EXTERNAL_V2V_VDDK,
} from './constants';

import {
  getName,
  getNamespace,
  getGibStorageSize,
  getPvcStorageClassName,
  getDataVolumeStorageClassName,
  getPvcResources,
  getDataVolumeResources,
} from '../../../selectors';

import {
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
  getNoBootableError,
} from './strings';

import { canBeBootable, needsBootableDisk } from './utils/storageTabUtils';

import { getValidK8SSize } from '../../../utils';
import { addMissingSubject } from '../../../utils/grammar';

const initalStorageErrorsArray = () => Array(4).fill(null);

const genericValidator = (storage, validationResolvers) =>
  initalStorageErrorsArray().map((error, idx) => {
    if (idx === 0 && (!storage || storage.id == null)) {
      return ERROR_EMPTY_ENTITY;
    }
    const validationResolver = validationResolvers[idx - 1];
    return typeof validationResolver === 'function' ? validationResolver(storage) : null;
  });

const nameValidation = storage => {
  const validation = validateDNS1123SubdomainValue(storage && storage.name);
  if (get(validation, 'type') === VALIDATION_ERROR_TYPE) {
    return addMissingSubject(validation.message, 'Name');
  }
  return null;
};

const positiveSizeValidation = storage => {
  if (!storage || !storage.size || storage.size <= 0) {
    return ERROR_POSITIVE_SIZE;
  }
  return null;
};

const validatePvcStorage = storage => genericValidator(storage, [nameValidation]);
const validateDataVolumeStorage = storage => genericValidator(storage, [nameValidation, positiveSizeValidation]);
const validateContainerStorage = storage => genericValidator(storage, [nameValidation]);
const validateExternalImportStorage = storage => genericValidator(storage, [nameValidation, positiveSizeValidation]);
const validateExternalTempImportStorage = storage =>
  genericValidator(storage, [nameValidation, positiveSizeValidation]);
const validateExternalVddkImportStorage = storage => genericValidator(storage, [nameValidation]);

const validateResolver = {
  [STORAGE_TYPE_PVC]: validatePvcStorage,
  [STORAGE_TYPE_DATAVOLUME]: validateDataVolumeStorage,
  [STORAGE_TYPE_CONTAINER]: validateContainerStorage,
  [STORAGE_TYPE_EXTERNAL_IMPORT]: validateExternalImportStorage,
  [STORAGE_TYPE_EXTERNAL_V2V_TEMP]: validateExternalTempImportStorage,
  [STORAGE_TYPE_EXTERNAL_V2V_VDDK]: validateExternalVddkImportStorage,
};

const validateStorage = row => {
  const validator = validateResolver[row.storageType];
  return validator ? validator(row) : initalStorageErrorsArray();
};

const validateDiskNamespace = (storages, pvcs, namespace) => {
  const availablePvcs = pvcs.filter(pvc => getNamespace(pvc) === namespace);
  storages
    .filter(storage => storage.storageType === STORAGE_TYPE_PVC)
    .forEach(storage => {
      if (!storage.errors) {
        storage.errors = initalStorageErrorsArray();
      }
      storage.errors[1] = availablePvcs.some(pvc => getName(pvc) === storage.name) ? null : ERROR_DISK_NOT_FOUND;
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
  if (!bootableDisks || bootableDisks.length === 0) {
    return undefined;
  }

  let bootDisk;

  // lets check template storage boot order
  bootableDisks
    .filter(disk => disk.templateStorage)
    .forEach(disk => {
      const bootOrder = get(disk.templateStorage, 'disk.bootOrder');
      if (bootOrder && (!bootDisk || bootOrder < bootDisk.templateStorage.disk.bootOrder)) {
        bootDisk = disk;
      }
    });

  // if we still did not find any boot disk, lets mark the first one
  if (!bootDisk) {
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
    const bootableDisks = rows.filter(row => canBeBootable(row, sourceType));
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
        storageClasses.find(clazz => getName(clazz) === getPvcStorageClassName(pvc))
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
        case STORAGE_TYPE_DATAVOLUME:
        case STORAGE_TYPE_EXTERNAL_IMPORT:
        case STORAGE_TYPE_EXTERNAL_V2V_TEMP:
        case STORAGE_TYPE_EXTERNAL_V2V_VDDK:
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
    result.errors = validateStorage(result);
    return result;
  });

  validateDiskNamespace(storages, persistentVolumeClaims, namespace);
  resolveBootability(storages, sourceType);
  return storages;
};

const publishResults = (rows, otherStorages, sourceType, publish, editing) => {
  let valid = !needsBootableDisk(rows, sourceType);

  const storages = rows.map(
    ({ templateStorage, data, rootStorage, storageType, id, name, size, storageClass, isBootable, errors }) => {
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

      // TODO: refactor to data field
      if (templateStorage) {
        result.templateStorage = templateStorage;
      }

      if (data) {
        result.data = data;
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
  publish(storages, valid, editing);
};

export class StorageTab extends React.Component {
  constructor(props) {
    super(props);
    const { sourceType, onChange } = props;

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

    publishResults(this.state.rows, this.state.otherStorages, sourceType, onChange, false);
  }

  onRowActivate = rows => {
    const { sourceType, onChange } = this.props;
    this.setState({
      rows,
      editing: true,
    });
    publishResults(rows, this.state.otherStorages, sourceType, onChange, true);
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
    const { sourceType, onChange } = this.props;
    resolveBootability(rows, sourceType);
    publishResults(rows, this.state.otherStorages, sourceType, onChange, editing);
    this.setState({
      rows,
      editing,
    });
  };

  create = storageType => {
    this.setState(state => {
      const { sourceType, onChange } = this.props;
      const rows = [
        ...state.rows,
        {
          id: state.nextId,
          isBootable: false,
          editable: true,
          edit: true, // trigger immediate edit
          storageType,
          newRow: true,
        },
      ];
      publishResults(rows, state.otherStorages, sourceType, onChange, true);
      return {
        nextId: state.nextId + 1,
        rows,
      };
    });
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
      renderEditConfig: storage => {
        if (storage.storageType === STORAGE_TYPE_PVC) {
          return {
            id: 'name-attach-edit',
            type: DROPDOWN,
            choices: this.props.persistentVolumeClaims
              .filter(pvc => pvc.metadata.namespace === this.props.namespace)
              .map(getName)
              .filter(pvc => !this.state.rows.some(row => row.name === pvc)),
            initialValue: '--- Select Storage ---',
          };
        }
        if ([STORAGE_TYPE_EXTERNAL_V2V_TEMP, STORAGE_TYPE_EXTERNAL_V2V_VDDK].includes(storage.storageType)) {
          return null;
        }
        return {
          id: 'name-edit',
          type: TEXT,
        };
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
      renderEditConfig: storage =>
        storage.storageType === STORAGE_TYPE_DATAVOLUME
          ? {
              id: 'size-edit',
              type: POSITIVE_NUMBER,
            }
          : null,
      renderValueConfig: storage => {
        if ([STORAGE_TYPE_EXTERNAL_IMPORT].includes(storage.storageType)) {
          return {
            formatter: value => getValidK8SSize(value, this.props.units, 'Gi').string,
          };
        }
        if ([STORAGE_TYPE_DATAVOLUME, STORAGE_TYPE_PVC, STORAGE_TYPE_EXTERNAL_V2V_TEMP].includes(storage.storageType)) {
          // do not convert, keep Gi
          return {
            formatter: value => `${value} Gi`,
          };
        }
        return null;
      },
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

      renderEditConfig: storage =>
        [STORAGE_TYPE_DATAVOLUME, STORAGE_TYPE_EXTERNAL_IMPORT, STORAGE_TYPE_EXTERNAL_V2V_TEMP].includes(
          storage.storageType
        )
          ? {
              id: 'storage-edit',
              type: DROPDOWN,
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
      renderEditConfig: storage =>
        storage.rootStorage ||
        [STORAGE_TYPE_EXTERNAL_IMPORT, STORAGE_TYPE_EXTERNAL_V2V_TEMP, STORAGE_TYPE_EXTERNAL_V2V_VDDK].includes(
          storage.storageType
        )
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
      disabled: this.state.editing || this.props.isCreateRemoveDisabled,
    },
    {
      className: 'kubevirt-create-vm-wizard__button-attach-disk',
      onClick: () => this.create(STORAGE_TYPE_PVC),
      id: 'attach-disk-btn',
      text: ATTACH_DISK_BUTTON,
      disabled: this.state.editing || this.props.isCreateRemoveDisabled,
    },
  ];

  getFormFields = (disks, sourceType) => ({
    bootableDisk: {
      id: 'bootable-disk-dropdown',
      title: BOOTABLE_DISK,
      type: DROPDOWN,
      defaultValue: SELECT_BOOTABLE_DISK,
      choices: disks
        .filter(disk => canBeBootable(disk, sourceType) && !hasError(disk))
        .map(disk => ({
          name: disk.name,
          id: disk.id,
        })),
      disabled: [PROVISION_SOURCE_CONTAINER, PROVISION_SOURCE_URL].includes(sourceType),
      required: [PROVISION_SOURCE_CONTAINER, PROVISION_SOURCE_URL, PROVISION_SOURCE_CLONED_DISK].includes(sourceType),
    },
  });

  onFormChange = newValue => {
    this.setState(state => {
      state.rows.forEach(row => {
        row.isBootable = row.id === newValue.value.id;
      });

      const { sourceType, onChange } = this.props;
      publishResults(state.rows, state.otherStorages, sourceType, onChange, state.editing);
      return state.rows;
    });
  };

  render() {
    const { sourceType } = this.props;
    const { rows } = this.state;
    const columns = this.getColumns();
    const actionButtons = this.getActionButtons();

    const bootableDisk = rows.find(row => row.isBootable);
    const values = {
      bootableDisk: {
        value: bootableDisk ? bootableDisk.name : undefined,
        validation: needsBootableDisk(rows, sourceType)
          ? getValidationObject(getNoBootableError(sourceType))
          : undefined,
      },
    };

    const bootableForm = (
      <FormFactory
        fields={this.getFormFields(rows, sourceType)}
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
  isCreateRemoveDisabled: false,
};

StorageTab.propTypes = {
  storageClasses: PropTypes.array.isRequired,
  persistentVolumeClaims: PropTypes.array.isRequired,
  initialStorages: PropTypes.array, // StorageTab keeps it's own state
  onChange: PropTypes.func.isRequired,
  units: PropTypes.object.isRequired,
  sourceType: PropTypes.string.isRequired,
  namespace: PropTypes.string.isRequired,
  isCreateRemoveDisabled: PropTypes.bool,
};
