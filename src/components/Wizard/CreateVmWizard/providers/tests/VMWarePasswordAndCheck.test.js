import React from 'react';
import { mount, render } from 'enzyme';

import { WithResources } from '../../../../../tests/k8s';
import VMWarePasswordAndCheck from '../VMWarePasswordAndCheck';
import fixture from '../fixtures/VMWarePasswordAndCheck.fixture';
import {
  PROVIDER_STATUS_CONNECTING,
  PROVIDER_STATUS_CONNECTION_FAILED,
  PROVIDER_STATUS_SUCCESS,
  PROVIDER_VMWARE_CONNECTION,
  PROVIDER_VMWARE_USER_PWD_AND_CHECK_KEY,
} from '../../constants';
import { basicSettingsImportVmwareNewConnection } from '../../../../../tests/forms_mocks/basicSettings.mock';

const rendersProviderStatus = (providerStatus, phase) => {
  const onChange = jest.fn();
  const { value } = basicSettingsImportVmwareNewConnection[PROVIDER_VMWARE_USER_PWD_AND_CHECK_KEY];
  value[PROVIDER_VMWARE_CONNECTION].providerStatus = providerStatus;

  const extraProps = {
    onCheckConnection: () => {},
    WithResources: props => <WithResources {...props} tesOnlyPhase={phase} />,
    basicSettings: basicSettingsImportVmwareNewConnection,
  };

  const component = render(
    <VMWarePasswordAndCheck onChange={onChange} id="my-id" value={value} extraProps={extraProps} />
  );
  expect(component).toMatchSnapshot();
};

describe('<VMWarePasswordAndCheck />', () => {
  it('renders correctly', () => {
    const component = mount(<VMWarePasswordAndCheck {...fixture.props} />);
    expect(component).toMatchSnapshot();
  });
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
});
