import cloneDeep from 'lodash/cloneDeep';

import { fedora28 } from '../../k8s/objects/template/fedora28';
import { rhel75 } from '../../k8s/objects/template/rhel75';
import { ubuntu1804 } from '../../k8s/objects/template/ubuntu1804';
import { windows } from '../../k8s/objects/template/windows';
import { baseTemplates } from '../../k8s/objects/template';

import {
  TEMPLATE_WORKLOAD_LABEL,
  TEMPLATE_TYPE_BASE,
  TEMPLATE_TYPE_VM,
  TEMPLATE_TYPE_LABEL,
  PROVISION_SOURCE_URL,
  PROVISION_SOURCE_CONTAINER,
  PROVISION_SOURCE_PXE,
  LABEL_USED_TEMPLATE_NAME,
  LABEL_USED_TEMPLATE_NAMESPACE,
} from '../../constants';

import {
  getTemplatesWithLabels,
  getTemplatesLabelValues,
  getTemplate,
  getUserTemplate,
  getTemplateStorages,
  getTemplateInterfaces,
  hasAutoAttachPodInterface,
  getTemplateProvisionSource,
  retrieveVmTemplate,
} from '../templates';

import {
  userTemplates,
  containerTemplate,
  urlTemplate,
  pxeTemplate,
  urlNoNetworkTemplate,
} from '../../tests/mocks/user_template';
import { getNamespace } from '../../selectors';
import { urlTemplateDataVolume, LONG_ISO_URL } from '../../tests/mocks/user_template/url.mock';

const templates = [...baseTemplates, ...userTemplates];

describe('templates.js', () => {
  it('getTemplatesWithLabels returns templates with given label', () => {
    expect(getTemplatesWithLabels(baseTemplates, ['os.template.kubevirt.io/fedora29'])).toEqual([fedora28]);
    expect(getTemplatesWithLabels(templates, [])).toEqual(templates);
    expect(getTemplatesWithLabels(baseTemplates, ['workload.template.kubevirt.io/generic'])).toEqual([
      fedora28,
      rhel75,
      ubuntu1804,
      windows,
    ]);
    expect(
      getTemplatesWithLabels(baseTemplates, [
        'workload.template.kubevirt.io/generic',
        'flavor.template.kubevirt.io/small',
      ])
    ).toEqual([fedora28, rhel75, ubuntu1804]);
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
  it('getUserTemplate returns user template with given name', () => {
    expect(getUserTemplate(templates, userTemplates[0].metadata.name)).toEqual(userTemplates[0]);
    const sameName = cloneDeep(userTemplates[0]);
    sameName.metadata.labels[TEMPLATE_TYPE_LABEL] = TEMPLATE_TYPE_BASE;
    expect(getUserTemplate([userTemplates[0], sameName], userTemplates[0].metadata.name)).toEqual(userTemplates[0]);
  });
  it('getTemplateStorages returns all template storages', () => {
    let storages = getTemplateStorages(urlTemplate, [urlTemplateDataVolume]);
    expect(storages).toHaveLength(1);
    expect(storages[0].disk).toEqual(urlTemplate.objects[0].spec.template.spec.domain.devices.disks[0]);
    expect(storages[0].volume).toEqual(urlTemplate.objects[0].spec.template.spec.volumes[0]);
    expect(storages[0].dataVolume).toEqual(urlTemplateDataVolume);
    expect(storages[0].dataVolumeTemplate).toBeUndefined();

    expect(getTemplateStorages(pxeTemplate, [])).toHaveLength(0);

    const vmWithDV = cloneDeep(urlTemplate);

    const dv = {
      metadata: {
        name: 'fooName',
        namespace: getNamespace(urlTemplate),
      },
    };

    vmWithDV.objects[0].spec.template.spec.volumes[0].dataVolume.name = dv.metadata.name;
    storages = getTemplateStorages(vmWithDV, [dv]);
    expect(storages).toHaveLength(1);
    expect(storages[0].disk).toEqual(vmWithDV.objects[0].spec.template.spec.domain.devices.disks[0]);
    expect(storages[0].volume).toEqual(vmWithDV.objects[0].spec.template.spec.volumes[0]);
    expect(storages[0].dataVolumeTemplate).toBeUndefined();
    expect(storages[0].dataVolume).toEqual(dv);
  });
  it('getTemplateInterfaces returns all template interfaces', () => {
    const interfaces = getTemplateInterfaces(pxeTemplate);
    expect(interfaces).toHaveLength(2);
    expect(interfaces[0].interface).toEqual(pxeTemplate.objects[0].spec.template.spec.domain.devices.interfaces[0]);
    expect(interfaces[0].network).toEqual(pxeTemplate.objects[0].spec.template.spec.networks[0]);

    expect(interfaces[1].interface).toEqual(pxeTemplate.objects[0].spec.template.spec.domain.devices.interfaces[1]);
    expect(interfaces[1].network).toEqual(pxeTemplate.objects[0].spec.template.spec.networks[1]);

    const noInterfaces = getTemplateInterfaces(urlNoNetworkTemplate);
    expect(noInterfaces).toHaveLength(0);
  });
  it('hasAutoAttachPodInterface', () => {
    expect(hasAutoAttachPodInterface(pxeTemplate)).toBeTruthy();
    expect(hasAutoAttachPodInterface(urlNoNetworkTemplate)).toBeFalsy();
  });
  it('getTemplateProvisionSource returns proper template provision source', () => {
    expect(getTemplateProvisionSource(urlTemplate, [urlTemplateDataVolume])).toEqual({
      type: PROVISION_SOURCE_URL,
      source: LONG_ISO_URL,
    });

    expect(getTemplateProvisionSource(containerTemplate)).toEqual({
      type: PROVISION_SOURCE_CONTAINER,
      source: 'fooContainer',
    });

    expect(getTemplateProvisionSource(pxeTemplate)).toEqual({
      type: PROVISION_SOURCE_PXE,
    });
  });

  it('retrieveVmTemplate', () => {
    const template = {
      metadata: {
        name: 'fooTemplate',
        namespace: 'fooNamespace',
      },
    };
    const vm = {
      metadata: {
        labels: {
          [LABEL_USED_TEMPLATE_NAME]: 'fooTemaplte',
          [LABEL_USED_TEMPLATE_NAMESPACE]: 'fooNamespace',
        },
      },
    };
    const k8sGet = () => new Promise(resolve => resolve(template));
    return retrieveVmTemplate(k8sGet, vm).then(result => {
      expect(result).toEqual(template);
      return result;
    });
  });
  it('retrieveVmTemplate vm has no template', () => {
    const vm = {};
    const k8sGet = () => new Promise(resolve => resolve());
    return retrieveVmTemplate(k8sGet, vm).then(result => {
      expect(result).toEqual(null);
      return result;
    });
  });
  it('retrieveVmTemplate vm has template from mocked templates', () => {
    const vm = {
      metadata: {
        labels: {
          [LABEL_USED_TEMPLATE_NAME]: 'fedora-generic',
          [LABEL_USED_TEMPLATE_NAMESPACE]: 'openshift',
        },
      },
    };
    // eslint-disable-next-line prefer-promise-reject-errors
    const k8sGet = () => new Promise((resolve, reject) => reject({ json: { code: 404 } }));
    return retrieveVmTemplate(k8sGet, vm).then(result => {
      expect(result).toEqual(fedora28);
      return result;
    });
  });
  it('retrieveVmTemplate template does not exist', () => {
    // eslint-disable-next-line prefer-promise-reject-errors
    const k8sGet = () => new Promise((resolve, reject) => reject({ json: { code: 404 } }));
    return retrieveVmTemplate(k8sGet, {}).catch(error => {
      expect(error).toBeDefined();
      return error;
    });
  });
});
