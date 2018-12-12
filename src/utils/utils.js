import { get } from 'lodash';
import { getDisks, getInterfaces, getName } from './selectors';
import { ANNOTATION_FIRST_BOOT, BOOT_ORDER_FIRST, BOOT_ORDER_SECOND, PVC_ACCESSMODE_RWO } from '../constants';

export function prefixedId(idPrefix, id) {
  return idPrefix && id ? `${idPrefix}-${id}` : null;
}

export const getSequence = (from, to) => Array.from({ length: to - from + 1 }, (v, i) => i + from);

export const setNativeValue = (element, value) => {
  const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
  const prototype = Object.getPrototypeOf(element);
  const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;

  if (valueSetter && valueSetter !== prototypeValueSetter) {
    prototypeValueSetter.call(element, value);
  } else {
    valueSetter.call(element, value);
  }
};

export const getBootDeviceIndex = (devices, bootOrder) => devices.findIndex(device => device.bootOrder === bootOrder);

export const getPxeBootPatch = vm => {
  const patches = [];
  const annotations = get(vm, 'metadata.annotations', {});
  if (annotations[ANNOTATION_FIRST_BOOT]) {
    if (annotations[ANNOTATION_FIRST_BOOT] === 'true') {
      patches.push({
        op: 'replace',
        path: `/metadata/annotations/${ANNOTATION_FIRST_BOOT}`,
        value: 'false',
      });
    } else {
      // find bootable disk and change boot order
      const bootableDiskIndex = getBootDeviceIndex(getDisks(vm), BOOT_ORDER_SECOND);
      const bootableInterfaceIndex = getBootDeviceIndex(getInterfaces(vm), BOOT_ORDER_FIRST);

      if (bootableDiskIndex !== -1 && bootableInterfaceIndex !== -1) {
        patches.push(
          {
            op: 'replace',
            path: `/spec/template/spec/domain/devices/disks/${bootableDiskIndex}/bootOrder`,
            value: BOOT_ORDER_FIRST,
          },
          {
            op: 'remove',
            path: `/spec/template/spec/domain/devices/interfaces/${bootableInterfaceIndex}/bootOrder`,
          }
        );
      }
    }
  }
  return patches;
};

export const getAddDiskPatch = (vm, storage) => {
  const disk = {
    name: storage.name,
    volumeName: storage.name,
  };
  if (storage.bus) {
    disk.disk = {
      bus: storage.bus,
    };
  }
  const volume = {
    name: storage.name,
    dataVolume: {
      name: `${storage.name}-${getName(vm)}`,
    },
  };
  const dataVolumeTemplate = {
    metadata: {
      name: `${storage.name}-${getName(vm)}`,
    },
    spec: {
      pvc: {
        accessModes: [PVC_ACCESSMODE_RWO],
        resources: {
          requests: {
            storage: `${storage.size}Gi`,
          },
        },
      },
      source: {
        blank: {},
      },
    },
  };
  if (storage.storageClass) {
    dataVolumeTemplate.spec.pvc.storageClassName = storage.storageClass;
  }

  const patch = [];

  const hasDisk = get(vm, 'spec.template.spec.domain.devices.disks', false);
  if (hasDisk) {
    patch.push({
      op: 'add',
      path: '/spec/template/spec/domain/devices/disks/0',
      value: disk,
    });
  } else {
    patch.push({
      op: 'add',
      path: '/spec/template/spec/domain/devices/disks',
      value: [disk],
    });
  }

  const hasVolume = get(vm, 'spec.template.spec.volumes', false);
  if (hasVolume) {
    patch.push({
      op: 'add',
      path: '/spec/template/spec/volumes/0',
      value: volume,
    });
  } else {
    patch.push({
      op: 'add',
      path: '/spec/template/spec/volumes',
      value: [volume],
    });
  }

  const hasDataVolume = get(vm, 'spec.dataVolumeTemplates', false);
  if (hasDataVolume) {
    patch.push({
      op: 'add',
      path: '/spec/dataVolumeTemplates/0',
      value: dataVolumeTemplate,
    });
  } else {
    patch.push({
      op: 'add',
      path: '/spec/dataVolumeTemplates',
      value: [dataVolumeTemplate],
    });
  }

  return patch;
};
