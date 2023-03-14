import React, { useState, useEffect } from 'react';
import { Table } from 'antd';

import { isEqual } from 'lodash';

import usePrevious from '../../utils/usePrevious';
import './searchTable.css';

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
}) => {
  const [loading, setLoading] = useState(false);
  const prevFetchDataParams = usePrevious(fetchDataParams);

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
      if (isEqual(prevFetchDataParams, fetchDataParams)) {
        return;
      }

      setLoading(true);
      const remainingRecords = searchResults.total
        ? searchResults.total - page * pageSize
        : pageSize + 1;
      console.log(remainingRecords);
      const options = {
        ...fetchDataParams,
        first: pageSize,
        offset: page - 1,
        sort: fetchDataParams.config.sort,
        projectCode,
      };

      try {
        console.log('try fetching data');
        const result = await fetchData(options);
        setTableData(result);
      } catch (e) {
        console.log(e);
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
      rowKey={(record) => record.id}
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
