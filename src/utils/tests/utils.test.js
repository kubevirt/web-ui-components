import { ANNOTATION_FIRST_BOOT, BOOT_ORDER_SECOND, BOOT_ORDER_FIRST } from '../../constants';
import { getPxeBootPatch } from '../utils';

const getVM = firstBoot => ({
  metadata: {
    annotations: {
      [ANNOTATION_FIRST_BOOT]: `${firstBoot}`,
    },
  },
  spec: {
    template: {
      spec: {
        domain: {
          devices: {
            disks: [
              {
                bootOrder: BOOT_ORDER_SECOND,
              },
            ],
            interfaces: [
              {
                bootOrder: BOOT_ORDER_FIRST,
              },
            ],
          },
        },
      },
    },
  },
});

describe('utils.js tests', () => {
  it('PXE boot patch - set ANNOTATION_FIRST_BOOT to false', () => {
    const patch = getPxeBootPatch(getVM(true));
    expect(patch).toEqual([
      {
        op: 'replace',
        path: `/metadata/annotations/${ANNOTATION_FIRST_BOOT}`,
        value: 'false',
      },
    ]);
  });
  it('PXE boot patch - change boot order', () => {
    const patch = getPxeBootPatch(getVM(false));
    expect(patch).toEqual([
      {
        op: 'replace',
        path: `/spec/template/spec/domain/devices/disks/0/bootOrder`,
        value: BOOT_ORDER_FIRST,
      },
      {
        op: 'remove',
        path: `/spec/template/spec/domain/devices/interfaces/0/bootOrder`,
      },
    ]);
  });
  it('PXE boot patch - does nothing if VM has no disk', () => {
    const vm = getVM(false);
    delete vm.spec.template.spec.domain.devices.disks;
    const patch = getPxeBootPatch(vm);
    expect(patch).toEqual([]);
  });
});
