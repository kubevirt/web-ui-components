import { getPodStatus } from '../podStatus';
import podFixtures from '../fixtures/podStatus.fixture';

describe('getPodStatus()', () => {
  podFixtures.forEach((fixture, idx) => {
    it(`matches status ${idx} (${fixture.expected.status})`, () => {
      expect(getPodStatus(fixture.pod)).toEqual(fixture.expected);
    });
  });
});
