import { TemplateSource } from '../TemplateSource';
import { urlTemplate, urlTemplateDataVolume } from '../../../tests/mocks/user_template/url.mock';

export default [
  {
    name: 'inline',
    component: TemplateSource,
    props: {
      template: urlTemplate,
      dataVolumes: [urlTemplateDataVolume],
    },
  },
  {
    name: 'detailed',
    component: TemplateSource,
    props: {
      template: urlTemplate,
      dataVolumes: [urlTemplateDataVolume],
      detailed: true,
    },
  },
];
