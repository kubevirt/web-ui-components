import React from 'react';
import { shallow } from 'enzyme';

import { UtilizationBody } from '../UtilizationBody';
import { default as UtilizationItemFixture } from '../fixtures/UtilizationItem.fixture';
import { UtilizationItem } from '../UtilizationItem';

const testUtilizationBody = () => (
  <UtilizationBody>
    <UtilizationItem {...UtilizationItemFixture[0].props} />
  </UtilizationBody>
);

describe('<UtilizationBody />', () => {
  it('renders correctly', () => {
    const component = shallow(testUtilizationBody());
    expect(component).toMatchSnapshot();
  });
});
