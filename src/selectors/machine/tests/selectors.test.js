import fixtures from '../fixtures/selectors.fixture';
import { getMachineRole } from '../selectors';

describe('getMachineRole selector', () => {
  it('returns machine role', () => {
    expect(getMachineRole(fixtures[0].machine)).toEqual('worker');
  });
});
