import React from 'react';
import { shallow } from 'enzyme';

import { ClusterOverview } from '..';

describe('<ClusterOverview />', () => {
  it('renders correctly', () => {
    const component = shallow(<ClusterOverview />);
    expect(component).toMatchSnapshot();
  });
});
