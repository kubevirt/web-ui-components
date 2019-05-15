import { BaremetalHostStatus } from '../BaremetalHostStatus';

const createFixture = (name, state, onAddHost) => ({
  component: BaremetalHostStatus,
  name,
  props: {
    onAddHost,
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
  createFixture('Show add host link for `discovered` status', 'discovered', { onClick: () => true }),
  createFixture('Show ValidationError', 'validation error'),
];
