// @flow
import React from 'react';
// $FlowIgnore
import { take, xor } from 'lodash';
import {
  compose,
  withState,
  withProps,
  withHandlers,
  defaultProps,
  // $FlowIgnore
} from 'recompose';

import { Row } from '../Flex';
import { toggleSQON, replaceFilterSQON } from './utils';

export const Bubble = ({ variant = 'default', className, children, ...props }) => {
  className = variant === 'default' ? `sqon-bubble ${className}` : className;

  return (
    <div className={className} {...props}>
      <div>{children}</div>
    </div>
  );
};

export const Field = ({ children, className = 'sqon-field', ...props }) => (
  <Bubble className={className} {...props}>
    {children}
  </Bubble>
);

export const Op = ({ children, className = 'sqon-op', ...props }) => (
  <Bubble className={className} {...props}>
    {children}
  </Bubble>
);

export const Value = ({ variant = 'default', children, className, ...props }) => {
  className = variant === 'default' ? `sqon-value ${className}` : className;

  return (
    <Bubble className={className} {...props}>
      {children}
    </Bubble>
  );
};

const enhance = compose(
  defaultProps({
    FieldCrumb: ({ className, field, nextSQON }) => (
      <Field className={className} onClick={() => console.log(nextSQON)}>
        {field}
      </Field>
    ),
    ValueCrumb: ({ variant, value, nextSQON, ...props }) => (
      <Value
        variant={variant}
        className={className}
        onClick={() => console.log(nextSQON)}
        {...props}
      >
        {value}
      </Value>
    ),
    Clear: ({ nextSQON }) => (
      <Bubble className="sqon-clear" onClick={() => console.log(nextSQON)}>
        Clear
      </Bubble>
    ),
  }),
  withState('expanded', 'setExpanded', []),
  withProps(({ expanded }) => ({
    isExpanded: (valueSQON) => expanded.includes(valueSQON),
  })),
  withHandlers({
    onLessClicked:
      ({ expanded, setExpanded }) =>
      (valueSQON) => {
        setExpanded(xor(expanded, [valueSQON]));
      },
  }),
);

// Portal version of SQON
const FacetFilters = ({ sqon, FieldCrumb, ValueCrumb, isExpanded, onLessClicked }) => {
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
                {/* {(isExpanded(valueSQON) ? value : take(value, 2)).map((value, i) => */}
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
                {/* {value.length > 2 && !isExpanded(valueSQON) && (
                  <button className="filter-more" onClick={() => onLessClicked(valueSQON)}>
                    ...
                  </button>
                )}
                {isExpanded(valueSQON) && (
                  <button className="filter-less" onClick={() => onLessClicked(valueSQON)}>
                    -
                  </button>
                )} */}
                {i < sqonContent.length - 1 && <Op>{sqon.op}</Op>}
              </Row>
            );
          })}
        </Row>
      )}
    </div>
  );
};

export const CurrentFilters = enhance(FacetFilters);

const SQON = ({
  emptyMessage = 'Start by selecting filters',
  sqon,
  FieldCrumb,
  ValueCrumb,
  Clear,
  isExpanded,
  expanded,
  setExpanded,
  onLessClicked,
}) => {
  const sqonContent = sqon?.content || [];
  const isEmpty = sqonContent.length === 0;
  return (
    <div className={`sqon-view ${isEmpty ? 'sqon-view-empty' : ''}`}>
      {isEmpty && (
        <div className="sqon-empty-message">
          <span className="sqon-empty-message-arrow">{'\u2190'}</span>
          {` ${emptyMessage}`}
        </div>
      )}
      {sqonContent.length >= 1 && (
        <Row wrap>
          <Row className="sqon-group" key="clear" style={{ alignItems: 'center' }}>
            {Clear({ nextSQON: null })}
          </Row>
          {sqonContent.map((valueSQON, i) => {
            const {
              op,
              content: { field, fields, entity },
            } = valueSQON;
            const value = [].concat(valueSQON.content.value || []);
            const isSingleValue = !Array.isArray(value) || value.length === 1;
            return (
              <Row
                className="sqon-group"
                key={`${field || fields.join()}.${op}.${value.join()}`}
                style={{ alignItems: 'center' }}
              >
                {FieldCrumb({
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
                {value.length > 1 && (
                  <span className="sqon-value-group sqon-value-group-start">(</span>
                )}
                {(isExpanded(valueSQON) ? value : take(value, 2)).map((value, i) =>
                  ValueCrumb({
                    field,
                    key: value,
                    value,
                    className: isSingleValue ? 'sqon-value-single' : '',
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
                {value.length > 2 && !isExpanded(valueSQON) && (
                  <span className="sqon-more" onClick={() => onLessClicked(valueSQON)}>
                    {'\u2026'}
                  </span>
                )}
                {isExpanded(valueSQON) && (
                  <div className="sqon-less" onClick={() => onLessClicked(valueSQON)}>
                    Less
                  </div>
                )}
                {value.length > 1 && (
                  <span className="sqon-value-group sqon-value-group-end">)</span>
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

export default enhance(SQON);
