import {
  EnhancedK8sMethods,
  HistoryItem,
  HISTORY_TYPE_CREATE,
  HISTORY_TYPE_DELETE,
  HISTORY_TYPE_PATCH,
  HISTORY_TYPE_NOT_FOUND,
} from '../enhancedK8sMethods';
import { K8sCreateError, K8sPatchError, K8sKillError, K8sMultipleErrors } from '../errors';

import { fullVm } from '../../../tests/mocks/vm/vm.mock';
import { cloudInitTestVm } from '../../../tests/mocks/vm/cloudInitTestVm.mock';
import { VirtualMachineModel } from '../../../models';

const mockPatch = {
  additionalData: 'testData',
};

const disableHistoryOpts = { disableHistory: true };
const buildMethods = () =>
  new EnhancedK8sMethods({
    k8sCreate: (kind, data) => Promise.resolve(data),
    k8sGet: (kind, data) => Promise.resolve(data),
    k8sPatch: (kind, data, patch) => Promise.resolve({ ...data, ...patch }),
    k8sKill: (kind, data) => Promise.resolve(data),
  });

const buildErrorMethods = () =>
  new EnhancedK8sMethods({
    k8sCreate: () => Promise.reject(new Error('create failed')),
    k8sPatch: () => Promise.reject(new Error('patch failed')),
    k8sKill: () => Promise.reject(new Error('delete failed')),
  });

const expectHistory = (history, expectedHistory) => {
  expect(history).toHaveLength(expectedHistory.length);

  expectedHistory.forEach((expectHistoryItem, idx) => {
    expect(history[idx]).toEqual(expectHistoryItem);
  });
};

describe('enhancedK8sMethods.js', () => {
  it('records history and shows actualState', async () => {
    const methods = buildMethods();

    expect(methods.getHistory()).toHaveLength(0);
    expect(methods.getActualState()).toHaveLength(0);

    await methods.k8sCreate(VirtualMachineModel, fullVm);
    await methods.k8sPatch(VirtualMachineModel, fullVm, mockPatch);
    await methods.k8sKill(VirtualMachineModel, fullVm);
    const history = methods.getHistory();

    expectHistory(history, [
      new HistoryItem(HISTORY_TYPE_CREATE, fullVm),
      new HistoryItem(HISTORY_TYPE_PATCH, { ...fullVm, ...mockPatch }),
      new HistoryItem(HISTORY_TYPE_DELETE, fullVm),
    ]);

    expect(methods._history).toHaveLength(3);
  });

  it('shows actualState', async () => {
    const methods = buildMethods();

    await methods.k8sCreate(VirtualMachineModel, fullVm);
    await methods.k8sPatch(VirtualMachineModel, fullVm);
    await methods.k8sPatch(VirtualMachineModel, fullVm);
    await methods.k8sGet(VirtualMachineModel, fullVm);
    await methods.k8sKill(VirtualMachineModel, fullVm);
    await methods.k8sCreate(VirtualMachineModel, cloudInitTestVm);
    await methods.k8sPatch(VirtualMachineModel, cloudInitTestVm);
    await methods.k8sGet(VirtualMachineModel, cloudInitTestVm);
    await methods.k8sCreate(VirtualMachineModel, fullVm);
    await methods.k8sGet(VirtualMachineModel, fullVm);
    await methods.k8sPatch(VirtualMachineModel, fullVm, mockPatch);
    const actualState = methods.getActualState();

    expect(actualState).toHaveLength(2);
    expect(actualState[0]).toEqual(cloudInitTestVm);
    expect(actualState[1]).toEqual({ ...fullVm, ...mockPatch });
  });

  it('disables recording history', async () => {
    const methods = buildMethods();

    await methods.k8sCreate(VirtualMachineModel, fullVm, null, disableHistoryOpts);
    await methods.k8sPatch(VirtualMachineModel, fullVm, mockPatch, disableHistoryOpts);
    await methods.k8sKill(VirtualMachineModel, fullVm, null, null, disableHistoryOpts);

    expect(methods.getHistory()).toHaveLength(0);
    expect(methods._history).toHaveLength(0);

    await methods.k8sCreate(VirtualMachineModel, fullVm);
    expect(methods.getHistory()).toHaveLength(1);
  });

  it('k8s methods throw appropriate errors', async () => {
    const methods = buildErrorMethods();
    expect.assertions(3);

    methods.k8sCreate(VirtualMachineModel, fullVm).catch(error => expect(error).toBeInstanceOf(K8sCreateError));
    methods
      .k8sPatch(VirtualMachineModel, fullVm, mockPatch)
      .catch(error => expect(error).toBeInstanceOf(K8sPatchError));
    methods.k8sKill(VirtualMachineModel, fullVm).catch(error => expect(error).toBeInstanceOf(K8sKillError));
  });

  it('rollback', async () => {
    const methods = buildMethods();

    await methods.k8sCreate(VirtualMachineModel, fullVm);
    await methods.k8sPatch(VirtualMachineModel, fullVm);
    await methods.k8sCreate(VirtualMachineModel, cloudInitTestVm);

    const results = await methods.rollback();

    expect(results).toHaveLength(2);
    expect(methods.getActualState()).toHaveLength(0);

    expectHistory(methods.getHistory(), [
      new HistoryItem(HISTORY_TYPE_CREATE, fullVm),
      new HistoryItem(HISTORY_TYPE_PATCH, fullVm),
      new HistoryItem(HISTORY_TYPE_CREATE, cloudInitTestVm),
      // reverse order of deletion
      new HistoryItem(HISTORY_TYPE_DELETE, cloudInitTestVm),
      new HistoryItem(HISTORY_TYPE_DELETE, fullVm),
    ]);
  });

  it('rollback fails', async () => {
    const methods = buildMethods();
    methods._k8sKill = () => Promise.reject(new Error('delete failed'));

    await methods.k8sCreate(VirtualMachineModel, fullVm);
    await methods.k8sPatch(VirtualMachineModel, fullVm);
    await methods.k8sCreate(VirtualMachineModel, cloudInitTestVm);

    expect.assertions(4);
    await methods.rollback().catch(error => {
      expect(error).toBeInstanceOf(K8sMultipleErrors);
      expect(error.errors).toHaveLength(2);
    });

    // does not change EnhancedK8sMethods and results
    expect(methods.getActualState()).toHaveLength(2);
    expect(methods.getHistory()).toHaveLength(3);
  });

  it('rollback does not fail on 404', async () => {
    const methods = buildMethods();
    methods._k8sKill = () => Promise.reject(new K8sKillError('delete failed', { code: 404 }));

    await methods.k8sCreate(VirtualMachineModel, fullVm);
    await methods.k8sPatch(VirtualMachineModel, fullVm);
    await methods.k8sCreate(VirtualMachineModel, cloudInitTestVm);

    const results = await methods.rollback();
    expect(results).toHaveLength(2);
    expect(methods.getActualState()).toHaveLength(0);

    expectHistory(methods.getHistory(), [
      new HistoryItem(HISTORY_TYPE_CREATE, fullVm),
      new HistoryItem(HISTORY_TYPE_PATCH, fullVm),
      new HistoryItem(HISTORY_TYPE_CREATE, cloudInitTestVm),
      new HistoryItem(HISTORY_TYPE_NOT_FOUND, cloudInitTestVm),
      new HistoryItem(HISTORY_TYPE_NOT_FOUND, fullVm),
    ]);
  });
});
