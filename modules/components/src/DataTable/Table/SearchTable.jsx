import React, { useState, useEffect } from 'react';
import { Table } from 'antd';

export default ({
  columns,
  fetchData,
  fetchDataParams,
  defaultPageSize,
  pageSize,
  onPaginationChange,
  selectedTableRows,
  onSelectedTableRows,
  page,
  onPageChange,
  onSortedChange,
  loading,
}) => {
  const [searchResults, setSearchResults] = useState({ data: [], total: 0 });

  const onChange = (pagination, _, sorter, extra) => {
    const { action } = extra;

    if (action === 'sort') {
      const sorted = [{ field: sorter.field, order: sorter.order === 'ascend' ? 'asc' : 'desc' }];
      onSortedChange(sorted);
      onPageChange(0);
    }

    if (action === 'paginate') {
      const { current: currentPage, pageSize } = pagination;
      onPageChange(currentPage);
      onPaginationChange(pageSize);
    }
  };

  useEffect(() => {
    (async function () {
      const options = {
        ...fetchDataParams,
        first: pageSize,
        offset: page - 1,
        sort: fetchDataParams.config.sort,
      };

      const result = await fetchData(options);
      setSearchResults(result);
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
