import React from 'react';
import { render } from 'enzyme';

import { Events } from '../Events';
import { default as EventsFixtures } from '../fixtures/Events.fixture';

const testEventsOverview = () => <Events {...EventsFixtures.props} />;

describe('<Events />', () => {
  it('renders correctly', () => {
    const component = render(testEventsOverview());
    expect(component).toMatchSnapshot();
  });
});
