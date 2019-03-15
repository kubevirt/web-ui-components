import React from 'react';
import { render } from 'enzyme';

import { ClusterOverviewContext } from '../ClusterOverviewContext';

describe('ClusterOverviewContext', () => {
  it('is defined', () => {
    expect(!!ClusterOverviewContext).toBe(true);
  });
  it('dummy test to workaround linter', () => {
    expect(render(<div />)).toMatchSnapshot();
  });
});
