import { get, has } from 'lodash';
import {
  CUSTOM_FLAVOR,
  TEMPLATE_FLAVOR_LABEL,
  TEMPLATE_OS_LABEL,
  TEMPLATE_WORKLOAD_LABEL,
  TEMPLATE_TYPE_LABEL,
  TEMPLATE_TYPE_BASE,
  baseTemplates as predefinedTemplates
} from '../constants';

import { getTemplatesLabelValues, getTemplatesWithLabels } from '../utils/template';

export const getLabel = (basicSettings, labelPrefix, value) =>
  has(basicSettings, value) ? `${labelPrefix}/${get(basicSettings, [value, 'value'])}` : undefined;

export const getWorkloadLabel = basicSettings => getLabel(basicSettings, TEMPLATE_WORKLOAD_LABEL, 'workloadProfile');
export const getOsLabel = basicSettings => getLabel(basicSettings, TEMPLATE_OS_LABEL, 'operatingSystem');

export const getOperatingSystems = (basicSettings, templates) => {
  const templatesWithLabels = getTemplatesWithLabels(getTemplate(templates, TEMPLATE_TYPE_BASE), [
    getWorkloadLabel(basicSettings),
    getFlavorLabel(basicSettings)
  ]);
  return getTemplatesLabelValues(templatesWithLabels, TEMPLATE_OS_LABEL);
};

export const getWorkloadProfiles = (basicSettings, templates) => {
  const templatesWithLabels = getTemplatesWithLabels(getTemplate(templates, TEMPLATE_TYPE_BASE), [
    getOsLabel(basicSettings),
    getFlavorLabel(basicSettings)
  ]);
  return getTemplatesLabelValues(templatesWithLabels, TEMPLATE_WORKLOAD_LABEL);
};

export const getFlavorLabel = basicSettings => {
  if (has(basicSettings, 'flavor.value')) {
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
    getOsLabel(basicSettings)
  ]);
  const flavors = getTemplatesLabelValues(templatesWithLabels, TEMPLATE_FLAVOR_LABEL);
  flavors.push(CUSTOM_FLAVOR);
  return flavors;
};

export const isImageSourceType = (basicSettings, type) => get(basicSettings, 'imageSourceType.value') === type;

export const isFlavorType = (basicSettings, type) => get(basicSettings, 'flavor.value') === type;

export const getTemplate = (templates, type) => {
  if (type === TEMPLATE_TYPE_BASE) {
    return predefinedTemplates;
  }
  return templates.filter(template => {
    const labels = get(template, 'metadata.labels', {});
    return labels[TEMPLATE_TYPE_LABEL] === type;
  });
};

export const getChosenTemplateAnnotations = (basicSettings, name) =>
  get(basicSettings.chosenTemplate.metadata.annotations, [name]);
