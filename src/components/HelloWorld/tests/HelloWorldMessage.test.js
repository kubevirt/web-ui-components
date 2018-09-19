import createTestContext from 'react-cosmos-test/enzyme';
import fixture from '../fixtures/HelloWorldMessage.fixture';

const { mount, getWrapper } = createTestContext({ fixture });

beforeEach(mount);

test('renders hello world', () => {
  expect(getWrapper().text()).toEqual('Hello World!');
});

test('matches snapshot', () => {
  expect(getWrapper()).toMatchSnapshot();
});
