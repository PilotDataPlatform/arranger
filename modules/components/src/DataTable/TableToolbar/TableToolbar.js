import React from 'react';
import { compose, withProps, withPropsOnChange, withState } from 'recompose';
import { debounce } from 'lodash';
import { css } from 'emotion';

import { Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

import CurrentSQON from '../../Arranger/CurrentSQON';
import CurrentFacetFilters from './FilterBar';
import DropDown, { MultiSelectDropDown } from '../../DropDown';
import { addInSQON, currentFilterValue } from '../../SQONView/utils';
import TextFilter, { generateNextSQON } from '../../TextFilter';
import download from '../../utils/download';
import stringCleaner from '../../utils/stringCleaner';
import exporterProcessor from './helpers';
import './Toolbar.css';

const enhance = compose(
  withProps(({ columns }) => ({
    canChangeShowColumns: columns.filter((column) => column.canChangeShow),
  })),
  withPropsOnChange(['onFilterChange'], ({ onFilterChange = () => {} }) => ({
    debouncedOnFilterChange: debounce(onFilterChange, 300),
  })),
  withState('filterVal', 'setFilterVal', ''),
  withPropsOnChange(['sqon'], ({ sqon, setFilterVal }) => {
    if (!currentFilterValue(sqon)) setFilterVal('');
  }),
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
  allowTogglingColumns = true,
  allowTSVExport = true,
  canChangeShowColumns,
  columnDropdownText = 'Show columns',
  columns,
  customActions = null,
  debouncedOnFilterChange,
  defaultColumns,
  downloadUrl,
  enableDropDownControls = false,
  enableSelectedTableRowsExporterFilter = false,
  selectedRowsFilterPropertyName = 'file_autocomplete',
  exporter = null,
  exporterLabel = 'Download',
  exportTSVFilename = '',
  exportTSVText = 'Download Metadata',
  filterInputPlaceholder = 'Filter',
  filterVal,
  InputComponent,
  onColumnsChange,
  onFilterChange,
  onMultipleColumnsChange,
  page = 0,
  pageSize = 0,
  projectCode,
  projectId,
  graphqlField,
  selectedTableRows = [],
  setFilterVal,
  showFilterInput = true,
  sqon = {},
  setSQON,
  style,
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

  return (
    <div className="tableToolbar">
      <div
        className={`tableToolbar__plugins ${
          sqon?.content?.length ? 'tableToolbar_plugins--active-filters' : ''
        }`}
      >
        {/* {allowTogglingColumns &&
          (enableDropDownControls ? (
            <MultiSelectDropDown
              buttonAriaLabelClosed={`Open column selection menu`}
              buttonAriaLabelOpen={`Close column selection menu`}
              itemSelectionLegend={`Select columns to display`}
              selectAllAriaLabel={`Select all columns`}
              resetToDefaultAriaLabel={`Reset to default columns`}
              itemToString={(i) => i.displayName || i.Header}
              items={canChangeShowColumns}
              defaultColumns={defaultColumns}
              onChange={(item) => {
                setFilterVal('');
                onFilterChange({
                  value: '',
                  generateNextSQON: generateNextSQON(''),
                });
                onColumnsChange({ ...item, show: !item.show });
              }}
              onMultipleChange={(changes) => {
                onMultipleColumnsChange(changes);
              }}
            >
              {columnDropdownText}
            </MultiSelectDropDown>
          ) : (
            <DropDown
              aria-label={`Select columns`}
              itemToString={(i) => i.Header}
              items={canChangeShowColumns}
              onChange={(item) => {
                setFilterVal('');
                onFilterChange({
                  value: '',
                  generateNextSQON: generateNextSQON(''),
                });
                onColumnsChange({ ...item, show: !item.show });
              }}
            >
              {columnDropdownText}
            </DropDown>
          ))} */}

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
                        columns,
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
              <Button
                icon={<DownloadOutlined />}
                disabled={exporter?.[0]?.requiresRowSelection && !hasSelectedRows}
                onClick={() => {
                  (exporter?.[0]?.requiresRowSelection && !hasSelectedRows) ||
                    singleExporter(
                      transformParams({
                        files: [
                          {
                            columns,
                            fileName: exportTSVFilename || `${type}-table.tsv`,
                            fileType: 'tsv',
                            index: type,
                            sqon: downloadSqon,
                          },
                        ],
                        url: downloadUrl,
                        projectCode,
                        // remove uuid prefix to correctly pass params to download endpoint
                        identifiers: selectedTableRows.map((id) => id.split('-uuid-')[0]),
                      }),
                    );
                }}
              >
                {exportTSVText}
              </Button>
            </div>
          )
        )}
        {customActions}
      </div>

      <div className="tableToolbar__page-count-filter">
        <div className="tableToolbar__pagination-display">
          <span className="numbers">
            {`Showing ${total > 0 ? ((page - 1) * pageSize + 1).toLocaleString() : 0} - ${Math.min(
              page * pageSize,
              total,
            ).toLocaleString()}`}
          </span>{' '}
          <span className="ofTotal">of {total?.toLocaleString()}</span>{' '}
        </div>

        {showFilterInput && (
          <div className="tableToolbar__filter">
            <TextFilter
              InputComponent={InputComponent}
              value={filterVal}
              placeholder={filterInputPlaceholder}
              onChange={({ value, generateNextSQON }) => {
                setFilterVal(value);
                debouncedOnFilterChange({ value, generateNextSQON });
              }}
            />
          </div>
        )}
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
