import React from 'react';
import PropTypes from 'prop-types';

export const DetailsBody = ({ children }) => <dl className="kubevirt-detail__list">{children}</dl>;

DetailsBody.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
};
