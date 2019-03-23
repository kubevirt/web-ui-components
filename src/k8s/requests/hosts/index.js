import { SecretModel, BaremetalHostModel } from '../../../models';
import { getName } from '../../../selectors';

const getSecretName = name => `${name}-secret`;

const getSecret = (name, namespace, username, password) => ({
  apiVersion: SecretModel.apiVersion,
  kind: SecretModel.kind,
  metadata: {
    namespace,
    name,
  },
  data: {
    username: btoa(username),
    password: btoa(password),
  },
  type: 'Opaque',
});

const getBaremetalHostObject = (name, namespace, controller, secretName) => ({
  apiVersion: `${BaremetalHostModel.apiGroup}/${BaremetalHostModel.apiVersion}`,
  kind: BaremetalHostModel.kind,
  metadata: {
    name,
    namespace,
  },
  spec: {
    bmc: {
      address: controller,
      credentialsName: secretName,
    },
  },
});

export const createBaremetalHost = async (k8sCreate, formData, selectedNamespace) => {
  const { name, username, password, controller } = formData;

  const namespace = getName(selectedNamespace);
  const secretName = getSecretName(name.value);

  const secret = getSecret(secretName, namespace, username.value, password.value);
  const bmo = getBaremetalHostObject(name.value, namespace, controller.value, secretName);

  const results = [];

  results.push(await k8sCreate(SecretModel, secret));
  results.push(await k8sCreate(BaremetalHostModel, bmo));

  return results;
};
