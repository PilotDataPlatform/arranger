import download from '../../utils/download';

const useCustomisers =
  (extendedColumn) =>
  ([customiserLabel, customiserValue]) =>
    customiserValue && {
      [customiserLabel]:
        typeof customiserValue === 'function' ? customiserValue(extendedColumn) : customiserValue,
    };

const saveTSV = async ({ url, files = [], projectCode, identifiers, options = {} }) => {
  return download({
    url,
    method: 'POST',
    ...options,
    projectCode,
    params: {
      files: files.map(({ allColumns, columns, exporterColumns = null, ...file }, i) => ({
        ...file,
        columns: exporterColumns // if the component gave you custom columns to show
          ? Object.values(
              exporterColumns.length > 0 // if they ask for any specific columns
                ? // use them
                  exporterColumns.map((column) => {
                    switch (typeof column) {
                      // checking if each column is customised
                      case 'object': {
                        const extendedColumn = allColumns[column.fieldName];
                        const useExtendedCustomisers = useCustomisers(extendedColumn);
                        return {
                          ...extendedColumn,
                          ...Object.entries(column).reduce(
                            (customisers, customiser) => ({
                              ...customisers,
                              ...useExtendedCustomisers(customiser),
                            }),
                            {},
                          ),
                        };
                      }

                      // or not
                      case 'string':
                      default:
                        return allColumns[column];
                    }
                  })
                : allColumns, // else, they're asking for all the columns
            )
          : columns.filter((column) => column.show), // no custom columns, use admin's
      })),
      project_code: projectCode,
      identifiers,
    },
  });
};

const exporterProcessor = (exporter, allowTSVExport, exportTSVText) => {
  const exporterArray =
    Array.isArray(exporter) &&
    exporter
      .filter((item) => item)
      .map((item) => {
        const exporterObj = Object.entries(item).reduce(
          (exporterItem, [key, value]) => ({
            ...exporterItem,
            [`exporter${key[0].toUpperCase()}${key.slice(1)}`]: value,
          }),
          {},
        );

        if (
          [item, item.function].some((fnName) => fnName === 'saveTSV') ||
          (item.hasOwnProperty('fileName') && !item.hasOwnProperty('function'))
        ) {
          return {
            ...exporterObj,
            exporterLabel: item.label || exportTSVText,
            exporterFunction: saveTSV,
          };
        }

        return exporterObj;
      });

  const multipleExporters = exporterArray && exporter.length > 1;

  // this checks whether a single custom function has been provided
  // by itself, or as the single item in an array
  const resolveSingleExporter = (exporter, useDefaultTSV) => {
    switch (true) {
      case exporter instanceof Function:
        return exporter;

      case multipleExporters:
        return exporterArray;

      case exporterArray:
        return exporterArray[0]?.exporterFunction;

      case useDefaultTSV:
        return saveTSV;

      default:
        exporter && // log something to indicate this needs to be addressed
          console.log('The custom exporter(s) format provided was invalid');
    }
  };

  return {
    singleExporter: resolveSingleExporter(exporter, allowTSVExport),
    exporterArray,
    multipleExporters,
  };
};

export default exporterProcessor;
