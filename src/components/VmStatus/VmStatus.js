import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import {
  VM_STATUS_VMI_WAITING,
  VM_STATUS_STARTING,
  VM_STATUS_RUNNING,
  VM_STATUS_OFF,
  VM_STATUS_POD_ERROR,
  VM_STATUS_ERROR,
  VM_STATUS_MIGRATING,
  VM_STATUS_DISKS_FAILED,
  VM_STATUS_PREPARING_DISKS,
  DATA_VOLUME_STATUS_PENDING,
  DATA_VOLUME_STATUS_UPLOAD_IN_PROGRESS,
  DATA_VOLUME_STATUS_CLONE_IN_PROGRESS,
  DATA_VOLUME_STATUS_IMPORT_IN_PROGRESS,
} from '../../constants';

import { getSubPagePath } from '../../utils';
import { PodModel, VirtualMachineModel } from '../../models';
import { getVmStatusDetail } from './getVmStatus';
import { getNamespace, getName } from '../../utils/selectors';
import { getVolumes } from '../../k8s/vmBuilder';

const StateValue = ({ iconClass, children, linkTo, message }) => (
  <Fragment>
    <span className={`kubevirt-vm-status__icon ${iconClass}`} aria-hidden="true" />
    {linkTo ? (
      <Link className="kubevirt-vm-status__link" to={linkTo} title={message}>
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
  linkTo: undefined,
  message: undefined,
};

const StateRunning = ({ ...props }) => (
  <StateValue iconClass="pficon pficon-on-running" {...props}>
    Running
  </StateValue>
);
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

const getDiskLinkTo = (pod, vm) =>
  pod ? getSubPagePath(pod, PodModel, 'events') : getSubPagePath(vm, VirtualMachineModel, 'events');

const StateDisksPreparing = ({ vm, statusDetail, verbose }) => {
  const diskProps = {
    linkTo: getDiskLinkTo(statusDetail.pod, vm),
    diskName: statusDetail.diskName,
    verbose,
  };
  switch (statusDetail.diskStatus) {
    case DATA_VOLUME_STATUS_PENDING:
      return <StatePreparingDisks action="Preparing" {...diskProps} />;
    case DATA_VOLUME_STATUS_UPLOAD_IN_PROGRESS:
      return <StatePreparingDisks action="Uploading" {...diskProps} />;
    case DATA_VOLUME_STATUS_CLONE_IN_PROGRESS:
      return <StatePreparingDisks action="Cloning" {...diskProps} />;
    case DATA_VOLUME_STATUS_IMPORT_IN_PROGRESS:
      return <StatePreparingDisks action="Importing" {...diskProps} />;
    default:
      return <StateUnknown />;
  }
};
const StateDisksFailed = ({ vm, statusDetail, verbose }) => {
  const message = verbose ? statusDetail.verboseMessage : statusDetail.message;
  const child = verbose ? statusDetail.message : 'Disk Error';
  return (
    <StateError linkTo={getDiskLinkTo(statusDetail.pod, vm)} message={message}>
      {child}
    </StateError>
  );
};

StateDisksFailed.defaultProps = {
  verbose: false,
};

StateDisksFailed.propTypes = {
  vm: PropTypes.object.isRequired,
  statusDetail: PropTypes.object.isRequired,
  verbose: PropTypes.bool,
};

const StatePreparingDisks = ({ diskName, verbose, action, ...props }) => (
  <StateValue iconClass="pficon pficon-import" {...props}>
    {verbose ? `${action} disk ${diskName}` : `Preparing Disks`}
  </StateValue>
);
const StateError = ({ children, ...props }) => (
  <StateValue iconClass="pficon pficon-error-circle-o" {...props}>
    {children}
  </StateValue>
);

export const VmStatuses = props => {
  const { vm, launcherPod, cdiPods, migration, dataVolumes } = props;

  if (dataVolumes) {
    const vmDataVolumes = dataVolumes.filter(
      dv =>
        !!getVolumes(vm)
          .filter(volume => volume.dataVolume)
          .find(volume => volume.dataVolume.name === getName(dv) && getNamespace(vm) === getNamespace(dv))
    );

    const statuses = vmDataVolumes.map(vmDv => getVmStatusDetail(vm, launcherPod, cdiPods, migration, [vmDv]));
    const diskStatuses = statuses.filter(
      status => status.status === VM_STATUS_PREPARING_DISKS || status.status === VM_STATUS_DISKS_FAILED
    );

    if (diskStatuses.length > 0) {
      return (
        <div id={`kubevirt-vm-statuses-${getNamespace(vm)}/${getName(vm)}`}>
          {diskStatuses.map(diskStatus => (
            <div key={diskStatus.diskName}>
              <VmStatusDetail vm={vm} launcherPod={launcherPod} statusDetail={diskStatus} verbose />
            </div>
          ))}
        </div>
      );
    }
  }

  return <VmStatus {...props} key={`${getName(vm)}-status`} />;
};

VmStatuses.defaultProps = {
  launcherPod: undefined,
  cdiPods: undefined,
  migration: undefined,
  dataVolumes: undefined,
};

VmStatuses.propTypes = {
  vm: PropTypes.object.isRequired,
  launcherPod: PropTypes.object,
  cdiPods: PropTypes.array,
  migration: PropTypes.object,
  dataVolumes: PropTypes.array,
};

const VmStatusDetail = ({ vm, launcherPod, statusDetail, verbose }) => {
  switch (statusDetail.status) {
    case VM_STATUS_OFF:
      return <StateOff />;
    case VM_STATUS_RUNNING:
      return <StateRunning linkTo={getSubPagePath(launcherPod, PodModel)} />;
    case VM_STATUS_VMI_WAITING:
      return <StateVmiWaiting linkTo={getSubPagePath(vm, VirtualMachineModel, 'events')} />;
    case VM_STATUS_STARTING:
      return <StateStarting linkTo={getSubPagePath(launcherPod, PodModel, 'events')} message={statusDetail.message} />;
    case VM_STATUS_PREPARING_DISKS:
      return <StateDisksPreparing vm={vm} statusDetail={statusDetail} verbose={verbose} />;
    case VM_STATUS_DISKS_FAILED:
      return <StateDisksFailed vm={vm} statusDetail={statusDetail} verbose={verbose} />;
    case VM_STATUS_MIGRATING:
      return <StateMigrating />; // TODO: add linkTo once migration monitoring page is available
    case VM_STATUS_POD_ERROR:
      return (
        <StateError linkTo={getSubPagePath(launcherPod, PodModel, 'events')} message={statusDetail.message}>
          Pod Error
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

VmStatusDetail.propTypes = {
  vm: PropTypes.object.isRequired,
  launcherPod: PropTypes.object,
  statusDetail: PropTypes.object.isRequired,
  verbose: PropTypes.bool,
};

VmStatusDetail.defaultProps = {
  verbose: false,
  launcherPod: undefined,
};

export const VmStatus = ({ vm, launcherPod, cdiPods, migration, dataVolumes }) => {
  const statusDetail = getVmStatusDetail(vm, launcherPod, cdiPods, migration, dataVolumes);
  return (
    <div id={`kubevirt-vm-status-${getNamespace(vm)}/${getName(vm)}`}>
      <VmStatusDetail vm={vm} launcherPod={launcherPod} statusDetail={statusDetail} />
    </div>
  );
};

VmStatus.defaultProps = {
  launcherPod: undefined,
  cdiPods: undefined,
  migration: undefined,
  dataVolumes: undefined,
};

VmStatus.propTypes = {
  vm: PropTypes.object.isRequired,
  launcherPod: PropTypes.object,
  cdiPods: PropTypes.array,
  migration: PropTypes.object,
  dataVolumes: PropTypes.array,
};
