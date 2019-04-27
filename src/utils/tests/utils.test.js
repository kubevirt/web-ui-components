import { formatBytes, formatCores, formatNetTraffic, hasObjectTruthyValue, objectMerge } from '../utils';

describe('unit format functions', () => {
  it('formats bytes', () => {
    expect(formatBytes(2)).toEqual({ value: 2, unit: 'B' });
    expect(formatBytes(3 * 1024)).toEqual({ value: 3, unit: 'Ki' });
    expect(formatBytes(3 * 1024 ** 2)).toEqual({ value: 3, unit: 'Mi' });
    expect(formatBytes(3 * 1024 ** 3)).toEqual({ value: 3, unit: 'Gi' });
    expect(formatBytes(3 * 1024 ** 4)).toEqual({ value: 3, unit: 'Ti' });
    expect(formatBytes(3 * 1024 ** 5)).toEqual({ value: 3, unit: 'Pi' });
    expect(formatBytes(3 * 1024 ** 6)).toEqual({ value: 3 * 1024, unit: 'Pi' });
    expect(formatBytes(3 * 1024 ** 7)).toEqual({ value: 3 * 1024 ** 2, unit: 'Pi' });
  });
  it('formats bytes in preferred units', () => {
    expect(formatBytes(3 * 1024 * 1024, 'Ki')).toEqual({ value: 3 * 1024, unit: 'Ki' });
  });
  it('formats cores', () => {
    expect(formatCores(2)).toEqual({ value: 2, unit: 'cores' });
  });
  it('formats net traffic', () => {
    expect(formatNetTraffic(3 * 1000 * 1000)).toEqual({ value: 3, unit: 'MBps' });
  });
});

describe('objectMerge', () => {
  it('works with arrays', () => {
    const destination = {
      a: {},
      b: {
        e: {},
        array: [1, 2, 3, 4],
      },
      c: {
        f: {},
      },
      d: {},
    };

    const updateOne = {
      b: {
        e: {
          c: 9,
        },
        array: [3, 5],
      },
      d: {
        g: {
          i: 10,
        },
      },
    };

    const updateTwo = {
      d: {
        g: {
          h: 5,
        },
      },
    };

    const result = {
      a: {},
      b: {
        e: {
          c: 9,
        },
        array: [3, 5],
      },
      c: {
        f: {},
      },
      d: {
        g: {
          h: 5,
          i: 10,
        },
      },
    };

    expect(objectMerge(destination, updateOne, updateTwo)).toEqual(result);
  });
});

describe('hasObjectTruthyValue', () => {
  it('does not have', () => {
    expect(hasObjectTruthyValue({ a: false, b: undefined, c: null })).toBeFalsy();
  });
  it('has', () => {
    expect(hasObjectTruthyValue({ a: false, b: undefined, c: null, d: true })).toBeTruthy();
  });
});
