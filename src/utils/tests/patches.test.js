import { get, cloneDeep } from 'lodash';

import {
  ANNOTATION_FIRST_BOOT,
  BOOT_ORDER_SECOND,
  BOOT_ORDER_FIRST,
  PVC_ACCESSMODE_RWO,
  TEMPLATE_FLAVOR_LABEL,
  POD_NETWORK,
} from '../../constants';
import {
  getPxeBootPatch,
  getAddDiskPatch,
  getUpdateDescriptionPatch,
  getUpdateFlavorPatch,
  getAddNicPatch,
  getStartStopPatch,
  getUpdateCpuMemoryPatch,
} from '../patches';
import { cloudInitTestVm } from '../../tests/mocks/vm/cloudInitTestVm.mock';
import { NETWORK_TYPE_POD, NETWORK_TYPE_MULTUS } from '../../components/Wizard/CreateVmWizard/constants';

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

const compareNestedPatch = (patch, path, value, op = 'add') => {
  let resolvedPath = patch.path;
  let nextSegment = patch.value;

  while (typeof nextSegment === 'object') {
    const keys = Object.keys(nextSegment);

    if (keys.length !== 1) {
      // resolve value which is an object without clear path
      break;
    }
    const pathKey = keys[0];
    resolvedPath = `${resolvedPath}/${pathKey}`;
    nextSegment = nextSegment[pathKey];
  }

  comparePatch(
    {
      ...patch,
      path: resolvedPath,
      value: nextSegment,
    },
    path,
    value,
    op
  );
};

const comparePatch = (patch, path, value, op = 'add') => {
  expect(patch).toEqual({
    op,
    path,
    value,
  });
};

const nic = {
  name: 'fooNic',
  mac: 'fooMac',
  network: {
    name: 'fooNetwork',
    networkType: NETWORK_TYPE_MULTUS,
  },
  model: 'fooModel',
};

const podNic = {
  name: 'fooNic',
  mac: 'fooMac',
  network: {
    name: POD_NETWORK,
    networkType: NETWORK_TYPE_POD,
  },
  model: 'fooModel',
};

const intface = {
  name: nic.name,
  macAddress: nic.mac,
  model: nic.model,
  bridge: {},
};

const network = {
  name: nic.name,
  multus: {
    networkName: nic.network.name,
  },
};

const podNetwork = {
  name: nic.name,
  pod: {},
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
    comparePatch(patch[0], '/spec/template/spec/domain/devices/disks/0', disk);
    comparePatch(patch[1], '/spec/template/spec/volumes', [volume]);
    comparePatch(patch[2], '/spec/dataVolumeTemplates', [dataVolumeTemplate]);

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
    comparePatch(patchWithClass[0], '/spec/template/spec/domain/devices/disks/0', disk);
    comparePatch(patchWithClass[1], '/spec/template/spec/volumes', [volume]);
    comparePatch(patchWithClass[2], '/spec/dataVolumeTemplates', [dataVolWithClass]);
  });
  it('Update description patch', () => {
    let patch = getUpdateDescriptionPatch(cloudInitTestVm, 'new description');
    expect(patch).toHaveLength(1);
    comparePatch(patch[0], '/metadata/annotations/description', 'new description', 'replace');

    patch = getUpdateDescriptionPatch(cloudInitTestVm, cloudInitTestVm.metadata.annotations.description);
    expect(patch).toHaveLength(0);

    patch = getUpdateDescriptionPatch(cloudInitTestVm, '');
    expect(patch).toHaveLength(1);
    comparePatch(patch[0], '/metadata/annotations/description', undefined, 'remove');

    const vmWithNoDescription = cloneDeep(cloudInitTestVm);
    delete vmWithNoDescription.metadata.annotations.description;

    const vmWithNoAnnotations = cloneDeep(cloudInitTestVm);
    delete vmWithNoAnnotations.metadata.annotations;

    [vmWithNoAnnotations, vmWithNoDescription].forEach(vm => {
      patch = getUpdateDescriptionPatch(vm, 'new description');
      expect(patch).toHaveLength(1);
      compareNestedPatch(patch[0], '/metadata/annotations/description', 'new description');
    });
  });
  it('Update flavor patch', () => {
    let patch = getUpdateFlavorPatch(cloudInitTestVm, 'Custom');
    // different flavor
    expect(patch).toHaveLength(2);
    comparePatch(patch[0], `/metadata/labels/${TEMPLATE_FLAVOR_LABEL}~1small`, undefined, 'remove');
    comparePatch(patch[1], `/metadata/labels/${TEMPLATE_FLAVOR_LABEL}~1Custom`, 'true');

    // same flavor
    patch = getUpdateFlavorPatch(cloudInitTestVm, 'small');
    expect(patch).toHaveLength(0);

    // missing flavor
    const vmWithNoFlavorLabel = cloneDeep(cloudInitTestVm);
    delete vmWithNoFlavorLabel.metadata.labels[`${TEMPLATE_FLAVOR_LABEL}/small`];
    const vmWithNoLabels = cloneDeep(cloudInitTestVm);
    delete vmWithNoLabels.metadata.labels;

    [vmWithNoFlavorLabel, vmWithNoLabels].forEach(vmWithNoFlavor => {
      const hasLabels = !!vmWithNoFlavor.metadata.labels;
      patch = getUpdateFlavorPatch(vmWithNoFlavor, 'Custom');
      const patchLength = hasLabels ? 1 : 2;

      expect(patch).toHaveLength(patchLength);
      if (!hasLabels) {
        comparePatch(patch[0], `/metadata/labels`, {});
      }
      comparePatch(patch[patchLength - 1], `/metadata/labels/${TEMPLATE_FLAVOR_LABEL}~1Custom`, 'true');
    });
  });
  it('Update cpu memory patch', () => {
    const cpuPath = '/spec/template/spec/domain/cpu/cores';
    const memPath = '/spec/template/spec/domain/resources/requests/memory';

    const getNumberOfPatches = (expectsDomainCreation, expectedCpuCount, expectedMemoryCount) => {
      let patchesCount = expectsDomainCreation ? 1 : 0;
      if (expectedCpuCount) {
        patchesCount += 1;
      }
      if (expectedMemoryCount) {
        patchesCount += 1;
      }
      return patchesCount;
    };

    const expectCpuMem = (
      patch,
      expectsDomainCreation,
      { expectedCpuCount, expectedCpuOp },
      { expectedMemoryCount, expectedMemoryOp }
    ) => {
      const patchesCount = getNumberOfPatches(expectsDomainCreation, expectedCpuCount, expectedMemoryCount);
      expect(patch).toHaveLength(patchesCount);

      if (expectsDomainCreation) {
        compareNestedPatch(patch[0], `/spec/template/spec/domain`, {});
      }

      if (expectedCpuCount) {
        const cpuPatchIndex = patchesCount - (expectedMemoryCount ? 2 : 1);
        compareNestedPatch(patch[cpuPatchIndex], cpuPath, parseInt(expectedCpuCount, 10), expectedCpuOp);
      }
      if (expectedMemoryCount) {
        const memPatchIndex = patchesCount - 1;
        compareNestedPatch(patch[memPatchIndex], memPath, expectedMemoryCount, expectedMemoryOp);
      }
    };

    const expectCpuMemWrapped = (vm, cpu, memory, expectedCpu, expectedMemory) => {
      const patch = getUpdateCpuMemoryPatch(vm, cpu, memory);
      const expectsDomainCreation = !get(vm, 'spec.template.spec.domain');
      const expectsCpuCreation = !get(vm, 'spec.template.spec.domain.cpu.cores');
      const expectsMemoryCreation = !get(vm, 'spec.template.spec.domain.resources.requests.memory');

      expectCpuMem(
        patch,
        expectsDomainCreation,
        { expectedCpuCount: expectedCpu, expectedCpuOp: expectsCpuCreation ? 'add' : 'replace' },
        { expectedMemoryCount: expectedMemory, expectedMemoryOp: expectsMemoryCreation ? 'add' : 'replace' }
      );
    };

    const vmWithNoCores = cloneDeep(cloudInitTestVm);
    delete vmWithNoCores.spec.template.spec.domain.cpu.cores;

    const vmWithNoCpuNoCores = cloneDeep(cloudInitTestVm);
    delete vmWithNoCpuNoCores.spec.template.spec.domain.cpu;

    const vmWithNoMemory = cloneDeep(cloudInitTestVm);
    delete vmWithNoMemory.spec.template.spec.domain.resources.requests.memory;

    const vmWithNoRequests = cloneDeep(cloudInitTestVm);
    delete vmWithNoRequests.spec.template.spec.domain.resources.requests;

    const vmWithNoResources = cloneDeep(cloudInitTestVm);
    delete vmWithNoResources.spec.template.spec.domain.resources;

    const vmWithNoDomain = cloneDeep(cloudInitTestVm);
    delete vmWithNoDomain.spec.template.spec.domain;

    const vmWithNoTemplateSpec = cloneDeep(cloudInitTestVm);
    delete vmWithNoTemplateSpec.spec.template.spec;

    const vmWithNoTemplate = cloneDeep(cloudInitTestVm);
    delete vmWithNoTemplate.spec.template;

    const vmWithNoSpec = cloneDeep(cloudInitTestVm);
    delete vmWithNoSpec.spec;

    // no changes
    expectCpuMemWrapped(cloudInitTestVm, '2', '2G');
    // partial changes
    expectCpuMemWrapped(cloudInitTestVm, '1', '2G', '1');
    expectCpuMemWrapped(cloudInitTestVm, '2', '1G', undefined, '1G');

    // changes and path creation
    [
      cloudInitTestVm,
      vmWithNoCores,
      vmWithNoCpuNoCores,
      vmWithNoMemory,
      vmWithNoRequests,
      vmWithNoResources,
      vmWithNoDomain,
      vmWithNoTemplateSpec,
      vmWithNoTemplate,
      vmWithNoSpec,
    ].forEach(vm => {
      expectCpuMemWrapped(vm, '3', '4G', '3', '4G');
    });
  });
  it('Add Nic patch', () => {
    const vmWithoutNetworks = getVM(false);

    let patch = getAddNicPatch(vmWithoutNetworks, nic);
    expect(patch).toHaveLength(2);
    comparePatch(patch[0], '/spec/template/spec/domain/devices/interfaces/0', intface);
    comparePatch(patch[1], '/spec/template/spec/networks', [network]);

    const vmWithoutInterfaces = getVM(false);
    delete vmWithoutInterfaces.spec.template.spec.domain.devices.interfaces;
    vmWithoutInterfaces.spec.template.spec.networks = {};

    patch = getAddNicPatch(vmWithoutInterfaces, nic);
    expect(patch).toHaveLength(2);
    comparePatch(patch[0], '/spec/template/spec/domain/devices/interfaces', [intface]);
    comparePatch(patch[1], '/spec/template/spec/networks/0', network);

    const nicWithoutMac = cloneDeep(nic);
    delete nicWithoutMac.mac;
    const intfaceWithoutMac = cloneDeep(intface);
    delete intfaceWithoutMac.macAddress;

    patch = getAddNicPatch(vmWithoutNetworks, nicWithoutMac);
    expect(patch).toHaveLength(2);
    comparePatch(patch[0], '/spec/template/spec/domain/devices/interfaces/0', intfaceWithoutMac);
    comparePatch(patch[1], '/spec/template/spec/networks', [network]);

    patch = getAddNicPatch(vmWithoutNetworks, podNic);
    expect(patch).toHaveLength(2);
    comparePatch(patch[0], '/spec/template/spec/domain/devices/interfaces/0', intface);
    comparePatch(patch[1], '/spec/template/spec/networks', [podNetwork]);
  });
  it('start stop vm patch', () => {
    const vm = getVM(false);

    vm.spec.running = true;

    let patch = getStartStopPatch(vm, true);
    expect(patch).toHaveLength(1);
    comparePatch(patch[0], '/spec/running', true, 'replace');

    patch = getStartStopPatch(vm, false);
    expect(patch).toHaveLength(1);
    comparePatch(patch[0], '/spec/running', false, 'replace');

    delete vm.spec.running;

    patch = getStartStopPatch(vm, false);
    expect(patch).toHaveLength(1);
    comparePatch(patch[0], '/spec/running', false);

    delete vm.spec;

    patch = getStartStopPatch(vm, false);
    expect(patch).toHaveLength(1);
    comparePatch(patch[0], '/spec', { running: false });
  });
});
