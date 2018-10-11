import createTestContext from '../../../cosmos/enzyme';
import fixture from '../fixtures/ButtonWithIcon.fixture';

const { mount, getWrapper } = createTestContext({ fixture });

beforeEach(mount);

test('renders Button With Icon', () => {
  expect(getWrapper().text()).toEqual('Button With Icon');
});

test('matches snapshot', () => {
  expect(getWrapper()).toMatchSnapshot();
});
