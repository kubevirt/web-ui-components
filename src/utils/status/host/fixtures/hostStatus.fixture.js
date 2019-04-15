import {
  HOST_STATUS_READY,
  HOST_STATUS_DISCOVERED,
  HOST_STATUS_OK,
  HOST_STATUS_PROVISIONED,
  HOST_STATUS_DEPROVISIONED,
  HOST_STATUS_REGISTERING,
  HOST_STATUS_INSPECTING,
  HOST_STATUS_PREPARING_TO_PROVISION,
  HOST_STATUS_PROVISIONING,
  HOST_STATUS_DEPROVISIONING,
  HOST_STATUS_MAKING_HOST_AVAILABLE,
  HOST_STATUS_VALIDATION_ERROR,
  HOST_STATUS_REGISTRATION_ERROR,
} from '../constants';

const getHost = (provisioningState, operationalStatus = 'OK', errorMessage = '') => ({
  metadata: {
    name: 'test-host',
    namespace: 'openshift-machine-api',
  },
  spec: {},
  status: {
    errorMessage,
    operationalStatus,
    provisioning: { state: provisioningState },
  },
});

export default [
  {
    host: getHost('ready'),
    expectedSimple: HOST_STATUS_READY,
  },
  {
    host: getHost('discovered'),
    expectedSimple: HOST_STATUS_DISCOVERED,
  },
  {
    host: getHost(undefined, 'OK'),
    expectedSimple: HOST_STATUS_OK,
  },
  {
    host: getHost('provisioned'),
    expectedSimple: HOST_STATUS_PROVISIONED,
  },
  {
    host: getHost('deprovisioned'),
    expectedSimple: HOST_STATUS_DEPROVISIONED,
  },
  {
    host: getHost('registering'),
    expectedSimple: HOST_STATUS_REGISTERING,
  },
  {
    host: getHost('inspecting'),
    expectedSimple: HOST_STATUS_INSPECTING,
  },
  {
    host: getHost('preparing to provision'),
    expectedSimple: HOST_STATUS_PREPARING_TO_PROVISION,
  },
  {
    host: getHost('provisioning'),
    expectedSimple: HOST_STATUS_PROVISIONING,
  },
  {
    host: getHost('deprovisioning'),
    expectedSimple: HOST_STATUS_DEPROVISIONING,
  },
  {
    host: getHost('making host available'),
    expectedSimple: HOST_STATUS_MAKING_HOST_AVAILABLE,
  },
  {
    host: getHost('validation error', 'error', 'some validation error'),
    expectedSimple: HOST_STATUS_VALIDATION_ERROR,
  },
  {
    host: getHost('registration error', 'error', 'failed to register new host'),
    expectedSimple: HOST_STATUS_REGISTRATION_ERROR,
  },
];
