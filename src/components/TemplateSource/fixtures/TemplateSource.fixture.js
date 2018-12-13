import { TemplateSource } from '../TemplateSource';
import { urlTemplate } from '../../../k8s/mock_user_templates';

export default [
  {
    component: TemplateSource,
    props: {
      template: urlTemplate,
      tooltipPlacement: 'bottom',
    },
  },
];
