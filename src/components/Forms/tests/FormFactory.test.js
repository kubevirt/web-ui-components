import createTestContext from '../../../cosmos/enzyme';
import fixture from '../fixtures/FormFactory.fixture';

const { mount, getWrapper } = createTestContext({ fixture });

beforeEach(mount);

describe('<FormFactory />', () => {
  it('renders correctly', () => {
    expect(getWrapper()).toMatchSnapshot();
  });
  /*
  it('required field is marked', () => {
    expect(getWrapper().find('.required-pf')).toHaveLength(1);
  });
  */
  it('not visible field is not rendered', () => {
    expect(
      getWrapper()
        .find('.control-label')
        .find(node => node.text() === 'invisibleField')
    ).toHaveLength(0);
  });
});
