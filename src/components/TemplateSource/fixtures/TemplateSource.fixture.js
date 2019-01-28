import { TemplateSource } from '../TemplateSource';
import { urlTemplate, urlTemplateDataVolume } from '../../../tests/mocks/user_template/url.mock';

export default [
  {
    component: TemplateSource,
    props: {
      template: urlTemplate,
      tooltipPlacement: 'bottom',
      dataVolumes: [urlTemplateDataVolume],
    },
  },
];
