import React from 'react';
import { isEqual } from 'lodash';
import urlJoin from 'url-join';

import { ARRANGER_API, PROJECT_ID } from '../utils/config';
import { Table, TableToolbar } from './';

class DataTableWithToolbar extends React.Component {
  constructor(props) {
    super(props);

    let pageSize = 10;
    let page = 1;
    let sorted = props.config.defaultSorted || [];
    let selectedTableRows = [];

    this.state = {
      defaultPageSize: pageSize,
      pageSize,
      page,
      sorted,
      selectedTableRows,
    };
  }

  componentWillReceiveProps(nextProps) {
    // sets page to 1 when sort / facted search changes
    if (!isEqual(nextProps.sqon, this.props.sqon)) {
      this.setState({ page: this.state.defaultPageSize });
    }
  }

  render() {
    const {
      allowTogglingColumns = true,
      allowTSVExport = true,
      alwaysSorted = [],
      columnDropdownText,
      customActions = null,
      customHeaderContent = null,
      data = null,
      downloadUrl = '',
      enableDropDownControls = false,
      enableSelectedTableRowsExporterFilter,
      selectedRowsFilterPropertyName,
      exporter,
      exporterLabel,
      exportTSVFilename,
      exportTSVText,
      fetchData,
      filterInputPlaceholder,
      initalSelectedTableRows,
      InputComponent,
      keepSelectedOnPageChange = false,
      loading = null,
      maxPagesOptions,
      onColumnsChange = () => {},
      onFilterChange = () => {},
      onMultipleColumnsChange = () => {},
      projectId = PROJECT_ID,
      sessionStorage,
      selectedTableRows = [],
      setSelectedTableRows = () => {},
      showFilterInput = true,
      sqon,
      tableStyle,
      toolbarStyle,
      transformParams,
    } = this.props;
    const config = { ...this.props.config, sort: this.state.sorted };
    const { defaultPageSize, pageSize, page, sorted, total } = this.state;

    const url = downloadUrl || urlJoin(ARRANGER_API, projectId, 'download');

    return (
      <>
        <TableToolbar
          allColumns={config.allColumns}
          allowTSVExport={allowTSVExport}
          allowTogglingColumns={allowTogglingColumns}
          columnDropdownText={columnDropdownText}
          columns={config.columns}
          customActions={customActions}
          customHeaderContent={customHeaderContent}
          defaultColumns={config.defaultColumns}
          downloadUrl={url}
          enableDropDownControls={enableDropDownControls}
          enableSelectedTableRowsExporterFilter={enableSelectedTableRowsExporterFilter}
          selectedRowsFilterPropertyName={selectedRowsFilterPropertyName}
          exportTSVFilename={exportTSVFilename}
          exportTSVText={exportTSVText}
          exporter={exporter}
          exporterLabel={exporterLabel}
          filterInputPlaceholder={filterInputPlaceholder}
          InputComponent={InputComponent}
          keyField={config.keyField}
          onColumnsChange={onColumnsChange}
          onFilterChange={onFilterChange}
          onMultipleColumnsChange={onMultipleColumnsChange}
          page={page}
          pageSize={pageSize}
          propsData={data}
          selectedTableRows={selectedTableRows}
          showFilterInput={showFilterInput}
          sqon={sqon}
          style={toolbarStyle}
          total={total}
          transformParams={transformParams}
          type={config.type}
        />
        <Table
          style={tableStyle}
          propsData={data}
          sqon={sqon}
          config={config}
          fetchData={fetchData}
          onSelectedTableRows={(selectedTableRows) => {
            setSelectedTableRows(selectedTableRows);
          }}
          onPaginationChange={(pageSize) => {
            // React table
            // this.setState(state);
            this.setState((prevState) => ({ ...prevState, pageSize }));
          }}
          onSortedChange={(sorted) => {
            this.setState((prevState) => ({
              ...prevState,
              sorted,
              pageSize: this.state.defaultPageSize,
            }));
          }}
          onPageChange={(page) => {
            this.setState((prevState) => ({ ...prevState, page }));
          }}
          pageSize={pageSize}
          defaultPageSize={defaultPageSize}
          page={page}
          defaultSorted={sorted}
          sorted={sorted}
          loading={loading}
          maxPagesOptions={maxPagesOptions}
          alwaysSorted={alwaysSorted}
          initalSelectedTableRows={initalSelectedTableRows || this.state.selectedTableRows}
          keepSelectedOnPageChange={sessionStorage || keepSelectedOnPageChange} // If false, this will reset the selection to empty on reload. To keep selections after reload set this to true. Use sessionStorage or specific property to set this.
          selectedTableRows={selectedTableRows}
        />
      </>
    );
  }
}
export default DataTableWithToolbar;
