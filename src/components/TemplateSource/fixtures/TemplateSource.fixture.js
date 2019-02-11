import { TemplateSource } from '../TemplateSource';
import { urlTemplate } from '../../../tests/mocks/user_template';

export default [
  {
    component: TemplateSource,
    props: {
      template: urlTemplate,
      tooltipPlacement: 'bottom',
    },
  },
];
