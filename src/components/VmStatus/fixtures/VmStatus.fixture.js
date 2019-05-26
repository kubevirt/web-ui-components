import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import { VmStatus } from '../VmStatus';
import vmFixtures from '../../../utils/status/vm/fixtures/vmStatus.fixture';

const VmStatusWrapper = props => (
  <MemoryRouter>
    <VmStatus {...props} />
  </MemoryRouter>
);

export default [
  {
    name: 'Off',
    component: VmStatusWrapper,
    props: {
      vm: vmFixtures[0].vm,
      migrations: vmFixtures[0].migrations,
      pods: vmFixtures[0].podsFixture,
    },
  },
  {
    name: 'Running',
    component: VmStatusWrapper,
    props: {
      vm: vmFixtures[1].vm,
      migrations: vmFixtures[1].migrations,
      pods: vmFixtures[1].podsFixture,
    },
  },
  {
    name: 'Starting',
    component: VmStatusWrapper,
    props: {
      vm: vmFixtures[2].vm,
      migrations: vmFixtures[2].migrations,
      pods: vmFixtures[2].podsFixture,
    },
  },

  {
    name: 'Pending',
    component: VmStatusWrapper,
    props: {
      vm: vmFixtures[6].vm,
      migrations: vmFixtures[6].migrations,
      pods: vmFixtures[6].podsFixture,
    },
  },
  {
    name: 'Error',
    component: VmStatusWrapper,
    props: {
      vm: vmFixtures[9].vm,
      migrations: vmFixtures[9].migrations,
      pods: vmFixtures[9].podsFixture,
    },
  },
  {
    name: 'Importing',
    component: VmStatusWrapper,
    props: {
      vm: vmFixtures[14].vm,
      migrations: vmFixtures[14].migrations,
      pods: vmFixtures[14].podsFixture,
    },
  },
  {
    name: 'Importing (VMWare)',
    component: VmStatusWrapper,
    props: {
      vm: vmFixtures[16].vm,
      migrations: vmFixtures[16].migrations,
      pods: vmFixtures[16].podsFixture,
    },
  },
];
