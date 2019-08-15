import React from 'react';
import { shallow } from 'enzyme';

import CancelAcceptButtonsFixture from '../fixtures/CancelAcceptButtons.fixture';

import { CancelAcceptButtons } from '..';

const testCancelAcceptButtons = (disabled = false) => (
  <CancelAcceptButtons {...CancelAcceptButtonsFixture[0].props} disabled={disabled} />
);

describe('<CancelAcceptButtons />', () => {
  it('renders correctly enabled CancelAcceptButtons', () => {
    const component = shallow(testCancelAcceptButtons());
    expect(component).toMatchSnapshot();
  });
  it('renders correctly disabled CancelAcceptButtons', () => {
    const component = shallow(testCancelAcceptButtons(true));
    expect(component).toMatchSnapshot();
  });
});
