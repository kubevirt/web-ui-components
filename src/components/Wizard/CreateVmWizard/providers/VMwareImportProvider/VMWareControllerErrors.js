import React from 'react';
import PropTypes from 'prop-types';

import { Iterable } from 'immutable';

import { ResultTabRow } from '../../ResultTabRow';

const VMWareControllerErrors = ({ id, errors }) => {
  if (!errors) {
    return null;
  }

  return (
    <div id={id}>
      {errors.map((result, index) => (
        <ResultTabRow key={index} {...(Iterable.isIterable(result) ? result.toJS() : result)} />
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
  errors: PropTypes.object,
};

export default VMWareControllerErrors;
