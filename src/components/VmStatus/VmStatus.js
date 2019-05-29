import React from 'react';
import PropTypes from 'prop-types';

import { CDI_KUBEVIRT_IO, STORAGE_IMPORT_PVC_NAME } from '../../constants';

import { getSubPagePath } from '../../utils';
import { PodModel, VirtualMachineModel } from '../../models';
import { getId, getVmImporterPods } from '../../selectors';
import { Status, PopoverStatus, StatusLinkField, StatusDescriptionField, StatusProgressField } from '../Status';
import {
  VM_STATUS_V2V_CONVERSION_ERROR,
  VM_STATUS_V2V_CONVERSION_IN_PROGRESS,
  VM_STATUS_V2V_CONVERSION_PENDING,
  VM_STATUS_VMI_WAITING,
  VM_STATUS_STARTING,
  VM_STATUS_RUNNING,
  VM_STATUS_OFF,
  VM_STATUS_IMPORTING,
  VM_STATUS_POD_ERROR,
  VM_STATUS_ERROR,
  VM_STATUS_IMPORT_ERROR,
  VM_STATUS_MIGRATING,
  getVmStatus,
} from '../../utils/status/vm';
import {
  RUNNING,
  PENDING,
  IMPORTING,
  IMPORTING_ERROR_VMWARE,
  IMPORTING_PENDING_VMWARE,
  IMPORTING_VMWARE,
  VIEW_POD_OVERVIEW,
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

const VmStatusInProgress = ({ header, message, children, progress, linkTo, linkMessage }) => (
  <PopoverStatus icon="in-progress" header={header}>
    <StatusDescriptionField>{message}</StatusDescriptionField>
    {children}
    {progress && <StatusProgressField title={IMPORTING} progress={progress} />}
    <StatusLinkField title={linkMessage} linkTo={linkTo} />
  </PopoverStatus>
);
VmStatusInProgress.defaultProps = {
  progress: null,
  children: null,
};
VmStatusInProgress.propTypes = {
  header: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  linkTo: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  linkMessage: PropTypes.string.isRequired,
  children: PropTypes.any,
  progress: PropTypes.number,
};

const VmStatusPending = ({ header, message, children, linkTo, linkMessage }) => (
  <PopoverStatus icon="hourglass-half" iconType="fa" header={header}>
    <StatusDescriptionField>{message}</StatusDescriptionField>
    {children}
    <StatusLinkField title={linkMessage} linkTo={linkTo} />
  </PopoverStatus>
);
VmStatusPending.defaultProps = {
  children: null,
};
VmStatusPending.propTypes = {
  header: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  linkTo: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  linkMessage: PropTypes.string.isRequired,
  children: PropTypes.any,
};

const VmStatusError = ({ header, message, children, linkTo, linkMessage }) => (
  <PopoverStatus icon="error-circle-o" header={header}>
    <StatusDescriptionField>{message}</StatusDescriptionField>
    {children}
    <StatusLinkField title={linkMessage} linkTo={linkTo} />
  </PopoverStatus>
);
VmStatusError.defaultProps = {
  children: null,
};
VmStatusError.propTypes = {
  header: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  linkMessage: PropTypes.string.isRequired,
  linkTo: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  children: PropTypes.any,
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
  const linkToPodOverview = getSubPagePath(statusDetail.launcherPod, PodModel);
  const linkToVMEvents = getSubPagePath(vm, VirtualMachineModel, 'events');
  const additionalText =
    verbose && statusDetail.pod && statusDetail.pod.metadata.labels ? getAdditionalImportText(statusDetail.pod) : null;

  switch (statusDetail.status) {
    case VM_STATUS_V2V_CONVERSION_PENDING:
      return (
        <VmStatusPending
          header={IMPORTING_PENDING_VMWARE}
          message={IMPORTING_VMWARE_MESSAGE}
          linkMessage={VIEW_VM_EVENTS}
          linkTo={linkToVMEvents}
        >
          {statusDetail.message && <StatusDescriptionField>{statusDetail.message}</StatusDescriptionField>}
        </VmStatusPending>
      );
    case VM_STATUS_VMI_WAITING:
      return (
        <VmStatusPending
          header={PENDING}
          message={VMI_WAITING_MESSAGE}
          linkMessage={VIEW_VM_EVENTS}
          linkTo={linkToVMEvents}
        >
          {statusDetail.message && <StatusDescriptionField>{statusDetail.message}</StatusDescriptionField>}
        </VmStatusPending>
      );

    case VM_STATUS_POD_ERROR:
      return <VmStatusError header={POD_ERROR} linkMessage={VIEW_POD_OVERVIEW} linkTo={linkToPodOverview} />;

    case VM_STATUS_ERROR:
      return (
        <VmStatusError
          header={VM_ERROR}
          message={statusDetail.message}
          linkMessage={VIEW_VM_EVENTS}
          linkTo={linkToVMEvents}
        >
          {additionalText && <StatusDescriptionField>{additionalText}</StatusDescriptionField>}
        </VmStatusError>
      );
    case VM_STATUS_IMPORT_ERROR:
      return (
        <VmStatusError
          header={IMPORTING_ERROR}
          message={IMPORTING_ERROR_MESSAGE}
          linkMessage={VIEW_VM_EVENTS}
          linkTo={linkToVMEvents}
        >
          {statusDetail.message && <StatusDescriptionField>{statusDetail.message}</StatusDescriptionField>}
          {additionalText && <StatusDescriptionField>{additionalText}</StatusDescriptionField>}
        </VmStatusError>
      );
    case VM_STATUS_V2V_CONVERSION_ERROR:
      return (
        <VmStatusError
          header={IMPORTING_ERROR_VMWARE}
          message={IMPORTING_ERROR_VMWARE_MESSAGE}
          linkMessage={VIEW_VM_EVENTS}
          linkTo={linkToVMEvents}
        >
          {statusDetail.message && <StatusDescriptionField>{statusDetail.message}</StatusDescriptionField>}
          {additionalText && <StatusDescriptionField>{additionalText}</StatusDescriptionField>}
        </VmStatusError>
      );

    case VM_STATUS_IMPORTING:
      return (
        <VmStatusInProgress
          header={IMPORTING}
          message={IMPORTING_MESSAGE}
          linkMessage={VIEW_VM_EVENTS}
          linkTo={linkToVMEvents}
          progress={statusDetail.progress}
        >
          {additionalText && <StatusDescriptionField>{additionalText}</StatusDescriptionField>}
        </VmStatusInProgress>
      );
    case VM_STATUS_V2V_CONVERSION_IN_PROGRESS:
      return (
        <VmStatusInProgress
          header={IMPORTING_VMWARE}
          message={IMPORTING_VMWARE_MESSAGE}
          linkMessage={VIEW_VM_EVENTS}
          linkTo={linkToVMEvents}
          progress={statusDetail.progress}
        >
          {additionalText && <StatusDescriptionField>{additionalText}</StatusDescriptionField>}
        </VmStatusInProgress>
      );
    case VM_STATUS_STARTING:
      return (
        <VmStatusInProgress
          header={STARTING}
          message={STARTING_MESSAGE}
          linkMessage={VIEW_VM_EVENTS}
          linkTo={linkToVMEvents}
          progress={statusDetail.progress}
        >
          {statusDetail.message && <StatusDescriptionField>{statusDetail.message}</StatusDescriptionField>}
        </VmStatusInProgress>
      );

    case VM_STATUS_MIGRATING:
      return (
        <VmStatusInProgress
          header={MIGRATING}
          message={statusDetail.message}
          linkMessage={VIEW_VM_EVENTS}
          linkTo={linkToVMEvents}
          progress={statusDetail.progress}
        />
      );
    case VM_STATUS_RUNNING:
      return <Status icon="ok">{RUNNING}</Status>;
    case VM_STATUS_OFF:
      return <Status icon="off">{OFF}</Status>;
    default:
      return <Status icon="unknown">{UNKNOWN}</Status>;
  }
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
