import { remove, pull, get } from 'lodash';

import {
  getDisks,
  getVolumes,
  getDataVolumeTemplates,
  getInterfaces,
  getNetworks,
  getVmTemplate,
  getName,
  getNamespace,
  getDataVolumeSourceType,
  getLabels,
} from '../selectors';
import { selectVm } from '../k8s/selectors';

import {
  TEMPLATE_TYPE_LABEL,
  TEMPLATE_TYPE_VM,
  PROVISION_SOURCE_PXE,
  PROVISION_SOURCE_CONTAINER,
  PROVISION_SOURCE_URL,
  PROVISION_SOURCE_CLONED_DISK,
} from '../constants';
import { TemplateModel } from '../models';
import { DATA_VOLUME_SOURCE_URL, DATA_VOLUME_SOURCE_PVC } from '../components/Wizard/CreateVmWizard/constants';

export const getTemplatesWithLabels = (templates, labels) => {
  const filteredTemplates = [...templates];
  labels.forEach(label => {
    if (label !== undefined) {
      pull(
        filteredTemplates,
        remove(filteredTemplates, template => Object.keys(getLabels(template, [])).find(l => l === label) === undefined)
      );
    }
  });
  return filteredTemplates;
};

export const getTemplatesLabelValues = (templates, label) => {
  const labelValues = [];
  (templates || []).forEach(t => {
    const labels = Object.keys(getLabels(t, [])).filter(l => l.startsWith(label));
    labels.forEach(l => {
      const labelParts = l.split('/');
      if (labelParts.length > 1) {
        const labelName = labelParts[labelParts.length - 1];
        if (labelValues.indexOf(labelName) === -1) {
          labelValues.push(labelName);
        }
      }
    });
  });
  return labelValues;
};

export const getTemplate = (templates, type) =>
  (templates || []).filter(template => {
    const labels = get(template, 'metadata.labels', {});
    return labels[TEMPLATE_TYPE_LABEL] === type;
  });

export const getUserTemplate = (templates, userTemplateName) => {
  const userTemplates = getTemplate(templates, TEMPLATE_TYPE_VM);
  return userTemplates.find(template => template.metadata.name === userTemplateName);
};

export const getTemplateStorages = (template, dataVolumes) => {
  const vm = selectVm(template.objects);

  const volumes = getVolumes(vm);
  const dataVolumeTemplates = getDataVolumeTemplates(vm);
  return getDisks(vm).map(disk => {
    const volume = volumes.find(v => v.name === disk.name);
    const storage = {
      disk,
      volume,
    };
    if (get(volume, 'dataVolume')) {
      storage.dataVolumeTemplate = dataVolumeTemplates.find(d => getName(d) === get(volume.dataVolume, 'name'));
      storage.dataVolume = dataVolumes.find(
        d => getName(d) === get(volume.dataVolume, 'name') && getNamespace(d) === getNamespace(template)
      );
    }
    return storage;
  });
};

export const getTemplateInterfaces = ({ objects }) => {
  const vm = selectVm(objects);

  return getInterfaces(vm).map(i => {
    const network = getNetworks(vm).find(n => n.name === i.name);
    return {
      network,
      interface: i,
    };
  });
};

export const hasAutoAttachPodInterface = ({ objects }) => {
  const vm = selectVm(objects);

  return get(vm, 'spec.template.spec.domain.devices.autoattachPodInterface', true);
};

export const getTemplateProvisionSource = (template, dataVolumes) => {
  const vm = selectVm(template.objects);
  if (getInterfaces(vm).some(i => i.bootOrder === 1)) {
    return {
      type: PROVISION_SOURCE_PXE,
    };
  }
  const bootDisk = getDisks(vm).find(disk => disk.bootOrder === 1);
  if (bootDisk) {
    const bootVolume = getVolumes(vm).find(volume => volume.name === bootDisk.name);
    if (bootVolume && bootVolume.containerDisk) {
      return {
        type: PROVISION_SOURCE_CONTAINER,
        source: bootVolume.containerDisk.image,
      };
    }
    if (bootVolume && bootVolume.dataVolume) {
      let dataVolume = getDataVolumeTemplates(vm).find(dv => dv.metadata.name === bootVolume.dataVolume.name);
      if (!dataVolume) {
        dataVolume = dataVolumes.find(
          d => getName(d) === bootVolume.dataVolume.name && getNamespace(d) === getNamespace(template)
        );
      }
      if (dataVolume) {
        const source = getDataVolumeSourceType(dataVolume);
        switch (source.type) {
          case DATA_VOLUME_SOURCE_URL:
            return {
              type: PROVISION_SOURCE_URL,
              source: source.url,
            };
          case DATA_VOLUME_SOURCE_PVC:
            return {
              type: PROVISION_SOURCE_CLONED_DISK,
              source: `${source.namespace}/${source.name}`,
            };
          default:
            return null;
        }
      }
    }
  }
  return null;
};

export const retrieveVmTemplate = (k8sGet, vm) =>
  new Promise((resolve, reject) => {
    const template = getVmTemplate(vm);
    if (!template) {
      resolve(null);
    }
    const getTemplatePromise = k8sGet(TemplateModel, template.name, template.namespace);
    getTemplatePromise
      .then(result => resolve(result))
      .catch(error => {
        if (get(error, 'json.code') === 404) {
          console.warn('Could not retrieve template, are common-templates installed?'); // eslint-disable-line no-console
        }
        reject(error);
      });
  });
