import { Button } from 'patternfly-react';

export const flushPromises = () => new Promise(resolve => setImmediate(resolve));

export const openDropdown = (dropdown, dropdownSelector) => {
  const opened = dropdown
    .find('.pf-c-dropdown__toggle')
    .simulate('click')
    .update(); // triggers render() on mounted component (can be a parent of the Dropdown)

  if (dropdownSelector) {
    // update returns parent component, not the Dropdown
    return opened.find(dropdownSelector);
  }
  return opened;
};

export const selectDropdownItem = (dropdown, itemText, dropdownSelector) => {
  const opened = openDropdown(dropdown, dropdownSelector);

  opened
    .find('.pf-c-dropdown__menu-item')
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
