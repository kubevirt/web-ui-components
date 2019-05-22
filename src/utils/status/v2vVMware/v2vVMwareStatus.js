import {
  V2V_WMWARE_STATUS_CONNECTION_FAILED,
  V2V_WMWARE_STATUS_LOADING_VMS_LIST_FAILED,
  V2V_WMWARE_STATUS_LOADING_VM_DETAIL_FAILED,
  V2V_WMWARE_STATUS_CONNECTING,
  V2V_WMWARE_STATUS_LOADING_VMS_LIST,
  V2V_WMWARE_STATUS_LOADING_VM_DETAIL,
  V2V_WMWARE_STATUS_CONNECTION_SUCCESSFUL,
  V2V_WMWARE_STATUS_UNKNOWN,
  V2V_WMWARE_STATUS_CONNECTION_TO_VCENTER_FAILED,
} from './constants';

import { getStatusPhase } from '../../../selectors';

import { NOT_HANDLED } from '..';

// Following constants conform v2vvmware_controller.go
const phaseMapper = {
  Failed: V2V_WMWARE_STATUS_CONNECTION_TO_VCENTER_FAILED,
  LoadingVmsListFailed: V2V_WMWARE_STATUS_LOADING_VMS_LIST_FAILED,
  LoadingVmDetailFailed: V2V_WMWARE_STATUS_LOADING_VM_DETAIL_FAILED,
  LoadingVmsList: V2V_WMWARE_STATUS_LOADING_VMS_LIST,
  LoadingVmDetail: V2V_WMWARE_STATUS_LOADING_VM_DETAIL,
  Connecting: V2V_WMWARE_STATUS_CONNECTING,
  ConnectionVerified: V2V_WMWARE_STATUS_CONNECTION_SUCCESSFUL,
};

const hasV2vVMWareStatus = v2vvmware => {
  const status = phaseMapper[getStatusPhase(v2vvmware)];

  if (status) {
    return { status };
  }

  if (v2vvmware) {
    // object created without status and is connecting
    return { status: V2V_WMWARE_STATUS_CONNECTING };
  }

  return NOT_HANDLED;
};

const hasSetStatus = flags => {
  if (flags.hasConnectionFailed) {
    return { status: V2V_WMWARE_STATUS_CONNECTION_FAILED };
  }

  return NOT_HANDLED;
};

// TODO: tests?
export const getV2vVMwareStatus = (v2vvmware, flags = { hasConnectionFailed: false }) =>
  hasV2vVMWareStatus(v2vvmware) || hasSetStatus(flags) || { status: V2V_WMWARE_STATUS_UNKNOWN };

export const getSimpleV2vVMwareStatus = (v2vvmware, flags = { hasConnectionFailed: false }) =>
  getV2vVMwareStatus(v2vvmware, flags).status;
