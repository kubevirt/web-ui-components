import { isVmiRunning } from '../vmi';
import { isVmRunning } from './selectors';

export const isVmStarting = (vm, vmi) => isVmRunning(vm) && !isVmiRunning(vmi);
