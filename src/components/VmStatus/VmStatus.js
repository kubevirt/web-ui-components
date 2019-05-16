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
import { Status, LinkStatus } from '../Status';

const getAdditionalImportText = pod => ` (${pod.metadata.labels[`${CDI_KUBEVIRT_IO}/${STORAGE_IMPORT_PVC_NAME}`]})`;

const StateRunning = ({ ...props }) => (
  <LinkStatus icon="on-running" {...props}>
    Running
  </LinkStatus>
);
const StateOff = () => <Status icon="off">Off</Status>;
const StateUnknown = () => <Status icon="unknown">Unknown</Status>;
const StateMigrating = () => <Status icon="migration">Migrating</Status>;
const StateVmiWaiting = ({ ...props }) => (
  <LinkStatus icon="pending" {...props}>
    Pending
  </LinkStatus>
);
const StateStarting = ({ ...props }) => (
  <LinkStatus icon="pending" {...props}>
    Starting
  </LinkStatus>
);
const StateImporting = ({ additionalText, ...props }) => (
  <LinkStatus icon="import" {...props}>
    Importing
    {additionalText}
  </LinkStatus>
);

const StateV2VConversionInProgress = ({ progress, ...props }) => (
  <LinkStatus icon="import" {...props}>
    Importing (VMWare)
  </LinkStatus>
);
StateV2VConversionInProgress.defaultProps = {
  progress: null,
};
StateV2VConversionInProgress.propTypes = {
  progress: PropTypes.number,
};

const StateV2VConversionPending = ({ ...props }) => (
  <LinkStatus icon="pending" {...props}>
    Importing Pending (VMware)
  </LinkStatus>
);

const StateV2VConversionError = ({ ...props }) => (
  <LinkStatus icon="error-circle-o" {...props}>
    Importing Error (VMware)
  </LinkStatus>
);
StateImporting.defaultProps = {
  additionalText: undefined,
};
StateImporting.propTypes = {
  additionalText: PropTypes.string,
};
const StateError = ({ children, ...props }) => (
  <LinkStatus icon="error-circle-o" {...props}>
    {children}
  </LinkStatus>
);
StateError.propTypes = {
  children: PropTypes.any.isRequired,
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
        <StateV2VConversionInProgress {...statusDetail} linkTo={getSubPagePath(statusDetail.pod, PodModel, 'events')} />
      );
    case VM_STATUS_V2V_CONVERSION_PENDING:
      return (
        <StateV2VConversionPending {...statusDetail} linkTo={getSubPagePath(statusDetail.pod, PodModel, 'events')} />
      );
    case VM_STATUS_V2V_CONVERSION_ERROR:
      return (
        <StateV2VConversionError {...statusDetail} linkTo={getSubPagePath(statusDetail.pod, PodModel, 'events')} />
      );
    case VM_STATUS_IMPORTING:
      return (
        <StateImporting
          linkTo={getSubPagePath(statusDetail.pod, PodModel, 'events')}
          additionalText={verbose ? getAdditionalImportText(statusDetail.pod) : ''}
        />
      );
    case VM_STATUS_IMPORT_ERROR:
      return (
        <StateError linkTo={getSubPagePath(statusDetail.pod, PodModel, 'events')} message={statusDetail.message}>
          Importer Error
          {verbose ? getAdditionalImportText(statusDetail.pod) : ''}
        </StateError>
      );
    case VM_STATUS_MIGRATING:
      return <StateMigrating />; // TODO: add linkTo once migration monitoring page is available
    case VM_STATUS_OFF:
      return <StateOff />;
    case VM_STATUS_RUNNING:
      return <StateRunning linkTo={getSubPagePath(statusDetail.launcherPod, PodModel)} />;
    case VM_STATUS_VMI_WAITING:
      return <StateVmiWaiting linkTo={getSubPagePath(vm, VirtualMachineModel, 'events')} />;
    case VM_STATUS_STARTING:
      return (
        <StateStarting
          linkTo={getSubPagePath(statusDetail.launcherPod, PodModel, 'events')}
          message={statusDetail.message}
        />
      );
    case VM_STATUS_POD_ERROR:
      return (
        <StateError
          linkTo={getSubPagePath(statusDetail.launcherPod, PodModel, 'events')}
          message={statusDetail.message}
        >
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
