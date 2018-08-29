import createTestContext from '../../../cosmos/enzyme';
import fixture from '../fixtures/Dropdown.fixture';

const { mount, getWrapper } = createTestContext({ fixture });

beforeEach(mount);

describe('<DropdownControl />', () => {
  it('renders correctly', () => {
    expect(getWrapper()).toMatchSnapshot();
  });
});
