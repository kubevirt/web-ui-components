import React from 'react';
import { render } from 'enzyme/build';

import { default as BootOrderFixture } from '../fixtures/BootOrder.fixture';
import { BootOrder } from '../BootOrder';

describe('<BootOrder />', () => {
  it('renders correctly', () => {
    const component = render(<BootOrder {...BootOrderFixture[0].props} />);
    expect(component).toMatchSnapshot();
  });
});
