import React from 'react';
import { FileOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';

import searchTableType from './searchTableTypes';
import { withProps } from 'recompose';

export function getSingleValue(data) {
  if (typeof data === 'object' && data) {
    return getSingleValue(Object.values(data)[0]);
  } else {
    return data;
  }
}

const ColumnTitle = ({ title }) => {
  return (
    <div className="column-title__container">
      <span>{title}</span>
    </div>
  );
};

// source of truth from columnState api call
const PILOT_TABLE_COLUMNS = [
  {
    field: 'type',
    title: <ColumnTitle title={<FileOutlined />} />,
    width: '6%',
    order: 1,
  },
  {
    field: 'name',
    sorter: true,
    title: <ColumnTitle title="Name" />,
    width: '27%',
    order: 2,
  },
  {
    field: 'owner',
    sorter: true,
    title: <ColumnTitle title="Added" />,
    width: '26%',
    order: 3,
  },
  {
    field: 'created_time',
    sorter: true,
    title: <ColumnTitle title="Created" />,
    width: '13%',
    order: 4,
  },
  {
    field: 'size',
    sorter: true,
    title: <ColumnTitle title="Size" />,
    width: '10%',
    order: 5,
  },
  { field: 'parent_path', title: 'Destination', width: '18%', order: 6 },
  { field: 'identifier' },
];

const normalizeSearchTableColumns = ({ columns = [] }) =>
  PILOT_TABLE_COLUMNS.reduce((resultingColumn, column) => {
    const configColumn = columns.find((c) => c.field === column.field);

    resultingColumn.push({
      ...column,
      ...configColumn,
      // identifier used only to query table data
      show: column.field !== 'identifier' ? configColumn.show : false,
      fetch: column.field !== 'identifier' ? configColumn.show : true,
      dataIndex: column.field,
      key: column.field,
      render: searchTableType(column.field),
    });

    return resultingColumn;
  }, []);

export const withSearchTableColumns = withProps(
  ({ config = {}, customTypes, customColumns, customTypeConfigs }) => ({
    config: {
      ...config,
      columns: normalizeSearchTableColumns({
        columns: config.columns,
        customTypes,
        customColumns,
        customTypeConfigs,
      }),
    },
  }),
);
