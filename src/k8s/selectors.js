import { get, has } from 'lodash';

import { getTemplatesLabelValues, getTemplatesWithLabels, getTemplate } from '../utils/templates';
import { VirtualMachineModel, TemplateModel, SecretModel } from '../models';

import {
  CUSTOM_FLAVOR,
  TEMPLATE_FLAVOR_LABEL,
  TEMPLATE_OS_LABEL,
  TEMPLATE_WORKLOAD_LABEL,
  TEMPLATE_TYPE_BASE,
  TEMPLATE_TYPE_VM,
  TEMPLATE_OS_NAME_ANNOTATION,
  PROVISION_SOURCE_IMPORT,
} from '../constants';

import {
  PROVISION_SOURCE_TYPE_KEY,
  OPERATING_SYSTEM_KEY,
  FLAVOR_KEY,
  WORKLOAD_PROFILE_KEY,
  PROVIDER_KEY,
  PROVIDER_VMWARE_USER_PWD_AND_CHECK_KEY,
  PROVIDER_VMWARE_CONNECTION,
  PROVIDER_VMWARE_VCENTER_KEY,
} from '../components/Wizard/CreateVmWizard/constants';

export const settingsValue = (basicSettings, key, defaultValue) => get(basicSettings, [key, 'value'], defaultValue);

export const getLabel = (basicSettings, labelPrefix, value) => {
  const val = settingsValue(basicSettings, value);
  if (val == null) {
    return undefined;
  }
  const isObject = typeof val === 'object';
  return `${labelPrefix}/${isObject ? val.id : val}`;
};

export const getWorkloadLabel = basicSettings => getLabel(basicSettings, TEMPLATE_WORKLOAD_LABEL, WORKLOAD_PROFILE_KEY);
export const getOsLabel = basicSettings => getLabel(basicSettings, TEMPLATE_OS_LABEL, OPERATING_SYSTEM_KEY);

export const getOperatingSystems = (basicSettings, templates, userTemplate) => {
  let templatesWithLabels;
  if (userTemplate) {
    templatesWithLabels = [getTemplate(templates, TEMPLATE_TYPE_VM).find(t => t.metadata.name === userTemplate)];
  } else {
    templatesWithLabels = getTemplatesWithLabels(getTemplate(templates, TEMPLATE_TYPE_BASE), [
      getWorkloadLabel(basicSettings),
      getFlavorLabel(basicSettings),
    ]);
  }
  return getTemplateOperatingSystems(templatesWithLabels);
};

export const getWorkloadProfiles = (basicSettings, templates, userTemplate) => {
  let templatesWithLabels;
  if (userTemplate) {
    templatesWithLabels = [getTemplate(templates, TEMPLATE_TYPE_VM).find(t => t.metadata.name === userTemplate)];
  } else {
    templatesWithLabels = getTemplatesWithLabels(getTemplate(templates, TEMPLATE_TYPE_BASE), [
      getOsLabel(basicSettings),
      getFlavorLabel(basicSettings),
    ]);
  }
  return getTemplateWorkloadProfiles(templatesWithLabels);
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

export const getFlavors = (basicSettings, templates, userTemplate) => {
  let templatesWithLabels;
  if (userTemplate) {
    templatesWithLabels = [getTemplate(templates, TEMPLATE_TYPE_VM).find(t => t.metadata.name === userTemplate)];
  } else {
    templatesWithLabels = getTemplatesWithLabels(getTemplate(templates, TEMPLATE_TYPE_BASE), [
      getWorkloadLabel(basicSettings),
      getOsLabel(basicSettings),
    ]);
  }
  const flavors = getTemplateFlavors(templatesWithLabels);
  if (!flavors.some(flavor => flavor === CUSTOM_FLAVOR)) {
    flavors.push(CUSTOM_FLAVOR);
  }
  return flavors;
};

export const getTemplateFlavors = templates => getTemplatesLabelValues(templates, TEMPLATE_FLAVOR_LABEL);

export const getTemplateOperatingSystems = templates => {
  const osIds = getTemplatesLabelValues(templates, TEMPLATE_OS_LABEL);
  return osIds.map(osId => {
    const nameAnnotation = `${TEMPLATE_OS_NAME_ANNOTATION}/${osId}`;
    const template = templates.find(t =>
      Object.keys(t.metadata.annotations || []).find(annotation => annotation === nameAnnotation)
    );
    return {
      id: osId,
      name: get(template, ['metadata', 'annotations', nameAnnotation]),
    };
  });
};

export const getTemplateWorkloadProfiles = templates => getTemplatesLabelValues(templates, TEMPLATE_WORKLOAD_LABEL);

export const isImageSourceType = (basicSettings, type) =>
  settingsValue(basicSettings, PROVISION_SOURCE_TYPE_KEY) === type;

// true if selected
// - provision source Import
// - provider of given "providerType"
export const isImportProviderType = (basicSettings, providerType) =>
  isImageSourceType(basicSettings, PROVISION_SOURCE_IMPORT) &&
  settingsValue(basicSettings, PROVIDER_KEY) === providerType;

export const isFlavorType = (basicSettings, type) => settingsValue(basicSettings, FLAVOR_KEY) === type;

export const getTemplateAnnotations = (template, name) => get(template.metadata.annotations, [name]);

export const selectVm = objects => objects.find(obj => obj.kind === VirtualMachineModel.kind);

export const selectTemplate = objects => objects.find(obj => obj.kind === TemplateModel.kind);

export const selectSecret = objects => objects.find(obj => obj.kind === SecretModel.kind);

export const getModelApi = model => `${model.apiGroup}/${model.apiVersion}`;

export const getV2VVmwareName = basicSettings =>
  get(settingsValue(basicSettings, PROVIDER_VMWARE_USER_PWD_AND_CHECK_KEY), [
    PROVIDER_VMWARE_CONNECTION,
    'V2VVmwareName',
  ]);

export const isVmwareImport = basicSettings =>
  !!settingsValue(basicSettings, [PROVIDER_VMWARE_VCENTER_KEY]) &&
  settingsValue(basicSettings, [PROVISION_SOURCE_TYPE_KEY]) === PROVISION_SOURCE_IMPORT;
