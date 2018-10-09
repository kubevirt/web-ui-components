import React from 'react';
import { shallow } from 'enzyme';
import { NetworksTab } from '..';
import NetworksTabFixture from '../fixtures/NetworksTab.fixture';

const testNetworksTab = () => <NetworksTab {...NetworksTabFixture.props} />;

describe('<NetworksTab />', () => {
  it('renders correctly', () => {
    const component = shallow(testNetworksTab());
    expect(component).toMatchSnapshot();
  });
});
