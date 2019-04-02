import { get } from 'lodash';

import { TEMPLATE_VM_NAME_LABEL } from '../../constants';
import { getName } from '../common';

export const getServicesForVm = (services, vm) =>
  services.filter(service => get(service, ['spec', 'selector', TEMPLATE_VM_NAME_LABEL]) === getName(vm));
