import { Inventory } from '../Inventory';

export const inventoryData = {
  inventory: {
    hosts: {
      title: 'Hosts',
      data: [
        {
          status: 'ok',
        },
        {
          status: 'ok',
        },
      ],
    },
    disks: {
      title: 'Disks',
      data: [
        {
          status: 'ok',
        },
      ],
    },
    pods: {
      title: 'Pods',
      data: [
        {
          status: 'ok',
        },
        {
          status: 'ok',
        },
        {
          status: 'ok',
        },
        {
          status: 'ok',
        },
      ],
    },
    vms: {
      title: 'VMs',
      data: [
        {
          status: 'ok',
        },
      ],
    },
  },
  loaded: true,
};

export default {
  component: Inventory,
  props: { ...inventoryData },
};
