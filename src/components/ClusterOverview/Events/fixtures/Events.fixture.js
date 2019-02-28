import React from 'react';

import { Events } from '../Events';

export const eventsData = {
  Component: () => <div>Requires component from tectonic</div>,
  loaded: true,
};

export default {
  component: Events,
  props: { ...eventsData },
};
