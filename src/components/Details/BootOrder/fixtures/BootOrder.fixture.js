import { BootOrder } from '../BootOrder';

export const bootableDevices = [
  { type: 'interface', value: { bridge: {}, name: 'pxeNetworkName', bootOrder: 1 } },
  { type: 'interface', value: { bridge: {}, name: 'podNetworkName', bootOrder: 2 } },
  { type: 'disk', value: { disk: {}, name: 'disk-one', bootOrder: 3 } },
  { type: 'disk', value: { disk: {}, name: 'disk-two', bootOrder: 4 } },
  { type: 'disk', value: { disk: {}, name: 'disk-three', bootOrder: 5 } },
];

export default [
  {
    component: BootOrder,
    name: 'BootOrder',
    props: {
      bootableDevices,
    },
  },
];
