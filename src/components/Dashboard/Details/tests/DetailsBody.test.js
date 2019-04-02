import React from 'react';
import { render } from 'enzyme';

import { DetailsBody } from '../DetailsBody';
import { default as DetailsBodyFixture } from '../fixtures/DetailsBody.fixture';

const testDetailsBody = () => <DetailsBody {...DetailsBodyFixture.props} />;

describe('<DetailsBody />', () => {
  it('renders correctly', () => {
    const component = render(testDetailsBody());
    expect(component).toMatchSnapshot();
  });
});
