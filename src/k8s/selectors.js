import { get, has } from 'lodash';
import {
  CUSTOM_FLAVOR,
  TEMPLATE_FLAVOR_LABEL,
  TEMPLATE_OS_LABEL,
  TEMPLATE_WORKLOAD_LABEL,
  TEMPLATE_TYPE_BASE,
} from '../constants';

import { getTemplatesLabelValues, getTemplatesWithLabels, getTemplate } from '../utils/templates';
import {
  IMAGE_SOURCE_TYPE_KEY,
  OPERATING_SYSTEM_KEY,
  FLAVOR_KEY,
  WORKLOAD_PROFILE_KEY,
} from '../components/Wizard/CreateVmWizard/constants';
import { PersistentVolumeClaimModel, VirtualMachineModel } from '../models';

export const settingsValue = (basicSettings, key, defaultValue) => get(basicSettings, [key, 'value'], defaultValue);

export const getLabel = (basicSettings, labelPrefix, value) =>
  has(basicSettings, value) ? `${labelPrefix}/${settingsValue(basicSettings, value)}` : undefined;

export const getWorkloadLabel = basicSettings => getLabel(basicSettings, TEMPLATE_WORKLOAD_LABEL, WORKLOAD_PROFILE_KEY);
export const getOsLabel = basicSettings => getLabel(basicSettings, TEMPLATE_OS_LABEL, OPERATING_SYSTEM_KEY);

export const getOperatingSystems = (basicSettings, templates) => {
  const templatesWithLabels = getTemplatesWithLabels(getTemplate(templates, TEMPLATE_TYPE_BASE), [
    getWorkloadLabel(basicSettings),
    getFlavorLabel(basicSettings),
  ]);
  return getTemplatesLabelValues(templatesWithLabels, TEMPLATE_OS_LABEL);
};

export const getWorkloadProfiles = (basicSettings, templates) => {
  const templatesWithLabels = getTemplatesWithLabels(getTemplate(templates, TEMPLATE_TYPE_BASE), [
    getOsLabel(basicSettings),
    getFlavorLabel(basicSettings),
  ]);
  return getTemplatesLabelValues(templatesWithLabels, TEMPLATE_WORKLOAD_LABEL);
};

export const getFlavorLabel = basicSettings => {
  if (has(basicSettings, [FLAVOR_KEY, 'value'])) {
    const flavorValue = basicSettings.flavor.value;
    if (flavorValue !== CUSTOM_FLAVOR) {
      return `${TEMPLATE_FLAVOR_LABEL}/${basicSettings.flavor.value}`;
    }
  }
  return undefined;
};

export const getFlavors = (basicSettings, templates) => {
  const templatesWithLabels = getTemplatesWithLabels(getTemplate(templates, TEMPLATE_TYPE_BASE), [
    getWorkloadLabel(basicSettings),
    getOsLabel(basicSettings),
  ]);
  const flavors = getTemplatesLabelValues(templatesWithLabels, TEMPLATE_FLAVOR_LABEL);
  flavors.push(CUSTOM_FLAVOR);
  return flavors;
};

export const isImageSourceType = (basicSettings, type) => settingsValue(basicSettings, IMAGE_SOURCE_TYPE_KEY) === type;

export const isFlavorType = (basicSettings, type) => settingsValue(basicSettings, FLAVOR_KEY) === type;

export const getTemplateAnnotations = (template, name) => get(template.metadata.annotations, [name]);

export const selectPVCs = objects => objects.filter(obj => obj.kind === PersistentVolumeClaimModel.kind);
export const selectAllExceptPVCs = objects => objects.filter(obj => obj.kind !== PersistentVolumeClaimModel.kind);
export const selectVm = objects => objects.find(obj => obj.kind === VirtualMachineModel.kind);
