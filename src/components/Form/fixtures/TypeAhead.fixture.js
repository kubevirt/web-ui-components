import { TypeAhead } from '../TypeAhead';

export default {
  component: TypeAhead,
  props: {
    id: 'typeahead-1',
    placeholder: 'Select an operating system...',
    choices: ['fedora29', 'fedora28', 'fedora27', 'fedora26', 'rhel7.0', 'ubuntu18.04', 'win10'],
    onChange: () => {},
  },
};
