import React from 'react';
import { mount } from 'enzyme';

import { ImportProvider } from '../ImportProvider';

const testImportProvider = () => <ImportProvider isVisible>provider</ImportProvider>;

describe('<ImportProvider />', () => {
  it('renders correctly', () => {
    const component = mount(testImportProvider());
    expect(component).toMatchSnapshot();
  });
});
