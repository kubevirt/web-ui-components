import React from 'react';
import { get } from 'lodash';
import PropTypes from 'prop-types';

export const ClusterOverviewContext = React.createContext({});

export const ClusterOverviewContextGenericConsumer = ({ Component, dataPath }) => (
  <ClusterOverviewContext.Consumer>{value => <Component {...get(value, dataPath)} />}</ClusterOverviewContext.Consumer>
);
ClusterOverviewContextGenericConsumer.propTypes = {
  Component: PropTypes.func.isRequired,
  dataPath: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
};
