import { Dropdown } from '../Dropdown';

export default [
  {
    component: Dropdown,
    props: {
      id: '1',
      value: 'This is dropdown button',
      choices: [{ name: 'choice1' }, { name: 'choice2' }],
      onChange: () => {},
    },
  },
  {
    component: Dropdown,
    props: {
      id: '1',
      value: 'This is dropdown button with tooltips',
      choices: [{ name: 'choice1' }, { name: 'choice2' }, { name: 'very long choice which needs to be shortened' }],
      withTooltips: true,
      onChange: () => {},
    },
  },
];
