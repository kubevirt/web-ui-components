import React from 'react';
import PropTypes from 'prop-types';

const VMwareStatusField = ({ id, children }) => (
  <div id={id} className="kubevirt-create-vm-wizard__import-vmware-connection-status">
    {children}
  </div>
);

VMwareStatusField.defaultProps = {
  id: null,
};

VMwareStatusField.propTypes = {
  id: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default VMwareStatusField;
