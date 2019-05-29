import { fromJS } from 'immutable';

import { getV2vVMwareDeploymentStatus, getSimpleV2vVMwareDeploymentStatus } from '../v2vVMwareDeploymentStatus';
import v2vVMwareDeploymentFixtures from '../fixtures/v2vVMwareDeploymentStatus.fixture';

describe('getV2vVMwareDeploymentStatus()', () => {
  v2vVMwareDeploymentFixtures.forEach((fixture, idx) => {
    const resultStatus = fixture.expected;
    it(`return status correctly ${idx} (${resultStatus})`, () => {
      expect(getV2vVMwareDeploymentStatus(fixture.deployment, fixture.deploymentPods).status).toBe(resultStatus);
      expect(getV2vVMwareDeploymentStatus(fromJS(fixture.deployment), fromJS(fixture.deploymentPods)).status).toBe(
        resultStatus
      );
      expect(getSimpleV2vVMwareDeploymentStatus(fixture.deployment, fixture.deploymentPods)).toBe(resultStatus);
    });
  });
});
