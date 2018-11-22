import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { Link } from 'react-router-dom';

import {
  VM_STATUS_STARTING,
  VM_STATUS_RUNNING,
  VM_STATUS_OFF,
  VM_STATUS_POD_ERROR,
  VM_STATUS_ERROR,
  VM_STATUS_ERROR_COMMON,
  VM_STATUS_UNKNOWN,
} from '../../constants';

import { getSubPagePath } from '../../utils';
import { PodModel, VirtualMachineModel } from '../../models';

const NOT_HANDLED = null;

const isRunning = vm => {
  if (!get(vm, 'spec.running', false)) {
    return { status: VM_STATUS_OFF };
  }
  return NOT_HANDLED;
};

const isReady = vm => {
  if (get(vm, 'status.ready', false)) {
    // we are all set
    return { status: VM_STATUS_RUNNING };
  }
  return NOT_HANDLED;
};

const isCreated = (vm, launcherPod) => {
  if (get(vm, 'status.created', false)) {
    // created but not yet ready
    if (launcherPod) {
      // pod created, so check for it's potential error
      const notReadyCondition = get(launcherPod, 'status.conditions', []).find(
        condition => condition.status !== 'True'
      );
      if (notReadyCondition) {
        // at least one pod condition not met, let the user analyze issue via Pod events
        return { status: VM_STATUS_POD_ERROR, message: notReadyCondition.message };
      }
      return { status: VM_STATUS_STARTING }; // Pod is not yet created. This state is most probably tentative and will be changed soon.
    }
    return { status: VM_STATUS_POD_ERROR };
  }
  return NOT_HANDLED;
};

const isVmError = vm => {
  // is an issue with the VM definition?
  const condition = get(vm, 'status.conditions[0]');
  if (condition) {
    // Do we need to analyze additional conditions in the array? Probably not.
    if (condition.type === 'Failure') {
      return { status: VM_STATUS_ERROR, message: condition.message };
    }
  }
  return NOT_HANDLED;
};

export const getVmStatusDetail = (vm, launcherPod) =>
  isRunning(vm) || isReady(vm) || isCreated(vm, launcherPod) || isVmError(vm) || { status: VM_STATUS_UNKNOWN };

export const getVmStatus = (vm, launcherPod) => {
  const vmStatus = getVmStatusDetail(vm, launcherPod).status;
  return vmStatus === VM_STATUS_ERROR || vmStatus === VM_STATUS_POD_ERROR ? VM_STATUS_ERROR_COMMON : vmStatus;
};

const StateValue = ({ iconClass, children }) => (
  <Fragment>
    <span className={`vm-status-icon ${iconClass}`} aria-hidden="true" />
    {children}
  </Fragment>
);

StateValue.propTypes = {
  children: PropTypes.any,
  iconClass: PropTypes.string.isRequired,
};

StateValue.defaultProps = {
  children: null,
};

const StateRunning = () => <StateValue iconClass="pficon pficon-on-running">Running</StateValue>;
const StateOff = () => <StateValue iconClass="pficon pficon-off">Off</StateValue>;
const StateUnknown = () => <StateValue iconClass="pficon pficon-unknown">Unknown</StateValue>;
const StateStarting = () => <StateValue iconClass="pficon pficon-pending">Starting</StateValue>;

const StateError = ({ linkTo, message, children }) => (
  <StateValue iconClass="pficon pficon-error-circle-o">
    <Link to={linkTo} title={message}>
      {children}
    </Link>
  </StateValue>
);
StateError.propTypes = {
  children: PropTypes.string.isRequired,
  linkTo: PropTypes.string.isRequired,
  message: PropTypes.string,
};
StateError.defaultProps = {
  message: undefined,
};

export const VmStatus = ({ vm, launcherPod }) => {
  const statusDetail = getVmStatusDetail(vm, launcherPod);
  switch (statusDetail.status) {
    case VM_STATUS_OFF:
      return <StateOff />;
    case VM_STATUS_RUNNING:
      return <StateRunning />;
    case VM_STATUS_STARTING:
      return <StateStarting />;
    case VM_STATUS_POD_ERROR:
      return (
        <StateError linkTo={getSubPagePath(launcherPod, PodModel, 'events')} message={statusDetail.message}>
          Pod Error
        </StateError>
      );
    case VM_STATUS_ERROR:
      return (
        <StateError linkTo={getSubPagePath(launcherPod, VirtualMachineModel, 'events')} message={statusDetail.message}>
          VM Error
        </StateError>
      );
    default:
      return <StateUnknown />; // Let's hope this state is tentative and will fit former conditions soon
  }
};

VmStatus.defaultProps = {
  launcherPod: undefined,
};

VmStatus.propTypes = {
  vm: PropTypes.object.isRequired,
  launcherPod: PropTypes.object,
};
