import { getNodeStatus } from '../nodeStatus';
import nodeFixtures from '../fixtures/nodeStatus.fixture';

describe('getNodeStatus()', () => {
  nodeFixtures.forEach((fixture, idx) => {
    it(`matches status ${idx} (${fixture.expected.status})`, () => {
      expect(getNodeStatus(fixture.node)).toEqual(fixture.expected);
    });
  });
});
