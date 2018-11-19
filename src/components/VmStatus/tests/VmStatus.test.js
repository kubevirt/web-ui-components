import React from 'react';
import { render, shallow } from 'enzyme';
import { VmStatus, getVmStatusDetail, getVmStatus } from '../index';
import { vmFixtures } from '../fixtures/VmStatus.fixture';

describe('<VmStatus vm />', () => {
  it('renders correctly', () => {
    const component = render(<VmStatus vm={vmFixtures[0]} />);
    expect(component).toMatchSnapshot();
  });
});

describe('getVmStatusDetail()', () => {
  it('macthes API objects correctly', () => {
    for (let index = 0; index < vmFixtures.length; index++) {
      expect(getVmStatusDetail(vmFixtures[index], vmFixtures[index].podFixture).status).toBe(
        vmFixtures[index].expectedDetail || vmFixtures[index].expected
      );
    }
  });
});

describe('<VmStatus vm pod />', () => {
  it('renders correctly', () => {
    for (let index = 0; index < vmFixtures.length; index++) {
      expect(shallow(<VmStatus vm={vmFixtures[index]} pod={vmFixtures[index].podFixture} />)).toMatchSnapshot();
      expect(getVmStatus(vmFixtures[index], vmFixtures[index].podFixture)).toBe(vmFixtures[index].expected);
    }
  });
});
