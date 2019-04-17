import { NamespaceModel, ProjectModel } from '../models';

import {
  NETWORK_TYPE_POD,
  NETWORK_TYPE_MULTUS,
  NETWORK_BINDING_BRIDGE,
  NETWORK_BINDING_SRIOV,
  NETWORK_BINDING_MASQUERADE,
} from '../components/Wizard/CreateVmWizard/constants';

export function prefixedId(idPrefix, id) {
  return idPrefix && id ? `${idPrefix}-${id}` : null;
}

export const parseUrl = url => {
  try {
    return new URL(url);
  } catch (e) {
    return null;
  }
};

export const parseNumber = (value, defaultValue = null) => {
  const number = Number(value);
  return !Number.isNaN(parseFloat(value)) && !Number.isNaN(number) ? number : defaultValue;
};

export const getSequence = (from, to) => Array.from({ length: to - from + 1 }, (v, i) => i + from);

export const setNativeValue = (element, value) => {
  const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
  const prototype = Object.getPrototypeOf(element);
  const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;

  if (valueSetter && valueSetter !== prototypeValueSetter) {
    prototypeValueSetter.call(element, value);
  } else {
    valueSetter.call(element, value);
  }
};

export const generateDiskName = (vmName, diskName, clone) => {
  const name = [vmName, diskName];
  if (clone) {
    name.push('clone');
  }
  return name.join('-');
};

export const getBootDeviceIndex = (devices, bootOrder) => devices.findIndex(device => device.bootOrder === bootOrder);

export const getResource = (
  model,
  { name, namespaced = true, namespace, isList = true, matchLabels, matchExpressions, prop, fieldSelector } = {
    namespaced: true,
    isList: true,
  }
) => {
  const res = {
    // non-admin user cannot list namespaces (k8s wont return only namespaces available to user but 403 forbidden, ).
    // Instead we need to use ProjectModel which will return available projects (namespaces)
    kind: model.kind === NamespaceModel.kind ? ProjectModel.kind : model.kind,
    namespaced,
    namespace,
    isList,
    prop: prop || model.kind,
  };

  if (name) {
    res.name = name;
  }
  if (matchLabels) {
    res.selector = { matchLabels };
  }
  if (matchExpressions) {
    res.selector = { matchExpressions };
  }
  if (fieldSelector) {
    res.fieldSelector = fieldSelector;
  }

  return res;
};

const BYTE_UNITS_CONFIG = {
  conversion: 1024,
  units: {
    B: 0,
    Ki: 1,
    Mi: 2,
    Gi: 3,
    Ti: 4,
    Pi: 5,
  },
};

const NETWORK_BYTE_UNITS_CONFIG = {
  conversion: 1000,
  units: {
    Bps: 0,
    KBps: 1,
    MBps: 2,
    GBps: 3,
    TBps: 4,
    PBps: 5,
  },
};

export const formatBytes = (bytes, unit, fixed = 2, conversionConfig = BYTE_UNITS_CONFIG) => {
  const { units, conversion } = conversionConfig;
  const unitKeys = Object.keys(units);
  unit = unit || unitKeys.find(key => bytes < conversion ** (units[key] + 1)) || unitKeys[unitKeys.length - 1];
  return { value: Number((bytes / conversion ** units[unit]).toFixed(fixed)), unit };
};

export const formatCores = cores => ({ value: cores, unit: 'cores' });
export const formatPercents = percents => ({ value: percents, unit: '%' });

export const formatNetTraffic = (bytesPerSecond, preferredUnit, fixed = 2) =>
  formatBytes(bytesPerSecond, preferredUnit, fixed, NETWORK_BYTE_UNITS_CONFIG);

export const getNetworkBindings = networkType => {
  switch (networkType) {
    case NETWORK_TYPE_MULTUS:
      return [NETWORK_BINDING_BRIDGE, NETWORK_BINDING_SRIOV];
    case NETWORK_TYPE_POD:
    default:
      return [NETWORK_BINDING_MASQUERADE, NETWORK_BINDING_BRIDGE, NETWORK_BINDING_SRIOV];
  }
};

export const getDefaultNetworkBinding = networkType => {
  switch (networkType) {
    case NETWORK_TYPE_MULTUS:
      return NETWORK_BINDING_BRIDGE;
    case NETWORK_TYPE_POD:
    default:
      return NETWORK_BINDING_MASQUERADE;
  }
};

export const formatToShortTime = timestamp => {
  const dt = new Date(timestamp);

  // returns in HH:MM format
  return dt.toString().substring(16, 21);
};
