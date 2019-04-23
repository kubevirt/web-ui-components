import React from 'react';
import PropTypes from 'prop-types';

import { getHostStatus } from '../../utils/status/host/hostStatus';
import {
  AddDiscoveredHostLink,
  GenericStatus,
  GenericError,
  GenericProgress,
  GenericSuccess,
  ValidationError,
} from './StatusComponents';
import {
  HOST_STATUS_VALIDATION_ERROR,
  HOST_STATUS_DISCOVERED,
  HOST_STATUS_ALL_PROGRESS,
  HOST_STATUS_ALL_ERROR,
  HOST_STATUS_ALL_SUCCESS,
} from '../../utils/status/host/constants';

export const BaremetalHostStatus = ({ host, machine, nodes }) => {
  const hostStatus = getHostStatus(host, machine, nodes);
  const { status } = hostStatus;

  // Select the right component depending on the host status
  switch (true) {
    case status === HOST_STATUS_VALIDATION_ERROR:
      return <ValidationError {...hostStatus} />;
    case status === HOST_STATUS_DISCOVERED:
      return <AddDiscoveredHostLink host={host} />;
    case HOST_STATUS_ALL_PROGRESS.includes(status):
      return <GenericProgress {...hostStatus} />;
    case HOST_STATUS_ALL_SUCCESS.includes(status):
      return <GenericSuccess {...hostStatus} />;
    case HOST_STATUS_ALL_ERROR.includes(status):
      return <GenericError {...hostStatus} />;
    default:
      return <GenericStatus {...hostStatus} />;
  }
};

BaremetalHostStatus.propTypes = {
  host: PropTypes.object.isRequired,
  machine: PropTypes.object,
  nodes: PropTypes.array,
};

BaremetalHostStatus.defaultProps = {
  machine: undefined,
  nodes: undefined,
};
