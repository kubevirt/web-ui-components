import { getVmiTemplateLabels } from '../vm/selectors';
import { getServiceSelectors } from './selectors';

export const getServicesForVm = (services, vm) => {
  const vmLabels = getVmiTemplateLabels(vm);
  return services.filter(service => {
    const selectors = getServiceSelectors(service);
    const selectorKeys = Object.keys(selectors);
    return selectorKeys.length > 0 ? selectorKeys.every(key => vmLabels[key] === selectors[key]) : false;
  });
};
