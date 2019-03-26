import React from 'react';
import { cloneDeep } from 'lodash';
import { shallow, mount } from 'enzyme';
import { MenuItem } from 'patternfly-react';

import { StorageTab } from '../StorageTab';
import { units, storageClasses } from '../fixtures/CreateVmWizard.fixture';
import {
  PROVISION_SOURCE_URL,
  PROVISION_SOURCE_CONTAINER,
  PROVISION_SOURCE_PXE,
  PROVISION_SOURCE_CLONED_DISK,
} from '../../../../constants';
import { STORAGE_TYPE_DATAVOLUME, STORAGE_TYPE_PVC, STORAGE_TYPE_CONTAINER } from '../constants';
import { ERROR_POSITIVE_SIZE } from '../strings';
import { EMPTY_ERROR, DNS1123_UPPERCASE_ERROR } from '../../../../utils/strings';
import { persistentVolumeClaims } from '../../../../tests/mocks/persistentVolumeClaim';

const testStorageTab = (onChange, initialDisks, sourceType = PROVISION_SOURCE_URL) => (
  <StorageTab
    persistentVolumeClaims={persistentVolumeClaims}
    storageClasses={storageClasses}
    onChange={onChange || jest.fn()}
    initialStorages={initialDisks || []}
    units={units}
    sourceType={sourceType}
    namespace="default"
  />
);

const dataVolumeStorage = {
  id: 1,
  isBootable: true,
  name: 'datavolumestorage',
  size: '15',
  storageClass: 'iscsi',
  storageType: STORAGE_TYPE_DATAVOLUME,
};

const dataVolumeTemplateStorage = {
  templateStorage: {
    disk: {
      name: 'dataVolumeTemplateStorage',
      bootOrder: 1,
    },
    volume: {
      dataVolume: {},
    },
    dataVolume: {
      spec: {
        pvc: {
          storageClassName: 'fooStorageClass',
          resources: {
            requests: {
              storage: '5Gi',
            },
          },
        },
      },
    },
  },
};

const containerStorage = {
  id: 2,
  isBootable: false,
  name: 'containerStorage',
  storageType: STORAGE_TYPE_CONTAINER,
};

const containerTemplateStorage = {
  templateStorage: {
    disk: {
      name: 'containerTemplateStorage',
      bootOrder: 1,
    },
    volume: {
      containerDisk: {},
    },
  },
};

const pvcStorage = {
  id: 3,
  isBootable: false,
  name: persistentVolumeClaims[0].metadata.name,
  size: '15',
  storageClass: 'glusterfs',
  storageType: STORAGE_TYPE_PVC,
};

const pvcTemplateStorage = {
  templateStorage: {
    disk: {
      name: 'pvcTemplateStorage',
    },
    volume: {
      persistentVolumeClaim: {
        claimName: persistentVolumeClaims[0].metadata.name,
      },
    },
  },
};

const checkBootableStorage = (provisionSource, storages, bootable) => {
  const onChange = jest.fn();
  const component = shallow(testStorageTab(onChange, storages, provisionSource));

  expect(component.state().rows[0].isBootable).toEqual(bootable[0]);
  expect(component.state().rows[1].isBootable).toEqual(bootable[1]);
  expect(component.state().rows[2].isBootable).toEqual(bootable[2]);
};

const expectOnChange = (provisionSource, storages, expectValidity = true) => {
  const onChange = jest.fn();
  const component = shallow(testStorageTab(onChange, storages, provisionSource));

  expect(component.state().rows).toHaveLength(storages.length);

  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange.mock.calls[0][0]).toHaveLength(storages.length);
  expect(onChange.mock.calls[0][1]).toBe(expectValidity);
};

describe('<StorageTab />', () => {
  it('renders correctly', () => {
    const component = shallow(testStorageTab());
    expect(component).toMatchSnapshot();
  });

  it('creates disk', () => {
    const component = shallow(testStorageTab());

    expect(component.state().rows).toHaveLength(0);
    component.instance().create(STORAGE_TYPE_DATAVOLUME);

    expect(component.state().rows).toHaveLength(1);
    expect(component.state().rows[0].storageType).toEqual(STORAGE_TYPE_DATAVOLUME);
  });

  it('attaches disk', () => {
    const component = shallow(testStorageTab());

    expect(component.state().rows).toHaveLength(0);
    component.instance().create(STORAGE_TYPE_PVC);

    expect(component.state().rows).toHaveLength(1);
    expect(component.state().rows[0].storageType).toEqual(STORAGE_TYPE_PVC);
  });

  it('reads initial disks', () => {
    const onChange = jest.fn();
    const component = shallow(testStorageTab(onChange, [dataVolumeStorage, pvcStorage, containerStorage]));

    expect(component.state().rows).toHaveLength(3);

    expect(component.state().rows[0].isBootable).toBeTruthy();
    expect(component.state().rows[1].isBootable).toBeFalsy();
    expect(component.state().rows[2].isBootable).toBeFalsy();
  });

  it('test initial onChange validity', () => {
    expectOnChange(PROVISION_SOURCE_URL, [], false);

    expectOnChange(PROVISION_SOURCE_CLONED_DISK, [containerStorage, dataVolumeStorage], false);
    expectOnChange(PROVISION_SOURCE_CLONED_DISK, [pvcStorage], true);

    expectOnChange(PROVISION_SOURCE_CONTAINER, [], false);
    expectOnChange(PROVISION_SOURCE_CONTAINER, [containerStorage], true);

    expectOnChange(PROVISION_SOURCE_PXE, [], true);
    expectOnChange(PROVISION_SOURCE_PXE, [pvcStorage], true);
  });

  it('resolves template disks', () => {
    const onChange = jest.fn();
    const component = shallow(
      testStorageTab(onChange, [dataVolumeTemplateStorage, containerTemplateStorage, pvcTemplateStorage])
    );

    expect(component.state().rows).toHaveLength(3);

    const dataVolume = component.state().rows[0];
    expect(dataVolume.isBootable).toBeTruthy();
    expect(dataVolume.id).toEqual(1);
    expect(dataVolume.name).toEqual(dataVolumeTemplateStorage.templateStorage.disk.name);
    expect(dataVolume.size).toEqual(5);
    expect(dataVolume.storageClass).toEqual('fooStorageClass');
    expect(dataVolume.storageType).toEqual(STORAGE_TYPE_DATAVOLUME);
    expect(dataVolume.templateStorage).toEqual(dataVolumeTemplateStorage.templateStorage);

    const container = component.state().rows[1];
    expect(container.isBootable).toBeFalsy();
    expect(container.id).toEqual(2);
    expect(container.name).toEqual(containerTemplateStorage.templateStorage.disk.name);
    expect(container.size).toBeUndefined();
    expect(container.storageClass).toBeUndefined();
    expect(container.storageType).toEqual(STORAGE_TYPE_CONTAINER);
    expect(container.templateStorage).toEqual(containerTemplateStorage.templateStorage);

    const pvc = component.state().rows[2];
    expect(pvc.isBootable).toBeFalsy();
    expect(pvc.id).toEqual(3);
    expect(pvc.name).toEqual(pvcTemplateStorage.templateStorage.disk.name);
    expect(pvc.size).toEqual(10);
    expect(pvc.storageClass).toEqual('nfs');
    expect(pvc.storageType).toEqual(STORAGE_TYPE_PVC);
    expect(pvc.templateStorage).toEqual(pvcTemplateStorage.templateStorage);
  });

  it('resolves bootable disks according to provision source', () => {
    checkBootableStorage(
      PROVISION_SOURCE_URL,
      [dataVolumeTemplateStorage, containerTemplateStorage, pvcTemplateStorage],
      [true, false, false]
    );

    checkBootableStorage(
      PROVISION_SOURCE_CONTAINER,
      [dataVolumeTemplateStorage, containerTemplateStorage, pvcTemplateStorage],
      [false, true, false]
    );

    checkBootableStorage(
      PROVISION_SOURCE_PXE,
      [dataVolumeTemplateStorage, containerTemplateStorage, pvcTemplateStorage],
      [true, false, false]
    );

    checkBootableStorage(
      PROVISION_SOURCE_CLONED_DISK,
      [dataVolumeTemplateStorage, containerTemplateStorage, pvcTemplateStorage],
      [false, false, true]
    );

    // no storage has boot order, the first bootable storage is chosen
    const dvNoBoot = cloneDeep(dataVolumeTemplateStorage);
    delete dvNoBoot.templateStorage.disk.bootOrder;
    const containerNoBoot = cloneDeep(containerTemplateStorage);
    delete containerNoBoot.templateStorage.disk.bootOrder;

    checkBootableStorage(PROVISION_SOURCE_PXE, [dvNoBoot, containerNoBoot, pvcTemplateStorage], [true, false, false]);
  });

  it('calls onChange when rows change', () => {
    const onChange = jest.fn();

    const component = shallow(testStorageTab(onChange, [dataVolumeStorage, pvcStorage, pvcTemplateStorage]));
    expect(onChange).toHaveBeenCalledTimes(1);

    component.instance().rowsChanged([containerStorage], false);

    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('calls onChange when row is updated', () => {
    const onChange = jest.fn();

    const newRows = [dataVolumeStorage, pvcStorage];
    const component = shallow(testStorageTab(onChange, newRows));
    expect(onChange).toHaveBeenCalledTimes(1);

    component.instance().onRowUpdate(newRows, 1, false);

    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('does not call onChange when row is activated', () => {
    const onChange = jest.fn();

    const testRows = [dataVolumeStorage, pvcStorage];
    const component = shallow(testStorageTab(onChange, testRows));
    expect(onChange).toHaveBeenCalledTimes(1);

    component.instance().onRowActivate(testRows);

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('dropdown updates bootable storage', () => {
    const onChange = jest.fn();
    const rows = [dataVolumeStorage, dataVolumeTemplateStorage];

    const component = mount(testStorageTab(onChange, rows, PROVISION_SOURCE_PXE));

    const dropdown = component.find('#bootable-disk-dropdown');

    expect(dropdown.find(MenuItem).find('a')).toHaveLength(2);
    expect(component.state().rows[0].isBootable).toBeTruthy();
    expect(component.state().rows[1].isBootable).toBeFalsy();

    dropdown
      .find(MenuItem)
      .findWhere(item => item.text() === rows[1].templateStorage.disk.name)
      .find('a')
      .simulate('click');
    component.update();
    expect(component.state().rows[0].isBootable).toBeFalsy();
    expect(component.state().rows[1].isBootable).toBeTruthy();
  });

  it('onRowUpdate validates storage', () => {
    const onChange = jest.fn();
    const storages = [dataVolumeTemplateStorage, containerTemplateStorage, pvcTemplateStorage];
    const component = shallow(testStorageTab(onChange, storages, PROVISION_SOURCE_URL));

    const updatedDataVolumeRow = component.state().rows[0];
    updatedDataVolumeRow.name = '';
    updatedDataVolumeRow.size = 0;

    let newStorages = [updatedDataVolumeRow, component.state().rows[1], component.state().rows[2]];

    component.instance().onRowUpdate(newStorages, updatedDataVolumeRow.id, true);
    component.update();
    expect(component.state().rows[0].errors).toEqual([null, `Name ${EMPTY_ERROR}`, ERROR_POSITIVE_SIZE, null]);

    const updatedContainerRow = component.state().rows[1];
    updatedContainerRow.name = '';

    newStorages = [component.state().rows[0], updatedContainerRow, component.state().rows[2]];

    component.instance().onRowUpdate(newStorages, updatedContainerRow.id, true);
    component.update();
    expect(component.state().rows[1].errors).toEqual([null, `Name ${EMPTY_ERROR}`, null, null]);

    const updatedPvcRow = component.state().rows[2];
    updatedPvcRow.name = '';

    newStorages = [component.state().rows[0], component.state().rows[1], updatedPvcRow];

    component.instance().onRowUpdate(newStorages, updatedPvcRow.id, true);
    component.update();
    expect(component.state().rows[2].errors).toEqual([null, `Name ${EMPTY_ERROR}`, null, null]);

    const datavolumeWithUppercase = component.state().rows[0];
    datavolumeWithUppercase.name = 'Uppercase';
    datavolumeWithUppercase.size = 20;

    newStorages = [datavolumeWithUppercase, component.state().rows[1], component.state().rows[2]];

    component.instance().onRowUpdate(newStorages, datavolumeWithUppercase.id, true);
    component.update();
    expect(component.state().rows[0].errors).toEqual([null, `Name ${DNS1123_UPPERCASE_ERROR}`, null, null]);
  });
});
