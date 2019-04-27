import React from 'react';

import PropTypes from 'prop-types';

import { Loading } from '../../Loading';

export const LoadingTab = ({ children, text, ...loadingData }) =>
  Object.keys(loadingData).every(dataKey => loadingData[dataKey]) ? children : <Loading key="loading" text={text} />;

LoadingTab.defaultProps = {
  text: 'Loading Page',
  children: null,
};

LoadingTab.propTypes = {
  text: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};
