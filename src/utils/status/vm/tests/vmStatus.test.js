import { getVmStatus, getSimpleVmStatus } from '../vmStatus';
import vmFixtures from '../fixtures/VmStatus.fixture';

describe('getVmStatus()', () => {
  it('matches API objects correctly', () => {
    for (let index = 0; index < vmFixtures.length; index++) {
      const fixture = vmFixtures[index];
      expect(getVmStatus(fixture, fixture.podFixture, fixture.importerPodsFixture, fixture.migration).status).toBe(
        fixture.expectedDetail || fixture.expected
      );
    }
  });
});

describe('getSimpleVmStatus()', () => {
  it('return simple status correctly', () => {
    for (let index = 0; index < vmFixtures.length; index++) {
      const fixture = vmFixtures[index];
      expect(getSimpleVmStatus(fixture, fixture.podFixture, fixture.importerPodsFixture, fixture.migration)).toBe(
        fixture.expected
      );
    }
  });
});
