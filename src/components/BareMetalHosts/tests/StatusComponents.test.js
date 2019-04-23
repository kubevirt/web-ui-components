import React from 'react';
import { shallow } from 'enzyme';

import {
  GenericError,
  GenericProgress,
  GenericSuccess,
  GenericStatus,
  ValidationError,
  AddDiscoveredHostLink,
} from '../StatusComponents';

import StatusComponentsFixture from '../fixtures/StatusComponents.fixture';

const testGenericProgress = () => <GenericProgress {...StatusComponentsFixture[0].props} />;
const testGenericError = () => <GenericError {...StatusComponentsFixture[1].props} />;
const testGenericSuccess = () => <GenericSuccess {...StatusComponentsFixture[2].props} />;
const testGenericErrorWithDetails = () => <GenericError {...StatusComponentsFixture[3].props} />;
const testValidationError = () => <ValidationError {...StatusComponentsFixture[4].props} />;
const testGenericStatus = () => <GenericStatus {...StatusComponentsFixture[5].props} />;
const testAddDiscoveredHostLink = () => <AddDiscoveredHostLink {...StatusComponentsFixture[6].props} />;

describe('<GenericProgress />', () => {
  it('renders a progress message', () => {
    const component = shallow(testGenericProgress());
    expect(component).toMatchSnapshot();
  });
});
describe('<GenericError />', () => {
  it('renders an error message', () => {
    const component = shallow(testGenericError());
    expect(component).toMatchSnapshot();
  });
});
describe('<GenericSuccess />', () => {
  it('renders a success message', () => {
    const component = shallow(testGenericSuccess());
    expect(component).toMatchSnapshot();
  });
});
describe('<GenericError /> with details', () => {
  it('renders an error message with details', () => {
    const component = shallow(testGenericErrorWithDetails());
    expect(component).toMatchSnapshot();
  });
});
describe('<ValidationError />', () => {
  it('renders a validation error', () => {
    const component = shallow(testValidationError());
    expect(component).toMatchSnapshot();
  });
});
describe('<GenericStatus />', () => {
  it('renders a generic status string', () => {
    const component = shallow(testGenericStatus());
    expect(component).toMatchSnapshot();
  });
});
describe('<AddDiscoveredHostLink />', () => {
  it('renders a link to add discovered host', () => {
    const component = shallow(testAddDiscoveredHostLink());
    expect(component).toMatchSnapshot();
  });
});
