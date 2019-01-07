import { cloneDeep } from 'lodash';

import {
  ANNOTATION_FIRST_BOOT,
  BOOT_ORDER_SECOND,
  BOOT_ORDER_FIRST,
  PVC_ACCESSMODE_RWO,
  TEMPLATE_FLAVOR_LABEL,
  POD_NETWORK,
} from '../../constants';
import { getPxeBootPatch, getAddDiskPatch, getUpdateDescriptionPatch, getUpdateFlavorPatch, getAddNicPatch } from '../utils';
import { cloudInitTestVm } from '../../k8s/mock_vm/cloudInitTestVm.mock';

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

const comparePatch = (patch, path, value, op = 'add') => {
  expect(patch).toEqual({
    op,
    path,
    value,
  });
}
const nic = {
  name: 'fooNic',
  mac: 'fooMac',
  network: 'fooNetwork',
  model: 'fooModel',
};

const podNic = {
  name: 'fooNic',
  mac: 'fooMac',
  network: POD_NETWORK,
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
    networkName: nic.network,
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

    patch = getUpdateDescriptionPatch(vmWithNoDescription, 'new description');
    expect(patch).toHaveLength(1);
    comparePatch(patch[0], '/metadata/annotations/description', 'new description');

    const vmWithNoAnnotations = cloneDeep(cloudInitTestVm);
    delete vmWithNoAnnotations.metadata.annotations;

    patch = getUpdateDescriptionPatch(vmWithNoAnnotations, 'new description');
    expect(patch).toHaveLength(1);
    comparePatch(patch[0], '/metadata/annotations', { description: 'new description' });
  });
  it('Update flavor patch', () => {
    let patch = getUpdateFlavorPatch(cloudInitTestVm, 'Custom', '1', '3G');
    expect(patch).toHaveLength(4);
    comparePatch(patch[0], `/metadata/labels/${TEMPLATE_FLAVOR_LABEL}~1small`, undefined, 'remove');
    comparePatch(patch[1], `/metadata/labels/${TEMPLATE_FLAVOR_LABEL}~1Custom`, 'true');
    comparePatch(patch[2], `/spec/template/spec/domain/cpu/cores`, 1, 'replace');
    comparePatch(patch[3], `/spec/template/spec/domain/resources/requests/memory`, '3G', 'replace');

    patch = getUpdateFlavorPatch(cloudInitTestVm, 'small', '2', '2G');
    expect(patch).toHaveLength(0);

    patch = getUpdateFlavorPatch(cloudInitTestVm, 'small', '3', '2G');
    expect(patch).toHaveLength(1);
    comparePatch(patch[0], `/spec/template/spec/domain/cpu/cores`, 3, 'replace');

    patch = getUpdateFlavorPatch(cloudInitTestVm, 'small', '2', '1G');
    expect(patch).toHaveLength(1);
    comparePatch(patch[0], `/spec/template/spec/domain/resources/requests/memory`, '1G', 'replace');

    patch = getUpdateFlavorPatch(cloudInitTestVm, 'medium', '2', '2G');
    expect(patch).toHaveLength(2);
    comparePatch(patch[0], `/metadata/labels/${TEMPLATE_FLAVOR_LABEL}~1small`, undefined, 'remove');
    comparePatch(patch[1], `/metadata/labels/${TEMPLATE_FLAVOR_LABEL}~1medium`, 'true');

    const vmWithNoFlavorLabel = cloneDeep(cloudInitTestVm);
    delete vmWithNoFlavorLabel.metadata.labels[`${TEMPLATE_FLAVOR_LABEL}/small`];

    patch = getUpdateFlavorPatch(vmWithNoFlavorLabel, 'Custom', '1', '3G');
    expect(patch).toHaveLength(3);
    comparePatch(patch[0], `/metadata/labels/${TEMPLATE_FLAVOR_LABEL}~1Custom`, 'true');
    comparePatch(patch[1], `/spec/template/spec/domain/cpu/cores`, 1, 'replace');
    comparePatch(patch[2], `/spec/template/spec/domain/resources/requests/memory`, '3G', 'replace');

    const vmWithNoLabels = cloneDeep(cloudInitTestVm);
    delete vmWithNoLabels.metadata.labels;

    patch = getUpdateFlavorPatch(vmWithNoLabels, 'Custom', '1', '3G');
    expect(patch).toHaveLength(4);
    comparePatch(patch[0], `/metadata/labels`, {});
    comparePatch(patch[1], `/metadata/labels/${TEMPLATE_FLAVOR_LABEL}~1Custom`, 'true');
    comparePatch(patch[2], `/spec/template/spec/domain/cpu/cores`, 1, 'replace');
    comparePatch(patch[3], `/spec/template/spec/domain/resources/requests/memory`, '3G', 'replace');

    const vmWithNoCores = cloneDeep(cloudInitTestVm);
    delete vmWithNoCores.spec.template.spec.domain.cpu.cores;

    patch = getUpdateFlavorPatch(vmWithNoCores, 'Custom', '1', '3G');
    expect(patch).toHaveLength(4);
    comparePatch(patch[0], `/metadata/labels/${TEMPLATE_FLAVOR_LABEL}~1small`, undefined, 'remove');
    comparePatch(patch[1], `/metadata/labels/${TEMPLATE_FLAVOR_LABEL}~1Custom`, 'true');
    comparePatch(patch[2], `/spec/template/spec/domain/cpu/cores`, 1);
    comparePatch(patch[3], `/spec/template/spec/domain/resources/requests/memory`, '3G', 'replace');

    const vmWithNoCpuCores = cloneDeep(cloudInitTestVm);
    delete vmWithNoCpuCores.spec.template.spec.domain.cpu;

    patch = getUpdateFlavorPatch(vmWithNoCpuCores, 'Custom', '1', '3G');
    expect(patch).toHaveLength(4);
    comparePatch(patch[0], `/metadata/labels/${TEMPLATE_FLAVOR_LABEL}~1small`, undefined, 'remove');
    comparePatch(patch[1], `/metadata/labels/${TEMPLATE_FLAVOR_LABEL}~1Custom`, 'true');
    comparePatch(patch[2], `/spec/template/spec/domain/cpu`, { cores: 1 });
    comparePatch(patch[3], `/spec/template/spec/domain/resources/requests/memory`, '3G', 'replace');

    const vmWithNoMemory = cloneDeep(cloudInitTestVm);
    delete vmWithNoMemory.spec.template.spec.domain.resources.requests.memory;

    patch = getUpdateFlavorPatch(vmWithNoMemory, 'Custom', '1', '3G');
    expect(patch).toHaveLength(4);
    comparePatch(patch[0], `/metadata/labels/${TEMPLATE_FLAVOR_LABEL}~1small`, undefined, 'remove');
    comparePatch(patch[1], `/metadata/labels/${TEMPLATE_FLAVOR_LABEL}~1Custom`, 'true');
    comparePatch(patch[2], `/spec/template/spec/domain/cpu/cores`, 1, 'replace');
    comparePatch(patch[3], `/spec/template/spec/domain/resources/requests/memory`, '3G');

    const vmWithNoRequests = cloneDeep(cloudInitTestVm);
    delete vmWithNoRequests.spec.template.spec.domain.resources.requests;

    patch = getUpdateFlavorPatch(vmWithNoRequests, 'Custom', '1', '3G');
    expect(patch).toHaveLength(4);
    comparePatch(patch[0], `/metadata/labels/${TEMPLATE_FLAVOR_LABEL}~1small`, undefined, 'remove');
    comparePatch(patch[1], `/metadata/labels/${TEMPLATE_FLAVOR_LABEL}~1Custom`, 'true');
    comparePatch(patch[2], `/spec/template/spec/domain/cpu/cores`, 1, 'replace');
    comparePatch(patch[3], `/spec/template/spec/domain/resources/requests`, { memory: '3G' });

    const vmWithNoResources = cloneDeep(cloudInitTestVm);
    delete vmWithNoResources.spec.template.spec.domain.resources;

    patch = getUpdateFlavorPatch(vmWithNoResources, 'Custom', '1', '3G');
    expect(patch).toHaveLength(4);
    comparePatch(patch[0], `/metadata/labels/${TEMPLATE_FLAVOR_LABEL}~1small`, undefined, 'remove');
    comparePatch(patch[1], `/metadata/labels/${TEMPLATE_FLAVOR_LABEL}~1Custom`, 'true');
    comparePatch(patch[2], `/spec/template/spec/domain/cpu/cores`, 1, 'replace');
    comparePatch(patch[3], `/spec/template/spec/domain/resources`, { requests: { memory: '3G' } });

    const vmWithNoDomain = cloneDeep(cloudInitTestVm);
    delete vmWithNoDomain.spec.template.spec.domain;

    patch = getUpdateFlavorPatch(vmWithNoDomain, 'Custom', '1', '3G');
    expect(patch).toHaveLength(5);
    comparePatch(patch[0], `/metadata/labels/${TEMPLATE_FLAVOR_LABEL}~1small`, undefined, 'remove');
    comparePatch(patch[1], `/metadata/labels/${TEMPLATE_FLAVOR_LABEL}~1Custom`, 'true');
    comparePatch(patch[2], `/spec/template/spec/domain`, {});
    comparePatch(patch[3], `/spec/template/spec/domain/cpu`, { cores: 1 });
    comparePatch(patch[4], `/spec/template/spec/domain/resources`, { requests: { memory: '3G' } });

    const vmWithNoTemplateSpec = cloneDeep(cloudInitTestVm);
    delete vmWithNoTemplateSpec.spec.template.spec;

    patch = getUpdateFlavorPatch(vmWithNoTemplateSpec, 'Custom', '1', '3G');
    expect(patch).toHaveLength(5);
    comparePatch(patch[0], `/metadata/labels/${TEMPLATE_FLAVOR_LABEL}~1small`, undefined, 'remove');
    comparePatch(patch[1], `/metadata/labels/${TEMPLATE_FLAVOR_LABEL}~1Custom`, 'true');
    comparePatch(patch[2], `/spec/template/spec`, { domain: {} });
    comparePatch(patch[3], `/spec/template/spec/domain/cpu`, { cores: 1 });
    comparePatch(patch[4], `/spec/template/spec/domain/resources`, { requests: { memory: '3G' } });

    const vmWithNoTemplate = cloneDeep(cloudInitTestVm);
    delete vmWithNoTemplate.spec.template;

    patch = getUpdateFlavorPatch(vmWithNoTemplate, 'Custom', '1', '3G');
    expect(patch).toHaveLength(5);
    comparePatch(patch[0], `/metadata/labels/${TEMPLATE_FLAVOR_LABEL}~1small`, undefined, 'remove');
    comparePatch(patch[1], `/metadata/labels/${TEMPLATE_FLAVOR_LABEL}~1Custom`, 'true');
    comparePatch(patch[2], `/spec/template`, { spec: { domain: {} } });
    comparePatch(patch[3], `/spec/template/spec/domain/cpu`, { cores: 1 });
    comparePatch(patch[4], `/spec/template/spec/domain/resources`, { requests: { memory: '3G' } });

    const vmWithNoSpec = cloneDeep(cloudInitTestVm);
    delete vmWithNoSpec.spec;

    patch = getUpdateFlavorPatch(vmWithNoSpec, 'Custom', '1', '3G');
    expect(patch).toHaveLength(5);
    comparePatch(patch[0], `/metadata/labels/${TEMPLATE_FLAVOR_LABEL}~1small`, undefined, 'remove');
    comparePatch(patch[1], `/metadata/labels/${TEMPLATE_FLAVOR_LABEL}~1Custom`, 'true');
    comparePatch(patch[2], `/spec`, { template: { spec: { domain: {} } } });
    comparePatch(patch[3], `/spec/template/spec/domain/cpu`, { cores: 1 });
    comparePatch(patch[4], `/spec/template/spec/domain/resources`, { requests: { memory: '3G' } });
  });
  it('Add Nic patch', () => {
    const vmWithoutNetworks = getVM(false);

    let patch = getAddNicPatch(vmWithoutNetworks, nic);
    expect(patch).toHaveLength(2);
    compareAddPatch(patch[0], '/spec/template/spec/domain/devices/interfaces/0', intface);
    compareAddPatch(patch[1], '/spec/template/spec/networks', [network]);

    const vmWithoutInterfaces = getVM(false);
    delete vmWithoutInterfaces.spec.template.spec.domain.devices.interfaces;
    vmWithoutInterfaces.spec.template.spec.networks = {};

    patch = getAddNicPatch(vmWithoutInterfaces, nic);
    expect(patch).toHaveLength(2);
    compareAddPatch(patch[0], '/spec/template/spec/domain/devices/interfaces', [intface]);
    compareAddPatch(patch[1], '/spec/template/spec/networks/0', network);

    const nicWithoutMac = cloneDeep(nic);
    delete nicWithoutMac.mac;
    const intfaceWithoutMac = cloneDeep(intface);
    delete intfaceWithoutMac.macAddress;

    patch = getAddNicPatch(vmWithoutNetworks, nicWithoutMac);
    expect(patch).toHaveLength(2);
    compareAddPatch(patch[0], '/spec/template/spec/domain/devices/interfaces/0', intfaceWithoutMac);
    compareAddPatch(patch[1], '/spec/template/spec/networks', [network]);

    patch = getAddNicPatch(vmWithoutNetworks, podNic);
    expect(patch).toHaveLength(2);
    compareAddPatch(patch[0], '/spec/template/spec/domain/devices/interfaces/0', intface);
    compareAddPatch(patch[1], '/spec/template/spec/networks', [podNetwork]);
  });
});
