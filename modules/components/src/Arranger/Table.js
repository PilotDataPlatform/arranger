import React, { useContext } from 'react';
import { ArrangerStateContext } from './ArrangerContext';

import DataTable, { ColumnsState } from '../DataTable';

const Table = ({
  onFilterChange = () => {},
  onPaginationChange = () => {},
  onPageChange = () => {},
  onSortedChange = () => {},
  onSelectedTableRows = () => {},
  onFetchTableDataError = () => {},
  onFetchColumnsError = () => {},
  projectId,
  projectCode,
  graphqlField,
  fetchData,
  setSQON,
  sqon,
  fieldTypesForFilter = ['text', 'keyword'],
  api,
  showFilterInput = true,
  customHeaderContent = null,
  page = 1,
  pageSize = 10,
  ...props
}) => {
  const { setArrangerState } = useContext(ArrangerStateContext);
  return (
    <div
      css={`
        position: relative;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        background-color: white;
        border-bottom-right-radius: 6px;
        border-left: 1px solid #f0f0f0;
        letter-spacing: 0.2px;
      `}
    >
      <ColumnsState
        projectId={projectId}
        graphqlField={graphqlField}
        api={api}
        onFetchColumnsError={onFetchColumnsError}
        setArrangerState={setArrangerState}
        render={(columnState) => {
          return columnState.loading ? null : (
            <DataTable
              {...{ ...props, api, showFilterInput, customHeaderContent }}
              projectId={projectId}
              projectCode={projectCode}
              setSQON={setSQON}
              sqon={sqon}
              graphqlField={graphqlField}
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
              page={page}
              pageSize={pageSize}
              onPaginationChange={(pageSize) => {
                onPaginationChange(pageSize);
              }}
              onPageChange={(currentPage) => {
                onPageChange(currentPage);
              }}
              onSortedChange={(sorted) => onSortedChange(sorted)}
              onSelectedTableRows={(selectedTableRows) => onSelectedTableRows(selectedTableRows)}
              onFetchTableDataError={onFetchTableDataError}
            />
          );
        }}
      />
    </div>
  );
};

export default Table;
