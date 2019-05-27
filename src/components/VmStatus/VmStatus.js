import React from 'react';
import PropTypes from 'prop-types';

import { CDI_KUBEVIRT_IO, STORAGE_IMPORT_PVC_NAME } from '../../constants';

import { getSubPagePath, VM_STATUS_V2V_CONVERSION_PENDING } from '../../utils';
import { PodModel, VirtualMachineModel } from '../../models';
import {
  VM_STATUS_V2V_CONVERSION_ERROR,
  VM_STATUS_V2V_CONVERSION_IN_PROGRESS,
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
import { getId, getVmImporterPods } from '../../selectors';
import { Status, PopoverStatus, StatusLinkField, StatusDescriptionField, StatusProgressField } from '../Status';
import {
  RUNNING,
  PENDING,
  ERROR,
  IMPORTING,
  IMPORTING_ERROR_VMWARE,
  IMPORTING_PENDING_VMWARE,
  IMPORTING_VMWARE,
  VIEW_POD_EVENTS,
  VIEW_POD_DETAILS,
  VIEW_VM_EVENTS,
  UNKNOWN,
  MIGRATING,
  STARTING,
  VM_ERROR,
  POD_ERROR,
  IMPORTING_ERROR,
} from './strings';

const getAdditionalImportText = pod => ` (${pod.metadata.labels[`${CDI_KUBEVIRT_IO}/${STORAGE_IMPORT_PVC_NAME}`]})`;

const StateRunning = ({ children, linkTo, linkMessage, ...props }) => (
  <PopoverStatus icon="on-running" {...props} header={RUNNING}>
    <StatusDescriptionField content={props.message} />
    {children || ''}
    {linkTo ? <StatusLinkField title={linkMessage} linkTo={linkTo} /> : ''}
  </PopoverStatus>
);
StateRunning.defaultProps = {
  children: null,
  message: null,
  linkMessage: null,
  linkTo: null,
};
StateRunning.propTypes = {
  message: PropTypes.string,
  children: PropTypes.any,
  linkMessage: PropTypes.string,
  linkTo: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

const StateOff = () => <Status icon="off">Off</Status>;
const StateUnknown = () => <Status icon="unknown">{UNKNOWN}</Status>;
const StateMigrating = () => <Status icon="migration">{MIGRATING}</Status>;
const StateVmiWaiting = ({ children, linkTo, linkMessage, ...props }) => (
  <PopoverStatus icon="pending" {...props} header={PENDING}>
    <StatusDescriptionField content={props.message} />
    {children || ''}
    {linkTo ? <StatusLinkField title={linkMessage} linkTo={linkTo} /> : ''}
  </PopoverStatus>
);
StateVmiWaiting.defaultProps = {
  children: null,
  message: null,
  linkMessage: null,
  linkTo: null,
};
StateVmiWaiting.propTypes = {
  message: PropTypes.string,
  children: PropTypes.any,
  linkMessage: PropTypes.string,
  linkTo: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

const StateStarting = ({ children, linkTo, linkMessage, ...props }) => (
  <PopoverStatus icon="pending" {...props} header={STARTING}>
    <StatusDescriptionField content={props.message} />
    {children || ''}
    {linkTo ? <StatusLinkField title={linkMessage} linkTo={linkTo} /> : ''}
  </PopoverStatus>
);
StateStarting.defaultProps = {
  children: null,
  message: null,
  linkMessage: null,
  linkTo: null,
};
StateStarting.propTypes = {
  message: PropTypes.string,
  children: PropTypes.any,
  linkMessage: PropTypes.string,
  linkTo: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

const StateImporting = ({ children, linkTo, linkMessage, ...props }) => (
  <PopoverStatus icon="import" {...props} header={IMPORTING}>
    <StatusDescriptionField content={props.message} />
    {children || ''}
    {linkTo ? <StatusLinkField title={linkMessage} linkTo={linkTo} /> : ''}
  </PopoverStatus>
);
StateImporting.defaultProps = {
  children: null,
  message: null,
  linkMessage: null,
  linkTo: null,
};
StateImporting.propTypes = {
  message: PropTypes.string,
  children: PropTypes.any,
  linkMessage: PropTypes.string,
  linkTo: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

const StateV2VConversionInProgress = ({ progress, linkTo, linkMessage, ...props }) => (
  <PopoverStatus icon="import" {...props} header={IMPORTING_VMWARE}>
    <StatusDescriptionField content={props.message} />
    <StatusProgressField title={IMPORTING} progress={progress} />
    {linkTo ? <StatusLinkField title={linkMessage} linkTo={linkTo} /> : ''}
  </PopoverStatus>
);
StateV2VConversionInProgress.defaultProps = {
  progress: null,
  message: null,
  linkMessage: null,
  linkTo: null,
};
StateV2VConversionInProgress.propTypes = {
  progress: PropTypes.number,
  message: PropTypes.string,
  linkMessage: PropTypes.string,
  linkTo: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

const StateV2VConversionPending = ({ linkTo, linkMessage, ...props }) => (
  <PopoverStatus icon="pending" {...props} header={IMPORTING_PENDING_VMWARE}>
    <StatusDescriptionField content={props.message} />
    {linkTo ? <StatusLinkField title={linkMessage} linkTo={linkTo} /> : ''}
  </PopoverStatus>
);
StateV2VConversionPending.defaultProps = {
  message: null,
  linkMessage: null,
  linkTo: null,
};
StateV2VConversionPending.propTypes = {
  message: PropTypes.string,
  linkMessage: PropTypes.string,
  linkTo: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

const StateV2VConversionError = ({ linkTo, linkMessage, ...props }) => (
  <PopoverStatus icon="error-circle-o" {...props} header={IMPORTING_ERROR_VMWARE}>
    <StatusDescriptionField content={props.message} />
    {linkTo ? <StatusLinkField title={linkMessage} linkTo={linkTo} /> : ''}
  </PopoverStatus>
);
StateV2VConversionError.defaultProps = {
  message: null,
  linkMessage: null,
  linkTo: null,
};
StateV2VConversionError.propTypes = {
  message: PropTypes.string,
  linkMessage: PropTypes.string,
  linkTo: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

const StateError = ({ children, header, linkTo, linkMessage, ...props }) => (
  <PopoverStatus icon="error-circle-o" {...props} header={header}>
    <StatusDescriptionField content={props.message} />
    {children || ''}
    {linkTo ? <StatusLinkField title={linkMessage} linkTo={linkTo} /> : ''}
  </PopoverStatus>
);
StateError.defaultProps = {
  header: ERROR,
  message: null,
  children: null,
  linkMessage: null,
  linkTo: null,
};
StateError.propTypes = {
  header: PropTypes.string,
  message: PropTypes.string,
  children: PropTypes.any,
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
  switch (statusDetail.status) {
    case VM_STATUS_V2V_CONVERSION_IN_PROGRESS:
      return (
        <StateV2VConversionInProgress
          {...statusDetail}
          message=""
          linkMessage={VIEW_POD_EVENTS}
          linkTo={getSubPagePath(statusDetail.pod, PodModel, 'events')}
        />
      );
    case VM_STATUS_V2V_CONVERSION_PENDING:
      return (
        <StateV2VConversionPending
          {...statusDetail}
          linkMessage={VIEW_POD_EVENTS}
          linkTo={getSubPagePath(statusDetail.pod, PodModel, 'events')}
        />
      );
    case VM_STATUS_V2V_CONVERSION_ERROR:
      return (
        <StateV2VConversionError
          {...statusDetail}
          linkMessage={VIEW_POD_EVENTS}
          linkTo={getSubPagePath(statusDetail.pod, PodModel, 'events')}
        />
      );
    case VM_STATUS_IMPORTING:
      return (
        <StateImporting
          {...statusDetail}
          linkMessage={VIEW_POD_EVENTS}
          linkTo={getSubPagePath(statusDetail.pod, PodModel, 'events')}
        >
          <StatusDescriptionField>{verbose ? getAdditionalImportText(statusDetail.pod) : ''}</StatusDescriptionField>
        </StateImporting>
      );
    case VM_STATUS_IMPORT_ERROR:
      return (
        <StateError
          {...statusDetail}
          linkMessage={VIEW_POD_EVENTS}
          linkTo={getSubPagePath(statusDetail.pod, PodModel, 'events')}
          header={IMPORTING_ERROR}
        >
          <StatusDescriptionField>{verbose ? getAdditionalImportText(statusDetail.pod) : ''}</StatusDescriptionField>
        </StateError>
      );
    case VM_STATUS_MIGRATING:
      return <StateMigrating />; // TODO: add linkTo once migration monitoring page is available
    case VM_STATUS_OFF:
      return <StateOff />;
    case VM_STATUS_RUNNING:
      return (
        <StateRunning
          {...statusDetail}
          linkMessage={VIEW_POD_DETAILS}
          linkTo={getSubPagePath(statusDetail.launcherPod, PodModel)}
        />
      );
    case VM_STATUS_VMI_WAITING:
      return (
        <StateVmiWaiting
          {...statusDetail}
          linkMessage={VIEW_VM_EVENTS}
          linkTo={getSubPagePath(vm, VirtualMachineModel, 'events')}
        />
      );
    case VM_STATUS_STARTING:
      return (
        <StateStarting
          {...statusDetail}
          linkTo={getSubPagePath(statusDetail.launcherPod, PodModel, 'events')}
          linkMessage={VIEW_POD_EVENTS}
        />
      );
    case VM_STATUS_POD_ERROR:
      return (
        <StateError
          {...statusDetail}
          linkTo={getSubPagePath(statusDetail.launcherPod, PodModel, 'events')}
          linkMessage={VIEW_POD_EVENTS}
          header={POD_ERROR}
        />
      );
    case VM_STATUS_ERROR:
      return (
        <StateError
          {...statusDetail}
          linkMessage={VIEW_VM_EVENTS}
          linkTo={getSubPagePath(vm, VirtualMachineModel, 'events')}
          header={VM_ERROR}
        />
      );
    default:
      return <StateUnknown />; // Let's hope this state is tentative and will fit former conditions soon
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
