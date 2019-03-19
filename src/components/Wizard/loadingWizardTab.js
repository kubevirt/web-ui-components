import React from 'react';

import { Loading } from '../Loading';

/* eslint-disable react/prop-types */
export const loadingWizardTab = WizardPage => props =>
  Object.keys(props.loadingData).every(dataKey => props.loadingData[dataKey]) ? (
    <WizardPage {...props} {...props.loadingData} />
  ) : (
    <Loading text="Loading Page" />
  );
