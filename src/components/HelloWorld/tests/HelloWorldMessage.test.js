import createTestContext from '../../../cosmos/enzyme';
import fixture from '../fixtures/HelloWorldMessage.fixture';

const { mount, getWrapper } = createTestContext({ fixture });

beforeEach(mount);

test('renders hello world', () => {
  expect(getWrapper().text()).toEqual('Hello World!');
});

test('matches snapshot', () => {
  expect(getWrapper()).toMatchSnapshot();
});
