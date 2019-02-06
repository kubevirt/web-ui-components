import { SecretModel } from '../models';
import { NAMESPACE_KEY } from '../components/Wizard/CreateVmWizard/constants';
import { VCENTER_TYPE_LABEL } from '../constants';

export const getImportProviderSecretObject = () => {
  const secretName = `${url}-${username}`; // TODO: fix & improve
  const secret = {
    kind: SecretModel.kind,
    apiVersion: SecretModel.apiVersion,
    metadata: {
      name: secretName,
      namespace: getSetting(NAMESPACE_KEY),
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