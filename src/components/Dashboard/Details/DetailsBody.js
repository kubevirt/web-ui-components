import React from 'react';
import PropTypes from 'prop-types';

export const DetailsBody = ({ children }) => <dl>{children}</dl>;

DetailsBody.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
};
