import React from 'react';
import PropTypes from 'prop-types';

import {
  getNodeStatus,
  NODE_STATUS_UNDER_MAINTENANCE,
  NODE_STATUS_STOPPING_MAINTENANCE,
} from '../../utils/status/node';
import { getCreationTimestamp, getDeletionTimestamp, getMaintenanceReason } from '../../selectors';
import { OverlayStatus } from '../Status';

const UnderMaintenanceStatus = ({ node, maintenance, TimestampComponent }) => {
  const maintenanceReason = getMaintenanceReason(maintenance);
  const created = getCreationTimestamp(maintenance);

  return (
    <OverlayStatus icon="off" header="Under maintenance">
      <div className="kubevirt-host-status__description">This host is under maintenance.</div>
      {maintenanceReason && (
        <React.Fragment>
          <b>Maintenance reason:</b>
          <div className="kubevirt-host-status__reason">{maintenanceReason}</div>
        </React.Fragment>
      )}
      <div>
        Started: <TimestampComponent simple timestamp={created} />
      </div>
    </OverlayStatus>
  );
};

UnderMaintenanceStatus.defaultProps = {
  maintenance: null,
};

UnderMaintenanceStatus.propTypes = {
  node: PropTypes.object.isRequired,
  maintenance: PropTypes.object,
  TimestampComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
};

const StoppingMaintenanceStatus = ({ node, maintenance, TimestampComponent }) => {
  const created = getCreationTimestamp(maintenance);
  const deleted = getDeletionTimestamp(maintenance);

  return (
    <OverlayStatus icon="off" header="Stopping maintenance">
      <div className="kubevirt-host-status__description">
        This host is leaving maintenance. It will rejoin the cluster and resume accepting workloads.
      </div>
      <div>
        Started: <TimestampComponent simple timestamp={created} />
      </div>
      <div>
        Ended: <TimestampComponent simple timestamp={deleted} />
      </div>
    </OverlayStatus>
  );
};

StoppingMaintenanceStatus.defaultProps = {
  maintenance: null,
};

StoppingMaintenanceStatus.propTypes = {
  node: PropTypes.object.isRequired,
  maintenance: PropTypes.object,
  TimestampComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
};

export const NodeStatus = ({ node, maintenances, TimestampComponent }) => {
  const nodeStatus = getNodeStatus(node, maintenances);
  switch (nodeStatus.status) {
    case NODE_STATUS_UNDER_MAINTENANCE:
      return (
        <UnderMaintenanceStatus
          node={node}
          maintenance={nodeStatus.maintenance}
          TimestampComponent={TimestampComponent}
        />
      );
    case NODE_STATUS_STOPPING_MAINTENANCE:
      return (
        <StoppingMaintenanceStatus
          node={node}
          maintenance={nodeStatus.maintenance}
          TimestampComponent={TimestampComponent}
        />
      );
    default:
      return null;
  }
};

NodeStatus.defaultProps = {
  maintenances: null,
};

NodeStatus.propTypes = {
  node: PropTypes.object.isRequired,
  maintenances: PropTypes.array,
  TimestampComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
};
