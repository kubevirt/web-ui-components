import React from 'react';
import { shallow } from 'enzyme';

import { loadingWizardTab } from '../loadingWizardTab';
import { Loading } from '../../Loading';

const DummyComponent = () => {};

test('loadingWizardTab', () => {
  const LoadingDummyComponent = loadingWizardTab(DummyComponent);
  const loadingProps = {
    loadingData: {
      foo: undefined,
      foo1: undefined,
    },
    otherProp: 'prop',
  };

  const component = shallow(<LoadingDummyComponent {...loadingProps} />);
  expect(component.find(Loading)).toHaveLength(1);
  expect(component.find(DummyComponent)).toHaveLength(0);

  const loadingData = {
    foo: 'foo',
    foo1: 'foo1',
  };

  component.setProps({ loadingData });
  expect(component.find(Loading)).toHaveLength(0);
  expect(component.find(DummyComponent)).toHaveLength(1);
  expect(component.find(DummyComponent).props().otherProp).toEqual(loadingProps.otherProp);
  expect(component.find(DummyComponent).props().foo).toEqual(loadingData.foo);
  expect(component.find(DummyComponent).props().foo1).toEqual(loadingData.foo1);
});
