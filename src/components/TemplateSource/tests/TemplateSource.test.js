import React from 'react';
import { shallow } from 'enzyme';

import { TemplateSource } from '../TemplateSource';
import { default as urlFixtures } from '../fixtures/TemplateSource.fixture';
import { containerTemplate, pxeTemplate } from '../../../tests/mocks/user_template';

const testTemplateSource = ({ props }) => <TemplateSource {...props} />;

describe('<TemplateSource />', () => {
  it('renders correctly', () => {
    const tests = [
      ...urlFixtures,
      {
        props: {
          template: pxeTemplate,
        },
      },
      {
        props: {
          template: pxeTemplate,
          detailed: true,
        },
      },
      {
        props: {
          template: containerTemplate,
        },
      },
      {
        props: {
          template: containerTemplate,
          detailed: true,
        },
      },
    ];
    tests.forEach(fixture => {
      const component = shallow(testTemplateSource(fixture));
      expect(component).toMatchSnapshot();
    });
  });
});
