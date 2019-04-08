import { getPvStatus } from '../pvStatus';
import pvFixtures from '../fixtures/pvStatus.fixture';

describe('getPvStatus()', () => {
  pvFixtures.forEach((fixture, idx) => {
    it(`matches status ${idx} (${fixture.expected.status})`, () => {
      expect(getPvStatus(fixture.pv)).toEqual(fixture.expected);
    });
  });
});
