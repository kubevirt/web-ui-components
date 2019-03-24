import { LABEL_USED_TEMPLATE_NAME } from '../../../../constants';
import { VmTemplateDetails } from '../VmTemplateDetails';
import { containerCloudTemplate, urlCustomFlavorTemplate } from '../../../../tests/mocks/user_template';
import { k8sPatch, k8sGet } from '../../../../tests/k8s';

const containerCloudDeletedTemplate = {
  ...containerCloudTemplate,
  metadata: {
    ...containerCloudTemplate.metadata,
    labels: {
      ...containerCloudTemplate.metadata.labels,
      [LABEL_USED_TEMPLATE_NAME]: 'deleted-template',
    },
  },
};

export default [
  {
    component: VmTemplateDetails,
    name: 'Container VM Template',
    props: {
      vmTemplate: containerCloudTemplate,
      NamespaceResourceLink: () => containerCloudTemplate.metadata.namespace,
      k8sPatch,
      k8sGet,
    },
  },
  {
    component: VmTemplateDetails,
    name: 'URL VM Template',
    props: {
      vmTemplate: urlCustomFlavorTemplate,
      NamespaceResourceLink: () => urlCustomFlavorTemplate.metadata.namespace,
      k8sPatch,
      k8sGet,
    },
  },
  {
    component: VmTemplateDetails,
    name: 'Container VM Template with deleted base template',
    props: {
      vmTemplate: containerCloudDeletedTemplate,
      NamespaceResourceLink: () => containerCloudDeletedTemplate.metadata.namespace,
      k8sPatch,
      k8sGet,
    },
  },
];
