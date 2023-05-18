import React from 'react';
import { compose } from 'recompose';
import { truncate } from 'lodash';
import { format } from 'date-fns';
import { Row } from '../../Flex';
import { enhance } from '../../SQONView/index';
import { toggleSQON, replaceFilterSQON } from '../../SQONView/utils';
import internalTranslateSQONValue from '../../utils/translateSQONValue';
import './Toolbar.css';

export const Bubble = ({ className = '', children, ...props }) => (
  <div className={`${className} filter-bubble`} {...props}>
    <div>{children}</div>
  </div>
);

export const Field = ({ children, ...props }) => (
  <Bubble className="filter-field" {...props}>
    {children}
  </Bubble>
);

export const Op = ({ children, ...props }) => (
  <Bubble className="filter-op" {...props}>
    {children}
  </Bubble>
);

export const Value = ({ children, className = '', ...props }) => (
  <Bubble className="filter-value" {...props}>
    {children}
  </Bubble>
);

// Portal version of SQON
const FacetFilters = ({ sqon, FieldCrumb, ValueCrumb }) => {
  const sqonContent = sqon?.content || [];
  const isEmpty = sqonContent.length === 0;

  return (
    <div className={`facetFilters ${isEmpty ? 'facetFilters-empty' : ''}`}>
      {sqonContent.length >= 1 && (
        <Row wrap>
          {sqonContent.map((valueSQON, i) => {
            const {
              op,
              content: { field, fields, entity },
            } = valueSQON;

            const value = [].concat(valueSQON.content.value || []);
            const isSingleValue = !Array.isArray(value) || value.length === 1;
            return (
              <Row className="filter-group" key={`${field || fields.join()}.${op}.${value.join()}`}>
                {FieldCrumb({
                  className: 'filter-field',
                  field: op === 'filter' ? (entity ? `${entity}.${op}` : op) : field,
                  nextSQON: toggleSQON(
                    {
                      op: 'and',
                      content: [valueSQON],
                    },
                    sqon,
                  ),
                })}
                <Op>{(op === 'in' && isSingleValue) || op === 'filter' ? 'is' : op}</Op>
                {value.map((value, i) =>
                  ValueCrumb({
                    field,
                    key: value,
                    value,
                    variant: 'portal',
                    className: 'filter-value',
                    nextSQON:
                      op === 'filter'
                        ? replaceFilterSQON(
                            {
                              op: 'and',
                              content: [
                                {
                                  op: op,
                                  content: {
                                    ...(entity && { entity }),
                                  },
                                },
                              ],
                            },
                            sqon,
                          )
                        : toggleSQON(
                            {
                              op: 'and',
                              content: [
                                {
                                  op: op,
                                  content: {
                                    field: field,
                                    value: [value],
                                  },
                                },
                              ],
                            },
                            sqon,
                          ),
                  }),
                )}
                {i < sqonContent.length - 1 && <Op>{sqon.op}</Op>}
              </Row>
            );
          })}
        </Row>
      )}
    </div>
  );
};

const CurrentFilters = enhance(FacetFilters);

// Portal version of SQON
const CurrentFacetFilters = ({
  dateFormat = 'yyyy-MM-dd',
  emptyMessage,
  sqon,
  setSQON,
  extendedMapping,
  valueCharacterLimit = 30,
  onClear = () => {},
  translateSQONValue = (x) => x,
  findExtendedMappingField = (field) => extendedMapping?.find((e) => e.field === field),
  ...props
}) => (
  <CurrentFilters
    emptyMessage={emptyMessage}
    sqon={sqon}
    FieldCrumb={({ field, nextSQON, ...props }) => (
      <Field {...{ field, ...props }}>
        {findExtendedMappingField(field)?.displayName || field}
      </Field>
    )}
    ValueCrumb={({ field, value, nextSQON, ...props }) => (
      <Value onClick={() => setSQON(nextSQON)} {...props}>
        {truncate(
          compose(
            translateSQONValue,
            internalTranslateSQONValue,
          )(
            (findExtendedMappingField(field)?.type === 'date' && format(value, dateFormat)) ||
              (findExtendedMappingField(field)?.displayValues || {})[value] ||
              value,
          ),
          { length: valueCharacterLimit || Infinity },
        )}
      </Value>
    )}
    Clear={({ nextSQON }) => (
      <Bubble
        className="sqon-clear"
        onClick={() => {
          onClear();
          setSQON(nextSQON);
        }}
      >
        Clear
      </Bubble>
    )}
  />
);

export default CurrentFacetFilters;
