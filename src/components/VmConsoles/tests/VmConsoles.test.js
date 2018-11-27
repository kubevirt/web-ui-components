import React from 'react';
import { render } from 'enzyme';

import { VmConsoles } from '../index';
import { downVmProps, startingVmProps, runningVmProps } from '../fixtures/VmConsoles.fixture';

describe('<VmConsoles />', () => {
  it('renders correctly for a down VM', () => {
    const component = render(<VmConsoles {...downVmProps} />);
    expect(component).toMatchSnapshot();
  });
  it('renders correctly for a starting VM', () => {
    const component = render(<VmConsoles {...startingVmProps} />);
    expect(component).toMatchSnapshot();
  });
  it('renders correctly for a running VM', () => {
    const getVncConnectionDetails = jest.fn(vmi => ({
      encrypt: true,
      host: 'my.hostname.com',
      port: '443',
      path: `path/to/${vmi.metadata.name}/vnc`,
    }));

    const getSerialConsoleConnectionDetails = jest.fn(vmi => ({
      vmi,
      host: 'my.hostname.com',
      path: `path/to/${vmi.metadata.name}/console`,
    }));

    const component = render(
      <VmConsoles
        getVncConnectionDetails={getVncConnectionDetails}
        getSerialConsoleConnectionDetails={getSerialConsoleConnectionDetails}
        {...runningVmProps}
      />
    );
    expect(getVncConnectionDetails).toHaveBeenCalledTimes(1);
    expect(getSerialConsoleConnectionDetails).toHaveBeenCalledTimes(1);

    expect(component).toMatchSnapshot();
  });
});
