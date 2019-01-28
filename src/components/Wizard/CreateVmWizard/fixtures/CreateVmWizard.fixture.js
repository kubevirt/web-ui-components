import { CreateVmWizard } from '../CreateVmWizard';
import { ProcessedTemplatesModel } from '../../../../models';
import { networkConfigs } from '../../../../tests/mocks/networkAttachmentDefinition';
import { baseTemplates } from '../../../../tests/mocks/template';
import { userTemplates } from '../../../../tests/mocks/user_template';
import { persistentVolumeClaims } from '../../../../tests/mocks/persistentVolumeClaim';
import { urlTemplateDataVolume } from '../../../../tests/mocks/user_template/url.mock';

const templates = [...baseTemplates, ...userTemplates];

export const namespaces = [
  {
    metadata: {
      name: 'default',
    },
  },
  {
    metadata: {
      name: 'myproject',
    },
  },
];

export const storageClasses = [
  {
    metadata: {
      name: 'nfs',
      namespace: 'default',
    },
  },
  {
    metadata: {
      name: 'iscsi',
      namespace: 'default',
    },
  },
  {
    metadata: {
      name: 'glusterfs',
      namespace: 'default',
    },
  },
  {
    metadata: {
      name: 'azuredisk',
      namespace: 'default',
    },
  },
];

const processTemplate = template =>
  new Promise((resolve, reject) => {
    const nameParam = template.parameters.find(param => param.name === 'NAME');
    template.objects[0].metadata.name = nameParam.value;
    resolve(template);
  });

export const k8sCreate = (model, resource) => {
  if (model === ProcessedTemplatesModel) {
    return processTemplate(resource);
  }
  return new Promise(resolve => resolve(resource));
};
export const units = { dehumanize: val => ({ value: val ? val.match(/^[0-9]+/)[0] * 1073741824 : 0 }) };

export default [
  {
    component: CreateVmWizard,
    name: 'namespaces',
    props: {
      onHide: () => {},
      templates,
      namespaces,
      k8sCreate,
      networkConfigs,
      persistentVolumeClaims,
      storageClasses,
      units,
      dataVolumes: [urlTemplateDataVolume],
    },
  },
  {
    component: CreateVmWizard,
    name: 'selected namespace',
    props: {
      onHide: () => {},
      templates,
      namespaces,
      selectedNamespace: namespaces[1],
      k8sCreate,
      networkConfigs,
      persistentVolumeClaims,
      storageClasses,
      units,
      dataVolumes: [urlTemplateDataVolume],
    },
  },
  {
    component: CreateVmWizard,
    name: 'loading',
    props: {
      onHide: () => {},
      templates: null,
      namespaces: null,
      k8sCreate,
      networkConfigs: null,
      persistentVolumeClaims: null,
      storageClasses: null,
      units,
      dataVolumes: null,
    },
  },
  {
    component: CreateVmWizard,
    name: 'Create Vm Template',
    props: {
      onHide: () => {},
      templates,
      namespaces,
      k8sCreate,
      networkConfigs,
      persistentVolumeClaims,
      storageClasses,
      units,
      createTemplate: true,
      dataVolumes: [urlTemplateDataVolume],
    },
  },
];
