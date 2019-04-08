import React from 'react';

import EventsBody from '../EventsBody';

export default {
  component: EventsBody,
  props: {
    children: (
      <React.Fragment>
        <div>Requires component from tectonic</div>
      </React.Fragment>
    ),
    id: 'events-body',
  },
};
