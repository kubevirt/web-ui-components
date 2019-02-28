import React from 'react';
import { shallow } from 'enzyme';

import { DesktopViewerSelector } from '../DesktopViewerSelector';
import { default as desktopViewerSelectorFixture } from '../fixtures/DesktopViewerSelector.fixture';

describe('<DesktopViewerSelector />', () => {
  it('renders correctly', () => {
    const component = shallow(<DesktopViewerSelector {...desktopViewerSelectorFixture[0].props} />);
    expect(component).toMatchSnapshot();
  });
});
