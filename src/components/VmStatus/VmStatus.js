import React from 'react';
import PropTypes from 'prop-types';

import { CDI_KUBEVIRT_IO, STORAGE_IMPORT_PVC_NAME } from '../../constants';

import { getSubPagePath } from '../../utils';
import { PodModel, VirtualMachineModel } from '../../models';
import { VM_STATUS_IMPORTING, VM_STATUS_IMPORT_ERROR, getVmStatus } from '../../utils/status/vm';
import { getId, getVmImporterPods } from '../../selectors';
import { Status, PopoverStatus, StatusLinkField, StatusDescriptionField, StatusProgressField } from '../Status';
import {
  RUNNING,
  PENDING,
  IMPORTING,
  IMPORTING_ERROR_VMWARE,
  IMPORTING_PENDING_VMWARE,
  IMPORTING_VMWARE,
  VIEW_POD_EVENTS,
  VIEW_VM_EVENTS,
  UNKNOWN,
  MIGRATING,
  STARTING,
  VM_ERROR,
  POD_ERROR,
  IMPORTING_ERROR,
  OFF,
  IMPORTING_VMWARE_MESSAGE,
  IMPORTING_ERROR_VMWARE_MESSAGE,
  IMPORTING_MESSAGE,
  IMPORTING_ERROR_MESSAGE,
  VMI_WAITING_MESSAGE,
  STARTING_MESSAGE,
} from './strings';

const getAdditionalImportText = pod => ` (${pod.metadata.labels[`${CDI_KUBEVIRT_IO}/${STORAGE_IMPORT_PVC_NAME}`]})`;

const VmPopoverStatusWrapper = ({ icon, header, message, children, progress, linkTo, linkMessage, ...props }) =>
  message ? (
    <PopoverStatus icon={icon} {...props} header={header}>
      <StatusDescriptionField content={message} />
      {children || ''}
      {progress !== null ? <StatusProgressField title={IMPORTING} progress={progress} /> : ''}
      {linkTo ? <StatusLinkField title={linkMessage} linkTo={linkTo} /> : ''}
    </PopoverStatus>
  ) : (
    <Status icon={icon}>{header}</Status>
  );

VmPopoverStatusWrapper.defaultProps = {
  progress: null,
  message: null,
  linkMessage: null,
  linkTo: null,
  children: null,
  iconType: null,
};
VmPopoverStatusWrapper.propTypes = {
  icon: PropTypes.string.isRequired,
  iconType: PropTypes.string,
  header: PropTypes.string.isRequired,
  message: PropTypes.string,
  children: PropTypes.any,
  progress: PropTypes.number,
  linkMessage: PropTypes.string,
  linkTo: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

export const VmStatuses = props => {
  const { vm, pods, migrations } = props;
  const statusDetail = getVmStatus(vm, pods, migrations);
  const importerPods = getVmImporterPods(pods, vm);

  switch (statusDetail.status) {
    case VM_STATUS_IMPORTING:
    case VM_STATUS_IMPORT_ERROR:
      return (
        <React.Fragment>
          {importerPods.map(pod => (
            <div key={getId(pod)}>
              <VmStatus {...props} pods={[pod]} verbose />
            </div>
          ))}
        </React.Fragment>
      );
    default:
  }
  return (
    <div key={importerPods && importerPods.length > 0 ? getId(importerPods[0]) : '6d0c77-has-no-importer-pods'}>
      <VmStatus {...props} />
    </div>
  );
};
VmStatuses.defaultProps = {
  pods: undefined,
  migrations: undefined,
};
VmStatuses.propTypes = {
  vm: PropTypes.object.isRequired,
  pods: PropTypes.array,
  migrations: PropTypes.array,
};

export const VmStatus = ({ vm, pods, migrations, verbose }) => {
  const statusDetail = getVmStatus(vm, pods, migrations);
  const additionalText =
    verbose && statusDetail.pod && statusDetail.pod.metadata.labels ? getAdditionalImportText(statusDetail.pod) : null;

  const statusProps = {
    VM_STATUS_CONVERSION_IN_PROGRESS: {
      icon: 'in-progress',
      header: IMPORTING_VMWARE,
      message: IMPORTING_VMWARE_MESSAGE,
      linkMessage: VIEW_POD_EVENTS,
      linkTo: getSubPagePath(statusDetail.pod, PodModel, 'events'),
      children: additionalText ? <StatusDescriptionField content={additionalText} /> : '',
    },
    VM_STATUS_V2V_CONVERSION_IN_PROGRESS: {
      icon: 'in-progress',
      header: IMPORTING_VMWARE,
      message: IMPORTING_VMWARE_MESSAGE,
      linkMessage: VIEW_POD_EVENTS,
      linkTo: getSubPagePath(statusDetail.pod, PodModel, 'events'),
      children: additionalText ? <StatusDescriptionField content={additionalText} /> : '',
    },
    VM_STATUS_IMPORTING: {
      icon: 'in-progress',
      header: IMPORTING,
      message: IMPORTING_MESSAGE,
      linkMessage: VIEW_POD_EVENTS,
      linkTo: getSubPagePath(statusDetail.pod, PodModel, 'events'),
      children: additionalText ? <StatusDescriptionField content={additionalText} /> : '',
    },

    VM_STATUS_V2V_CONVERSION_PENDING: {
      icon: 'hourglass-half',
      iconType: 'fa',
      header: IMPORTING_PENDING_VMWARE,
      message: IMPORTING_VMWARE_MESSAGE,
      linkMessage: VIEW_POD_EVENTS,
      linkTo: getSubPagePath(statusDetail.pod, PodModel, 'events'),
      children: statusDetail.message ? <StatusDescriptionField content={statusDetail.message} /> : '',
    },
    VM_STATUS_VMI_WAITING: {
      icon: 'hourglass-half',
      iconType: 'fa',
      header: PENDING,
      message: VMI_WAITING_MESSAGE,
      linkMessage: VIEW_VM_EVENTS,
      linkTo: getSubPagePath(vm, VirtualMachineModel, 'events'),
      children: statusDetail.message ? <StatusDescriptionField content={statusDetail.message} /> : '',
    },

    VM_STATUS_ERROR: {
      icon: 'error-circle-o',
      header: VM_ERROR,
      linkMessage: VIEW_VM_EVENTS,
      linkTo: getSubPagePath(vm, VirtualMachineModel, 'events'),
    },
    VM_STATUS_POD_ERROR: {
      icon: 'error-circle-o',
      header: POD_ERROR,
      linkMessage: VIEW_POD_EVENTS,
      linkTo: getSubPagePath(statusDetail.launcherPod, PodModel, 'events'),
    },
    VM_STATUS_IMPORT_ERROR: {
      icon: 'error-circle-o',
      header: IMPORTING_ERROR,
      message: IMPORTING_ERROR_MESSAGE,
      linkMessage: VIEW_POD_EVENTS,
      linkTo: getSubPagePath(statusDetail.pod, PodModel, 'events'),
      children: (
        <React.Fragment>
          {statusDetail.message ? <StatusDescriptionField content={statusDetail.message} /> : ''}
          {additionalText ? <StatusDescriptionField content={additionalText} /> : ''}
        </React.Fragment>
      ),
    },
    VM_STATUS_V2V_CONVERSION_ERROR: {
      icon: 'error-circle-o',
      header: IMPORTING_ERROR_VMWARE,
      message: IMPORTING_ERROR_VMWARE_MESSAGE,
      linkMessage: VIEW_POD_EVENTS,
      linkTo: getSubPagePath(statusDetail.pod, PodModel, 'events'),
      children: (
        <React.Fragment>
          {statusDetail.message ? <StatusDescriptionField content={statusDetail.message} /> : ''}
          {additionalText ? <StatusDescriptionField content={additionalText} /> : ''}
        </React.Fragment>
      ),
    },
    VM_STATUS_CONVERSION_FAILED: {
      icon: 'error-circle-o',
      header: IMPORTING_ERROR_VMWARE,
      message: IMPORTING_ERROR_VMWARE_MESSAGE,
      linkMessage: VIEW_POD_EVENTS,
      linkTo: getSubPagePath(statusDetail.pod, PodModel, 'events'),
      children: (
        <React.Fragment>
          {statusDetail.message ? <StatusDescriptionField content={statusDetail.message} /> : ''}
          {additionalText ? <StatusDescriptionField content={additionalText} /> : ''}
        </React.Fragment>
      ),
    },

    VM_STATUS_STARTING: {
      icon: 'in-progress',
      header: STARTING,
      message: STARTING_MESSAGE,
      linkMessage: VIEW_POD_EVENTS,
      linkTo: getSubPagePath(statusDetail.launcherPod, PodModel, 'events'),
      children: statusDetail.message ? <StatusDescriptionField content={statusDetail.message} /> : '',
    },
    VM_STATUS_RUNNING: {
      icon: 'ok',
      iconType: 'fa',
      header: RUNNING,
    },
    VM_STATUS_MIGRATING: {
      icon: 'in-progress',
      header: MIGRATING,
    },
    VM_STATUS_OFF: {
      icon: 'off',
      header: OFF,
    },
  };

  const extraProps = statusProps[statusDetail.status] || { icon: 'unknown', header: UNKNOWN };
  return <VmPopoverStatusWrapper {...statusDetail} {...extraProps} />;
};
VmStatus.defaultProps = {
  pods: undefined,
  migrations: undefined,
  verbose: false,
};
VmStatus.propTypes = {
  vm: PropTypes.object.isRequired,
  pods: PropTypes.array,
  migrations: PropTypes.array,
  verbose: PropTypes.bool,
};
