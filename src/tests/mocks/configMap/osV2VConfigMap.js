import { ConfigMapModel } from '../../../models';

export const osV2VConfigMap = {
  data: {
    // purely dummy testing data
    rhel7_64Guest: 'rhel7.0',
    windows7Server64Guest: 'win2k8',
    fedora28_guest: 'fedora28',
    windows9Server64Guest: '',
  },
  kind: ConfigMapModel.kind,
  metadata: {},
};
