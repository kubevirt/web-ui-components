import React from 'react';
import PropTypes from 'prop-types';

import { ResultTabRow } from '../../ResultTabRow';

const VMWareControllerErrors = ({ id, errors }) => {
  if (!errors) {
    return null;
  }

  return (
    <div id={id}>
      {errors.map((result, index) => (
        <ResultTabRow key={index} {...result} />
      ))}
    </div>
  );
};

VMWareControllerErrors.defaultProps = {
  id: null,
  errors: null,
};

VMWareControllerErrors.propTypes = {
  id: PropTypes.string,
  errors: PropTypes.array,
};

export default VMWareControllerErrors;
