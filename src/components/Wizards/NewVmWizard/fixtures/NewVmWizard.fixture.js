import { NewVmWizard } from '..';
import { templates } from '../../../../constants';
import { ProcessedTemplatesModel } from '../../../../models';

export const namespaces = [
  {
    metadata: {
      name: 'default'
    }
  },
  {
    metadata: {
      name: 'myproject'
    }
  }
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

export default {
  component: NewVmWizard,
  props: {
    onHide: () => {},
    templates,
    namespaces,
    k8sCreate
  }
};
