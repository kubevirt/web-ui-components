import React from 'react';
import { render } from 'enzyme';

import { StorageOverviewContext } from '../StorageOverviewContext';

describe('StorageOverviewContext', () => {
  it('is defined', () => {
    expect(!!StorageOverviewContext).toBe(true);
  });
  it('dummy test to workaround linter', () => {
    expect(render(<div />)).toMatchSnapshot();
  });
});
