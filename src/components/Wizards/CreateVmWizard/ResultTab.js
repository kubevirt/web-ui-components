import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'patternfly-react';

const ResultTab = ({ result, success }) => {
  let value;
  if (success == null) {
    value = (
      <div className="wizard-pf-process blank-slate-pf" key="progress">
        <div className="spinner spinner-lg blank-slate-pf-icon" />
        <h3 className="blank-slate-pf-main-action">Creation of VM in progress</h3>
      </div>
    );
  } else if (success) {
    value = (
      <div className="wizard-pf-complete blank-slate-pf" key="success">
        <div className="wizard-pf-success-icon">
          <span className="glyphicon glyphicon-ok-circle" />
        </div>
        <h3 className="blank-slate-pf-main-action">Creation of VM was succesfull</h3>
        <pre className="blank-slate-pf-secondary-action description">{result}</pre>
      </div>
    );
  } else {
    value = <Alert key="fail">{result}</Alert>;
  }

  return value;
};

ResultTab.defaultProps = {
  result: null,
  success: null
};

ResultTab.propTypes = {
  result: PropTypes.string,
  success: PropTypes.bool
};

export default ResultTab;
