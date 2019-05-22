import { formatBytes, formatCores, formatNetTraffic } from '../utils';

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
