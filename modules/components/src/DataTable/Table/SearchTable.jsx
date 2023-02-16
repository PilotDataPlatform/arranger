import React, { useState, useEffect } from 'react';
import { Table } from 'antd';

export default ({ columns, fetchData, fetchDataParams, loading, ...props }) => {
  const [tableData, setTableData] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  // console.log(columns);
  // console.log(props)
  // const onTableChange = (pagination, filters, sorter, extra) => {

  //   switch (extra.action) {
  //     case 'sort':
  //       onSortedChange()
  //   }

  // }
  const rowSelection = {
    selectedRowKeys,
    onChange: (rowKeys, rowRecords) => {
      setSelectedFiles(rowRecords);
      setSelectedRowKeys(rowKeys);
    },
  };

  useEffect(() => {
    (async function () {
      const options = {
        ...fetchDataParams,
        // make the below values dynamic
        first: 20,
        offset: 0,
        sort: [{ field: 'container_code', order: 'asc' }],
      };

      const result = await fetchData(options);
      setTableData(result.data);
    })();
  }, [fetchDataParams]);

  return (
    <Table
      columns={columns}
      dataSource={tableData}
      rowKey={(record) => record.id}
      rowSelection={rowSelection}
      // onChange={onTableChange}
    />
  );
};
