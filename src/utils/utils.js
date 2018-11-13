import { get } from 'lodash';
import { getDisks, getInterfaces } from './selectors';
import { ANNOTATION_FIRST_BOOT, BOOT_ORDER_FIRST, BOOT_ORDER_SECOND } from '../constants';

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
