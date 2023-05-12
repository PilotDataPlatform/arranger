import React from 'react';
import SearchTable from './Table/SearchTable';

import { isEqual } from 'lodash';
import urlJoin from 'url-join';

import { ARRANGER_API, PROJECT_ID } from '../utils/config';
import { TableToolbar } from './';

class DataTableWithToolbar extends React.Component {
  constructor(props) {
    super(props);

    let pageSize = this.props.pageSize;
    let page = this.props.page;
    let sorted = props.config.defaultSorted || [];
    let selectedTableRows = [];
    const fetchDataParams = {
      config: { ...this.props.config, sort: sorted },
      sqon: this.props.sqon,
      queryName: 'table',
    };

    this.state = {
      defaultPageSize: pageSize,
      defaultPage: page,
      pageSize,
      page,
      sorted,
      selectedTableRows,
      searchResults: { data: [], total: 0 },
      fetchDataParams,
    };
  }

  componentWillReceiveProps(nextProps) {
    // sets page to 1 when sort / facted search changes
    if (!isEqual(nextProps.sqon, this.props.sqon)) {
      this.setState({ page: this.state.defaultPage });
    }
  }

  // searchTable depends on this.state.fetchDataParams and sets this.state.searchResults, will cause infinite render without this method
  componentDidUpdate(prevProps, prevState) {
    const currentFetchParams = {
      config: { ...this.props.config, sort: this.state.sorted },
      sqon: this.props.sqon,
      queryName: 'table',
    };
    const prevFetchParams = {
      config: { ...prevProps.config, sort: prevState.sorted },
      sqon: prevProps.sqon,
      queryName: 'table',
    };

    if (!isEqual(currentFetchParams, prevFetchParams)) {
      this.setState({ fetchDataParams: currentFetchParams });
    }
  }

  setSearchResults = (searchResults) => {
    // add uuid suffix to identifier to avoid duplicate keys from dirty data
    const data = searchResults.data.map((row) => ({
      ...row,
      identifier: `${row.identifier}-uuid-${crypto.randomUUID()}`,
    }));

    this.setState({ searchResults: { ...searchResults, data } });
  };

  render() {
    const {
      allowTogglingColumns = true,
      allowTSVExport = true,
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
      graphqlField,
      InputComponent,
      onColumnsChange = () => {},
      onMultipleColumnsChange = () => {},
      onFilterChange,
      onPaginationChange,
      onPageChange,
      onSortedChange,
      onSelectedTableRows,
      projectId = PROJECT_ID,
      projectCode,
      selectedTableRows = [],
      setSelectedTableRows = () => {},
      showFilterInput = true,
      sqon,
      setSQON,
      toolbarStyle,
      transformParams,
      onFetchTableDataError,
    } = this.props;
    const config = { ...this.props.config, sort: this.state.sorted };
    const { defaultPageSize, pageSize, page, searchResults } = this.state;

    const url = downloadUrl || urlJoin(ARRANGER_API, projectId, 'download');
    const configColumns = config.columns.filter((c) => c.show);

    return (
      <>
        <TableToolbar
          allColumns={config.allColumns}
          allowTSVExport={allowTSVExport}
          allowTogglingColumns={allowTogglingColumns}
          columnDropdownText={columnDropdownText}
          columns={configColumns}
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
          projectCode={projectCode}
          projectId={projectId}
          graphqlField={graphqlField}
          selectedTableRows={selectedTableRows}
          showFilterInput={showFilterInput}
          sqon={sqon}
          setSQON={setSQON}
          style={toolbarStyle}
          total={searchResults.total}
          transformParams={transformParams}
          type={config.type}
        />
        <SearchTable
          columns={configColumns}
          projectCode={projectCode}
          fetchData={fetchData}
          fetchDataParams={this.state.fetchDataParams}
          searchResults={searchResults}
          setTableData={this.setSearchResults}
          defaultPageSize={defaultPageSize}
          pageSize={pageSize}
          onPaginationChange={(pageSize) => {
            onPaginationChange(pageSize);
            this.setState({ pageSize });
          }}
          page={page}
          onPageChange={(page) => {
            this.setState({ page });
            onPageChange(page);
          }}
          defaultSorted={config.defaultSorted}
          onSortedChange={(sorted) => {
            this.setState({
              sorted,
              pageSize: this.state.defaultPageSize,
            });
            onSortedChange(sorted);
          }}
          selectedTableRows={selectedTableRows}
          onSelectedTableRows={(selectedTableRows) => {
            setSelectedTableRows(selectedTableRows);
            onSelectedTableRows(selectedTableRows);
          }}
          onFetchTableDataError={onFetchTableDataError}
        />
      </>
    );
  }
}
export default DataTableWithToolbar;
