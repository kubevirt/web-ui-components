import React from 'react';
import PropTypes from 'prop-types';
import { findIndex } from 'lodash';

import { PROVISION_SOURCE_URL, PROVISION_SOURCE_REGISTRY } from '../../../constants';
import { TableFactory } from '../../Table/TableFactory';
import { FormFactory } from '../../Form/FormFactory';
import { getName, getGibStorageSize, getStorageClassName } from '../../../utils/selectors';

import { ACTIONS_TYPE, DELETE_ACTION } from '../../Table/constants';

const validatePvc = pvc => {
  const errors = Array(4).fill(null);

  if (!pvc || pvc.id == null) {
    errors[0] = 'Empty entity'; // row error on index 0
  }

  if (!pvc.name) {
    errors[1] = 'Name is empty';
  }

  if (!pvc.size || pvc.size <= 0) {
    errors[2] = 'Size must be positive';
  }

  if (!pvc.storageClass) {
    errors[3] = 'Storage Class not selected';
  }

  return errors;
};

const validateAttachStorage = (storage, storages) => {
  const errors = Array(4).fill(null);
  if (!storage || storage.id == null) {
    errors[0] = 'Empty entity.'; // row error on index 0
  }

  const attachStorageName = getName(storage.attachStorage);
  if (!attachStorageName) {
    errors[1] = 'No storage is selected';
  } else if (!storages || !storages.find(clazz => getName(clazz) === attachStorageName)) {
    errors[1] = 'Selected storage is not valid';
  }

  return errors;
};

const validateDiskNamespace = (storages, pvcs, namespace) => {
  const availablePvcs = pvcs.filter(pvc => pvc.metadata.namespace === namespace);
  storages.filter(storage => !!storage.attachStorage).forEach(storage => {
    if (!storage.errors) {
      storage.errors = new Array(4).fill(null);
    }
    storage.errors[1] = availablePvcs.some(pvc => pvc.metadata.name === getName(storage.attachStorage))
      ? null
      : 'Disk configuration not found';
  });
};

const hasError = disk => (disk.errors ? disk.errors.some(error => !!error) : false);

const resolveBootability = (rows, sourceType) => {
  if (
    sourceType !== PROVISION_SOURCE_REGISTRY &&
    sourceType !== PROVISION_SOURCE_URL &&
    !rows.some(row => row.isBootable && !hasError(row))
  ) {
    const bootableDisks = rows.filter(row => !!row.attachStorage || !!row.templateStorage);
    if (bootableDisks.length > 0) {
      let bootableFound = false;
      bootableDisks.forEach(disk => {
        if (!bootableFound && !hasError(disk)) {
          disk.isBootable = true;
          bootableFound = true;
        } else {
          disk.isBootable = false;
        }
      });
    }
  }
  if (rows && rows.length > 0 && !rows[0].isBootable) {
    // change detected
    let isBootable = sourceType !== PROVISION_SOURCE_REGISTRY && sourceType !== PROVISION_SOURCE_URL;
    return rows.map(row => {
      const result = {
        ...row,
        isBootable
      };
      if (isBootable) {
        // only the first one is bootable
        isBootable = false;
      }
      return result;
    });
  }
  return rows;
};

const resolveAttachedStorage = (storage, persistentVolumeClaims, storageClasses, units) => {
  const attachStorage = persistentVolumeClaims.find(pvc => getName(pvc) === storage.name) || storage.attachStorage;
  const attachStorageClassName = getStorageClassName(attachStorage);

  return {
    ...storage,
    attachStorage,
    // just for visualisation
    name: getName(attachStorage),
    size: getGibStorageSize(units, attachStorage),
    storageClass: getName(storageClasses.find(clazz => getName(clazz) === attachStorageClassName))
  };
};

const resolveTemplateStorage = (storage, units) => {
  const {
    templateStorage: { pvc, disk }
  } = storage;

  return {
    ...storage,
    // just for visualisation
    name: disk.name,
    size: getGibStorageSize(units, pvc),
    storageClass: getStorageClassName(pvc)
  };
};

const resolveInitialStorages = (
  initialStorages,
  persistentVolumeClaims,
  storageClasses,
  units,
  sourceType,
  namespace
) => {
  let nextId = Math.max(...initialStorages.map(disk => disk.id || 0), 0) + 1;

  const disks = initialStorages.map(disk => {
    let result;

    if (disk.attachStorage) {
      result = {
        ...resolveAttachedStorage(disk, persistentVolumeClaims, storageClasses, units),
        renderConfig: 1,
        editable: true
      };
    } else if (disk.templateStorage) {
      result = {
        ...resolveTemplateStorage(disk, units),
        id: nextId++,
        renderConfig: 2
      };
    } else {
      result = {
        ...disk,
        renderConfig: 0,
        editable: true
      };
    }

    return result;
  });

  validateDiskNamespace(disks, persistentVolumeClaims, namespace);
  resolveBootability(disks, sourceType);
  return disks;
};

const validateStorage = (row, persistentVolumeClaims) => {
  let errors;
  if (row.attachStorage) {
    errors = validateAttachStorage(row, persistentVolumeClaims);
  } else if (row.templateStorage) {
    // expect template disks to be valid
    // only bootability can be changed
    errors = Array(4).fill(null);
  } else {
    errors = validatePvc(row);
  }
  return errors;
};

const publishResults = (rows, publish) => {
  let valid = true;
  const storages = rows.map(({ attachStorage, templateStorage, id, name, size, storageClass, isBootable, errors }) => {
    let result;
    if (attachStorage) {
      result = { attachStorage };
    } else if (templateStorage) {
      result = { templateStorage };
    } else {
      result = {
        name,
        size,
        storageClass
      };
    }

    result = {
      ...result,
      id,
      isBootable,
      errors
    };

    if (valid && errors) {
      for (const error of errors) {
        if (error) {
          valid = false;
          break;
        }
      }
    }
    return result;
  });

  publish(storages, valid);
};

class StorageTab extends React.Component {
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
      rows,
      editing: false
    };

    publishResults(rows, this.props.onChange); // resolved new validation and boot order
  }

  onRowActivate = rows => {
    this.setState({ rows, editing: true });
  };

  onRowUpdate = (rows, updatedRowId, editing) => {
    const index = findIndex(rows, row => row.id === updatedRowId);
    if (rows[index].attachStorage) {
      rows[index] = resolveAttachedStorage(
        rows[index],
        this.props.persistentVolumeClaims,
        this.props.storageClasses,
        this.props.units
      );
    }
    const updatedRow = rows[index];
    updatedRow.errors = validateStorage(updatedRow, this.props.persistentVolumeClaims);
    this.rowsChanged(rows, editing);
  };

  rowsChanged = (rows, editing) => {
    resolveBootability(rows, this.props.sourceType);
    publishResults(rows, this.props.onChange);
    this.setState({ rows, editing });
  };

  create = (renderConfig, values = {}) => {
    this.setState(state => ({
      nextId: state.nextId + 1,
      rows: [
        ...state.rows,
        {
          id: state.nextId,
          isBootable: false,
          editable: true,
          edit: true, // trigger immediate edit
          renderConfig,
          ...values
        }
      ]
    }));
  };

  createDisk = () => this.create(0);

  attachStorage = () => this.create(1, { attachStorage: {} });

  getColumns = () => [
    {
      header: {
        label: 'Disk Name',
        props: {
          style: {
            width: '50%'
          }
        }
      },
      property: 'name',
      renderConfigs: [
        {
          id: 'name-edit',
          type: 'text'
        },
        {
          id: 'name-attach-edit',
          type: 'dropdown',
          choices: this.props.persistentVolumeClaims
            .filter(pvc => pvc.metadata.namespace === this.props.namespace)
            .map(getName)
            .filter(pvc => !this.state.rows.some(row => row.name === pvc)),
          initialValue: '--- Select Storage ---'
        }
      ]
    },
    {
      header: {
        label: 'Size (GB)',
        props: {
          style: {
            width: '23%'
          }
        }
      },
      property: 'size',
      renderConfigs: [
        {
          id: 'size-edit',
          type: 'positive-number'
        }
      ]
    },
    {
      header: {
        label: 'Storage Class',
        props: {
          style: {
            width: '23%'
          }
        }
      },
      property: 'storageClass',

      renderConfigs: [
        {
          id: 'storage-edit',
          type: 'dropdown',
          choices: this.props.storageClasses.map(getName),
          initialValue: '--- Select ---'
        }
      ]
    },
    {
      header: {
        props: {
          style: {
            width: '4%'
          }
        }
      },

      renderConfigs: Array(3).fill({
        id: 'actions',
        type: ACTIONS_TYPE,
        actions: [
          {
            actionType: DELETE_ACTION,
            text: 'Remove Disk'
          }
        ],
        visibleOnEdit: false
      })
    }
  ];

  getActionButtons = () => [
    {
      onClick: this.attachStorage,
      id: 'attach-storage-btn',
      text: 'Attach Storage',
      disabled: this.state.editing
    }
    /*
    {
      className: 'create-disk',
      onClick: this.createDisk,
      id: 'create-storage-btn',
      text: 'Create Disk',
      disabled: this.state.editing
    }
    */
  ];

  getFormFields = disks => ({
    bootableDisk: {
      id: 'bootable-disk-dropdown',
      title: 'Bootable Disk',
      type: 'dropdown',
      defaultValue: '--- Select Bootable Disk ---',
      choices: disks.map(disk => disk.name),
      required: true
    }
  });

  onFormChange = newValue => {
    this.setState(state => {
      state.rows.forEach(row => {
        row.isBootable = row.name === newValue;
      });
      publishResults(state.rows, this.props.onChange);
      return state.rows;
    });
  };

  render() {
    const columns = this.getColumns();
    const actionButtons = this.getActionButtons();

    let bootableForm;
    if (this.props.sourceType !== PROVISION_SOURCE_REGISTRY && this.props.sourceType !== PROVISION_SOURCE_URL) {
      const bootableDisk = this.state.rows.find(row => row.isBootable && !hasError(row));
      const values = {
        bootableDisk: {
          value: bootableDisk ? bootableDisk.name : undefined,
          validMsg: this.state.rows.length === 0 ? 'A bootable disk could not be found' : undefined
        }
      };

      bootableForm = (
        <FormFactory
          fields={this.getFormFields(this.state.rows)}
          fieldsValues={values}
          onFormChange={this.onFormChange}
          textPosition="text-left"
          labelSize={2}
          controlSize={10}
          formClassName="pxe-form"
        />
      );
    }

    return (
      <React.Fragment>
        <TableFactory
          actionButtons={actionButtons}
          columns={columns}
          rows={this.state.rows}
          onRowUpdate={this.onRowUpdate}
          onRowDeleteOrMove={this.rowsChanged}
          onRowActivate={this.onRowActivate}
          error=""
        />
        {bootableForm}
      </React.Fragment>
    );
  }
}

StorageTab.defaultProps = {
  initialStorages: []
};

StorageTab.propTypes = {
  storageClasses: PropTypes.array.isRequired,
  persistentVolumeClaims: PropTypes.array.isRequired,
  initialStorages: PropTypes.array, // StorageTab keeps it's own state
  onChange: PropTypes.func.isRequired,
  units: PropTypes.object.isRequired,
  sourceType: PropTypes.string.isRequired,
  namespace: PropTypes.string.isRequired
};

export default StorageTab;
