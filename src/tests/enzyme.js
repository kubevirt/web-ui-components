import { MenuItem, Button } from 'patternfly-react';

export const flushPromises = () => new Promise(resolve => setImmediate(resolve));

export const selectDropdownItem = (dropdown, itemText) => {
  dropdown
    .find(MenuItem)
    .findWhere(item => item.text() === itemText)
    .find('a')
    .simulate('click');
};

export const getButton = (component, buttonText) =>
  component
    .find(Button)
    .findWhere(button => button.text() === buttonText)
    .find('.btn');

export const setInput = (input, value) => input.simulate('change', { target: { value } });

export const clickButton = (component, buttonText) => getButton(component, buttonText).simulate('click');

export const setCheckbox = (checkbox, checked) => checkbox.prop('onChange')(checked);
