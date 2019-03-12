import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { AccessConsoles, VncConsole } from '@patternfly/react-console';
import { Button } from 'patternfly-react';

import { isVmiRunning, isVmStarting } from '../../utils/status/vm';
import { SerialConsoleConnector } from './SerialConsoleConnector';
import { isWindows, isGuestAgentConnected } from '../../selectors';
import { DEFAULT_RDP_PORT, TEMPLATE_VM_NAME_LABEL } from '../../constants';
import { DesktopViewerSelector } from './DesktopViewerSelector';

const { VNC_CONSOLE_TYPE, SERIAL_CONSOLE_TYPE } = AccessConsoles.constants;

const VmIsDown = ({ vm, onStartVm }) => {
  const action = (
    <Button bsStyle="link" onClick={onStartVm}>
      start
    </Button>
  );

  return (
    <div className="co-m-pane__body">
      <div className="kubevirt-vm-consoles__loading">
        This Virtual Machine is down. Please {action} it to access its console.
      </div>
    </div>
  );
};
VmIsDown.propTypes = {
  vm: PropTypes.object.isRequired,
  onStartVm: PropTypes.func.isRequired,
};

const VmIsStarting = ({ LoadingComponent }) => (
  <div className="co-m-pane__body">
    <div className="kubevirt-vm-consoles__loading">
      <LoadingComponent />
      This Virtual Machine is still starting up. The console will be available soon.
    </div>
  </div>
);
VmIsStarting.propTypes = {
  LoadingComponent: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
};

export const RdpServiceNotConfigured = ({ vm }) => (
  <div className="kubevirt-vm-consoles__rdp">
    <span>This is a Windows virtual machine but no Service for the RDP (Remote Desktop Protocol) can be found.</span>
    <br />
    <span>
      For better experience accessing Windows console, it is recommended to use the RDP. To do so, create a service:
      <ul>
        <li>
          exposing the{' '}
          <b>
            {DEFAULT_RDP_PORT}
            /tcp
          </b>{' '}
          port of the virtual machine
        </li>
        <li>
          using selector:{' '}
          <b>
            {TEMPLATE_VM_NAME_LABEL}: {vm.metadata.name}
          </b>
        </li>
        <li>
          Example: virtctl expose virtualmachine {vm.metadata.name} --name {vm.metadata.name}
          -rdp --port [UNIQUE_PORT] --target-port {DEFAULT_RDP_PORT} --type NodePort
        </li>
      </ul>
      Make sure, the VM object has <b>spec.template.metadata.labels</b> set to{' '}
      <b>
        {TEMPLATE_VM_NAME_LABEL}: {vm.metadata.name}
      </b>
    </span>
  </div>
);

RdpServiceNotConfigured.propTypes = {
  vm: PropTypes.object.isRequired,
};

/**
 * Actual component for consoles.
 */
export const VmConsoles = ({ vm, vmi, onStartVm, vnc, serial, rdp, WSFactory, LoadingComponent }) => {
  if (!isVmiRunning(vmi)) {
    return isVmStarting(vm, vmi) ? (
      <VmIsStarting LoadingComponent={LoadingComponent} />
    ) : (
      <VmIsDown vm={vm} onStartVm={onStartVm} />
    );
  }

  const vncServiceManual = get({ vnc }, 'vnc.manual');
  const rdpServiceManual = get({ rdp }, 'rdp.manual');

  let desktopViewerSelector;
  if (isWindows(vm)) {
    desktopViewerSelector = (
      <DesktopViewerSelector
        vncServiceManual={vncServiceManual}
        rdpServiceManual={rdpServiceManual}
        type="DesktopViewer"
        vm={vm}
        vmi={vmi}
        guestAgent={isGuestAgentConnected(vmi)}
      />
    );
  }

  return (
    <div className="co-m-pane__body">
      <AccessConsoles preselectedType={VNC_CONSOLE_TYPE} disconnectByChange={false}>
        <SerialConsoleConnector type={SERIAL_CONSOLE_TYPE} WSFactory={WSFactory} {...serial} />
        <VncConsole {...vnc} />
        {desktopViewerSelector}
      </AccessConsoles>
    </div>
  );
};
VmConsoles.propTypes = {
  vm: PropTypes.object.isRequired,
  vmi: PropTypes.object,
  vnc: PropTypes.object,
  serial: PropTypes.object,
  rdp: PropTypes.object,
  onStartVm: PropTypes.func.isRequired,
  LoadingComponent: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
  WSFactory: PropTypes.func.isRequired,
};
VmConsoles.defaultProps = {
  vmi: undefined,

  vnc: undefined,
  serial: undefined,
  rdp: undefined,
};
