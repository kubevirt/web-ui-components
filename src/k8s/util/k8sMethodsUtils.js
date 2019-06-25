import * as _ from 'lodash';

import { getGeneratedName, getKind, getName } from '../../selectors';
import { getFullResourceId } from '../../utils';
import {
  ERROR,
  CREATED,
  CREATED_WITH_CLEANUP,
  CREATED_WITH_FAILED_CLEANUP,
  FAILED_TO_CREATE,
  FAILED_TO_PATCH,
} from '../../utils/strings';

const k8sObjectToResult = ({ obj, content, message, isExpanded, isError }) => ({
  title: [getKind(obj), getName(obj) || getGeneratedName(obj), message].filter(a => a).join(' '),
  content,
  isExpanded,
  isError,
});

export const cleanupAndGetResults = async (enhancedK8sMethods, { message, failedObject, failedPatches }) => {
  const actualState = enhancedK8sMethods.getActualState(); // actual state will differ after cleanup

  let errors;
  try {
    await enhancedK8sMethods.rollback();
  } catch (e) {
    // eslint-disable-next-line prefer-destructuring
    errors = e.errors;
  }

  const failedObjectsMap = {};

  if (errors) {
    errors.forEach(error => {
      failedObjectsMap[getFullResourceId(error.failedObject)] = error.failedObject;
    });
  }

  const cleanupArray = actualState
    .map(resource => {
      const failedToCleanup = !!failedObjectsMap[getFullResourceId(resource)];

      return k8sObjectToResult({
        obj: resource,
        content: resource,
        message: failedToCleanup ? CREATED_WITH_FAILED_CLEANUP : CREATED_WITH_CLEANUP,
        isExpanded: failedToCleanup,
        isError: failedToCleanup,
      });
    })
    .reverse();

  const results = [
    k8sObjectToResult({
      content: message,
      message: ERROR,
      isExpanded: true,
      isError: true,
    }),
    k8sObjectToResult({
      obj: failedObject,
      content: failedPatches || failedObject,
      message: failedPatches ? FAILED_TO_PATCH : FAILED_TO_CREATE,
      isError: true,
    }),
    ...cleanupArray,
  ];

  return {
    valid: false,
    results,
  };
};

export const getResults = enhancedK8sMethods => ({
  valid: true,
  results: enhancedK8sMethods
    .getActualState()
    .map(obj => k8sObjectToResult({ obj, content: obj, message: CREATED }))
    .reverse(),
});

export const errorsFirstSort = results =>
  results
    .map((result, sortIndex) => ({ ...result, sortIndex }))
    // move errors to the top
    .sort((a, b) => {
      if (a.isError === b.isError) {
        return a.sortIndex - b.sortIndex;
      }
      return a.isError ? -1 : 1;
    });

export const flatten = (props, resourceName, defaultValue) => _.get(props[resourceName], 'data', defaultValue);
