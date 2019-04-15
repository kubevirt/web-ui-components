import React from 'react';
import { shallow } from 'enzyme';

import { HealthBody } from '../HealthBody';
import { default as HealthItemFixture } from '../fixtures/HealthItem.fixture';
import { HealthItem } from '../HealthItem';

const testHealthBody = () => (
  <HealthBody>
    <HealthItem {...HealthItemFixture[0].props} />
  </HealthBody>
);

describe('<HealthBody />', () => {
  it('renders correctly', () => {
    const component = shallow(testHealthBody());
    expect(component).toMatchSnapshot();
  });
});
