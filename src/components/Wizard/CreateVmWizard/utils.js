import { getName, getDisks, getVolumes, getPersistentVolumeClaimName } from '../../../utils/selectors';

import { selectPVCs, selectVm } from '../../../k8s/selectors';

export const getTemplateStorages = (templates, userTemplate) => {
  const { objects } = templates.find(template => getName(template) === userTemplate);
  const vm = selectVm(objects);

  const templateDisks = {};
  const templateVolumes = {};

  // eslint-disable-next-line no-return-assign
  getDisks(vm).forEach(disk => (templateDisks[disk.volumeName] = disk));

  // eslint-disable-next-line no-return-assign
  getVolumes(vm).forEach(volume => (templateVolumes[getPersistentVolumeClaimName(volume)] = volume));

  return selectPVCs(objects).map(pvc => {
    const volume = templateVolumes[getName(pvc)];
    let disk;

    if (volume) {
      disk = templateDisks[volume.name];
    }

    return {
      templateStorage: {
        pvc,
        disk,
        volume,
      },
    };
  });
};
