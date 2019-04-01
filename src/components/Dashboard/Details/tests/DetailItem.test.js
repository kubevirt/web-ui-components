import React from 'react';
import { render } from 'enzyme';

import { DetailItem } from '../DetailItem';
import { default as DetailItemFixtures } from '../fixtures/DetailItem.fixture';

const testDetailItem = () => <DetailItem {...DetailItemFixtures[0].props} />;

describe('<DetailItem />', () => {
  it('renders correctly', () => {
    const component = render(testDetailItem());
    expect(component).toMatchSnapshot();
  });
});
