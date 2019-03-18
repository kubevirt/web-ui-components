import { Flavor } from '..';

import { cloudInitTestVm } from '../../../../tests/mocks/vm/cloudInitTestVm.mock';
import { fedora28 } from '../../../../k8s/objects/template/fedora28';
import { getFlavor } from '../../../../selectors';

export default [
  {
    component: Flavor,
    name: 'Flavor',
    props: {
      vm: cloudInitTestVm,
      flavor: getFlavor(cloudInitTestVm),
      onFormChange: () => {},
      retrieveVmTemplate: () =>
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
      flavor: getFlavor(cloudInitTestVm),
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
      retrieveVmTemplate: () =>
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
      flavor: getFlavor(cloudInitTestVm),
      updating: true,
      onFormChange: () => {},
      retrieveVmTemplate: () =>
        new Promise(resolve => {
          resolve(fedora28);
        }),
    },
  },
];
