import React from 'react';

import { helpers } from 'patternfly-react';
import { VmConsoles } from '../index';

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

  getVncConnectionDetails: helpers.noop,
  getSerialConsoleConnectionDetails: helpers.noop,
  onStartVm: helpers.noop,
  WSFactory: helpers.noop,
  LoadingComponent,
};

export const startingVmProps = {
  vm: vmRunning,
  vmi: vmiStarting,

  getVncConnectionDetails: helpers.noop,
  getSerialConsoleConnectionDetails: helpers.noop,
  onStartVm: helpers.noop,
  WSFactory: helpers.noop,
  LoadingComponent,
};

export const runningVmProps = {
  vm: vmRunning,
  vmi: vmiRunning,

  onStartVm: helpers.noop,
  WSFactory: helpers.noop,
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
