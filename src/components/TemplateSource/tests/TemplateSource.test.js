import React from 'react';
import { shallow } from 'enzyme';
import { OverlayTrigger } from 'patternfly-react';

import { TemplateSource } from '../TemplateSource';
import { containerTemplate, urlTemplate, pxeTemplate } from '../../../k8s/mock_user_templates';

const testTemplateSource = template => <TemplateSource template={template} />;

describe('<TemplateSource />', () => {
  it('renders correctly', () => {
    const component = shallow(testTemplateSource(containerTemplate));
    expect(component).toMatchSnapshot();
  });

  it('renders overlay for URL and Registry, not for PXE', () => {
    const component = shallow(testTemplateSource(containerTemplate));
    expect(component.find(OverlayTrigger).exists()).toBeTruthy();

    component.setProps({
      template: pxeTemplate,
    });

    expect(component.find(OverlayTrigger).exists()).toBeFalsy();

    component.setProps({
      template: urlTemplate,
    });

    expect(component.find(OverlayTrigger).exists()).toBeTruthy();
  });
});
