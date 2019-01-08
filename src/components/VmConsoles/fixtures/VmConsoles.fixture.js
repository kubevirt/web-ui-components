import React from 'react';
import { noop } from 'patternfly-react';

import { VmConsoles } from '../VmConsoles';

const LoadingComponent = () => <div className="dummy-loading-component" />;

const vmiStarting = {
  metadata: {
    name: 'my-vm',
  },
  status: {
    phase: 'Scheduling',
  },
};

const vmiRunning = {
  metadata: {
    name: 'my-vm',
  },
  status: {
    phase: 'Running',
  },
};

const vmOff = {
  metadata: {
    name: 'my-vm',
  },
  spec: {
    running: false,
  },
};

const vmRunning = {
  metadata: {
    name: 'my-vm',
  },
  spec: {
    running: true,
  },
};

export const downVmProps = {
  vm: vmOff,
  vmi: undefined,
  getVncConnectionDetails: noop,
  getSerialConsoleConnectionDetails: noop,
  getRdpConnectionDetails: noop,
  onStartVm: noop,
  WSFactory: noop,
  LoadingComponent,
};

export const startingVmProps = {
  vm: vmRunning,
  vmi: vmiStarting,
  getVncConnectionDetails: noop,
  getSerialConsoleConnectionDetails: noop,
  getRdpConnectionDetails: noop,
  onStartVm: noop,
  WSFactory: noop,
  LoadingComponent,
};

export const runningVmProps = {
  vm: vmRunning,
  vmi: vmiRunning,
  onStartVm: noop,
  WSFactory: noop,
  LoadingComponent,
};

export default [
  {
    component: VmConsoles,
    props: downVmProps,
  },
  {
    component: VmConsoles,
    props: startingVmProps,
  },
];
