import React from 'react';
import PropTypes from 'prop-types';

import { prefixedId } from '../../utils';

export const Loading = ({ text, id }) => (
  <div id={id} className="wizard-pf-process blank-slate-pf" key={prefixedId(id, 'progress') || 'progress'}>
    <div className="spinner spinner-lg blank-slate-pf-icon" />
    <h3 className="blank-slate-pf-main-action">{text}</h3>
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
