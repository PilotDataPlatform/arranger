import React from 'react';
import { compose, withProps } from 'recompose';

import { Button, Tooltip } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

import CurrentSQON from '../../Arranger/CurrentSQON';
import CurrentFacetFilters from './FilterBar';
import DropDown, { MultiSelectDropDown } from '../../DropDown';
import { generateNextSQON } from '../../TextFilter';
import download from '../../utils/download';
import stringCleaner from '../../utils/stringCleaner';
import exporterProcessor from './helpers';
import './Toolbar.css';
import moment from 'moment';

const enhance = compose(
  withProps(({ columns }) => ({
    canChangeShowColumns: columns.filter((column) => column.canChangeShow),
  })),
);

/** Advanced Implementation details ****** (TODO: move to TS)
 * This component allows library integrators to pass custom exporters (functionality to be run on the data, e.g. get JSON)
 * They can provide their own function (default is saveTSV) through `exporter`, and leverage other props like
 * `exportTSVText` and `exportTSVFilename` in order to customise the resulting button; or they can display multiple
 * options in a dropdown, by passing an array of objects with details like so:
 *
 * exporter = [{
 *   label: '' || () => </>,
 *   fileName?: '',
 *   function?: () => {},
 *   columns?: [''] | [{ fieldName, displayName }],
 *   requiresRowSelection?: false,
 * }, ...]
 *
 * A label doesn't require an exporter function, and can be a React component (e.g. to display instructions, a divider, etc.)
 * furthermore, if label is 'saveTSV', Arranger will use its internal TSV exporter.
 * The function attribute accepts 'saveTSV' as well, in case you wish to use a custom label for it.
 * When a fileName is given without a custom function, Arranger will also produce a TSV file.
 * Columns passed here override the ones being displayed in the table.
 * the format for these is always an array, which could consist of one of the following types:
 * accessor strings, or objects with "fieldName" and "displayName" function/string.
 * If columns is undefined/null, the exporter will use all the columns shown in the table.
 * However, if columns is an empty array, the exporter will use all the columns declared in the column-state config.
 */

const TableToolbar = ({
  allColumns = [],
  allowTSVExport = true,
  columns,
  customActions = null,
  downloadUrl,
  enableSelectedTableRowsExporterFilter = false,
  selectedRowsFilterPropertyName = 'file_autocomplete',
  exporter = null,
  exporterLabel = 'Download',
  exportTSVFilename = '',
  exportTSVText = 'Download',
  tooltipTitle = 'Download search table (TSV)',
  page = 0,
  pageSize = 0,
  projectCode,
  projectId,
  graphqlField,
  selectedTableRows = [],
  sqon = {},
  setSQON,
  total,
  transformParams = (params) => params,
  type = '',
}) => {
  const { singleExporter, exporterArray, multipleExporters } = exporterProcessor(
    exporter,
    allowTSVExport,
    exportTSVText,
  );

  const hasSelectedRows = selectedTableRows.length > 0;

  const downloadSqon =
    enableSelectedTableRowsExporterFilter && hasSelectedRows
      ? {
          op: 'and',
          content: [
            {
              op: 'in',
              content: { field: selectedRowsFilterPropertyName, value: selectedTableRows },
            },
          ],
        }
      : sqon;

  const downloadColumns = [
    ...columns.map((c) => {
      if (c.field === 'size') {
        c.Header = 'Size (bytes)';
      }

      return c;
    }),
    {
      field: 'zone',
      title: 'Destination',
      width: '19%',
      order: 6,
      accessor: 'zone',
      show: true,
      type: 'string',
      sortable: false,
      canChangeShow: true,
      query: null,
      jsonPath: null,
      Header: 'Zone',
      extendedType: 'keyword',
      isArray: false,
      extendedDisplayValues: {},
      dataIndex: 'zone',
      key: 'zone',
    },
  ];

  const defaultFileName = 'pilotsearch';

  return (
    <div className="tableToolbar">
      <div className="tableToolbar__pagination-display">
        <span className="numbers">
          {`Showing ${total > 0 ? ((page - 1) * pageSize + 1).toLocaleString() : 0} - ${Math.min(
            page * pageSize,
            total,
          ).toLocaleString()}`}
        </span>{' '}
        <span className="ofTotal">of {total?.toLocaleString()}</span>{' '}
      </div>

      <div className="tableToolbar__page-plugin-filter">
        <div
          className={`tableToolbar__plugins ${
            sqon?.content?.length ? 'tableToolbar_plugins--active-filters' : ''
          }`}
        >
          {multipleExporters ? ( // check if we're given more than one custom exporter
            <div className="buttonWrapper">
              <DropDown
                aria-label={`Download options`}
                itemToString={(i) =>
                  typeof i.exporterLabel === 'function' ? <i.exporterLabel /> : i.exporterLabel
                }
                hasSelectedRows={hasSelectedRows}
                items={exporterArray}
                onChange={({
                  exporterColumns,
                  exporterLabel,
                  exporterFileName,
                  exporterFunction,
                  exporterRequiresRowSelection,
                  exporterValueWhenEmpty: valueWhenEmpty,
                }) =>
                  (exporterRequiresRowSelection && !hasSelectedRows) ||
                  exporterFunction?.(
                    transformParams({
                      files: [
                        {
                          allColumns,
                          columns: downloadColumns,
                          exporterColumns,
                          fileName: exporterFileName
                            ? `${exporterFileName}${
                                exporterFileName.toLowerCase().endsWith('.tsv') ? '' : '.tsv'
                              }`
                            : `${stringCleaner(exporterLabel.toLowerCase())}.tsv`,
                          fileType: 'tsv',
                          index: type,
                          sqon: downloadSqon,
                          valueWhenEmpty,
                        },
                      ],
                      selectedTableRows,
                      url: downloadUrl,
                    }),
                    download,
                  )
                }
                singleSelect={true}
              >
                {exporterLabel}
              </DropDown>
            </div>
          ) : (
            // else, use a custom function if any is given, or use the default saveTSV if the flag is on
            singleExporter && (
              <div className="buttonWrapper">
                <Tooltip title={tooltipTitle} overlayClassName="arranger__download-tooltip">
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={() => {
                      (exporter?.[0]?.requiresRowSelection && !hasSelectedRows) ||
                        singleExporter(
                          transformParams({
                            files: [
                              {
                                columns: downloadColumns,
                                fileName:
                                  exportTSVFilename ||
                                  `${defaultFileName}-table-${moment().format(
                                    'YYYY-MM-DD',
                                  )}-${moment().format('HH-mm-ss')}.tsv`,
                                fileType: 'tsv',
                                index: type,
                                sqon: downloadSqon,
                              },
                            ],
                            url: downloadUrl,
                            projectCode,
                            // remove uuid prefix to correctly pass params to download endpoint
                            identifiers: selectedTableRows.map((id) => id.split('-uuid-')[0]), // if no selected rows, empty array will download all files within selected facets
                          }),
                        );
                    }}
                  >
                    {exportTSVText}
                  </Button>
                </Tooltip>
              </div>
            )
          )}
          {customActions}
        </div>
      </div>

      <CurrentSQON
        sqon={sqon}
        setSQON={setSQON}
        graphqlField={graphqlField}
        projectId={projectId}
        projectCode={projectCode}
        renderCurrentSQON={(props) => <CurrentFacetFilters {...props} />}
      />
    </div>
  );
};

export default enhance(TableToolbar);
