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

const ColumnTitle = ({ title, field, titleProps }) => {
  const { sortColumn, sortOrder } = titleProps;

  let sortIcon = <DownOutlined className="column-title__icon" />;
  if (sortColumn?.field === field) {
    if (sortOrder === 'ascend') {
      sortIcon = <UpOutlined className="column-title__icon column-title__icon--active" />;
    }
    if (sortOrder === 'descend') {
      sortIcon = <DownOutlined className="column-title__icon column-title__icon--active" />;
    }
  }

  return (
    <div class="column-title__container">
      <span>{title}</span>
      {sortIcon}
    </div>
  );
};

const PILOT_TABLE_COLUMNS = [
  {
    field: 'type',
    sorter: true,
    title: (titleProps) => (
      <ColumnTitle title={<FileOutlined />} field="type" titleProps={titleProps} />
    ),
    width: '5%',
    order: 1,
  },
  {
    field: 'name',
    sorter: true,
    title: (titleProps) => <ColumnTitle title="Name" field="name" titleProps={titleProps} />,
    width: '27%',
    order: 2,
  },
  {
    field: 'owner',
    sorter: true,
    title: (titleProps) => <ColumnTitle title="Added" field="owner" titleProps={titleProps} />,
    width: '26%',
    order: 3,
  },
  {
    field: 'created_time',
    sorter: true,
    title: (titleProps) => (
      <ColumnTitle title="Created" field="created_time" titleProps={titleProps} />
    ),
    width: '13%',
    order: 4,
  },
  {
    field: 'size',
    sorter: true,
    title: (titleProps) => <ColumnTitle title="Size" field="size" titleProps={titleProps} />,
    width: '10%',
    order: 5,
  },
  { field: 'zone', title: 'Destination', width: '19%', order: 6 },
];

const normalizeSearchTableColumns = ({
  columns = [],
  customTypes,
  customColumns = [],
  customTypeConfigs = {},
}) =>
  PILOT_TABLE_COLUMNS.reduce((resultingColumn, column) => {
    const configColumn = columns.find((c) => c.field === column.field);

    resultingColumn.push({
      ...column,
      ...(configColumn ?? {}),
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
