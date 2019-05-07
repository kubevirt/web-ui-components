import React from 'react';
import { shallow } from 'enzyme';

import { StorageOverview } from '..';

describe('<StorageOverview />', () => {
  it('shallow-renders correctly', () => {
    const component = shallow(<StorageOverview />);
    expect(component).toMatchSnapshot();
  });
});
