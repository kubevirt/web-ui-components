import React from 'react';
import PropTypes from 'prop-types';

import { prefixedId } from '../../utils';

export const Loading = ({ text, id }) => (
  <div className="blank-slate-pf" id={id} key={prefixedId(id, 'progress') || 'progress'}>
    <div className="spinner spinner-lg blank-slate-pf-icon" />
    {text && <h3 className="blank-slate-pf-main-action">{text}</h3>}
  </div>
);

Loading.propTypes = {
  text: PropTypes.string,
  id: PropTypes.string,
};

Loading.defaultProps = {
  text: 'Loading',
  id: undefined,
};
