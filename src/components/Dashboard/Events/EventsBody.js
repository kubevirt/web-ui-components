import React from 'react';
import PropTypes from 'prop-types';

const EventsBody = ({ children, ...props }) => (
  <div {...props} className="kubevirt-events__body">
    {children}
  </div>
);

EventsBody.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
};

export default EventsBody;
