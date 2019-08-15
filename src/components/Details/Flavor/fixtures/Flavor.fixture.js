import { cloudInitTestVm } from '../../../../tests/mocks/vm/cloudInitTestVm.mock';
import { fedora28 } from '../../../../k8s/objects/template/fedora28';
import { getFlavor } from '../../../../selectors';

import { Flavor } from '..';

export default [
  {
    component: Flavor,
    name: 'Flavor',
    props: {
      id: 'Flavor',
      vm: cloudInitTestVm,
      flavor: getFlavor(cloudInitTestVm),
      onFormChange: () => {},
      template: null,
    },
  },
  {
    component: Flavor,
    name: 'Flavor editing',
    props: {
      id: 'Flavor editing',
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
      template: fedora28,
    },
  },
  {
    component: Flavor,
    name: 'Flavor updating',
    props: {
      id: 'Flavor updating',
      vm: cloudInitTestVm,
      flavor: getFlavor(cloudInitTestVm),
      updating: true,
      onFormChange: () => {},
      template: null,
    },
  },
];
