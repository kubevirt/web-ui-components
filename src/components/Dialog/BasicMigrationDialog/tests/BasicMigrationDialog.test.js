import React from 'react';
import { shallow, mount } from 'enzyme';

import { BasicMigrationDialog } from '../BasicMigrationDialog';
import { k8sCreate } from '../../../Wizard/CreateVmWizard/fixtures/CreateVmWizard.fixture';
import { blueVmi } from '../../../../k8s/mock_vmi/blue.vmi';
import { migrate } from '../../../../k8s/migrate';

jest.mock('../../../../k8s/migrate');

const getMigrateButton = component => component.find('.btn').findWhere(btn => btn.text() === 'Migrate');

const testMigrateDialog = (onClose, onMigrationError) => (
  <BasicMigrationDialog
    k8sCreate={k8sCreate}
    onClose={onClose}
    onCancel={() => {}}
    onMigrationError={onMigrationError}
    virtualMachineInstance={blueVmi}
  />
);

describe('<BasicMigrationDialog />', () => {
  it('renders correctly', () => {
    const component = shallow(testMigrateDialog(() => {}, () => {}));
    expect(component).toMatchSnapshot();
  });

  it('migrates', () => {
    migrate.mockReturnValueOnce(new Promise((resolve, reject) => resolve({ result: 'migrated' })));
    const onClose = jest.fn();
    const component = mount(testMigrateDialog(onClose, () => {}));
    expect(onClose).not.toHaveBeenCalled();

    getMigrateButton(component).simulate('click');
    expect(migrate).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
