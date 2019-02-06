import React, { Fragment } from 'react';
import { get } from 'lodash';

import {
  PROVIDER_VMWARE_USER_PWD_KEY,
  PROVIDER_VMWARE_CONNECTION,
  PROVIDER_STATUS_CONNECTING,
  PROVIDER_STATUS_SUCCESS,
  PROVIDER_STATUS_CONNECTION_FAILED,
} from '../constants';

// TODO: improve design
const VMWareProviderStatus = ({ connValue }) => {
  const providerStatus = get(connValue, 'status');
  return (
    <div>
      {providerStatus === PROVIDER_STATUS_CONNECTING && 'connecting'}
      {providerStatus === PROVIDER_STATUS_SUCCESS && 'done'}
      {providerStatus === PROVIDER_STATUS_CONNECTION_FAILED && 'failure'}
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
