import { formatBytes, formatCores, formatNetTraffic } from '../utils';

describe('unit format functions', () => {
  it('formats bytes', () => {
    expect(formatBytes(2)).toEqual({ value: 2, unit: 'B' });
    expect(formatBytes(3 * 1024)).toEqual({ value: 3, unit: 'KiB' });
    expect(formatBytes(3 * 1024 ** 2)).toEqual({ value: 3, unit: 'MiB' });
    expect(formatBytes(3 * 1024 ** 3)).toEqual({ value: 3, unit: 'GiB' });
    expect(formatBytes(3 * 1024 ** 4)).toEqual({ value: 3, unit: 'TiB' });
    expect(formatBytes(3 * 1024 ** 5)).toEqual({ value: 3, unit: 'PiB' });
    expect(formatBytes(3 * 1024 ** 6)).toEqual({ value: 3 * 1024, unit: 'PiB' });
    expect(formatBytes(3 * 1024 ** 7)).toEqual({ value: 3 * 1024 ** 2, unit: 'PiB' });
  });
  it('formats bytes in preferred units', () => {
    expect(formatBytes(3 * 1024 * 1024, 'KiB')).toEqual({ value: 3 * 1024, unit: 'KiB' });
  });
  it('formats cores', () => {
    expect(formatCores(2)).toEqual({ value: 2, unit: 'cores' });
  });
  it('formats net traffic', () => {
    expect(formatNetTraffic(3 * 1024 * 1024)).toEqual({ value: 3, unit: 'MiBps' });
  });
});
