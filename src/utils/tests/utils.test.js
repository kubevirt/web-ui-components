import { formatBytes, formatCores, formatNetTraffic } from '../utils';

describe('unit format functions', () => {
  it('formats bytes', () => {
    expect(formatBytes(2)).toEqual({ value: 2, unit: 'B' });
    expect(formatBytes(3 * 1024)).toEqual({ value: 3, unit: 'KB' });
    expect(formatBytes(3 * 1024 ** 2)).toEqual({ value: 3, unit: 'MB' });
    expect(formatBytes(3 * 1024 ** 3)).toEqual({ value: 3, unit: 'GB' });
    expect(formatBytes(3 * 1024 ** 4)).toEqual({ value: 3, unit: 'TB' });
    expect(formatBytes(3 * 1024 ** 5)).toEqual({ value: 3, unit: 'PB' });
    expect(formatBytes(3 * 1024 ** 6)).toEqual({ value: 3 * 1024, unit: 'PB' });
    expect(formatBytes(3 * 1024 ** 7)).toEqual({ value: 3 * 1024 ** 2, unit: 'PB' });
  });
  it('formats bytes in preferred units', () => {
    expect(formatBytes(3 * 1024 * 1024, 'KB')).toEqual({ value: 3 * 1024, unit: 'KB' });
  });
  it('formats cores', () => {
    expect(formatCores(2)).toEqual({ value: 2, unit: 'cores' });
  });
  it('formats net traffic', () => {
    expect(formatNetTraffic(3 * 1024 * 1024)).toEqual({ value: 3, unit: 'MBps' });
  });
});
