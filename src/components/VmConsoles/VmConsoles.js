import React from 'react';
import PropTypes from 'prop-types';

import { AccessConsoles, VncConsole } from '@patternfly/react-console';
import { Button } from 'patternfly-react';

import { isVmiRunning, isVmStarting } from '../VmStatus';
import SerialConsoleConnector from './SerialConsoleConnector';

const { VNC_CONSOLE_TYPE, SERIAL_CONSOLE_TYPE } = AccessConsoles.constants;

const VmIsDown = ({ vm, onStartVm }) => {
  const action = (
    <Button bsStyle="link" onClick={onStartVm}>
      start
    </Button>
  );

  return (
    <div className="co-m-pane__body">
      <div className="vm-consoles-loading">This Virtual Machine is down. Please {action} it to access its console.</div>
    </div>
  );
};
VmIsDown.propTypes = {
  vm: PropTypes.object.isRequired,
  onStartVm: PropTypes.func.isRequired,
};

const VmIsStarting = ({ LoadingComponent }) => (
  <div className="co-m-pane__body">
    <div className="vm-consoles-loading">
      <LoadingComponent />
      This Virtual Machine is still starting up. The console will be available soon.
    </div>
  </div>
);
VmIsStarting.propTypes = {
  LoadingComponent: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
};

/**
 * Actual component for consoles.
 */
export const VmConsoles = ({
  vm,
  vmi,
  onStartVm,
  getVncConnectionDetails,
  getSerialConsoleConnectionDetails,
  WSFactory,
  LoadingComponent,
}) => {
  if (!isVmiRunning(vmi)) {
    return isVmStarting(vm, vmi) ? (
      <VmIsStarting LoadingComponent={LoadingComponent} />
    ) : (
      <VmIsDown vm={vm} onStartVm={onStartVm} />
    );
  }

  const vncConDetails = getVncConnectionDetails(vmi);
  const serialConDetails = getSerialConsoleConnectionDetails(vmi);
  return (
    <div className="co-m-pane__body">
      <AccessConsoles preselectedType={VNC_CONSOLE_TYPE}>
        <SerialConsoleConnector type={SERIAL_CONSOLE_TYPE} WSFactory={WSFactory} {...serialConDetails} />
        <VncConsole {...vncConDetails} />
      </AccessConsoles>
    </div>
  );
};
VmConsoles.propTypes = {
  vm: PropTypes.object.isRequired,
  vmi: PropTypes.object,

  getVncConnectionDetails: PropTypes.func.isRequired,
  getSerialConsoleConnectionDetails: PropTypes.func.isRequired,
  onStartVm: PropTypes.func.isRequired,

  LoadingComponent: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
  WSFactory: PropTypes.func.isRequired,
};
VmConsoles.defaultProps = {
  vmi: undefined,
};
