import React from 'react';
import PropTypes from 'prop-types';
import { findIndex } from 'lodash';
import { Button, ButtonGroup } from 'patternfly-react';

import EditableDraggableTable from '../../Table/EditableDraggableTable';
import { getName, getGibStorageSize, getStorageClassName } from '../../../utils/selectors';

import {
  ACTIONS_TYPE,
  DELETE_ACTION,
  ON_CHANGE,
  ON_ACTIVATE,
  ON_CONFIRM,
  ON_DELETE,
  ON_MOVE,
  ON_CANCEL
} from '../../Table/constants';

const BOOTABLE = '(Bootable)';

const validateDisk = disk => {
  const errors = Array(4).fill(null);

  if (!disk || disk.id == null) {
    errors[0] = 'Empty entity'; // row error on index 0
  }

  if (!disk.name) {
    errors[1] = 'Name is empty';
  }

  if (!disk.size || disk.size <= 0) {
    errors[2] = 'Size must be positive';
  }

  if (!disk.storageClass) {
    errors[3] = 'Storage Class not selected';
  }

  return {
    ...disk,
    errors
  };
};

const noValidation = disk => ({
  ...disk,
  errors: Array(4).fill(null)
});

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

  return {
    ...storage,
    errors
  };
};

const resolveBootability = rows => {
  if (rows && rows.length > 0 && !rows[0].isBootable) {
    // change detected
    let isBootable = true;
    return rows.map(row => {
      const result = {
        ...row,
        isBootable,
        addendum: isBootable ? BOOTABLE : null
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

const resolveAttachedStorage = (disk, storages, storageClasses, units) => {
  const attachStorage = storages.find(storage => getName(storage) === disk.name) || disk.attachStorage;
  const attachStorageClassName = getStorageClassName(attachStorage);

  return {
    ...disk,
    attachStorage,
    // just for visualisation
    name: getName(attachStorage),
    size: getGibStorageSize(units, attachStorage),
    storageClass: getName(storageClasses.find(clazz => getName(clazz) === attachStorageClassName))
  };
};

const resolveTemplateStorage = (templateDisk, units) => {
  const {
    templateStorage: { pvc, disk }
  } = templateDisk;

  return {
    ...templateDisk,
    // just for visualisation
    name: disk.name,
    size: getGibStorageSize(units, pvc),
    storageClass: getStorageClassName(pvc)
  };
};

const resolveInitialDisks = (initialDisks, storages, storageClasses, units) => {
  let nextId = Math.max(...initialDisks.map(disk => disk.id || 0), 0) + 1;

  const disks = initialDisks.map(disk => {
    let result;

    if (disk.attachStorage) {
      result = {
        ...resolveAttachedStorage(disk, storages, storageClasses, units),
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

    result.isBootable = false; // clear to prevent mistakes and resolve again (adds addendum)

    return result;
  });

  return resolveValidation(resolveBootability(disks), storages);
};

const resolveValidation = (rows, storages) =>
  rows.map(row => {
    if (row.attachStorage) {
      return validateAttachStorage(row, storages);
    }
    if (row.templateStorage) {
      // expect template disks to be valid
      // only bootability can be changed
      return noValidation(row);
    }
    return validateDisk(row);
  });

const publishResults = (rows, publish, defaultValid = true) => {
  let valid = defaultValid;
  const disks = rows.map(({ attachStorage, templateStorage, id, name, size, storageClass, isBootable, errors }) => {
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
      isBootable
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

  publish(disks, valid);
};

class StorageTab extends React.Component {
  constructor(props) {
    super(props);
    const rows = resolveInitialDisks(props.initialDisks, props.storages, props.storageClasses, props.units);

    this.state = {
      // eslint-disable-next-line react/no-unused-state
      nextId: Math.max(...rows.map(disk => disk.id || 0), 0) + 1,
      rows,
      editing: false
    };

    publishResults(rows, this.props.onChange, true); // resolved new validation and boot order
  }

  onChange = (rows, { editing, type, id }) => {
    if (type === ON_CHANGE) {
      const index = findIndex(rows, { id });
      const row = rows[index];

      if (row.attachStorage) {
        rows[index] = resolveAttachedStorage(row, this.props.storages, this.props.storageClasses, this.props.units);
      }
    }

    switch (type) {
      case ON_CONFIRM:
      case ON_CANCEL: // to validate first empty row
      case ON_DELETE:
        rows = resolveValidation(rows, this.props.storages);
        break;
      default:
        break;
    }

    switch (type) {
      case ON_ACTIVATE: // new row
      case ON_DELETE:
      case ON_MOVE:
        rows = resolveBootability(rows);
        break;
      default:
        break;
    }

    this.setState({
      rows,
      editing
    });

    switch (type) {
      case ON_ACTIVATE: // new empty data
        publishResults(rows, this.props.onChange, false); // data can't be valid ON_ACTIVATE
        break;
      case ON_CONFIRM: // new data
      case ON_DELETE:
      case ON_MOVE:
        publishResults(rows, this.props.onChange, true); // expect data to be valid
        break;
      default:
        break;
    }
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

  render() {
    const columns = [
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
        hasAddendum: true,
        renderConfigs: [
          {
            id: 'name-edit',
            type: 'text'
          },
          {
            id: 'name-attach-edit',
            type: 'dropdown',
            choices: this.props.storages.map(getName),
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

    // TODO: add create disk button once the create blank disk feature is implemented in kubevirt
    /*
     * <Button className="create-disk" onClick={this.createDisk} disabled={this.state.editing} id="create-disk-btn">
     *   Create Disk
     * </Button>
    */
    return (
      <React.Fragment>
        <ButtonGroup className="pull-right actions">
          <Button onClick={this.attachStorage} disabled={this.state.editing} id="attach-storage-btn">
            Attach Storage
          </Button>
        </ButtonGroup>
        <EditableDraggableTable columns={columns} rows={this.state.rows} onChange={this.onChange} />
      </React.Fragment>
    );
  }
}

StorageTab.defaultProps = {
  initialDisks: []
};

StorageTab.propTypes = {
  storageClasses: PropTypes.array.isRequired,
  storages: PropTypes.array.isRequired,
  initialDisks: PropTypes.array, // StorageTab keeps it's own state
  onChange: PropTypes.func.isRequired,
  units: PropTypes.object.isRequired
};

export default StorageTab;
