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

      manual: {
        address: 'vnc.address.com',
        port: 1234,
        tlsPort: 1235,
      },
    }));

    const getSerialConsoleConnectionDetails = jest.fn(vmi => ({
      vmi,
      host: 'my.hostname.com',
      path: `path/to/${vmi.metadata.name}/console`,

      manual: {
        address: 'serial.address.com',
        port: 1236,
        tlsPort: 1237,
      },
    }));

    const getRdpConnectionDetails = jest.fn(vmi => ({
      manual: {
        address: 'resp.address.com',
      },
    }));

    const component = render(
      <VmConsoles
        getVncConnectionDetails={getVncConnectionDetails}
        getSerialConsoleConnectionDetails={getSerialConsoleConnectionDetails}
        getRdpConnectionDetails={getRdpConnectionDetails}
        {...runningVmProps}
      />
    );
    expect(getVncConnectionDetails).toHaveBeenCalledTimes(1);
    expect(getSerialConsoleConnectionDetails).toHaveBeenCalledTimes(1);
    expect(getRdpConnectionDetails).toHaveBeenCalledTimes(1);

    expect(component).toMatchSnapshot();
  });
});
