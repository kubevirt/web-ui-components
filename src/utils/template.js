import { remove, pull } from 'lodash';

export const getTemplatesWithLabels = (templates, labels) => {
  const filteredTemplates = [...templates];
  labels.forEach(label => {
    if (label !== undefined) {
      pull(
        filteredTemplates,
        remove(
          filteredTemplates,
          template => Object.keys(template.metadata.labels).find(l => l === label) === undefined
        )
      );
    }
  });
  return filteredTemplates;
};

export const getTemplatesLabelValues = (templates, label) => {
  const labelValues = [];
  templates.forEach(t => {
    const labels = Object.keys(t.metadata.labels || []).filter(l => l.startsWith(label));
    labels.forEach(l => {
      const labelParts = l.split('/');
      if (labelParts.length > 1) {
        const labelName = labelParts[labelParts.length - 1];
        if (labelValues.indexOf(labelName) === -1) {
          labelValues.push(labelName);
        }
      }
    });
  });
  return labelValues;
};
