import React from 'react';
import { render } from 'enzyme';

import EventsBody from '../EventsBody';

import { default as EventsBodyFixture } from '../fixtures/EventsBody.fixture';

const testDetailsBody = () => <EventsBody {...EventsBodyFixture.props} />;

describe('<EventsBody />', () => {
  it('renders correctly', () => {
    const component = render(testDetailsBody());
    expect(component).toMatchSnapshot();
  });
});
