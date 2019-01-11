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
  CDI_KUBEVIRT_IO,
  STORAGE_IMPORT_PVC_NAME,
} from '../../constants';

import { getSubPagePath } from '../../utils';
import { PodModel, VirtualMachineModel } from '../../models';
import { getVmStatusDetail } from './getVmStatus';
import { getId } from '../../utils/selectors';

const getAdditionalImportText = pod => ` (${pod.metadata.labels[`${CDI_KUBEVIRT_IO}/${STORAGE_IMPORT_PVC_NAME}`]})`;

const StateValue = ({ iconClass, children, linkTo, message }) => (
  <Fragment>
    <span className={`kubevirt-vm-status__icon ${iconClass}`} aria-hidden="true" />
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
const StateImporting = ({ additionalText, ...props }) => (
  <StateValue iconClass="pficon pficon-import" {...props}>
    Importing
    {additionalText}
  </StateValue>
);
const StateError = ({ children, ...props }) => (
  <StateValue iconClass="pficon pficon-error-circle-o" {...props}>
    {children}
  </StateValue>
);

export const VmStatuses = props => {
  const { vm, launcherPod, importerPods, migration } = props;
  const statusDetail = getVmStatusDetail(vm, launcherPod, importerPods, migration);
  if (importerPods && importerPods.length > 1) {
    switch (statusDetail.status) {
      case VM_STATUS_IMPORTING:
      case VM_STATUS_IMPORT_ERROR:
        return (
          <React.Fragment>
            {importerPods.map(pod => (
              <div key={getId(pod)}>
                <VmStatus {...props} importerPods={[pod]} verbose />
              </div>
            ))}
          </React.Fragment>
        );
      default:
    }
  }
  return (
    <div key={importerPods && importerPods.length > 0 ? getId(importerPods[0]) : '6d0c77-has-no-importer-pods'}>
      <VmStatus {...props} />
    </div>
  );
};

VmStatuses.defaultProps = {
  launcherPod: undefined,
  importerPods: undefined,
  migration: undefined,
};

VmStatuses.propTypes = {
  vm: PropTypes.object.isRequired,
  launcherPod: PropTypes.object,
  importerPods: PropTypes.array,
  migration: PropTypes.object,
};

export const VmStatus = ({ vm, launcherPod, importerPods, migration, verbose }) => {
  const statusDetail = getVmStatusDetail(vm, launcherPod, importerPods, migration);
  switch (statusDetail.status) {
    case VM_STATUS_OFF:
      return <StateOff />;
    case VM_STATUS_RUNNING:
      return <StateRunning linkTo={getSubPagePath(launcherPod, PodModel)} />;
    case VM_STATUS_VMI_WAITING:
      return <StateVmiWaiting linkTo={getSubPagePath(vm, VirtualMachineModel, 'events')} />;
    case VM_STATUS_STARTING:
      return <StateStarting linkTo={getSubPagePath(launcherPod, PodModel, 'events')} message={statusDetail.message} />;
    case VM_STATUS_IMPORTING:
      return (
        <StateImporting
          linkTo={getSubPagePath(statusDetail.pod, PodModel, 'events')}
          additionalText={verbose ? getAdditionalImportText(statusDetail.pod) : ''}
        />
      );
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
        <StateError linkTo={getSubPagePath(statusDetail.pod, PodModel, 'events')} message={statusDetail.message}>
          Importer Error
          {verbose ? getAdditionalImportText(statusDetail.pod) : ''}
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
  importerPods: undefined,
  migration: undefined,
};

VmStatus.propTypes = {
  vm: PropTypes.object.isRequired,
  launcherPod: PropTypes.object,
  importerPods: PropTypes.array,
  migration: PropTypes.object,
};
