import React from 'react';
import { shallow } from 'enzyme';
import { Loading } from '../Loading';
import LoadingFixture from '../fixtures/Loading.fixture';

const testLoading = () => <Loading {...LoadingFixture.props} />;

describe('<Loading />', () => {
  it('renders correctly', () => {
    const component = shallow(testLoading());
    expect(component).toMatchSnapshot();
  });
});
