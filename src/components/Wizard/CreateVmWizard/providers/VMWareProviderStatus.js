import React from 'react';
import { get } from 'lodash';
import PropTypes from 'prop-types';

import { Alert, Spinner } from 'patternfly-react';

import {
  NAMESPACE_KEY,
  PROVIDER_STATUS_CONNECTING,
  PROVIDER_STATUS_CONNECTION_FAILED,
  PROVIDER_VMWARE_CONNECTION,
  PROVIDER_VMWARE_USER_PWD_AND_CHECK_KEY,
} from '../constants';
import { getResource } from '../../../../utils';
import { V2VVMwareModel } from '../../../../models';
import { settingsValue } from '../../../../k8s/selectors';

// Following constants conform v2vvmware_controller.go
const PhaseConnecting = 'Connecting';
const PhaseConnectionSuccessful = 'ConnectionVerified';
const PhaseConnectionFailed = 'Failed';
const PhaseLoadingVmsList = 'LoadingVmsList';
const PhaseLoadingVmsListFailed = 'LoadingVmsList';
const PhaseLoadingVmDetail = 'LoadingVmDetail';
const PhaseLoadingVmDetailFailed = 'LoadingVmDetailFailed';

const StatusField = ({ children }) => (
  <div className="kubevirt-create-vm-wizard__import-vmware-connection-status">{children}</div>
);
StatusField.propTypes = {
  children: PropTypes.node.isRequired,
};

const CheckingCredentials = () => (
  <StatusField>
    Checking vCenter Credentials...
    <Spinner loading size="sm" />
  </StatusField>
);

const LoadingData = () => (
  <StatusField>
    Connection successful. Loading data...
    <Spinner loading size="sm" />
  </StatusField>
);

const ConnectionFailed = () => (
  <StatusField>
    <Alert type="warning">Could not connect to vCenter using the provided credentials.</Alert>
  </StatusField>
);

const ConnectionFailedInfra = () => (
  <StatusField>
    <Alert type="warning">Can not verify vCenter credentials, connection to the V2V VMWare failed.</Alert>
  </StatusField>
);

const ConnectionSuccessful = () => <StatusField>Connection successful</StatusField>;

const ReadVmsListFailed = () => (
  <StatusField>
    <Alert type="warning">
      Connection succeeded but could not read list of virtual machines from the vCenter instance.
    </Alert>
  </StatusField>
);

const ReadVmDetailFailed = () => (
  <StatusField>
    <Alert type="warning">
      Connection succeeded but could not read details of the virtual machine from the vCenter instance.
    </Alert>
  </StatusField>
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

  // eslint-disable-next-line no-console
  console.warn('VMWareProviderStatusByPhase unrecognized phase found within the V2V VMWare object: ', phase);
  return null;
};
VMWareProviderStatusByPhase.defaultProps = {
  phase: undefined,
};
VMWareProviderStatusByPhase.propTypes = {
  phase: PropTypes.string,
};

const getConnection = basicSettings =>
  get(settingsValue(basicSettings, PROVIDER_VMWARE_USER_PWD_AND_CHECK_KEY), PROVIDER_VMWARE_CONNECTION);

export const hasConnection = basicSettings => {
  const connValue = getConnection(basicSettings);
  return connValue && !!connValue.V2VVmwareName;
};

// see onVmwareCheckConnection() for details
const VMWareProviderStatus = ({ extraProps }) => {
  const { WithResources, basicSettings } = extraProps;

  if (!hasConnection(basicSettings)) {
    return null;
  }
  const { providerStatus, V2VVmwareName } = getConnection(basicSettings);

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
        namespace: settingsValue(basicSettings, NAMESPACE_KEY),
        isList: false,
      }),
    },
  };
  const resourceToProps = ({ v2vvmware }) => ({
    // TODO: handle the case when V2VVmwareName is set but the object is missing in API (404)
    // means: it was garbage collected (so rare case)
    phase: get(v2vvmware, 'status.phase'), // value set by the controller
  });

  return (
    <WithResources resourceMap={resourceMap} resourceToProps={resourceToProps}>
      <VMWareProviderStatusByPhase />
    </WithResources>
  );
};
VMWareProviderStatus.defaultProps = {};
VMWareProviderStatus.propTypes = {
  extraProps: PropTypes.object.isRequired,
};

export default VMWareProviderStatus;
