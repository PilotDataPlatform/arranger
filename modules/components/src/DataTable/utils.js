import React from 'react';
import { FileOutlined } from '@ant-design/icons';

import columnTypes from './columnTypes';
import searchTableType from './searchTableTypes';
import { withProps } from 'recompose';
import { isNil, sortBy } from 'lodash';

export function getSingleValue(data) {
  if (typeof data === 'object' && data) {
    return getSingleValue(Object.values(data)[0]);
  } else {
    return data;
  }
}

export function normalizeColumns({
  columns = [],
  customTypes,
  customColumns = [],
  customTypeConfigs = {},
}) {
  const types = {
    ...columnTypes,
  };

  const mappedColumns = columns
    .map((column) => {
      const customCol =
        customColumns.find((cc) => cc.content.field === column.field)?.content || {};

      return {
        ...column,
        show: typeof column.show === 'boolean' ? column.show : true,
        Cell: column.Cell || types[column.isArray ? 'list' : column.type],
        hasCustomType: isNil(column.hasCustomType)
          ? !!(customTypes || {})[column.type]
          : column.hasCustomType,
        ...(!column.accessor && !column.id ? { id: column.field } : {}),
        ...(customTypeConfigs[column.type] || {}),
        ...customCol,
      };
    })
    .filter((x) => x.show || x.canChangeShow);

  // filter out override columns
  const filteredCustomCols = customColumns.filter(
    (cc) => !mappedColumns.some((col) => col.field === cc.content.field),
  );

  return sortBy(filteredCustomCols, 'index').reduce(
    (arr, { index, content }, i) => [...arr.slice(0, index + i), content, ...arr.slice(index + i)],
    mappedColumns,
  );
}

export const withNormalizedColumns = withProps(
  ({ config = {}, customTypes, customColumns, customTypeConfigs }) => ({
    config: {
      ...config,
      columns: normalizeColumns({
        columns: config.columns,
        customTypes,
        customColumns,
        customTypeConfigs,
      }),
    },
  }),
);

// add width
const PILOT_TABLE_COLUMNS = [
  { field: 'icon', title: <FileOutlined />, sorter: true, order: 1 },
  { field: 'name', sorter: true, title: 'Name', order: 2 },
  { field: 'owner', sorter: true, title: 'Added', order: 3 },
  { field: 'created_time', sorter: true, title: 'Created', order: 4 },
  { field: 'size', sorter: true, title: 'Size', order: 5 },
  { field: 'zone', title: 'Destination', order: 6 },
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
