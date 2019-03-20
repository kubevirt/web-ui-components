import React from 'react';
import PropTypes from 'prop-types';

import { getHostStatus } from '../../utils/status/host/hostStatus';
import { GenericStatus, GenericError, GenericProgress, GenericSuccess, ValidationError } from './StatusComponents';
import {
  HOST_STATUS_READY,
  HOST_STATUS_DISCOVERED,
  HOST_STATUS_OK,
  HOST_STATUS_PROVISIONED,
  HOST_STATUS_REGISTERING,
  HOST_STATUS_INSPECTING,
  HOST_STATUS_PREPARING_TO_PROVISION,
  HOST_STATUS_PROVISIONING,
  HOST_STATUS_DEPROVISIONING,
  HOST_STATUS_MAKING_HOST_AVAILABLE,
  HOST_STATUS_VALIDATION_ERROR,
  HOST_STATUS_REGISTRATION_ERROR,
} from '../../utils/status/host/constants';

// Map status strings to components
const componentMap = {
  [HOST_STATUS_VALIDATION_ERROR]: ValidationError,
  [HOST_STATUS_REGISTRATION_ERROR]: GenericError,
  [HOST_STATUS_REGISTERING]: GenericProgress,
  [HOST_STATUS_INSPECTING]: GenericProgress,
  [HOST_STATUS_DISCOVERED]: GenericSuccess,
  [HOST_STATUS_OK]: GenericSuccess,
  [HOST_STATUS_READY]: GenericSuccess,
  [HOST_STATUS_PROVISIONED]: GenericSuccess,
  [HOST_STATUS_PROVISIONING]: GenericProgress,
  [HOST_STATUS_PREPARING_TO_PROVISION]: GenericProgress,
  [HOST_STATUS_DEPROVISIONING]: GenericProgress,
  [HOST_STATUS_MAKING_HOST_AVAILABLE]: GenericProgress,
};

export const BaremetalHostStatus = ({ host }) => {
  const hostStatus = getHostStatus(host);
  // Select the right component depending on the host status
  const StatusComponent = hostStatus.status in componentMap ? componentMap[hostStatus.status] : GenericStatus;
  return <StatusComponent {...hostStatus} />;
};

BaremetalHostStatus.propTypes = {
  host: PropTypes.object.isRequired,
};
