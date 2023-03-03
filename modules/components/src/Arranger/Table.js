import React from 'react';

import DataTable, { ColumnsState } from '../DataTable';
import Spinner from 'react-spinkit';

const Table = ({
  onFilterChange = () => {},
  onPaginationChange = () => {},
  onPageChange = () => {},
  onSortedChange = () => {},
  onSelectedTableRows = () => {},
  projectId,
  projectCode,
  graphqlField,
  fetchData,
  setSQON,
  sqon,
  fieldTypesForFilter = ['text', 'keyword'],
  api,
  InputComponent,
  showFilterInput = true,
  customHeaderContent = null,
  page = 1,
  pageSize = 10,
  ...props
}) => {
  return (
    <ColumnsState
      projectId={projectId}
      graphqlField={graphqlField}
      api={api}
      render={(columnState) => {
        return columnState.loading ? (
          <Spinner fadeIn="full" name="circle" />
        ) : (
          <DataTable
            {...{ ...props, api, showFilterInput, customHeaderContent }}
            InputComponent={InputComponent}
            projectId={projectId}
            projectCode={projectCode}
            sqon={sqon}
            config={{
              ...columnState.state,
              // generates a handy dictionary with all the available columns
              allColumns: columnState.state.columns.reduce(
                (columnsDict, column) => ({
                  ...columnsDict,
                  [column.field]: column,
                }),
                {},
              ),
              type: graphqlField,
            }}
            fetchData={fetchData(projectId)}
            onColumnsChange={columnState.toggle}
            onMultipleColumnsChange={columnState.toggleMultiple}
            onFilterChange={({ generateNextSQON, value }) => {
              onFilterChange(value);
              setSQON(
                generateNextSQON({
                  sqon,
                  fields: columnState.state.columns
                    .filter((x) => fieldTypesForFilter.includes(x.extendedType) && x.show)
                    .map((x) => x.field),
                }),
              );
            }}
            onPaginationChange={(pageSize) => {
              onPaginationChange(pageSize);
            }}
            onPageChange={(currentPage) => {
              onPageChange(currentPage);
            }}
            onSortedChange={(sorted) => onSortedChange(sorted)}
            onSelectedTableRows={(selectedTableRows) => onSelectedTableRows(selectedTableRows)}
          />
        );
      }}
    />
  );
};

export default Table;
