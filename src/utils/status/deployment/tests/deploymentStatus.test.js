import { getDeploymentStatus, getSimpleDeploymentStatus } from '../deploymentStatus';
import deploymentFixtures from '../fixtures/deploymentStatus.fixture';

describe('getDeploymentStatus()', () => {
  deploymentFixtures.forEach((fixture, idx) => {
    const resultStatus = fixture.expected;
    it(`return status correctly ${idx} (${resultStatus})`, () => {
      expect(getDeploymentStatus(fixture.deployment).status).toBe(resultStatus);
      expect(getSimpleDeploymentStatus(fixture.deployment)).toBe(resultStatus);
    });
  });
});
