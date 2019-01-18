import React from 'react';
import { shallow } from 'enzyme';

import { TypeAhead } from '../TypeAhead';

const testTypeAheadContol = defaultValue => (
  <TypeAhead
    id="typeahead-1"
    defaultValue={defaultValue}
    placeholder="Select a record..."
    labelKey="name"
    choices={[{ id: 1, name: 'Record 1' }, { id: 2, name: 'Record 2' }]}
    onChange={() => {}}
    onBlur={() => {}}
  />
);

describe('<TextAreaControl />', () => {
  it('renders correctly', () => {
    const component = shallow(testTypeAheadContol());
    expect(component).toMatchSnapshot();
  });
  it('renders a default value', () => {
    const component = shallow(testTypeAheadContol('Record 1'));
    expect(component).toMatchSnapshot();
  });
});
