import React from 'react';
import { shallow } from 'enzyme';

import { PfStorageTab } from '../PfStorageTab';
import { units, storageClasses } from '../../../Wizard/CreateVmWizard/fixtures/CreateVmWizard.fixture';
import { PROVISION_SOURCE_URL } from '../../../../constants';
import { persistentVolumeClaims } from '../../../../tests/mocks/persistentVolumeClaim';

const testStorageTab = (onChange, initialDisks, sourceType = PROVISION_SOURCE_URL) => (
  <PfStorageTab
    persistentVolumeClaims={persistentVolumeClaims}
    storageClasses={storageClasses}
    onChange={onChange || jest.fn()}
    initialStorages={initialDisks || []}
    units={units}
    sourceType={sourceType}
    namespace="default"
  />
);

describe('<Pf4StorageTab />', () => {
  it('renders correctly', () => {
    const component = shallow(testStorageTab());
    expect(component).toMatchSnapshot();
  });
});
