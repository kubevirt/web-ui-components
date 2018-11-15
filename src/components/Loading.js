import React from 'react';
import PropTypes from 'prop-types';

export const Loading = ({ text }) => (
  <div className="wizard-pf-process blank-slate-pf" key="progress">
    <div className="spinner spinner-lg blank-slate-pf-icon" />
    <h3 className="blank-slate-pf-main-action">{text}</h3>
  </div>
);

Loading.propTypes = {
  text: PropTypes.string.isRequired,
};
