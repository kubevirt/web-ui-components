import React from 'react';
import { get } from 'lodash';
import PropTypes from 'prop-types';

export const StorageOverviewContext = React.createContext({});

export const StorageOverviewContextGenericConsumer = ({ Component, dataPath }) => (
  <StorageOverviewContext.Consumer>{value => <Component {...get(value, dataPath)} />}</StorageOverviewContext.Consumer>
);
StorageOverviewContextGenericConsumer.propTypes = {
  Component: PropTypes.func.isRequired,
  dataPath: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
};
