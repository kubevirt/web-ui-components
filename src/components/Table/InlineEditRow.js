import React from 'react';
import { Table } from 'patternfly-react';

// HACK: DragableRow gives this error:
//   Stateless function components cannot be given refs. Attempts to access this ref will fail.
// eslint-disable-next-line react/prefer-stateless-function
class InlineEditRow extends React.Component {
  render() {
    return <Table.InlineEditRow {...this.props} />;
  }
}

export default InlineEditRow;
