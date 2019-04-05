import React from 'react';
import { DonutChart } from 'patternfly-react';
import PropTypes from 'prop-types';

import { InlineLoading } from '../../Loading';
import { prefixedId } from '../../../utils';
import { USED, AVAILABLE, LOADING, CAPACITY, UNKNOWN, NOT_AVAILABLE } from './strings';

const pfGetUtilizationDonutTooltipContents = d =>
  `<span class="donut-tooltip-pf" style="white-space: nowrap;">${Math.round(d[0].ratio * 1000) / 10} ${
    d[0].name
  }</span>`;

export const CapacityItem = ({ id, title, used, total, unit, formatValue, LoadingComponent, isLoading }) => {
  let description;
  let columns = [[USED, 0], [AVAILABLE, 100]];
  let tooltip;
  let primaryTitle;
  let secondaryTitle = CAPACITY;
  if (isLoading) {
    description = <LoadingComponent />;
    primaryTitle = LOADING;
  } else if (used == null || total == null) {
    description = NOT_AVAILABLE;
    primaryTitle = UNKNOWN;
  } else {
    const totalFormatted = formatValue(total, unit);
    const usedFormatted = formatValue(used, totalFormatted.unit);

    unit = totalFormatted.unit; // eslint-disable-line prefer-destructuring
    total = totalFormatted.value;
    used = usedFormatted.value;

    const available = total - used;
    columns = [[USED, used], [AVAILABLE, available]];

    const percentageUsed = total > 0 ? Math.round((100 * used) / total) : 0;
    const availableNice = Number.isInteger(available) ? available : available.toFixed(1);
    const totalNice = Number.isInteger(total) ? total : total.toFixed(1);

    description = `${availableNice} ${unit} available out of ${totalNice} ${unit}`;
    tooltip = { contents: pfGetUtilizationDonutTooltipContents };
    primaryTitle = `${percentageUsed.toString()}%`;
    secondaryTitle = USED;
  }
  // TODO(mlibra): align text font
  return (
    <div className="kubevirt-capacity__item">
      <h2 className="kubevirt-capacity__item-title">{title}</h2>
      <h6>{description}</h6>
      <div>
        <DonutChart
          id={prefixedId('donut-chart', id)}
          size={{ width: 150, height: 150 }}
          data={{
            unload: true,
            columns,
            order: null,
          }}
          unloadBeforeLoad
          tooltip={tooltip}
          title={{
            primary: primaryTitle,
            secondary: secondaryTitle,
          }}
        />
      </div>
    </div>
  );
};

CapacityItem.defaultProps = {
  formatValue: (value, unit) => ({ value, unit }),
  unit: undefined,
  LoadingComponent: InlineLoading,
  used: null,
  total: null,
  isLoading: false,
};

CapacityItem.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  used: PropTypes.number,
  total: PropTypes.number,
  unit: PropTypes.string,
  formatValue: PropTypes.func,
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  isLoading: PropTypes.bool,
};
