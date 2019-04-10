import { ServiceAccountModel } from '../../../models';

export const buildServiceAccount = ({ namespace, generateName, name }) => ({
  apiVersion: ServiceAccountModel.apiVersion,
  kind: ServiceAccountModel.kind,
  metadata: {
    namespace,
    generateName,
    name,
  },
});
