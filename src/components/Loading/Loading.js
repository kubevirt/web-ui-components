import React from 'react';
import PropTypes from 'prop-types';

import { prefixedId } from '../../utils';

export const TinyInlineLoading = () => <span className="spinner spinner-xs spinner-inline" />;

export const InlineLoading = ({ id, size }) => (
  <div id={id} key={prefixedId(id, 'progress') || 'progress'}>
    <div className={`spinner spinner-${size} blank-slate-pf-icon`} />
  </div>
);

InlineLoading.propTypes = {
  id: PropTypes.string,
  size: PropTypes.string,
};

InlineLoading.defaultProps = {
  id: undefined,
  size: 'md',
};

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
