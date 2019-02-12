import { VmTemplateDetails } from '../VmTemplateDetails';
import { fedora28 } from '../../../../k8s/objects/template/fedora28';
import { containerCloudTemplate, urlCustomFlavorTemplate } from '../../../../tests/mocks/user_template';

export default [
  {
    component: VmTemplateDetails,
    name: 'Container VM Template',
    props: {
      vmTemplate: containerCloudTemplate,
      NamespaceResourceLink: () => containerCloudTemplate.metadata.namespace,
      k8sPatch: () =>
        new Promise(resolve => {
          resolve();
        }),
      k8sGet: () =>
        new Promise(resolve => {
          resolve(fedora28);
        }),
    },
  },
  {
    component: VmTemplateDetails,
    name: 'URL VM Template',
    props: {
      vmTemplate: urlCustomFlavorTemplate,
      NamespaceResourceLink: () => urlCustomFlavorTemplate.metadata.namespace,
      k8sPatch: () =>
        new Promise(resolve => {
          resolve();
        }),
      k8sGet: () =>
        new Promise(resolve => {
          resolve(fedora28);
        }),
    },
  },
];
