import React from 'react';
import { shallow } from 'enzyme';
import { FormControl, KEY_CODES as PF_KEY_CODES } from 'patternfly-react';
import { Integer } from '../Integer';
import { KEY_CODES } from '../../../constants/keys';

const testInteger = (value = -5, positive = false, nonNegative = false) => (
  <Integer id="1" value={value} onChange={jest.fn()} positive={positive} nonNegative={nonNegative} />
);

const getEvent = keyCode => ({
  keyCode,
  preventDefault: jest.fn(),
  target: {
    value: ''
  }
});

const testValidity = (component, keyCode, validity) => {
  const event = getEvent(keyCode);
  expect(
    component
      .find(FormControl)
      .props()
      .onKeyDown(event)
  ).toBe(validity);

  if (validity) {
    expect(event.preventDefault).not.toHaveBeenCalled();
  } else {
    expect(event.preventDefault).toHaveBeenCalled();
  }
};

const testValidKey = (component, keyCode) => testValidity(component, keyCode, true);

const testInValidKey = (component, keyCode) => testValidity(component, keyCode, false);

describe('<Integer />', () => {
  it('renders correctly', () => {
    const component = shallow(testInteger());
    expect(component).toMatchSnapshot();
  });

  it('renders positive correctly', () => {
    const component = shallow(testInteger(5, true));
    expect(component).toMatchSnapshot();
  });

  it('renders nonNegative correctly', () => {
    const component = shallow(testInteger(0, false, true));
    expect(component).toMatchSnapshot();
  });

  it('integer onKeyDown', () => {
    const component = shallow(testInteger());

    testValidKey(component, KEY_CODES['0']);
    testValidKey(component, KEY_CODES.NUMPAD['1']);
    testValidKey(component, KEY_CODES.NUMPAD.SUBTRACT);
    testValidKey(component, KEY_CODES.HYPHEN_MINUS);
    testValidKey(component, KEY_CODES.MINUS);
    testValidKey(component, KEY_CODES.LEFT_KEY);
    testValidKey(component, KEY_CODES.SHIFT);
    testValidKey(component, KEY_CODES.BACKSPACE);
    testInValidKey(component, PF_KEY_CODES.A);
  });

  it('nonNegative integer onKeyDown', () => {
    const component = shallow(testInteger(0, false, true));

    testValidKey(component, KEY_CODES['0']);
    testValidKey(component, KEY_CODES.NUMPAD['1']);
    testInValidKey(component, KEY_CODES.NUMPAD.SUBTRACT);
    testInValidKey(component, KEY_CODES.HYPHEN_MINUS);
    testInValidKey(component, KEY_CODES.MINUS);
    testValidKey(component, KEY_CODES.LEFT_KEY);
    testValidKey(component, KEY_CODES.SHIFT);
    testValidKey(component, KEY_CODES.BACKSPACE);
    testInValidKey(component, PF_KEY_CODES.A);
  });

  it('positive integer onKeyDown', () => {
    const component = shallow(testInteger(1, true));

    testValidKey(component, KEY_CODES['0']); // is set in timeout after that

    testValidKey(component, KEY_CODES.NUMPAD['1']);
    testInValidKey(component, KEY_CODES.NUMPAD.SUBTRACT);
    testInValidKey(component, KEY_CODES.HYPHEN_MINUS);
    testInValidKey(component, KEY_CODES.MINUS);
    testValidKey(component, KEY_CODES.LEFT_KEY);
    testValidKey(component, KEY_CODES.SHIFT);
    testValidKey(component, KEY_CODES.BACKSPACE);
    testInValidKey(component, PF_KEY_CODES.A);
  });
});
