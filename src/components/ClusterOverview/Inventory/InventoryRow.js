import React from 'react';
import PropTypes from 'prop-types';

import { prefixedId } from '../../../utils';

import { InventoryItemStatus } from './InventoryItemStatus';
import { InlineLoading } from '../../Loading';

const InventoryRowTitle = ({ title, count }) => (
  <div className="kubevirt-inventory__row-title">{count != null ? `${count} ${title}` : title}</div>
);

InventoryRowTitle.defaultProps = {
  count: null,
};

InventoryRowTitle.propTypes = {
  title: PropTypes.string.isRequired,
  count: PropTypes.number,
};

export const InventoryRow = ({ title, count, ...rest }) => (
  <div id={prefixedId('inventory', title.toLowerCase())} className="kubevirt-inventory__row">
    <InventoryRowTitle count={count} title={title} />
    {count != null ? <InventoryItemStatus {...rest} key="status" /> : <InlineLoading />}
  </div>
);

InventoryRow.defaultProps = {
  ...InventoryRowTitle.defaultProps,
  ...InventoryItemStatus.defaultProps,
};

InventoryRow.propTypes = {
  ...InventoryRowTitle.propTypes,
  ...InventoryItemStatus.propTypes,
};
