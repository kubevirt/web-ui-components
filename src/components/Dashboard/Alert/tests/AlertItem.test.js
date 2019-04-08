import React from 'react';
import { shallow } from 'enzyme';

import { AlertItem } from '../AlertItem';
import { default as AlertItemFixtures } from '../fixtures/AlertItem.fixture';

const testAlertItem = () => <AlertItem {...AlertItemFixtures[0].props} />;

describe('<AlertItem />', () => {
  it('renders correctly', () => {
    const component = shallow(testAlertItem());
    expect(component).toMatchSnapshot();
  });
});
