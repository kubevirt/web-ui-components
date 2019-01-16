import React from 'react';
import PropTypes from 'prop-types';

export const BootOrder = props => {
  const { bootableDevices } = props;
  const sortedBootableDevices = bootableDevices.sort((a, b) => a.bootOrder - b.bootOrder);
  const listItems = sortedBootableDevices.map((dev, idx) => <li key={`${idx}-${dev.name}`}>{dev.name}</li>);

  return <ol className="kubevirt-boot-order__list">{listItems}</ol>;
};

BootOrder.propTypes = {
  bootableDevices: PropTypes.array.isRequired,
};
