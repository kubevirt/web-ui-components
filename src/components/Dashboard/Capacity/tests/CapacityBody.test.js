import React from 'react';
import { shallow } from 'enzyme';

import { CapacityBody } from '../CapacityBody';
import { default as CapacityItemFixture } from '../fixtures/CapacityItem.fixture';
import { CapacityItem } from '../CapacityItem';

const testCapacityBody = () => (
  <CapacityBody>
    <CapacityItem {...CapacityItemFixture[0].props} />
  </CapacityBody>
);

describe('<CapacityBody />', () => {
  it('renders correctly', () => {
    const component = shallow(testCapacityBody());
    expect(component).toMatchSnapshot();
  });
});
