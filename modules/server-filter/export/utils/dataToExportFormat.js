import { format, isValid, parseISO } from 'date-fns';
import jsonPath from 'jsonpath';
import pkg from 'lodash';
const { get, flatten, isNil } = pkg
import through2 from 'through2';

const STANDARD_DATE = 'yyyy-MM-dd';

const dateHandler = (value, { dateFormat = STANDARD_DATE }) => {
  switch (true) {
    case isNil(value):
      return '';

    case isValid(new Date(value)):
      return format(new Date(value), dateFormat);

    case isValid(parseISO(value)):
      return format(parseISO(value), dateFormat);

    case !isNaN(parseInt(value, 10)):
      return format(parseInt(value, 10), dateFormat);

    default: {
      console.error('unhandled "date"', value, dateFormat);
      return value;
    }
  }
};

const getAllValue = (data) => {
  if (typeof data === 'object') {
    return Object.values(data || {})
      .map(getAllValue)
      .reduce((a, b) => a.concat(b), []);
  } else {
    return data;
  }
};

const getValue = (row, column) => {
  const valueFromExtended = (value) => {
    switch (true) {
      case column?.extendedDisplayValues?.constructor === Object &&
        Object.keys(column.extendedDisplayValues).length > 0:
        return column.extendedDisplayValues[value];

      case column.isArray && Array.isArray(value):
        return value
          .map((each) => valueFromExtended(each))
          .join(';')
          .replace(';;', ';');

      case [column.displayType, column.type].includes('date'):
        return dateHandler(value, { dateFormat: column.displayFormat });

      default:
        return value;
    }
  };

  if (column.jsonPath) {
    return jsonPath
      .query(row, column.jsonPath.split('.hits.edges[*].node.').join('[*].'))
      .map(getAllValue)
      .reduce((a, b) => a.concat(b), [])
      .map(valueFromExtended)
      .join(', ');
  } else if (column.accessor) {
    return valueFromExtended(get(row, column.accessor));
  } else {
    return '';
  }
};

const getRows = (args) => {
  const { row, data = row, paths, pathIndex = 0, columns, entities = [] } = args;
  if (pathIndex >= paths.length - 1) {
    return [
      columns.map((column) => {
        const entity = entities
          .slice()
          .reverse()
          .find((entity) => column.field.indexOf(entity.field) === 0);

        if (entity) {
          return getValue(entity.data, {
            ...column,
            jsonPath: column.field.replace(`${entity.path.join('.')}.`, ''),
          });
        } else {
          return getValue(row, column);
        }
      }),
    ];
  } else {
    const currentPath = paths[pathIndex];
    return flatten(
      (get(data, currentPath) || []).map((node) => {
        return getRows({
          ...args,
          data: node,
          pathIndex: pathIndex + 1,
          entities: [
            ...entities,
            {
              path: paths.slice(0, pathIndex + 1),
              field: paths.slice(0, pathIndex + 1).join(''),
              // TODO: don't assume hits.edges.node.
              // .replace(/(\.hits.edges(node)?)/g, ''),
              data: node,
            },
          ],
        });
      }),
    );
  }
};

export const columnsToHeader = ({ columns, fileType = 'tsv' }) => {
  return fileType === 'tsv'
    ? `${columns.map(({ Header, displayName }) => (displayName ? displayName : Header)).join('\t')}`
    : fileType === 'json'
    ? columns.reduce((output, { Header, displayName, accessor }) => {
        output[[accessor]] = displayName ? displayName : Header;
        return output;
      }, {})
    : '';
};

export const dataToTSV = ({ isFirst, pipe, columns, ...args }) => {
  if (isFirst) {
    const headerRow = columnsToHeader({ columns, fileType: 'tsv' });
    pushToStream(headerRow, pipe);
  }

  transformData({
    isFirst,
    pipe,
    columns,
    ...args,
    dataTransformer: transformDataToTSV,
  });
};

/**
 * This should ideally stream data as a JSON list using JSONStream
 * but as of now; in favor of simplicity; it streams each row as separate JSON object
 * and it is left up to consuming application to make a well formatted
 * JSON list from individual JSON objects
 * See https://github.com/nci-hcmi-catalog/portal/tree/master/api/src/dataExport.js for an example consumer
 * @param {*} param0
 */
export const dataToJSON = ({ isFirst, pipe, columns, ...args }) => {
  if (isFirst) {
    const headerRow = columnsToHeader({ columns, fileType: 'json' });
    pushToStream(JSON.stringify(headerRow), pipe);
  }

  transformData({
    isFirst,
    pipe,
    columns,
    ...args,
    dataTransformer: transformDataToJSON,
  });
};

export function dataToExportFormat ({
  index,
  columns,
  emptyValue, // kept for backwards compatibility. To be deprecated
  uniqueBy,
  valueWhenEmpty = emptyValue || '--',
  fileType = 'tsv',
}) {
  let isFirst = true;
  let chunkCounts = 0;

  return through2.obj(function ({ hits, total }, enc, callback) {
    const outputStream = this;
    dataToStream({
      index,
      columns,
      uniqueBy,
      valueWhenEmpty,
      hits,
      total,
      pipe: outputStream,
      isFirst,
      fileType,
    });

    if (isFirst) {
      isFirst = false;
    }

    callback();
    chunkCounts++;
  });
};

const transformData = ({
  data: { hits, total },
  data,
  index,
  uniqueBy,
  columns,
  valueWhenEmpty,
  dataTransformer,
  pipe,
}) => {
  hits
    .map((row) => dataTransformer({ row, uniqueBy, columns, valueWhenEmpty }))
    .forEach((transformedRow) => {
      pushToStream(transformedRow, pipe);
    });
};

const transformDataToTSV = ({ row, uniqueBy, columns, valueWhenEmpty }) => {
  return getRows({
    row: row._source,
    paths: (uniqueBy || '').split('.hits.edges[].node.').filter(Boolean),
    columns: columns,
    valueWhenEmpty,
  }).map((r) => rowToTSV({ row: r, valueWhenEmpty }));
};

const transformDataToJSON = ({ row, uniqueBy, columns, valueWhenEmpty }) => {
  return JSON.stringify(
    rowToJSON({
      row: row._source,
      paths: (uniqueBy || '').split('.hits.edges[].node.').filter(Boolean),
      columns: columns,
      valueWhenEmpty,
    }),
  );
};

const dataToStream = ({
  index,
  columns,
  uniqueBy,
  valueWhenEmpty = '--',
  hits,
  total,
  pipe,
  isFirst,
  fileType = 'tsv',
}) => {
  const args = {
    data: { hits, total },
    index,
    uniqueBy,
    columns,
    valueWhenEmpty,
    pipe,
    isFirst,
  };

  // transform and stream data
  if (fileType === 'tsv') {
    dataToTSV(args);
  } else if (fileType === 'json') {
    dataToJSON(args);
  } else {
    throw new Error('Unsupported file type specified for export.');
  }
};

const rowToTSV = ({ row, valueWhenEmpty }) => row.map((r) => r || valueWhenEmpty).join('\t');

/*
example args:
{ row:                                                                                                                                         [250/1767]
   { name: 'HCM-dddd-0000-C00',
     type: '2-D: Conditionally reprogrammed cells',
     growth_rate: 5,
     files: [],
     clinical_diagnosis: { clinical_tumor_diagnosis: 'Colorectal cancer' },
     variants: [ [Object], [Object], [Object] ]
    },
  paths: [],
  columns:
   [ { field: 'name',
       accessor: 'name',
       show: true,
       type: 'entity',
       sortable: true,
       canChangeShow: true,
       query: null,
       jsonPath: null,
       Header: 'Name',
       extendedType: 'keyword',
       extendedDisplayValues: {},
       hasCustomType: true,
       minWidth: 140 },
       { field: 'split_ratio',
       accessor: 'split_ratio',
       show: true,
       type: 'string',
       sortable: true,
       canChangeShow: true,
       query: null,
       jsonPath: null,
       Header: 'Split Ratio',
       extendedType: 'keyword',
       extendedDisplayValues: {},
       hasCustomType: false } ],
  valueWhenEmpty: '--' }
*/
const rowToJSON = (args) => {
  const { row, data = row, paths, pathIndex = 0, columns, valueWhenEmpty, entities = [] } = args;
  return (columns || [])
    .filter((col) => col.show)
    .reduce((output, col) => {
      output[[col.accessor]] = row[col.accessor] || valueWhenEmpty;
      return output;
    }, {});
};

const pushToStream = (line, stream) => {
  stream.push(`${line}\n`);
};