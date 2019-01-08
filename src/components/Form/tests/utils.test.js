import { checkboxHandler, eventValueHandler } from '../utils';

const checkFuntion = fn => expect(typeof fn === 'function').toBeTruthy();

describe('<TextControl />', () => {
  it('checks handlers', () => {
    checkFuntion(checkboxHandler(jest.fn()));
    checkFuntion(eventValueHandler(jest.fn()));

    expect(eventValueHandler()).toBeNull();
    expect(checkboxHandler()).toBeNull();
    expect(eventValueHandler()).toBeNull();
  });
});
