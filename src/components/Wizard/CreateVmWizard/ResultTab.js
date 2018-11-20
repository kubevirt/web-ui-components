import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'patternfly-react';
import { Loading } from '../../Loading';

const getCreationText = createTemplate => `Creation of VM ${createTemplate ? 'Template ' : ''}`;

const ResultTab = ({ result, success, createTemplate }) => {
  let value;
  const loadingText = `${getCreationText(createTemplate)}in progress`;
  const successText = `${getCreationText(createTemplate)}was successful`;
  if (success == null) {
    value = <Loading text={loadingText} />;
  } else if (success) {
    value = (
      <div className="wizard-pf-complete blank-slate-pf" key="success">
        <div className="wizard-pf-success-icon">
          <span className="glyphicon glyphicon-ok-circle" />
        </div>
        <h3 className="blank-slate-pf-main-action">{successText}</h3>
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
  success: null,
  createTemplate: false,
};

ResultTab.propTypes = {
  result: PropTypes.string,
  success: PropTypes.bool,
  createTemplate: PropTypes.bool,
};

export default ResultTab;
