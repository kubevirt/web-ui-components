import React from 'react';
import { shallow, mount } from 'enzyme';
import StorageTab from '../StorageTab';

import { units, persistentVolumeClaims, storageClasses } from '../fixtures/CreateVmWizard.fixture';
import { rows } from '../fixtures/StorageTab.fixture';
import { PROVISION_SOURCE_URL } from '../../../../constants';

const testStorageTab = (onChange, initialDisks) => (
  <StorageTab
    persistentVolumeClaims={persistentVolumeClaims}
    storageClasses={storageClasses}
    onChange={onChange || jest.fn()}
    initialStorages={initialDisks || []}
    units={units}
    sourceType={PROVISION_SOURCE_URL}
    namespace="default"
  />
);

const thirdRow = rows[2];
const testRows = rows.slice(0, 2);

const updatedThirdRow = {
  ...thirdRow,
  attachStorage: {
    id: 'attach',
  },
  name: 'name',
};

describe('<StorageTab />', () => {
  it('renders correctly', () => {
    const component = shallow(testStorageTab());
    expect(component).toMatchSnapshot();
  });

  // TODO: add create disk test once the create blank disk feature is implemented in kubevirt
  // it('creates disk', () => {
  //   const component = shallow(testStorageTab());
  //
  //   expect(component.state().rows).toHaveLength(0);
  //   component.instance().createDisk();
  //
  //   expect(component.state().rows).toHaveLength(1);
  // });

  it('attaches storage', () => {
    const component = shallow(testStorageTab());

    expect(component.state().rows).toHaveLength(0);
    component.instance().attachStorage();

    expect(component.state().rows).toHaveLength(1);
  });

  it('initializes attach storage ', () => {
    const onChange = jest.fn();
    const component = mount(testStorageTab(onChange, testRows.slice(0, 1)));

    expect(component.state().rows).toHaveLength(1);
  });

  it('initializes disk and remove it', () => {
    const onChange = jest.fn();
    const component = mount(testStorageTab(onChange, testRows.slice(0, 1)));

    expect(component.state().rows).toHaveLength(1);
    component.instance().setState({ rows: [] });
    expect(component.state().rows).toHaveLength(0);
  });

  it('calls onChange when rows change', () => {
    const onChange = jest.fn();

    const component = mount(testStorageTab(onChange, [...testRows, thirdRow]));
    expect(onChange).toHaveBeenCalledTimes(1);

    component.instance().rowsChanged(testRows, false);

    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('calls onChange when row is updated', () => {
    const onChange = jest.fn();

    const newRows = [...testRows, thirdRow];
    const component = mount(testStorageTab(onChange, newRows));
    expect(onChange).toHaveBeenCalledTimes(1);

    component.instance().onRowUpdate(newRows, thirdRow.id, false);

    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('does not call onChange when row is activated', () => {
    const onChange = jest.fn();

    const component = mount(testStorageTab(onChange, [...testRows, thirdRow]));
    expect(onChange).toHaveBeenCalledTimes(1);

    component.instance().onRowActivate([...testRows, updatedThirdRow]);

    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
