import React from 'react';
import { render } from 'enzyme';

import { DataResiliency } from '../DataResiliency';
import { dataResiliencyData } from '../fixtures/DataResiliency.fixture';

const testDataResiliencyErrorStatus = () => <DataResiliency {...dataResiliencyData['0']} />;
const testDataResiliencyBuildStatus = () => <DataResiliency {...dataResiliencyData['1']} />;
const testDataResiliencyResilientStatus = () => <DataResiliency {...dataResiliencyData['2']} />;

describe('<DataResiliency />', () => {
  it('dat-resilience-error-state-renders correctly', () => {
    const component = render(testDataResiliencyErrorStatus());
    expect(component).toMatchSnapshot();
  });
  it('data-resiliency-build-renders-correctly', () => {
    const component = render(testDataResiliencyBuildStatus());
    expect(component).toMatchSnapshot();
  });
  it('data-resiliency-resilient-status-renders-correctly', () => {
    const component = render(testDataResiliencyResilientStatus());
    expect(component).toMatchSnapshot();
  });
});
