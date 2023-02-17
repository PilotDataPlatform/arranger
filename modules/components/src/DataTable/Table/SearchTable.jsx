import React, { useState, useEffect } from 'react';
import { Table } from 'antd';

export default ({
  columns,
  fetchData,
  fetchDataParams,
  defaultPageSize,
  onPaginationChange,
  onSortedChange,
  loading,
  ...props
}) => {
  const [searchResults, setSearchResults] = useState({ data: [], total: 0 });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [page, setPage] = useState(0);

  const onChange = (pagination, filters, sorter, extra) => {
    const { action } = extra;

    if (action === 'sort') {
      const sort = [{ field: sorter.field, order: sorter.order === 'ascend' ? 'asc' : 'desc' }];
      onSortedChange(sort);
      setPage(0);
      setPageSize(defaultPageSize);
    }

    console.log(pagination);
  };

  // onPaginationChange(pageSize, sorted, selectedTableRows)

  const rowSelection = {
    selectedRowKeys,
    onChange: (rowKeys, rowRecords) => {
      setSelectedFiles(rowRecords);
      setSelectedRowKeys(rowKeys);
    },
  };

  useEffect(() => {
    // test if changing sort changes config (fetchDataParams)
    (async function () {
      console.log(fetchDataParams);
      const options = {
        ...fetchDataParams,
        first: pageSize,
        offset: page,
        sort: fetchDataParams.config.sort,
      };

      const result = await fetchData(options);
      setSearchResults(result);
    })();
  }, [fetchDataParams, page, pageSize]);

  return (
    <Table
      columns={columns}
      dataSource={searchResults.data}
      rowKey={(record) => record.id}
      rowSelection={rowSelection}
      onChange={onChange}
      pagination={{
        current: page + 1,
        pageSize,
        total: searchResults.total,
        pageSizeOptions: ['10', '20', '50'],
        showSizeChanger: true,
      }}
      // onChange={onTableChange}
    />
  );
};
