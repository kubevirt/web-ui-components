import { SecretModel } from '../../../../models';
import { CONVERSION_GENERATE_NAME } from '../../../requests/v2v';

export const buildConversionPodSecret = ({ namespace, data }) => ({
  kind: SecretModel.kind,
  apiVersion: SecretModel.apiVersion,
  metadata: {
    generateName: CONVERSION_GENERATE_NAME,
    namespace,
  },
  type: 'Opaque',
  data: {
    'conversion.json': btoa(JSON.stringify(data)),
  },
});
