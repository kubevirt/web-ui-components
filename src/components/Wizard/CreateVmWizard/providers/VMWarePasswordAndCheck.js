import React, { Fragment } from 'react';
import { get } from 'lodash';

import { Spinner, Button, Alert } from 'patternfly-react';

import { Text } from '../../../Form';
import { getResource } from '../../../../utils';

import {
  PROVIDER_VMWARE_USER_PWD_KEY,
  PROVIDER_VMWARE_CONNECTION,
  PROVIDER_STATUS_CONNECTING,
  PROVIDER_STATUS_CONNECTION_FAILED,
  NAMESPACE_KEY,
} from '../constants';
import {V2VVMwareModel} from "../../../../models";

// Following constants conform v2vvmware_controller.go
const PhaseConnecting = 'Connecting';
const PhaseConnectionSuccessful = 'ConnectionVerified';
const PhaseConnectionFailed = 'Failed';
const PhaseLoadingVmsList = 'LoadingVmsList';
const PhaseLoadingVmsListFailed = 'LoadingVmsList';
const PhaseLoadingVmDetail = 'LoadingVmDetail';
const PhaseLoadingVmDetailFailed = 'LoadingVmDetailFailed';

const CheckingCredentials = () => (
  <div className="kubevirt-create-vm-wizard__import-vmware-connection-status">
    Checking vCenter Credentials...<Spinner loading size="sm"/>
  </div>
);

const LoadingData = () => (
  <div className="kubevirt-create-vm-wizard__import-vmware-connection-status">
    Connection successful. Loading data...<Spinner loading size="sm"/>
  </div>
);

const ConnectionFailed = () => (
  <div className="kubevirt-create-vm-wizard__import-vmware-connection-status">
    <Alert type="warning">
      Could not connect to vCenter using the provided credentials.
    </Alert>
  </div>
);

const ConnectionFailedInfra = () => (
  <div className="kubevirt-create-vm-wizard__import-vmware-connection-status">
    <Alert type="warning">
      Can not verify vCenter credentials, connection to the V2V VMWare failed.
    </Alert>
  </div>
);

const ConnectionSuccessful = () => (
  <div className="kubevirt-create-vm-wizard__import-vmware-connection-status">
    Connection successful
  </div>
);

const ReadVmsListFailed = () => (
  <div className="kubevirt-create-vm-wizard__import-vmware-connection-status">
    <Alert type="warning">
      Connection succeeded but could not read list of virtual machines from the vCenter instance.
    </Alert>
  </div>
);

const ReadVmDetailFailed = () => (
  <div className="kubevirt-create-vm-wizard__import-vmware-connection-status">
    <Alert type="warning">
      Connection succeeded but could not read details of the virtual machine from the vCenter instance.
    </Alert>
  </div>
);

// Determine status of the "check-connection" user action from the 'status.phase' of the V2V VMWare object
const VMWareProviderStatusByPhase = ({ phase }) => {
  if (!phase || phase === PhaseConnecting) {
    return <CheckingCredentials />;
  }

  if (phase === PhaseConnectionSuccessful) {
    return <ConnectionSuccessful />;
  }

  if ([PhaseLoadingVmsList, PhaseLoadingVmDetail].includes(phase)) {
    return <LoadingData />;
  }

  if (phase === PhaseConnectionFailed) {
    return <ConnectionFailed />;
  }

  if (phase === PhaseLoadingVmsListFailed) {
    return <ReadVmsListFailed />;
  }

  if (phase === PhaseLoadingVmDetailFailed) {
    return <ReadVmDetailFailed />;
  }

  console.warn('VMWareProviderStatusByPhase unrecognized phase found within the V2V VMWare object: ', phase);
  return null;
};

// see onVmwareCheckConnection() for details
const VMWareProviderStatus = ({ connValue, extraProps }) => {
  if (!connValue) {
    return null;
  }
  const { WithResources, basicSettings } = extraProps;
  const { providerStatus, V2VVmwareName } = connValue;

  if (providerStatus === PROVIDER_STATUS_CONNECTION_FAILED) {
    return <ConnectionFailedInfra />;
  }

  if (providerStatus === PROVIDER_STATUS_CONNECTING && !V2VVmwareName) {
    return <CheckingCredentials />;
  }

  const resourceMap = {
    v2vvmware: {
      resource: getResource(V2VVMwareModel, {
        name: V2VVmwareName,
        namespace: get(basicSettings[NAMESPACE_KEY], 'value'),
        isList: false,
      }),
    },
  };
  const resourceToProps = ({ v2vvmware }) => {
    return {
      phase: get(v2vvmware, 'status.phase'), // value set by the controller
    };
  };

  return (
    <WithResources resourceMap={resourceMap} resourceToProps={resourceToProps}>
      <VMWareProviderStatusByPhase/>
    </WithResources>
  );
};

// workaround to wrap two components at a single row
const VMWarePasswordAndCheck = ({ onChange, id, value, extraProps }) => {
  const { onCheckConnection } = extraProps;
  const pwdValue = get(value, PROVIDER_VMWARE_USER_PWD_KEY);
  const connValue = get(value, PROVIDER_VMWARE_CONNECTION);

  return (
    <Fragment>
      <div className="kubevirt-create-vm-wizard__import-vmware-passwordcheck">
        <Text
          id={`${id}-text`}
          value={pwdValue || ''}
          onChange={newValue => onChange({
            [PROVIDER_VMWARE_USER_PWD_KEY]: newValue,
            [PROVIDER_VMWARE_CONNECTION]: connValue,
          })}
        />
        <Button id={`${id}-check-button`} onClick={() => {
          onCheckConnection(newValue => onChange({
            [PROVIDER_VMWARE_USER_PWD_KEY]: pwdValue,
            [PROVIDER_VMWARE_CONNECTION]: newValue,
          }))
        }}>
          Check
        </Button>
      </div>

      <VMWareProviderStatus connValue={connValue} extraProps={extraProps} />
    </Fragment>
  );
};

export default VMWarePasswordAndCheck;
