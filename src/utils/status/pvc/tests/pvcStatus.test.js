import { getPvcStatus } from '../pvcStatus';
import pvcFixtures from '../fixtures/pvcStatus.fixture';

describe('getPvcStatus()', () => {
  pvcFixtures.forEach((fixture, idx) => {
    it(`matches status ${idx} (${fixture.expected.status})`, () => {
      expect(getPvcStatus(fixture.pvc)).toEqual(fixture.expected);
    });
  });
});
