import { getHostStatus, getSimpleHostStatus } from '../hostStatus';
import hostFixtures from '../fixtures/hostStatus.fixture';

describe('getHostStatus()', () => {
  hostFixtures.forEach((fixture, idx) => {
    const resultStatus = fixture.expectedSimple;
    it(`return status correctly ${idx} (${resultStatus})`, () => {
      expect(getHostStatus(fixture.host).status).toBe(resultStatus);
    });
  });
});

describe('getSimpleHostStatus()', () => {
  hostFixtures.forEach((fixture, idx) => {
    const resultStatus = fixture.expectedSimple;
    it(`return status correctly ${idx} (${resultStatus})`, () => {
      expect(getSimpleHostStatus(fixture.host)).toBe(resultStatus);
    });
  });
});
