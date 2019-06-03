import React from 'react';
import PropTypes from 'prop-types';

import { Alert, Spinner } from 'patternfly-react';

import {
  V2V_WMWARE_STATUS_CONNECTING,
  V2V_WMWARE_STATUS_CONNECTION_FAILED,
  V2V_WMWARE_STATUS_CONNECTION_SUCCESSFUL,
  V2V_WMWARE_STATUS_LOADING_VM_DETAIL,
  V2V_WMWARE_STATUS_LOADING_VM_DETAIL_FAILED,
  V2V_WMWARE_STATUS_LOADING_VMS_LIST,
  V2V_WMWARE_STATUS_LOADING_VMS_LIST_FAILED,
  V2V_WMWARE_STATUS_UNKNOWN,
  V2V_WMWARE_STATUS_CONNECTION_TO_VCENTER_FAILED,
} from '../../../../../utils/status/v2vVMware';
import VMwareStatusField from './VMwareStatusField';

const CheckingCredentials = () => (
  <VMwareStatusField>
    Checking vCenter Credentials...
    <Spinner loading size="sm" />
  </VMwareStatusField>
);

const LoadingData = () => (
  <VMwareStatusField>
    Connection successful. Loading data...
    <Spinner loading size="sm" />
  </VMwareStatusField>
);

const ConnectionFailed = () => (
  <VMwareStatusField>
    <Alert type="warning">Could not connect to vCenter using the provided credentials.</Alert>
  </VMwareStatusField>
);

const ConnectionFailedInfra = () => (
  <VMwareStatusField>
    <Alert type="warning">Can not verify vCenter credentials, connection to the V2V VMWare failed.</Alert>
  </VMwareStatusField>
);

const ConnectionSuccessful = () => <VMwareStatusField>Connection successful</VMwareStatusField>;

const ConnectionUnknown = () => <VMwareStatusField>Status unknown</VMwareStatusField>;

const ReadVmsListFailed = () => (
  <VMwareStatusField>
    <Alert type="warning">
      Connection succeeded but could not read list of virtual machines from the vCenter instance.
    </Alert>
  </VMwareStatusField>
);

const ReadVmDetailFailed = () => (
  <VMwareStatusField>
    <Alert type="warning">
      Connection succeeded but could not read details of the virtual machine from the vCenter instance.
    </Alert>
  </VMwareStatusField>
);

const vmwareStatusComponentResolver = {
  [V2V_WMWARE_STATUS_CONNECTING]: CheckingCredentials,
  [V2V_WMWARE_STATUS_CONNECTION_TO_VCENTER_FAILED]: ConnectionFailedInfra,
  [V2V_WMWARE_STATUS_CONNECTION_FAILED]: ConnectionFailed,
  [V2V_WMWARE_STATUS_LOADING_VMS_LIST]: LoadingData,
  [V2V_WMWARE_STATUS_LOADING_VMS_LIST_FAILED]: ReadVmsListFailed,
  [V2V_WMWARE_STATUS_LOADING_VM_DETAIL]: LoadingData,
  [V2V_WMWARE_STATUS_LOADING_VM_DETAIL_FAILED]: ReadVmDetailFailed,
  [V2V_WMWARE_STATUS_CONNECTION_SUCCESSFUL]: ConnectionSuccessful,
  [V2V_WMWARE_STATUS_UNKNOWN]: ConnectionUnknown,
};
// see onVmwareCheckConnection() for details
const VMWareObjectStatus = ({ status }) => {
  const StatusComponent = vmwareStatusComponentResolver[status] || ConnectionUnknown;

  return <StatusComponent />;
};

VMWareObjectStatus.defaultProps = {
  status: null,
};

VMWareObjectStatus.propTypes = {
  status: PropTypes.string,
};

export default VMWareObjectStatus;
