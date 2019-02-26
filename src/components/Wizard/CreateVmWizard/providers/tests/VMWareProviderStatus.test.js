import { render } from 'enzyme/build';

import React from 'react';

import {
  PROVIDER_STATUS_CONNECTING,
  PROVIDER_STATUS_CONNECTION_FAILED,
  PROVIDER_STATUS_SUCCESS,
} from '../../constants';
import VMWareProviderStatus from '../VMWareProviderStatus';
import { basicSettingsImportVmwareNewConnection } from '../../../../../tests/forms_mocks/basicSettings.mock';
import { WithResources } from '../../../../../tests/k8s';

export const rendersProviderStatus = (providerStatus, phase, removeV2VVmwareName) => {
  const onChange = jest.fn();

  const connValue = {
    providerStatus,
    V2VVmwareName: removeV2VVmwareName ? undefined : 'v2vvmware-object-name',
  };

  const extraProps = {
    onCheckConnection: () => {},
    WithResources: props => <WithResources {...props} tesOnlyPhase={phase} />,
    basicSettings: basicSettingsImportVmwareNewConnection,
  };

  const component = render(
    <VMWareProviderStatus onChange={onChange} id="my-id" connValue={connValue} extraProps={extraProps} />
  );
  expect(component).toMatchSnapshot();
};

describe('<VMWareProviderStatus />', () => {
  it('renders PROVIDER_STATUS_SUCCESS', () => {
    rendersProviderStatus(PROVIDER_STATUS_SUCCESS);
  });
  it('renders PROVIDER_STATUS_CONNECTION_FAILED', () => {
    rendersProviderStatus(PROVIDER_STATUS_CONNECTION_FAILED);
  });
  it('renders PROVIDER_STATUS_CONNECTING', () => {
    rendersProviderStatus(PROVIDER_STATUS_CONNECTING);
  });

  it('renders Connecting based on status.phase', () => {
    rendersProviderStatus('', 'Connecting');
  });
  it('renders ConnectionVerified based on status.phase', () => {
    rendersProviderStatus('', 'ConnectionVerified');
  });
  it('renders Failed based on status.phase', () => {
    rendersProviderStatus('', 'Failed');
  });
  it('renders LoadingVmsList based on status.phase', () => {
    rendersProviderStatus('', 'LoadingVmsList');
  });
  it('renders LoadingVmDetail based on status.phase', () => {
    rendersProviderStatus('', 'LoadingVmDetail');
  });
  it('renders LoadingVmDetailFailed based on status.phase', () => {
    rendersProviderStatus('', 'LoadingVmDetailFailed');
  });

  it('handles unknown V2VVMWare', () => {
    rendersProviderStatus(PROVIDER_STATUS_CONNECTING, '', true);
  });
});
