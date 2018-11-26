import React from 'react';

export const dummyFixture = {
  vmi: {},
  host: 'dummy.host',
  path: 'dummy.path',
  WSFactory: () => {},
};

export default {
  component: ({ text }) => <div>{text}</div> /* eslint-disable-line react/prop-types */,
  props: {
    text: 'SerialConsoleConnector skipped due to complexity',
  },
};
