import { ANNOTATION_FIRST_BOOT, BOOT_ORDER_SECOND, BOOT_ORDER_FIRST, PVC_ACCESSMODE_RWO } from '../../constants';
import { getPxeBootPatch, getAddDiskPatch } from '../utils';

const getVM = firstBoot => ({
  metadata: {
    annotations: {
      [ANNOTATION_FIRST_BOOT]: `${firstBoot}`,
    },
    name: 'fooVM',
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

const storageNoClass = {
  name: 'foo',
  size: '5',
  bus: 'fooBus',
};

const storage = {
  ...storageNoClass,
  storageClass: 'fooStorageClass',
};

const disk = {
  name: storageNoClass.name,
  disk: {
    bus: storageNoClass.bus,
  },
  volumeName: storageNoClass.name,
};

const volume = {
  name: storageNoClass.name,
  dataVolume: {
    name: `${storageNoClass.name}-fooVM`,
  },
};

const dataVolumeTemplate = {
  metadata: {
    name: `${storageNoClass.name}-fooVM`,
  },
  spec: {
    pvc: {
      accessModes: [PVC_ACCESSMODE_RWO],
      resources: {
        requests: {
          storage: `${storageNoClass.size}Gi`,
        },
      },
    },
    source: {
      blank: {},
    },
  },
};

const compareAddPatch = (patch, expectedPath, expectedValue) => {
  expect(patch).toEqual({
    op: 'add',
    path: expectedPath,
    value: expectedValue,
  });
};

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
  it('Add disk patch', () => {
    const vm = getVM(false);

    const patch = getAddDiskPatch(vm, storageNoClass);
    expect(patch).toHaveLength(3);
    compareAddPatch(patch[0], '/spec/template/spec/domain/devices/disks/0', disk);
    compareAddPatch(patch[1], '/spec/template/spec/volumes', [volume]);
    compareAddPatch(patch[2], '/spec/dataVolumeTemplates', [dataVolumeTemplate]);

    const dataVolWithClass = {
      ...dataVolumeTemplate,
      spec: {
        ...dataVolumeTemplate.spec,
        pvc: {
          ...dataVolumeTemplate.spec.pvc,
          storageClassName: storage.storageClass,
        },
      },
    };
    const patchWithClass = getAddDiskPatch(vm, storage);
    expect(patchWithClass).toHaveLength(3);
    compareAddPatch(patchWithClass[0], '/spec/template/spec/domain/devices/disks/0', disk);
    compareAddPatch(patchWithClass[1], '/spec/template/spec/volumes', [volume]);
    compareAddPatch(patchWithClass[2], '/spec/dataVolumeTemplates', [dataVolWithClass]);
  });
});
