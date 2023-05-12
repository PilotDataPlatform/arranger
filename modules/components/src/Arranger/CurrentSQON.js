import React from 'react';
import { compose } from 'recompose';
import Component from 'react-component-component';
import { truncate } from 'lodash';
import { format } from 'date-fns';

import SQONView, { Value, Bubble, Field, CurrentFilters } from '../SQONView';
import { fetchExtendedMapping } from '../utils/api';
import internalTranslateSQONValue from '../utils/translateSQONValue';

// Portal version of CurrentSQON
export const CurrentFacetFilters = ({
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

export const CurrentSQON = ({
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
  <SQONView
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

const CurrentSQONState = ({
  sqon,
  setSQON,
  graphqlField,
  projectId,
  projectCode,
  renderCurrentSQON = (props) => <CurrentSQON {...props} />,
  ...props
}) => {
  return (
    <Component
      initialState={{ extendedMapping: null }}
      didMount={({ state: { extendedMapping }, setState }) =>
        fetchExtendedMapping({ graphqlField, projectId, projectCode, api: props.api }).then(
          ({ extendedMapping }) => {
            return setState({ extendedMapping });
          },
        )
      }
    >
      {({ state: { extendedMapping } }) =>
        renderCurrentSQON({ ...{ sqon, setSQON, extendedMapping, ...props } })
      }
    </Component>
  );
};

export default CurrentSQONState;
