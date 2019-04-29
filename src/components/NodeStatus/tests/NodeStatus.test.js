import React from 'react';
import { shallow } from 'enzyme';

import { NodeStatus } from '../NodeStatus';
import NodeStatusFixtures from '../fixtures/NodeStatus.fixture';

const testNodeStatus = () => <NodeStatus {...NodeStatusFixtures[0].props} />;

describe('<NodeStatus />', () => {
  it('renders correctly', () => {
    const component = shallow(testNodeStatus());
    expect(component).toMatchSnapshot();
  });
});
