import React from 'react';
import PropTypes from 'prop-types';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import * as dnd from 'reactabular-dnd';
import { get, findIndex, cloneDeep } from 'lodash';
import {
  TablePfProvider,
  inlineEditFormatterFactory,
  Table,
  MenuItem,
  DropdownKebab,
  HelpBlock
} from 'patternfly-react';
import { getFormElement } from '../Forms/FormFactory';
import { prefixedId } from '../../utils/utils';
import InlineEditRow from './InlineEditRow';
import {
  ON_MOVE,
  ON_ACTIVATE,
  ON_CHANGE,
  ON_CANCEL,
  ON_CONFIRM,
  ON_DELETE,
  ACTIONS_TYPE,
  DELETE_ACTION
} from './constants';

class EditableDraggableTable extends React.Component {
  state = {
    editing: false
  };

  componentDidUpdate() {
    const editRow = this.props.rows.find(row => row.edit);
    if (editRow) {
      this.inlineEditController.onActivate({ rowData: editRow });
    }
  }

  // needed for refiring row renders
  // eslint-disable-next-line no-return-assign
  flagUpdate = (rows, editingInProgress) => rows.forEach(row => (row.editingInProgress = editingInProgress));

  inlineEditController = {
    isEditing: ({ rowData }) => rowData.backup !== undefined,
    onActivate: ({ rowData }) => {
      if (!this.state.editing) {
        const editing = true;
        const { id } = rowData;
        const rows = cloneDeep(this.props.rows);
        const index = findIndex(rows, { id });

        if (index !== -1) {
          delete rows[index].edit; // remove edit signal
          rows[index].backup = cloneDeep(rows[index]);

          this.flagUpdate(rows, editing);
          this.setState({ editing });

          this.props.onChange(rows, {
            type: ON_ACTIVATE,
            id,
            editing
          });
        }
      }
    },

    onConfirm: ({ rowData }) => {
      const editing = false;
      const { id } = rowData;
      const rows = cloneDeep(this.props.rows);
      const index = findIndex(rows, { id });

      delete rows[index].backup;

      this.flagUpdate(rows, editing);
      this.setState({ editing });

      this.props.onChange(rows, {
        type: ON_CONFIRM,
        id,
        editing
      });
    },

    onCancel: ({ rowData }) => {
      const editing = false;
      const { id } = rowData;
      const rows = cloneDeep(this.props.rows);
      const index = findIndex(rows, { id });

      rows[index] = cloneDeep(rows[index].backup);
      delete rows[index].backup;

      this.flagUpdate(rows, editing);
      this.setState({ editing });

      this.props.onChange(rows, {
        type: ON_CANCEL,
        id,
        editing
      });
    },

    onChange: (value, { rowData, property }) => {
      const editing = true;
      const { id } = rowData;
      const rows = cloneDeep(this.props.rows);
      const index = findIndex(rows, { id });

      rows[index][property] = value;

      this.props.onChange(rows, {
        type: ON_CHANGE,
        id,
        editing
      });
    }
  };

  crudController = {
    onDelete: ({ rowData }) => {
      const { id } = rowData;
      this.props.onChange(this.props.rows.filter(row => row.id !== id), {
        type: ON_DELETE,
        editing: false,
        id
      });
    }
  };

  getActionButton = (type, additionalData, id) => {
    switch (type) {
      case DELETE_ACTION:
        return (
          <MenuItem id={id} key={id} onSelect={() => this.crudController.onDelete(additionalData)}>
            Remove Disk
          </MenuItem>
        );
      default:
        return null;
    }
  };

  getActionButtons = (additionalData, isEditing) => {
    const renderConfig = this.getRenderConfig(additionalData);
    const id = prefixedId(renderConfig.id, additionalData.rowKey);

    const result =
      isEditing && !renderConfig.visibleOnEdit ? null : (
        <DropdownKebab className="row-actions" id={id} key={id} pullRight>
          {renderConfig.actions.map((action, idx) => this.getActionButton(action, additionalData, prefixedId(idx, id)))}
        </DropdownKebab>
      );

    return <td className="editable">{result}</td>;
  };

  isDropdown = additionalData => get(this.getRenderConfig(additionalData), 'type') === 'dropdown';

  getRenderConfig = additionalData => {
    const { renderConfigs } = additionalData.column;
    const renderConfigIdx = additionalData.rowData.renderConfig;

    if (renderConfigs && Number.isInteger(renderConfigIdx) && renderConfigIdx < renderConfigs.length) {
      return renderConfigs[renderConfigIdx];
    }
    return null;
  };

  resolveRenderedValue = (value, additionalData, editable) => {
    const renderConfig = this.getRenderConfig(additionalData);
    let result;
    if (this.isDropdown(additionalData)) {
      result = get(renderConfig.choices.find(clazz => clazz.id === value), 'name');
    }

    if (!result) {
      result = value;
    }

    if (!editable && renderConfig && renderConfig.hasAddendum) {
      const { addendum } = additionalData.rowData;
      if (addendum) {
        result = result ? `${result} ${addendum}` : addendum;
      }
    }

    return result;
  };

  inlineEditFormatter = inlineEditFormatterFactory({
    isEditing: additionalData =>
      this.inlineEditController.isEditing(additionalData) && this.getRenderConfig(additionalData),

    renderValue: (value, additionalData) => {
      const data = this.resolveRenderedValue(value, additionalData, false);
      const { errors, isBootable } = additionalData.rowData;

      let errorField;
      if (errors && additionalData.columnIndex + 1 < errors.length) {
        const error = errors[additionalData.columnIndex + 1];
        if (error) {
          let additionalClass;
          if (!data && isBootable) {
            additionalClass = 'bootable-style';
          }
          errorField = (
            <div className={`form-group minimal-formgroup has-error ${additionalClass}`}>
              <HelpBlock>{error}</HelpBlock>
            </div>
          );
        }
      }

      return (
        <td
          className="editable editable-draggable-table-elem"
          onClick={() => this.inlineEditController.onActivate(additionalData)}
        >
          <div className="static">
            {data}
            {errorField}
          </div>
        </td>
      );
    },

    renderEdit: (value, additionalData) => {
      const renderConfig = this.getRenderConfig(additionalData);
      const isDropdown = this.isDropdown(additionalData);

      const onChange = v => this.inlineEditController.onChange(v, additionalData);
      return (
        <td className="editable editable-draggable-table-elem editable editing">
          {getFormElement({
            ...renderConfig,
            id: prefixedId(renderConfig.id, additionalData.rowKey),
            value: this.resolveRenderedValue(value, additionalData, true),
            defaultValue: this.resolveRenderedValue(value, additionalData, true) || renderConfig.initialValue,
            onChange: isDropdown ? onChange : null, // onChange for dropdowns
            onBlur: isDropdown ? null : onChange // onBlur for text
          })}
        </td>
      );
    }
  });

  inlineEditButtonsFormatter = inlineEditFormatterFactory({
    isEditing: additionalData => this.state.editing,
    renderValue: (value, additionalData) => this.getActionButtons(additionalData, false),
    renderEdit: (value, additionalData) => this.getActionButtons(additionalData, true)
  });

  onRow = (rowData, { rowIndex }) => ({
    rowId: rowData.id,
    role: 'row',
    onMove: ({ sourceRowId, targetRowId }) => {
      if (!this.state.editing) {
        const rows = dnd.moveRows({
          sourceRowId,
          targetRowId
        })(this.props.rows);

        if (rows) {
          this.props.onChange(rows, {
            type: ON_MOVE,
            id: sourceRowId,
            targetRowId,
            editing: false
          });
        }
      }
    },
    isEditing: () => this.inlineEditController.isEditing({ rowData }),
    onCancel: () =>
      this.inlineEditController.onCancel({
        rowData,
        rowIndex
      }),
    onConfirm: () =>
      this.inlineEditController.onConfirm({
        rowData,
        rowIndex
      }),
    last: rowIndex > 3 && rowIndex === this.props.rows.length - 1
  });

  render() {
    // setup our custom formatter for the cells
    const columns = this.props.columns.map(column => {
      const config = this.getRenderConfig({
        column,
        rowData: { renderConfig: 0 }
      });

      return {
        ...column,
        cell: {
          ...column.cell,
          formatters: [
            config && config.type === ACTIONS_TYPE ? this.inlineEditButtonsFormatter : this.inlineEditFormatter
          ]
        }
      };
    });

    const renderers = {
      body: {
        row: dnd.draggableRow(InlineEditRow),
        cell: cellProps => cellProps.children
      }
    };

    return (
      <TablePfProvider
        striped
        bordered
        hover
        dataTable
        inlineEdit
        columns={columns}
        renderers={renderers}
        key="TablePfProvider"
      >
        <Table.Header key="Table.Header" />
        <Table.Body key="Table.Body" rows={this.props.rows} rowKey="id" onRow={this.onRow} />
      </TablePfProvider>
    );
  }
}

EditableDraggableTable.propTypes = {
  rows: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired
};

export default DragDropContext(HTML5Backend)(EditableDraggableTable);
