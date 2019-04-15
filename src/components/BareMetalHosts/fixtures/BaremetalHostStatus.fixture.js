import { BaremetalHostStatus } from '../BaremetalHostStatus';

const createFixture = (name, state) => ({
  component: BaremetalHostStatus,
  name,
  props: {
    host: {
      status: {
        provisioning: {
          state,
        },
      },
    },
  },
});

export default [
  createFixture('Show Generic Status', 'unknown state'),
  createFixture('Show Generic Success', 'provisioned'),
  createFixture('Show progress state for `match profile` status', 'match profile'),
  createFixture('Show error state for `provisioning error` status', 'provisioning error'),
  createFixture('Show error state for `power management error` status', 'power management error'),
];
