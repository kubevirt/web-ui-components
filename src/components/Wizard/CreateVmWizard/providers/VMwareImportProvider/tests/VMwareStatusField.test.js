import React from 'react';
import { mount } from 'enzyme';

import VMwareStatusField from '../VMwareStatusField';

const testStatusField = () => <VMwareStatusField>status</VMwareStatusField>;

describe('<StatusField />', () => {
  it('renders correctly', () => {
    const component = mount(testStatusField());
    expect(component).toMatchSnapshot();
  });
});
