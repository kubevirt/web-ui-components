import React from 'react';
import { Button, Icon } from 'patternfly-react';
import PropTypes from 'prop-types';

export const CancelAcceptButtons = ({ onCancel, onAccept, disabled }) => (
  <React.Fragment>
    <Button onClick={onCancel} className="kubevirt-cancel-accept-buttons">
      <Icon type="pf" name="close" />
    </Button>
    <Button onClick={onAccept} disabled={disabled} bsStyle="primary" className="kubevirt-cancel-accept-buttons">
      <Icon type="fa" name="check" />
    </Button>
  </React.Fragment>
);

CancelAcceptButtons.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onAccept: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

CancelAcceptButtons.defaultProps = {
  disabled: false,
};
