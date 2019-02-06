import React, { Fragment } from 'react';
import { get } from 'lodash';

import { Spinner, Button, Alert } from 'patternfly-react';

import { Text } from '../../../Form';

import {
  PROVIDER_VMWARE_USER_PWD_KEY,
  PROVIDER_VMWARE_CONNECTION,
  PROVIDER_STATUS_CONNECTING,
  PROVIDER_STATUS_CONNECTION_FAILED, PROVIDER_STATUS_SUCCESS,
} from '../constants';

const CheckingCredentials = () => (
  <Fragment>
    Checking vCenter Credentials...<Spinner loading size="sm"/>
  </Fragment>
);

const ConnectionFailed = () => (
  <Alert type="warning">
    Could not connect to vCenter using the provided credentials.
  </Alert>
);

const ConnectionSuccessful = () => (
  <Fragment>
    Connection successful
  </Fragment>
);

const VMWareProviderStatus = ({ connValue }) => {
  const providerStatus = get(connValue, 'status');
  return (
    <div className="kubevirt-create-vm-wizard__import-vmware-connection-status">
      {providerStatus === PROVIDER_STATUS_CONNECTING && <CheckingCredentials />}
      {providerStatus === PROVIDER_STATUS_CONNECTION_FAILED && <ConnectionFailed />}
      {providerStatus === PROVIDER_STATUS_SUCCESS && <ConnectionSuccessful />}
    </div>
  );
};

// workaround to wrap two components at a single row
const VMWarePasswordAndCheck = ({ onChange, id, value, extraProps }) => {
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
          extraProps.onCheckConnection(newValue => onChange({
            [PROVIDER_VMWARE_USER_PWD_KEY]: pwdValue,
            [PROVIDER_VMWARE_CONNECTION]: newValue,
          }))
        }}>
          Check
        </Button>
      </div>
      <VMWareProviderStatus connValue={connValue} />
    </Fragment>
  );
};

export default VMWarePasswordAndCheck;
