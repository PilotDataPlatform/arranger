import React, { useState, useEffect } from 'react';
import { Table } from 'antd';

import './searchTable.css';
import { isEqual } from 'lodash';

import usePrevious from '../../utils/usePrevious';

export default ({
  columns,
  projectCode,
  fetchData,
  fetchDataParams,
  searchResults,
  setTableData,
  defaultPageSize,
  pageSize,
  onPaginationChange,
  page,
  onPageChange,
  defaultSorted,
  onSortedChange,
  selectedTableRows,
  onSelectedTableRows,
  onFetchTableDataError,
}) => {
  const [loading, setLoading] = useState(false);
  const [resultTotal, setResultTotal] = useState(0);
  const [searchFilterRef, setSearchFilterRef] = usePrevious(fetchDataParams.sqon);

  const onChange = (pagination, _, sorter, extra) => {
    const { action } = extra;

    if (action === 'sort') {
      const sorted = sorter.column
        ? [{ field: sorter.field, order: sorter.order === 'ascend' ? 'asc' : 'desc' }]
        : defaultSorted;
      onSortedChange(sorted);
    }

    if (action === 'paginate') {
      const { current: currentPage, pageSize } = pagination;
      onPageChange(currentPage);
      onPaginationChange(pageSize);
    }
  };

  useEffect(() => {
    (async function () {
      setLoading(true);
      const resultsRemaining = resultTotal - (page - 1) * pageSize;
      let resultsRemainingParam =
        resultsRemaining > 0 && resultsRemaining < pageSize ? resultsRemaining : pageSize;

      if (!searchFilterRef || !isEqual(fetchDataParams.sqon, searchFilterRef)) {
        setSearchFilterRef(fetchDataParams.sqon);
        resultsRemainingParam = pageSize;
      }

      const options = {
        ...fetchDataParams,
        first: resultsRemainingParam,
        offset: page - 1,
        sort: fetchDataParams.config.sort,
        projectCode,
      };

      try {
        const result = await fetchData(options);
        setTableData(result);
        setResultTotal(result.total);
      } catch (e) {
        onFetchTableDataError(e);
      }
      setLoading(false);
    })();
  }, [fetchDataParams, page, pageSize]);

  const rowSelection = {
    selectedRowKeys: selectedTableRows,
    onChange: (rowKeys) => {
      onSelectedTableRows(rowKeys);
    },
  };

  return (
    <Table
      className="searchTable"
      tableLayout="fixed"
      loading={loading}
      columns={columns}
      dataSource={searchResults.data}
      rowKey={(record) => `${record.id}`}
      rowSelection={rowSelection}
      onChange={onChange}
      pagination={{
        current: page,
        pageSize,
        total: searchResults.total,
        pageSizeOptions: [
          defaultPageSize,
          defaultPageSize * 2,
          defaultPageSize * 4 + defaultPageSize,
        ],
        showSizeChanger: true,
      }}
    />
  );
};
