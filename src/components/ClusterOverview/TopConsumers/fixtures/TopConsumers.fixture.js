import { TopConsumers } from '../TopConsumers';
import { PodModel, VirtualMachineModel } from '../../../../models';

export const consumersData = {
  metrics: {
    cpu: {
      title: 'CPU',
      consumers: [
        {
          kind: PodModel.kind,
          name: 'Pod1',
          usage: '80',
        },
        {
          kind: PodModel.kind,
          name: 'Pod2',
          usage: '40',
        },
        {
          kind: PodModel.kind,
          name: 'Pod3',
          usage: '70',
        },
        {
          kind: VirtualMachineModel.kind,
          name: 'VM1',
          usage: '20',
        },
        {
          kind: VirtualMachineModel.kind,
          name: 'VM3',
          usage: '100',
        },
      ],
    },
    memory: {
      title: 'Memory',
      consumers: [
        {
          kind: PodModel.kind,
          name: 'Pod1',
          usage: '80',
        },
        {
          kind: PodModel.kind,
          name: 'Pod2',
          usage: '40',
        },
        {
          kind: PodModel.kind,
          name: 'Pod3',
          usage: '70',
        },
        {
          kind: VirtualMachineModel.kind,
          name: 'VM1',
          usage: '20',
        },
        {
          kind: VirtualMachineModel.kind,
          name: 'VM3',
          usage: '100',
        },
      ],
    },
    network: {
      title: 'Network',
      consumers: [
        {
          kind: PodModel.kind,
          name: 'Pod1',
          usage: '80',
        },
        {
          kind: PodModel.kind,
          name: 'Pod2',
          usage: '40',
        },
        {
          kind: PodModel.kind,
          name: 'Pod3',
          usage: '70',
        },
        {
          kind: VirtualMachineModel.kind,
          name: 'VM1',
          usage: '20',
        },
        {
          kind: VirtualMachineModel.kind,
          name: 'VM3',
          usage: '100',
        },
      ],
    },
    storage: {
      title: 'Storage',
      consumers: [
        {
          kind: PodModel.kind,
          name: 'Pod1',
          usage: '80',
        },
        {
          kind: PodModel.kind,
          name: 'Pod2',
          usage: '40',
        },
        {
          kind: PodModel.kind,
          name: 'Pod3',
          usage: '70',
        },
        {
          kind: VirtualMachineModel.kind,
          name: 'VM1',
          usage: '20',
        },
        {
          kind: VirtualMachineModel.kind,
          name: 'VM3',
          usage: '100',
        },
      ],
    },
  },
  loaded: true,
};

export default {
  component: TopConsumers,
  props: { ...consumersData },
};
