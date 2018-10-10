import { shallow } from 'enzyme/build/index';
import createTestContext from '../../../cosmos/enzyme';
import fixture, { getPositiveNumber } from '../fixtures/FormFactory.fixture';

const { mount, getWrapper } = createTestContext({ fixture });

describe('<FormFactory />', () => {
  beforeEach(mount);

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

describe('getFormElement', () => {
  it('renders correctly', () => {
    const component = shallow(getPositiveNumber());
    expect(component).toMatchSnapshot();
  });
});
