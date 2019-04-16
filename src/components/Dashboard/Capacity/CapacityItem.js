import React from 'react';
import { ChartDonut, ChartTheme, ChartLabel, ChartTooltip } from '@patternfly/react-charts';
import PropTypes from 'prop-types';

import { InlineLoading } from '../../Loading';
import { prefixedId } from '../../../utils';
import { USED, AVAILABLE, LOADING, CAPACITY, UNKNOWN, NOT_AVAILABLE } from './strings';

const CHART_WIDTH = 200;
const CHART_HEIGHT = 200;

const TITLE_HEIGHT_OFFSET = 12;

export const CapacityItem = ({ id, title, used, total, unit, formatValue, LoadingComponent, isLoading }) => {
  let description;
  let data = [{ x: USED, y: 0 }, { x: AVAILABLE, y: 100 }];
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

    const formattedUnit = totalFormatted.unit; // eslint-disable-line prefer-destructuring
    const formattedTotal = totalFormatted.value;
    const formattedUsed = usedFormatted.value;

    const available = formattedTotal - formattedUsed;

    const percentageUsed = total > 0 ? Math.round((100 * formattedUsed) / formattedTotal) : 0;
    const availableNice = Number.isInteger(available) ? available : available.toFixed(1);
    const totalNice = Number.isInteger(formattedTotal) ? formattedTotal : formattedTotal.toFixed(1);
    const usedNice = Number.isInteger(formattedUsed) ? formattedUsed : formattedUsed.toFixed(1);

    data = [
      {
        x: USED,
        y: formattedUsed,
        label: `${USED}: ${usedNice}${formattedUnit}`,
      },
      {
        x: AVAILABLE,
        y: available,
        label: `${AVAILABLE}: ${availableNice}${formattedUnit}`,
      },
    ];
    description = `${availableNice} ${formattedUnit} available out of ${totalNice} ${formattedUnit}`;
    primaryTitle = `${percentageUsed.toString()}%`;
    secondaryTitle = USED;
  }
  return (
    <div className="kubevirt-capacity__item">
      <div className="kubevirt-capacity__item-title">{title}</div>
      <h6 className="kubevirt-capacity__item-description">{description}</h6>
      <div id={prefixedId('donut-chart', id)} className="kubevirt-capacity__graph">
        <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}>
          <ChartDonut
            data={data}
            labels={datum => datum.label}
            theme={ChartTheme.light.blue}
            height={CHART_HEIGHT}
            width={CHART_WIDTH}
            standalone={false}
            labelComponent={<ChartTooltip style={{ fontSize: 20 }} />}
          />
          <ChartLabel
            textAnchor="middle"
            style={{ fontSize: 25 }}
            x={CHART_WIDTH / 2}
            y={CHART_HEIGHT / 2 - TITLE_HEIGHT_OFFSET}
            text={primaryTitle}
          />
          <ChartLabel
            textAnchor="middle"
            style={{ fontSize: 15 }}
            x={CHART_WIDTH / 2}
            y={CHART_HEIGHT / 2 + TITLE_HEIGHT_OFFSET}
            text={secondaryTitle}
          />
        </svg>
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
