import React from 'react';

import * as _ from 'lodash';

import { ProcessedTemplatesModel } from '../models';
import { TEMPLATE_PARAM_VM_NAME } from '../constants';

const processTemplate = template =>
  new Promise((resolve, reject) => {
    const nameParam = template.parameters.find(param => param.name === TEMPLATE_PARAM_VM_NAME);
    template.objects[0].metadata.name = nameParam.value;
    resolve(template);
  });

export const k8sGet = (model, name, ns, opts) => {
  console.warn('TODO: tests/k8s.js k8sGet() not implemented: ', model, name, ns, opts);
};

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
  WithResources,
};
