import React from 'react';
import PropTypes from 'prop-types';

import {
  getOperatingSystemName,
  getWorkloadProfile,
  getDisks,
  getInterfaces,
  getFlavorDescription,
  getVolumes,
  getName,
  getDataVolumeResources,
  getFlavor,
  getPvcResources,
  getDataVolumeStorageClassName,
  getPvcStorageClassName,
  getDataVolumeTemplates,
  getNamespace,
  getStorageSize,
} from '../../selectors';
import { CUSTOM_FLAVOR, DASHES } from '../../constants';

const getNicsDescription = vm => {
  const interfaces = getInterfaces(vm);
  return interfaces
    .map(intface => [intface.name, intface.model, intface.macAddress].filter(i => !!i))
    .map(intface => <div key={intface[0]}>{intface.join(' - ')}</div>);
};

const getDisksDescription = (vm, pvcs, dataVolumes) => {
  const disks = getDisks(vm);
  const volumes = getVolumes(vm);
  const dataVolumeTemplates = getDataVolumeTemplates(vm);
  return disks.map(disk => {
    const description = [];
    description.push(disk.name);

    const volume = volumes.find(v => v.name === disk.name);
    let size;
    let storageClass;
    let other;
    if (volume.dataVolume) {
      let dataVolume = dataVolumeTemplates.find(dv => getName(dv) === volume.dataVolume.name);
      if (!dataVolume) {
        dataVolume = dataVolumes.find(
          dv => getName(dv) === volume.dataVolume.name && getNamespace(dv) === getNamespace(vm)
        );
      }
      size = getStorageSize(getDataVolumeResources(dataVolume));
      storageClass = getDataVolumeStorageClassName(dataVolume);
    } else if (volume.persistentVolumeClaim) {
      const pvc = pvcs.find(p => getName(p) === volume.persistentVolumeClaim.claimName);
      size = getStorageSize(getPvcResources(pvc));
      storageClass = getPvcStorageClassName(pvc);
    } else if (volume.containerDisk) {
      other = 'container disk';
    } else if (volume.cloudInitNoCloud) {
      other = 'cloud-init disk';
    }

    if (size) {
      description.push(size);
    }
    if (storageClass) {
      description.push(storageClass);
    }
    if (other) {
      description.push(other);
    }
    return <div key={disk.name}>{description.join(' - ')}</div>;
  });
};

const getFullFlavorDescription = vm => {
  const flavorDesc = getFlavorDescription(vm);
  const flavor = getFlavor(vm) || CUSTOM_FLAVOR;
  if (!flavorDesc) {
    return flavor;
  }
  return `${flavor} - ${flavorDesc}`;
};

export const ConfigurationSummary = ({ vm, persistentVolumeClaims, dataVolumes }) => {
  const disks = getDisksDescription(vm, persistentVolumeClaims, dataVolumes);
  const nics = getNicsDescription(vm);
  return (
    <dl className="kubevirt-configuration-summary">
      <dt>Operating System</dt>
      <dd>{getOperatingSystemName(vm) || DASHES}</dd>
      <dt>Flavor</dt>
      <dd>{getFullFlavorDescription(vm)}</dd>
      <dt>Workload Profile</dt>
      <dd>{getWorkloadProfile(vm) || DASHES}</dd>
      <dt>NICs</dt>
      <dd>{nics.length > 0 ? nics : DASHES}</dd>
      <dt>Disks</dt>
      <dd>{disks.length > 0 ? disks : DASHES}</dd>
    </dl>
  );
};

ConfigurationSummary.propTypes = {
  vm: PropTypes.object.isRequired,
  persistentVolumeClaims: PropTypes.array.isRequired,
  dataVolumes: PropTypes.array.isRequired,
};
