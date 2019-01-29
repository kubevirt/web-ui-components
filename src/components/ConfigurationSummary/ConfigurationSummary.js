import React from 'react';
import PropTypes from 'prop-types';

import {
  getOperatingSystemName,
  getWorkloadProfile,
  getDisks,
  getInterfaces,
  getFlavorDescription,
  getVolumes,
  getDataVolumes,
  getName,
  getDataVolumeResources,
  getGibStorageSize,
  getFlavor,
  getPvcResources,
  getDataVolumeStorageClassName,
  getPvcStorageClassName,
} from '../../utils';
import { CUSTOM_FLAVOR, DASHES } from '../../constants';

const getNicsDescription = vm => {
  const interfaces = getInterfaces(vm);
  return interfaces
    .map(intface => [intface.name, intface.model, intface.macAddress].filter(i => !!i))
    .map(intface => <div key={intface[0]}>{intface.join(' - ')}</div>);
};

const getDisksDescription = (vm, pvcs, units) => {
  const disks = getDisks(vm);
  const volumes = getVolumes(vm);
  const dataVolumeTemplates = getDataVolumes(vm);
  return disks.map(disk => {
    const description = [];
    description.push(disk.name);

    const volume = volumes.find(v => v.name === disk.name);
    let size;
    let storageClass;
    let other;
    if (volume.dataVolume) {
      const dataVolume = dataVolumeTemplates.find(dv => getName(dv) === volume.dataVolume.name);
      size = getGibStorageSize(units, getDataVolumeResources(dataVolume));
      storageClass = getDataVolumeStorageClassName(dataVolume);
    } else if (volume.persistentVolumeClaim) {
      const pvc = pvcs.find(p => getName(p) === volume.persistentVolumeClaim.claimName);
      size = getGibStorageSize(units, getPvcResources(pvc));
      storageClass = getPvcStorageClassName(pvc);
    } else if (volume.containerDisk) {
      other = 'container disk';
    } else if (volume.cloudInitNoCloud) {
      other = 'cloud-init disk';
    }

    if (size) {
      description.push(`${size}GB`);
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

export const ConfigurationSummary = ({ vm, units, persistentVolumeClaims }) => {
  const disks = getDisksDescription(vm, persistentVolumeClaims, units);
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
  units: PropTypes.object.isRequired,
  persistentVolumeClaims: PropTypes.array.isRequired,
};
