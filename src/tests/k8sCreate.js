import { ProcessedTemplatesModel } from '../models';
import { TEMPLATE_PARAM_VM_NAME } from '../constants';

const processTemplate = template =>
  new Promise((resolve, reject) => {
    const nameParam = template.parameters.find(param => param.name === TEMPLATE_PARAM_VM_NAME);
    template.objects[0].metadata.name = nameParam.value;
    resolve(template);
  });

export const k8sCreate = (model, resource) => {
  if (model === ProcessedTemplatesModel) {
    return processTemplate(resource);
  }

  if (resource.metadata.generateName) {
    resource.metadata.name = `${resource.metadata.generateName}-${Math.random()
      .toString(36)
      .substr(2, 5)}`;
  }

  return new Promise(resolve => resolve(resource));
};
