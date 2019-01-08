import React from 'react';
import { render } from 'enzyme';

import { VmConsoles } from '../VmConsoles';
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
    const vnc = {
      vmi: runningVmProps.vmi,
      encrypt: true,
      host: 'my.hostname.com',
      port: '443',
      path: `path/to/vmname/vnc`,

      manual: {
        address: 'vnc.address.com',
        port: 1234,
        tlsPort: 1235,
      },
    };

    const serial = {
      vmi: runningVmProps.vmi,
      host: 'my.hostname.com',
      path: `path/to/vmname/console`,

      manual: {
        address: 'serial.address.com',
        port: 1236,
        tlsPort: 1237,
      },
    };

    const rdp = {
      manual: {
        address: 'resp.address.com',
        port: 3389,
      },
    };

    const component = render(<VmConsoles vnc={vnc} serial={serial} rdp={rdp} {...runningVmProps} />);
    expect(component).toMatchSnapshot();
  });
});
