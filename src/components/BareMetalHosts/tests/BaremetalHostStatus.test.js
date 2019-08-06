import React from 'react';
import { shallow } from 'enzyme';

import BaremetalHostStatusFixture from '../fixtures/BaremetalHostStatus.fixture';

import { BaremetalHostStatus } from '..';

const getComponentFunction = props => () => <BaremetalHostStatus {...props} />;

describe('<BaremetalHostStatus />', () => {
  BaremetalHostStatusFixture.forEach((fixture, index) => {
    it(`renders the correct subcomponent for the "${fixture.props.host.status.provisioning.state}" state (${index})`, () => {
      const component = shallow(getComponentFunction(fixture.props)());
      expect(component).toMatchSnapshot();
    });
  });
});
