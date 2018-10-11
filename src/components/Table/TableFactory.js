import React from 'react';
import PropTypes from 'prop-types';
import { Button, ButtonGroup, Alert } from 'patternfly-react';
import EditableDraggableTable from './EditableDraggableTable';
import { ON_CONFIRM, ON_DELETE, ON_MOVE, ON_CANCEL, ON_CHANGE, ON_ACTIVATE } from './constants';

const onChange = (rows, { editing, type, id }, onRowUpdate, onRowDeleteOrMove, onRowActivate) => {
  switch (type) {
    case ON_ACTIVATE:
      onRowActivate(rows);
      break;
    case ON_CONFIRM:
    case ON_CANCEL:
    case ON_CHANGE:
      onRowUpdate(rows, id, editing);
      break;
    case ON_DELETE:
    case ON_MOVE:
      onRowDeleteOrMove(rows);
      break;
    default:
      // eslint-disable-next-line
      console.warn(`Unknown type ${type}`);
      break;
  }
};

export const TableFactory = props => {
  const actionButtons = props.actionButtons.map(({ id, className, onClick, disabled, text }) => (
    <Button key={id} className={className} onClick={onClick} id={id} disabled={disabled}>
      {text}
    </Button>
  ));

  const onTableChange = (rows, data) =>
    onChange(rows, data, props.onRowUpdate, props.onRowDeleteOrMove, props.onRowActivate);
  const error = props.error !== '' ? <Alert>{props.error}</Alert> : undefined;

  return (
    <React.Fragment>
      <ButtonGroup className="pull-right actions">{actionButtons}</ButtonGroup>
      <EditableDraggableTable columns={props.columns} rows={props.rows} onChange={onTableChange} />
      {error}
    </React.Fragment>
  );
};

TableFactory.propTypes = {
  actionButtons: PropTypes.array.isRequired,
  onRowUpdate: PropTypes.func.isRequired,
  onRowDeleteOrMove: PropTypes.func.isRequired,
  onRowActivate: PropTypes.func.isRequired,
  error: PropTypes.string.isRequired,
  columns: PropTypes.array.isRequired,
  rows: PropTypes.array.isRequired
};
