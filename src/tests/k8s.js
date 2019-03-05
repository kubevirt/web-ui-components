import React from 'react';

import * as _ from 'lodash';

import { ConfigMapModel, ProcessedTemplatesModel, V2VVMwareModel } from '../models';
import {
  TEMPLATE_PARAM_VM_NAME,
  VMWARE_TO_KUBEVIRT_OS_CONFIG_MAP_NAME,
  VMWARE_TO_KUBEVIRT_OS_CONFIG_MAP_NAMESPACE,
} from '../constants';

const processTemplate = template =>
  new Promise((resolve, reject) => {
    const nameParam = template.parameters.find(param => param.name === TEMPLATE_PARAM_VM_NAME);
    template.objects[0].metadata.name = nameParam.value;
    resolve(template);
  });

export const k8sGet = (model, name, ns, opts) => {
  if (model.kind === V2VVMwareModel.kind) {
    const v2vvmware = {
      spec: {
        vms: [
          {
            name: 'test-vm1-name',
          },
          {
            name: 'test-vm2-name',
          },
          {
            name: 'test-vm3-name',
          },
        ],
      },
    };
    return v2vvmware;
  }

  if (
    model.kind === ConfigMapModel.kind &&
    name === VMWARE_TO_KUBEVIRT_OS_CONFIG_MAP_NAME &&
    ns === VMWARE_TO_KUBEVIRT_OS_CONFIG_MAP_NAMESPACE
  ) {
    const configMap = {
      data: {
        // purely dummy testing data
        rhel7_64Guest: 'rhel7.0',
        windows7Server64Guest: 'win2k8',
        windows9Server64Guest: '',
      },
      kind: 'ConfigMap',
      metadata: {},
    };
    return configMap;
  }

  throw new Error(
    `Mock k8sGet() function is not implemented for that flow: model: ${model.kind}, name: ${name}, ns: ${ns}`
  );
};

// mock implementation
export const k8sKill = (model, resource) => resource;

export const k8sCreate = (model, resource) => {
  if (model === ProcessedTemplatesModel) {
    return processTemplate(resource);
  }

  if (resource.metadata.generateName) {
    resource.metadata.name = `${resource.metadata.generateName}-${Math.random()
      .toString(36)
      .substr(2, 5)}`;
  }

  return new Promise(resolve => resolve(resource));
};

export const k8sPatch = (model, instance, patch) => Promise.resolve(instance);

const inject = (children, props) => {
  const safeProps = _.omit(props, ['children']);
  return React.Children.map(children, c => {
    if (!_.isObject(c)) {
      return c;
    }
    return React.cloneElement(c, safeProps);
  });
};

export const WithResources = ({ resourceMap, resourceToProps, children, tesOnlyPhase = 'ConnectionVerified' }) => {
  let childrenProps = {
    choices: ['test-vm1', 'test-vm2'],
    disabled: false,
  };

  if (resourceMap.vCenterSecrets) {
    const vCenterSecrets = [
      {
        metadata: {
          name: 'secret-1',
        },
      },
      {
        metadata: {
          name: 'secret-2',
        },
      },
    ];
    childrenProps = resourceToProps({ vCenterSecrets });
  }

  if (resourceMap.v2vvmware) {
    const v2vvmware = {
      spec: {
        vms: [
          {
            name: 'vm-1',
          },
          {
            name: 'vm-2',
            detail: {
              raw: '{"content": "Dummy VMWare raw data about a VM"}',
            },
          },
        ],
      },
      status: {
        phase: tesOnlyPhase,
      },
    };
    childrenProps = resourceToProps({ v2vvmware });
  }

  return inject(children, childrenProps);
};

export const callerContext = {
  k8sCreate,
  k8sGet,
  k8sPatch,
  k8sKill,
  WithResources,
};
