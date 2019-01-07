import React from 'react';
import PropTypes from 'prop-types';

import { get } from 'lodash';

import { AccessConsoles, VncConsole, DesktopViewer } from '@patternfly/react-console';
import { Button, ExpandCollapse } from 'patternfly-react';

import { isVmiRunning, isVmStarting } from '../VmStatus';
import SerialConsoleConnector from './SerialConsoleConnector';
import { isWindows } from '../../utils';

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

const RdpServiceNotConfigured = ({ vm }) => (
  <div className="vm-consoles-no-rdp">
    <ExpandCollapse
      bordered={false}
      align={ExpandCollapse.ALIGN_CENTER}
      textCollapsed="No RDP Service found"
      textExpanded="No RDP Service found"
    >
      <div className="vm-consoles-no-rdp-content">
        <p>This is a Windows virtual machine but no Service for the RDP (Remote Desktop Protocol) can be found.</p>
        <p>For better experience accessing Windows console, it is recommended to use the RDP.</p>
        <p>
          To do so, create a service:
          <ul>
            <li>
              exposing the <b>3389/tcp</b> port of the virtual machine
            </li>
            <li>
              using selector: <b>vm.cnv.io/name: {vm.metadata.name}</b>
            </li>
            <li>
              Example: virtctl expose virtualmachine {vm.metadata.name} --name {vm.metadata.name}
              -rdp --port [UNIQUE_PORT] --target-port 3389 --type NodePort
            </li>
          </ul>
          Make sure, the VM object has <b>spec.template.metadata.labels</b> set to{' '}
          <b>vm.cnv.io/name: {vm.metadata.name}</b>
        </p>
      </div>
    </ExpandCollapse>
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

  let infoMessage;
  const vncManual = get({ vnc }, 'vnc.manual');
  const rdpManual = get({ rdp }, 'rdp.manual');

  if (!rdpManual && isWindows(vm)) {
    infoMessage = <RdpServiceNotConfigured vm={vm} />;
  }

  return (
    <div className="co-m-pane__body">
      {infoMessage}
      <AccessConsoles preselectedType={VNC_CONSOLE_TYPE}>
        <SerialConsoleConnector type={SERIAL_CONSOLE_TYPE} WSFactory={WSFactory} {...serial} />
        <VncConsole {...vnc} />
        {(vncManual || rdpManual) && <DesktopViewer vnc={vncManual} rdp={rdpManual} />}
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
