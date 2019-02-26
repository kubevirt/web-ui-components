import { basicSettingsImportVmwareNewConnection } from '../../../../../tests/forms_mocks/basicSettings.mock';
import { isNewVmwareInstanceSelected } from '../vmware';

describe('VMWare form section', () => {
  it('detects selection of new connection', () => {
    expect(isNewVmwareInstanceSelected(basicSettingsImportVmwareNewConnection)).toBe(true);
  });
});
