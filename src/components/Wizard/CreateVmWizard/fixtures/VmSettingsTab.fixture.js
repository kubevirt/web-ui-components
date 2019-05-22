import { Provider } from 'react-redux';

import React from 'react';

import { ConnectedVmSettingsTab } from '../VmSettingsTab';
import { wizardProps } from './CreateVmWizard.fixture';

import store from '../../../../tests/redux/store';

import { types, vmWizardActions } from '../redux/actions';

const reduxId = '5';

class VmSettingsTab extends React.Component {
  constructor(props) {
    super(props);
    store.dispatch(vmWizardActions[types.create](reduxId, props));
  }

  render() {
    return (
      <Provider store={store}>
        <ConnectedVmSettingsTab {...this.props} wizardReduxId={reduxId} dispatchUpdateContext={this.props} />
      </Provider>
    );
  }
}

export default {
  component: VmSettingsTab,
  props: wizardProps,
};
