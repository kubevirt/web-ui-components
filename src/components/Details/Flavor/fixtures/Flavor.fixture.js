import { Flavor } from '..';

import { cloudInitTestVm } from '../../../../k8s/mock_vm/cloudInitTestVm.mock';
import { fedora28 } from '../../../../k8s/mock_templates/fedora28.mock';

export default [
  {
    component: Flavor,
    name: 'Flavor',
    props: {
      vm: cloudInitTestVm,
      onFormChange: () => {},
      k8sGet: () =>
        new Promise(resolve => {
          resolve(fedora28);
        }),
    },
  },
  {
    component: Flavor,
    name: 'Flavor editing',
    props: {
      vm: cloudInitTestVm,
      formValues: {
        cpu: {
          value: '2',
        },
        memory: {
          value: '2',
        },
        flavor: {
          value: 'Custom',
        },
      },
      editing: true,
      onFormChange: () => {},
      k8sGet: () =>
        new Promise(resolve => {
          resolve(fedora28);
        }),
    },
  },
  {
    component: Flavor,
    name: 'Flavor updating',
    props: {
      vm: cloudInitTestVm,
      updating: true,
      onFormChange: () => {},
      k8sGet: () =>
        new Promise(resolve => {
          resolve(fedora28);
        }),
    },
  },
];
