import React from 'react';
import PropTypes from 'prop-types';

export const BootOrder = ({ bootableDevices }) => {
  const listItems = bootableDevices.map((dev, idx) => <li key={`${idx}-${dev.value.name}`}>{dev.value.name}</li>);

  return <ol className="kubevirt-boot-order__list">{listItems}</ol>;
};

BootOrder.propTypes = {
  bootableDevices: PropTypes.array.isRequired,
};
