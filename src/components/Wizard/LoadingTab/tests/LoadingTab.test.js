import React from 'react';
import { mount } from 'enzyme';

import { LoadingTab } from '../LoadingTab';

const testLoadingTab = () => <LoadingTab>data</LoadingTab>;

describe('<LoadingTab />', () => {
  it('renders correctly', () => {
    const component = mount(testLoadingTab());
    expect(component).toMatchSnapshot();
  });
});
