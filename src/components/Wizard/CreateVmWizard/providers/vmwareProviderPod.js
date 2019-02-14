/**
 * Based on V2V Provider Pod manifest.yaml
 */

import { PodModel, ServiceModel, RouteModel, SecretModel, V2VVMwareModel } from '../../../../models';
import { VCENTER_TYPE_LABEL } from '../../../../constants';

// const PROVIDER_POD_IMAGE_NAME = 'quay.io/pkliczewski/provider-pod:latest'; // TODO

export const getDefaultSecretName = ({ username, url }) => {
  const u = new URL(url || '');
  const host = u.host || 'nohost';
  return `${host}-${username}`
};

export const getImportProviderSecretObject = ({ url, username, pwd, secretName, namespace }) => {
  const _secretName = secretName || getDefaultSecretName({ username, url });
  const secret = {
    kind: SecretModel.kind,
    apiVersion: SecretModel.apiVersion,
    metadata: {
      generateName: _secretName,
      namespace,
      labels: {
        [VCENTER_TYPE_LABEL]: 'true',
      },
    },
    type: 'Opaque',
    data: {
      username: btoa(username),
      password: btoa(pwd),
      url: btoa(url),
    }
  };

  return secret;
};

export const getV2VVMwareObject = ({ name, namespace, connectionSecretName }) => {
  return {
    apiVersion: `${V2VVMwareModel.apiGroup}/${V2VVMwareModel.apiVersion}`,
    kind: V2VVMwareModel.kind,
    metadata: {
      generateName: name,
      namespace,
    },
    spec: {
      connection: connectionSecretName,
    }
  };
};

// ------------------------------------------------------------------------
/*
export const providerPod = ({ namespace, secretName = 'pod-config', appName = 'provider-pod' }) => {
  const secretRef = (name, key) => ({
    name,
    valueFrom: {
      name: secretName,
      key,
    }
  });
  return {
    kind: PodModel.kind,
    apiVersion: PodModel.apiVersion,
    metadata: {
      generateName: `${appName}-`,
      namespace,
      labels: {
        app: appName,
      }
    },
    spec: {
      containers: [{
        name: appName,
        image: PROVIDER_POD_IMAGE_NAME,
        env: [
          {
            name: 'SERVER_PORT',
            value: "8080",
          },
          secretRef('URL', 'url'),
          secretRef('USERNAME', 'username'),
          secretRef('PASSWORD', 'password'),
          secretRef('TOKEN', 'token'),
        ],
      }],
      restartPolicy: 'Never',
    },
  };
};


//  uniqueNodePort - please make sure it's unique
export const providerService = ({ namespace, providerPod, uniqueNodePort }) => {
  const appName = providerPod.metadata.labels.app;

  return {
    kind: ServiceModel.kind,
    apiVersion: ServiceModel.apiVersion,
    metadata: {
      generateName: `${appName}-service-`,
      namespace,
    },
    spec: {
      selector: {
        app: appName,
      },
      type: 'NodePort',
      ports: [{
        protocol: 'TCP',
        port: '8080',
        targetPort: '8080',
        nodePort: uniqueNodePort,
      }],
    },
  };
};

//  providerService - make sure it's the  object returned from API by creation due to providerService.metadata.name
export const providerRoute = ({ namespace, providerService }) => {
  const serviceName = providerService.metadata.name;
  const targetPort = providerService.spec.ports[0].targetPort;

  return {
    apiVersion: RouteModel.apiVersion,
    kind: RouteModel.kind,
    metadata: {
      name: serviceName, // share the name
      namespace,
    },
    spec: {
      // host: 'TODO', // can it be auto-generated? TODO: verify
      port: {
        targetPort,
      },
      to: {
        kind: ServiceModel.kind,
        name: serviceName,
      },
      wildcardPolicy: 'None',
    },
  };
};
*/