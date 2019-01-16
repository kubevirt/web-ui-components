import { BootOrder } from '../BootOrder';

export const bootableDevices = [
  { bridge: {}, name: 'podNetworkName', bootOrder: 2 },
  { disk: {}, name: 'disk-two', bootOrder: 4 },
  { disk: {}, name: 'disk-three', bootOrder: 5 },
  { disk: {}, name: 'disk-one', bootOrder: 3 },
  { bridge: {}, name: 'pxeNetworkName', bootOrder: 1 },
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
