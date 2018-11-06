import { get } from 'lodash';
import { getName, getDisks, getVolumes, getDataVolumes } from '../../../utils/selectors';

import { selectVm } from '../../../k8s/selectors';

export const getTemplateStorages = (templates, userTemplate) => {
  const { objects } = templates.find(template => getName(template) === userTemplate);
  const vm = selectVm(objects);

  return getDisks(vm).map(disk => {
    const volume = getVolumes(vm).find(v => v.name === disk.volumeName);
    return {
      templateStorage: {
        disk,
        volume,
        dataVolume: getDataVolumes(vm).find(
          dataVolume => get(dataVolume, 'metadata.name') === get(volume, 'dataVolume.name')
        )
      }
    };
  });
};
