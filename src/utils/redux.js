import { combineReducers } from 'redux';

import React from 'react';

import createVmWizardReducers from '../components/Wizard/CreateVmWizard/redux/reducers';

let lastId = 0;

export const getNextReduxId = () => ++lastId;

export const withReduxId = Component => {
  class IdComponent extends React.Component {
    id = String(getNextReduxId());

    render() {
      return <Component reduxId={this.id} {...this.props} />;
    }
  }

  return IdComponent;
};

export const kubevirtReducer = combineReducers({
  createVmWizards: createVmWizardReducers, // UI // TODO: add one UI level here?
});
