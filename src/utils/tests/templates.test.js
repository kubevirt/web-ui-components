import cloneDeep from 'lodash/cloneDeep';
import {
  templates,
  TEMPLATE_WORKLOAD_LABEL,
  TEMPLATE_TYPE_BASE,
  TEMPLATE_TYPE_VM,
  baseTemplates,
  userTemplates,
  TEMPLATE_TYPE_LABEL,
} from '../../constants';
import { fedora28 } from '../../k8s/mock_templates/fedora28.mock';
import { rhel75 } from '../../k8s/mock_templates/rhel75.mock';
import { ubuntu1804 } from '../../k8s/mock_templates/ubuntu1804.mock';
import { windows } from '../../k8s/mock_templates/windows.mock';
import { getTemplatesWithLabels, getTemplatesLabelValues, getTemplate, getUserTemplate } from '../templates';

describe('templates.js', () => {
  it('getTemplatesWithLabels returns templates with given label', () => {
    expect(getTemplatesWithLabels(templates, ['os.template.cnv.io/fedora29'])).toEqual([fedora28]);
    expect(getTemplatesWithLabels(templates, [])).toEqual(templates);
    expect(getTemplatesWithLabels(templates, ['workload.template.cnv.io/generic'])).toEqual([
      fedora28,
      ubuntu1804,
      rhel75,
      windows,
    ]);
    expect(
      getTemplatesWithLabels(templates, ['workload.template.cnv.io/generic', 'flavor.template.cnv.io/small'])
    ).toEqual([fedora28, ubuntu1804, rhel75]);
  });
  it('getTemplatesLabelValues returns values for given label', () => {
    expect(getTemplatesLabelValues(templates, TEMPLATE_WORKLOAD_LABEL)).toEqual(['generic', 'high-performance']);
    expect(getTemplatesLabelValues(templates, 'nonexistinglabel')).toEqual([]);
  });
  it('getTemplate returns template of given type', () => {
    expect(getTemplate(templates, TEMPLATE_TYPE_BASE)).toEqual(baseTemplates);
    expect(getTemplate(templates, TEMPLATE_TYPE_VM)).toEqual(userTemplates);
    expect(getTemplate(templates, 'unknown type')).toEqual([]);
  });
  it('getUserTemplate returns usert template with given name', () => {
    expect(getUserTemplate(templates, userTemplates[0].metadata.name)).toEqual(userTemplates[0]);
    const sameName = cloneDeep(userTemplates[0]);
    sameName.metadata.labels[TEMPLATE_TYPE_LABEL] = TEMPLATE_TYPE_BASE;
    expect(getUserTemplate([userTemplates[0], sameName], userTemplates[0].metadata.name)).toEqual(userTemplates[0]);
  });
});
