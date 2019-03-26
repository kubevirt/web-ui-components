import { getVmStatus, getSimpleVmStatus } from '../vmStatus';
import vmFixtures from '../fixtures/vmStatus.fixture';

describe('getVmStatus()', () => {
  vmFixtures.forEach((fixture, idx) => {
    const resultStatus = fixture.expected || fixture.expectedSimple;
    it(`return status correctly ${idx} (${resultStatus})`, () => {
      expect(getVmStatus(fixture.vm, fixture.podsFixture, fixture.migrations, fixture.importerPodsFixture).status).toBe(
        resultStatus
      );
    });
  });
});

describe('getSimpleVmStatus()', () => {
  vmFixtures.forEach((fixture, idx) => {
    it(`return simple status correctly ${idx} (${fixture.expectedSimple})`, () => {
      expect(getSimpleVmStatus(fixture.vm, fixture.podsFixture, fixture.migrations, fixture.importerPodsFixture)).toBe(
        fixture.expectedSimple
      );
    });
  });
});
