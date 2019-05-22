import { getTemplatesLabelValues, getTemplatesWithLabels, getTemplate } from '../utils/templates';
import { SecretModel, TemplateModel, VirtualMachineModel } from '../models';
import { get, getName } from '../selectors';

import {
  CUSTOM_FLAVOR,
  TEMPLATE_FLAVOR_LABEL,
  TEMPLATE_OS_LABEL,
  TEMPLATE_OS_NAME_ANNOTATION,
  TEMPLATE_TYPE_BASE,
  TEMPLATE_TYPE_VM,
  TEMPLATE_WORKLOAD_LABEL,
} from '../constants';

export const settingsValue = (vmSettings, key, defaultValue) => get(vmSettings, [key, 'value'], defaultValue);

const getLabel = (labelPrefix, value) => {
  if (value == null) {
    return undefined;
  }
  return `${labelPrefix}/${get(value, 'id') || value}`;
};

export const getWorkloadLabel = workload => getLabel(TEMPLATE_WORKLOAD_LABEL, workload);
export const getOsLabel = os => getLabel(TEMPLATE_OS_LABEL, os);

export const getOperatingSystems = ({ workload, flavor, userTemplate }, templates) => {
  let templatesWithLabels;
  if (userTemplate) {
    templatesWithLabels = [getTemplate(templates, TEMPLATE_TYPE_VM).find(t => getName(t) === userTemplate)];
  } else {
    templatesWithLabels = getTemplatesWithLabels(getTemplate(templates, TEMPLATE_TYPE_BASE), [
      getWorkloadLabel(workload),
      getFlavorLabel(flavor),
    ]);
  }
  return getTemplateOperatingSystems(templatesWithLabels);
};

export const getWorkloadProfiles = ({ flavor, os, userTemplate }, templates) => {
  let templatesWithLabels;
  if (userTemplate) {
    templatesWithLabels = [getTemplate(templates, TEMPLATE_TYPE_VM).find(t => getName(t) === userTemplate)];
  } else {
    templatesWithLabels = getTemplatesWithLabels(getTemplate(templates, TEMPLATE_TYPE_BASE), [
      getOsLabel(os),
      getFlavorLabel(flavor),
    ]);
  }
  return getTemplateWorkloadProfiles(templatesWithLabels);
};

export const getFlavorLabel = flavor => {
  if (flavor && flavor !== CUSTOM_FLAVOR) {
    return `${TEMPLATE_FLAVOR_LABEL}/${flavor}`;
  }
  return undefined;
};

export const getFlavors = ({ workload, os, userTemplate }, templates) => {
  let templatesWithLabels;
  if (userTemplate) {
    templatesWithLabels = [getTemplate(templates, TEMPLATE_TYPE_VM).find(t => getName(t) === userTemplate)];
  } else {
    templatesWithLabels = getTemplatesWithLabels(getTemplate(templates, TEMPLATE_TYPE_BASE), [
      getWorkloadLabel(workload),
      getOsLabel(os),
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

export const getTemplateAnnotations = (template, name) => get(template.metadata.annotations, [name]);

export const selectVm = objects => objects.find(obj => obj.kind === VirtualMachineModel.kind);

export const selectTemplate = objects => objects.find(obj => obj.kind === TemplateModel.kind);

export const selectSecret = objects => objects.find(obj => obj.kind === SecretModel.kind);

export const getModelApi = model => `${model.apiGroup}/${model.apiVersion}`;
