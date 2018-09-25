import React from 'react';
import PropTypes from 'prop-types';

const HelloWorldMessage = ({ text }) => <span>Hello {text}!</span>;

HelloWorldMessage.propTypes = {
  text: PropTypes.string.isRequired
};

export default HelloWorldMessage;
