import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { Link } from 'react-router-dom';

import {
  VM_STATUS_STARTING,
  VM_STATUS_RUNNING,
  VM_STATUS_OFF,
  VM_STATUS_IMPORTING,
  VM_STATUS_POD_ERROR,
  VM_STATUS_ERROR,
  VM_STATUS_IMPORT_ERROR,
  VM_STATUS_ERROR_COMMON,
  VM_STATUS_UNKNOWN,
} from '../../constants';

import { getSubPagePath } from '../../utils';
import { PodModel, VirtualMachineModel } from '../../models';

const NOT_HANDLED = null;

const getConditionOfType = (pod, type) => get(pod, 'status.conditions', []).find(condition => condition.type === type);

const getNotRedyConditionMessage = pod => {
  const notReadyCondition = get(pod, 'status.conditions', []).find(condition => condition.status !== 'True');
  if (notReadyCondition) {
    // at least one pod condition not met. This can be just tentative, let the user analyze progress via Pod events
    return notReadyCondition.message || `Step: ${notReadyCondition.type}`;
  }
  return undefined;
};

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

const isCreated = (vm, launcherPod = null) => {
  if (get(vm, 'status.created', false)) {
    // created but not yet ready
    let message;
    if (launcherPod) {
      // pod created, so check for it's potential error
      const podScheduledCond = getConditionOfType(launcherPod, 'PodScheduled');
      if (podScheduledCond && podScheduledCond.status !== 'True' && podScheduledCond.reason === 'Unschedulable') {
        return { status: VM_STATUS_POD_ERROR, message: 'Pod scheduling failed.' };
      }
      message = getNotRedyConditionMessage(launcherPod);
    }
    return { status: VM_STATUS_STARTING, message };
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

const isBeingImported = (vm, importerPod) => {
  if (importerPod && !get(vm, 'status.created', false)) {
    const podScheduledCond = getConditionOfType(importerPod, 'PodScheduled');
    if (podScheduledCond && podScheduledCond.status !== 'True' && podScheduledCond.reason === 'Unschedulable') {
      return { status: VM_STATUS_IMPORT_ERROR, message: 'Importer pod scheduling failed.' };
    }
    return { status: VM_STATUS_IMPORTING, message: getNotRedyConditionMessage(importerPod) };
  }
  return NOT_HANDLED;
};

export const getVmStatusDetail = (vm, launcherPod, importerPod) =>
  isRunning(vm) ||
  isReady(vm) ||
  isVmError(vm) ||
  isCreated(vm, launcherPod) ||
  isBeingImported(vm, importerPod) || { status: VM_STATUS_UNKNOWN };

export const getVmStatus = (vm, launcherPod, importerPod) => {
  const vmStatus = getVmStatusDetail(vm, launcherPod, importerPod).status;
  return vmStatus === VM_STATUS_ERROR || vmStatus === VM_STATUS_POD_ERROR || vmStatus === VM_STATUS_IMPORT_ERROR
    ? VM_STATUS_ERROR_COMMON
    : vmStatus;
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

const StateStarting = ({ linkTo, message }) => (
  <StateValue iconClass="pficon pficon-pending">
    {linkTo ? (
      <Link to={linkTo} title={message}>
        Starting
      </Link>
    ) : (
      'Starting'
    )}
  </StateValue>
);
StateStarting.propTypes = {
  linkTo: PropTypes.string,
  message: PropTypes.string,
};
StateStarting.defaultProps = {
  message: undefined,
  linkTo: undefined,
};

const StateError = ({ linkTo, message, children }) => (
  <StateValue iconClass="pficon pficon-error-circle-o">
    {linkTo ? (
      <Link to={linkTo} title={message}>
        {children}
      </Link>
    ) : (
      children
    )}
  </StateValue>
);
StateError.propTypes = {
  children: PropTypes.string.isRequired,
  linkTo: PropTypes.string,
  message: PropTypes.string,
};
StateError.defaultProps = {
  message: undefined,
  linkTo: undefined,
};

export const VmStatus = ({ vm, launcherPod, importerPod }) => {
  const statusDetail = getVmStatusDetail(vm, launcherPod, importerPod);
  switch (statusDetail.status) {
    case VM_STATUS_OFF:
      return <StateOff />;
    case VM_STATUS_RUNNING:
      return <StateRunning />;
    case VM_STATUS_STARTING:
      return <StateStarting linkTo={getSubPagePath(launcherPod, PodModel, 'events')} message={statusDetail.message} />;
    case VM_STATUS_POD_ERROR:
      return (
        <StateError linkTo={getSubPagePath(launcherPod, PodModel, 'events')} message={statusDetail.message}>
          Pod Error
        </StateError>
      );
    case VM_STATUS_IMPORT_ERROR:
      return (
        <StateError linkTo={getSubPagePath(importerPod, PodModel, 'events')} message={statusDetail.message}>
          Importer Error
        </StateError>
      );
    case VM_STATUS_ERROR:
      return (
        <StateError linkTo={getSubPagePath(vm, VirtualMachineModel, 'events')} message={statusDetail.message}>
          VM Error
        </StateError>
      );
    default:
      return <StateUnknown />; // Let's hope this state is tentative and will fit former conditions soon
  }
};

VmStatus.defaultProps = {
  launcherPod: undefined,
  importerPod: undefined,
};

VmStatus.propTypes = {
  vm: PropTypes.object.isRequired,
  launcherPod: PropTypes.object,
  importerPod: PropTypes.object,
};
