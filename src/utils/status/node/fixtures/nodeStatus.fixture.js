import {
  NODE_STATUS_READY,
  NODE_STATUS_NOT_RESPONDING,
  NODE_STATUS_MEMORY_PRESSURE,
  NODE_STATUS_NETWORK_UNAVAILABLE,
  NODE_STATUS_NOT_READY,
} from '../constants';

const metadata = {
  name: 'my-node',
  namespace: 'my-namespace',
};

const getNode = (conditions = []) => ({
  metadata,
  status: {
    conditions,
  },
});

const getCondition = (type, status, message) => ({
  type,
  status,
  message,
});

const getResult = (status, message) => ({
  status,
  message,
});

export default [
  {
    node: getNode(),
    expected: getResult(NODE_STATUS_NOT_READY),
  },
  {
    node: getNode([getCondition('Ready', 'Unknown', 'test')]),
    expected: getResult(NODE_STATUS_NOT_RESPONDING, 'test'),
  },
  {
    node: getNode([getCondition('Ready', 'True'), getCondition('UnknownCondition', 'True', 'test')]),
    expected: getResult(NODE_STATUS_NOT_READY, 'test'),
  },
  {
    node: getNode([getCondition('Ready', 'True')]),
    expected: getResult(NODE_STATUS_READY),
  },
  // error
  {
    node: getNode([getCondition('NetworkUnavailable', 'True', 'test')]),
    expected: getResult(NODE_STATUS_NETWORK_UNAVAILABLE, 'test'),
  },
  // warn
  {
    node: getNode([getCondition('Ready', 'True'), getCondition('MemoryPressure', 'True', 'test')]),
    expected: getResult(NODE_STATUS_MEMORY_PRESSURE, 'test'),
  },
];
