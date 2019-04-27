// eslint-disable-next-line no-unused-vars
import React from 'react';

import PropTypes from 'prop-types';

export const ImportProvider = ({ children, isVisible }) => (isVisible ? children : null);

ImportProvider.displayName = 'ImportProvider';

ImportProvider.defaultProps = {
  isVisible: false,
  children: null,
};

ImportProvider.propTypes = {
  isVisible: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};
