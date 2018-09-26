import { Dropdown } from '..';

export default {
  component: Dropdown,
  props: {
    fieldKey: 'fieldKey',
    value: 'This is dropdown button',
    choices: ['choice1', 'choice2'],
    onChange: () => {}
  }
};
