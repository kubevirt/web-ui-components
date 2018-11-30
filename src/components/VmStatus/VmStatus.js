import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import {
  VM_STATUS_VMI_WAITING,
  VM_STATUS_STARTING,
  VM_STATUS_RUNNING,
  VM_STATUS_OFF,
  VM_STATUS_IMPORTING,
  VM_STATUS_POD_ERROR,
  VM_STATUS_ERROR,
  VM_STATUS_IMPORT_ERROR,
  VM_STATUS_MIGRATING,
} from '../../constants';

import { getSubPagePath } from '../../utils';
import { PodModel, VirtualMachineModel } from '../../models';
import { getVmStatusDetail } from './getVmStatus';

const StateValue = ({ iconClass, children, linkTo, message }) => (
  <Fragment>
    <span className={`vm-status-icon ${iconClass}`} aria-hidden="true" />
    {linkTo ? (
      <Link to={linkTo} title={message}>
        {children}
      </Link>
    ) : (
      children
    )}
  </Fragment>
);
StateValue.propTypes = {
  children: PropTypes.any,
  iconClass: PropTypes.string.isRequired,
  linkTo: PropTypes.string,
  message: PropTypes.string,
};
StateValue.defaultProps = {
  children: null,
  message: undefined,
  linkTo: undefined,
};

const StateRunning = () => <StateValue iconClass="pficon pficon-on-running">Running</StateValue>;
const StateOff = () => <StateValue iconClass="pficon pficon-off">Off</StateValue>;
const StateUnknown = () => <StateValue iconClass="pficon pficon-unknown">Unknown</StateValue>;
const StateMigrating = () => <StateValue iconClass="pficon pficon-migration">Migrating</StateValue>;
const StateVmiWaiting = ({ ...props }) => (
  <StateValue iconClass="pficon pficon-pending" {...props}>
    Pending
  </StateValue>
);
const StateStarting = ({ ...props }) => (
  <StateValue iconClass="pficon pficon-pending" {...props}>
    Starting
  </StateValue>
);
const StateImporting = ({ ...props }) => (
  <StateValue iconClass="pficon pficon-import" {...props}>
    Importing
  </StateValue>
);
const StateError = ({ children, ...props }) => (
  <StateValue iconClass="pficon pficon-error-circle-o" {...props}>
    {children}
  </StateValue>
);
StateError.propTypes = {
  children: PropTypes.string.isRequired,
};

export const VmStatus = ({ vm, launcherPod, importerPod, migration }) => {
  const statusDetail = getVmStatusDetail(vm, launcherPod, importerPod, migration);
  switch (statusDetail.status) {
    case VM_STATUS_OFF:
      return <StateOff />;
    case VM_STATUS_RUNNING:
      return <StateRunning />;
    case VM_STATUS_VMI_WAITING:
      return <StateVmiWaiting linkTo={getSubPagePath(vm, VirtualMachineModel, 'events')} />;
    case VM_STATUS_STARTING:
      return <StateStarting linkTo={getSubPagePath(launcherPod, PodModel, 'events')} message={statusDetail.message} />;
    case VM_STATUS_IMPORTING:
      return <StateImporting linkTo={getSubPagePath(importerPod, PodModel, 'events')} />;
    case VM_STATUS_MIGRATING:
      return <StateMigrating />; // TODO: add linkTo once migration monitoring page is available
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
  migration: undefined,
};

VmStatus.propTypes = {
  vm: PropTypes.object.isRequired,
  launcherPod: PropTypes.object,
  importerPod: PropTypes.object,
  migration: PropTypes.object,
};
