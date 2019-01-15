import { get, has } from 'lodash';

import { getDisks, getInterfaces, getName, getDescription, getFlavor, getCpu, getMemory } from './selectors';
import { getBootDeviceIndex } from './utils';
import {
  ANNOTATION_FIRST_BOOT,
  BOOT_ORDER_FIRST,
  BOOT_ORDER_SECOND,
  PVC_ACCESSMODE_RWO,
  TEMPLATE_FLAVOR_LABEL,
} from '../constants';
import { NETWORK_TYPE_POD } from '../components/Wizard/CreateVmWizard/constants';
import { assignBootOrderIndex } from '../k8s/vmBuilder';

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
    bootOrder: assignBootOrderIndex(vm),
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

export const getUpdateDescriptionPatch = (vm, description) => {
  const patch = [];
  if (description !== getDescription(vm)) {
    if (!description && has(vm.metadata, 'annotations.description')) {
      patch.push({
        op: 'remove',
        path: '/metadata/annotations/description',
      });
    } else if (!has(vm.metadata, 'annotations')) {
      patch.push({
        op: 'add',
        path: '/metadata/annotations',
        value: {
          description,
        },
      });
    } else {
      patch.push({
        op: has(vm.metadata, 'annotations.description') ? 'replace' : 'add',
        path: '/metadata/annotations/description',
        value: description,
      });
    }
  }
  return patch;
};

const getDomainPatch = vm => {
  let patch;
  if (!has(vm, 'spec')) {
    patch = {
      op: 'add',
      path: '/spec',
      value: {
        template: {
          spec: {
            domain: {},
          },
        },
      },
    };
  } else if (!has(vm.spec, 'template')) {
    patch = {
      op: 'add',
      path: '/spec/template',
      value: {
        spec: {
          domain: {},
        },
      },
    };
  } else if (!has(vm.spec.template, 'spec')) {
    patch = {
      op: 'add',
      path: '/spec/template/spec',
      value: {
        domain: {},
      },
    };
  } else if (!has(vm.spec.template.spec, 'domain')) {
    patch = {
      op: 'add',
      path: '/spec/template/spec/domain',
      value: {},
    };
  }
  return patch;
};

const getLabelsPatch = vm => {
  if (!has(vm.metadata, 'labels')) {
    return {
      op: 'add',
      path: '/metadata/labels',
      value: {},
    };
  }
  return null;
};

const getCpuPatch = (vm, cpu) => {
  if (!has(vm.spec, 'template.spec.domain.cpu')) {
    return {
      op: 'add',
      path: '/spec/template/spec/domain/cpu',
      value: {
        cores: parseInt(cpu, 10),
      },
    };
  }
  return {
    op: has(vm.spec, 'template.spec.domain.cpu.cores') ? 'replace' : 'add',
    path: '/spec/template/spec/domain/cpu/cores',
    value: parseInt(cpu, 10),
  };
};

const getMemoryPatch = (vm, memory) => {
  if (!has(vm.spec, 'template.spec.domain.resources')) {
    return {
      op: 'add',
      path: '/spec/template/spec/domain/resources',
      value: {
        requests: {
          memory,
        },
      },
    };
  }
  if (!has(vm.spec, 'template.spec.domain.resources.requests')) {
    return {
      op: 'add',
      path: '/spec/template/spec/domain/resources/requests',
      value: {
        memory,
      },
    };
  }
  return {
    op: has(vm.spec, 'template.spec.domain.resources.requests.memory') ? 'replace' : 'add',
    path: '/spec/template/spec/domain/resources/requests/memory',
    value: memory,
  };
};

export const getUpdateFlavorPatch = (vm, flavor) => {
  const patch = [];
  if (flavor !== getFlavor(vm)) {
    const labelKey = `${TEMPLATE_FLAVOR_LABEL}/${flavor}`.replace('~', '~0').replace('/', '~1');
    const labelPatch = getLabelsPatch(vm);
    if (labelPatch) {
      patch.push(labelPatch);
    }
    const flavorLabel = Object.keys(vm.metadata.labels || {}).find(key => key.startsWith(TEMPLATE_FLAVOR_LABEL));
    if (flavorLabel) {
      const flavorParts = flavorLabel.split('/');
      if (flavorParts[flavorParts.length - 1] !== flavor) {
        const escapedLabel = flavorLabel.replace('~', '~0').replace('/', '~1');
        patch.push({
          op: 'remove',
          path: `/metadata/labels/${escapedLabel}`,
        });
      }
    }
    patch.push({
      op: 'add',
      path: `/metadata/labels/${labelKey}`,
      value: 'true',
    });
  }
  return patch;
};

export const getUpdateCpuMemoryPatch = (vm, cpu, memory) => {
  const patch = [];
  const vmCpu = getCpu(vm);
  const vmMemory = getMemory(vm);

  if (parseInt(cpu, 10) !== vmCpu || memory !== vmMemory) {
    const domainPatch = getDomainPatch(vm);
    if (domainPatch) {
      patch.push(domainPatch);
    }
  }

  if (parseInt(cpu, 10) !== vmCpu) {
    patch.push(getCpuPatch(vm, cpu));
  }

  if (memory !== vmMemory) {
    patch.push(getMemoryPatch(vm, memory));
  }

  return patch;
};

export const getAddNicPatch = (vm, nic) => {
  const i = {
    name: nic.name,
    model: nic.model,
    bridge: {},
    bootOrder: assignBootOrderIndex(vm),
  };
  if (nic.mac) {
    i.macAddress = nic.mac;
  }

  const network = {
    name: nic.name,
  };
  if (get(nic.network, 'networkType') === NETWORK_TYPE_POD) {
    network.pod = {};
  } else {
    network.multus = {
      networkName: get(nic.network, 'name'),
    };
  }

  const patch = [];

  const hasInterfaces = get(vm, 'spec.template.spec.domain.devices.interfaces', []).length > 0;
  if (hasInterfaces) {
    patch.push({
      op: 'add',
      path: '/spec/template/spec/domain/devices/interfaces/0',
      value: i,
    });
  } else {
    patch.push({
      op: 'add',
      path: '/spec/template/spec/domain/devices/interfaces',
      value: [i],
    });
  }

  const hasNetworks = get(vm, 'spec.template.spec.networks', false);
  if (hasNetworks) {
    patch.push({
      op: 'add',
      path: '/spec/template/spec/networks/0',
      value: network,
    });
  } else {
    patch.push({
      op: 'add',
      path: '/spec/template/spec/networks',
      value: [network],
    });
  }

  return patch;
};

export const getStartStopPatch = (vm, start) => {
  const patch = [];
  if (!has(vm, 'spec')) {
    patch.push({
      op: 'add',
      path: '/spec',
      value: {
        running: start,
      },
    });
  } else {
    patch.push({
      op: has(vm.spec, 'running') ? 'replace' : 'add',
      path: '/spec/running',
      value: start,
    });
  }
  return patch;
};

export const addPrefixToPatch = (prefix, patch) => ({
  ...patch,
  path: `${prefix}${patch.path}`,
});
