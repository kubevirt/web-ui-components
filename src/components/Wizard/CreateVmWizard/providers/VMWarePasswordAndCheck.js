import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';

import { Button } from 'patternfly-react';

import { PASSWORD, Text } from '../../../Form';
import { PROVIDER_VMWARE_USER_PWD_KEY, PROVIDER_VMWARE_CONNECTION, PROVIDER_VMWARE_URL_KEY } from '../constants';
import { settingsValue } from '../../../../k8s/selectors';

import VMWareProviderStatus from './VMWareProviderStatus';

// workaround to wrap two components at a single row
const VMWarePasswordAndCheck = ({ onChange, id, value, extraProps }) => {
  const { onCheckConnection, basicSettings } = extraProps;
  const pwdValue = get(value, PROVIDER_VMWARE_USER_PWD_KEY);
  const connValue = get(value, PROVIDER_VMWARE_CONNECTION);

  return (
    <Fragment>
      <Text
        type={PASSWORD}
        id={`${id}-text`}
        value={pwdValue || ''}
        onChange={newValue =>
          onChange({
            [PROVIDER_VMWARE_USER_PWD_KEY]: newValue,
            [PROVIDER_VMWARE_CONNECTION]: connValue,
          })
        }
      />
      <div className="kubevirt-create-vm-wizard__import-vmware-passwordcheck-button-section">
        <Button
          id={`${id}-check-button`}
          className="kubevirt-create-vm-wizard__import-vmware-passwordcheck-button"
          disabled={!settingsValue(basicSettings, PROVIDER_VMWARE_URL_KEY)}
          onClick={() => {
            onCheckConnection(newValue =>
              onChange({
                [PROVIDER_VMWARE_USER_PWD_KEY]: pwdValue,
                [PROVIDER_VMWARE_CONNECTION]: newValue,
              })
            );
          }}
        >
          Check
        </Button>
        <VMWareProviderStatus connValue={connValue} extraProps={extraProps} />
      </div>
    </Fragment>
  );
};
VMWarePasswordAndCheck.defaultProps = {
  id: undefined,
  value: undefined,
};
VMWarePasswordAndCheck.propTypes = {
  onChange: PropTypes.func.isRequired,
  extraProps: PropTypes.object.isRequired,
  id: PropTypes.string,
  value: PropTypes.object,
};

export default VMWarePasswordAndCheck;
