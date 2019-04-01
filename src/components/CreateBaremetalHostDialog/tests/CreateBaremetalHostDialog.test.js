import React from 'react';
import { shallow } from 'enzyme';

import CreateBaremetalHostDialogFixture from '../fixtures/CreateBaremetalHostDialog.fixture';
import { CreateBaremetalHostDialog } from '../CreateBaremetalHostDialog';

const testCreateBaremetalHostDialog = () => <CreateBaremetalHostDialog {...CreateBaremetalHostDialogFixture.props} />;

describe('<CreateBaremetalHostDialog />', () => {
  it('renders correctly', () => {
    const component = shallow(testCreateBaremetalHostDialog());
    expect(component).toMatchSnapshot();
  });
});
