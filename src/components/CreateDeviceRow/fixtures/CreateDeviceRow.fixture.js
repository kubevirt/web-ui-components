import { noop } from 'patternfly-react';

import { CreateDeviceRow } from '..';

import { Loading } from '../../Loading';

const deviceFields = {
  name: {
    id: 'device-name',
    required: true,
    title: 'DEVICE NAME',
  },
  dropdown: {
    id: 'device-dropdown',
    type: 'dropdown',
    defaultValue: '--- Device Dropdown ---',
    choices: ['fooValue1', 'fooValue'],
  },
};

const device = {
  name: {
    value: 'fooName',
  },
  dropdown: {
    value: 'fooValue',
  },
};

export default {
  component: CreateDeviceRow,
  props: {
    onChange: noop,
    onAccept: noop,
    onCancel: noop,
    LoadingComponent: Loading,
    deviceFields,
    device,
    columnSizes: {
      lg: 2,
    },
  },
};
