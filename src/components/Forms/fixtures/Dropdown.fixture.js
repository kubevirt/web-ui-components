import { Dropdown } from '..';

export default {
  component: Dropdown,
  props: {
    id: '1',
    value: 'This is dropdown button',
    choices: [{ name: 'choice1' }, { name: 'choice2' }],
    onChange: () => {}
  }
};
