import React from 'react';
import { shallow } from 'enzyme';

import { InlineEdit } from '..';

import { default as InlineEditFixture } from '../fixtures/InlineEdit.fixture';

const testInlineEdit = () => <InlineEdit {...InlineEditFixture.props} />;

describe('<InlineEdit />', () => {
  it('renders correctly', () => {
    const component = shallow(testInlineEdit());
    expect(component).toMatchSnapshot();
  });
});
