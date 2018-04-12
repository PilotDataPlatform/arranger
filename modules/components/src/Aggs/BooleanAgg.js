import React, { Component } from 'react';
import AggsWrapper from './AggsWrapper.js';
import { css } from 'emotion';
import {
  toggleSQON,
  inCurrentSQON,
  replaceSQON,
  removeSQON,
} from '../SQONView/utils';
import './BooleanAgg.css';
import TextHighlight from '../TextHighlight';
import ToggleButton from '../ToggleButton';

export default ({
  field,
  buckets,
  handleValueClick = () => {},
  isActive = () => false,
  collapsible,
  WrapperComponent,
  displayName,
  searchString,
  valueKeys = {
    true: 'true',
    false: 'false',
  },
  displayKeys = {
    true: 'Yes',
    false: 'No',
  },
  ...rest
}) => {
  const trueBucket = buckets.find(
    ({ key_as_string }) => key_as_string === valueKeys.true,
  );
  const falseBucket = buckets.find(
    ({ key_as_string }) => key_as_string === valueKeys.false,
  );
  const dotField = field.replace(/__/g, '.');

  const isTrueActive = isActive({
    value: valueKeys.true,
    field: dotField,
  });
  const isFalseActive = isActive({
    value: valueKeys.false,
    field: dotField,
  });
  const isNeitherActive = !isTrueActive && !isFalseActive;

  const handleChange = isTrue => {
    console.log(handleValueClick);
    if (isTrue !== undefined) {
      handleValueClick({
        bucket: isTrue ? trueBucket : falseBucket,
        generateNextSQON: sqon =>
          replaceSQON(
            {
              op: 'and',
              content: [
                {
                  op: 'in',
                  content: {
                    field: dotField,
                    value: [valueKeys[isTrue ? 'true' : 'false']],
                  },
                },
              ],
            },
            sqon,
          ),
      });
    } else {
      handleValueClick({
        bucket: null,
        generateNextSQON: sqon => removeSQON(dotField, sqon),
      });
    }
  };

  return (
    <AggsWrapper {...{ displayName, WrapperComponent, collapsible }}>
      <ToggleButton
        {...{
          value: isTrueActive
            ? valueKeys.true
            : isFalseActive ? valueKeys.false : undefined,
          options: [
            {
              value: undefined,
              title: 'any',
            },
            {
              value: valueKeys.true,
              title: (
                <>
                  <TextHighlight
                    content={displayKeys.true}
                    highlightText={searchString}
                  />
                  {trueBucket && (
                    <span
                      className={`bucket-count`}
                      style={{
                        marginLeft: 2,
                      }}
                    >
                      {trueBucket.doc_count}
                    </span>
                  )}
                </>
              ),
            },
            {
              value: valueKeys.false,
              title: (
                <>
                  <TextHighlight
                    content={displayKeys.false}
                    highlightText={searchString}
                  />
                  {falseBucket && (
                    <span
                      className={`bucket-count`}
                      style={{
                        marginLeft: 2,
                      }}
                    >
                      {falseBucket.doc_count}
                    </span>
                  )}
                </>
              ),
            },
          ],
          onChange: ({ value }) => {
            handleChange(
              value === valueKeys.true
                ? true
                : value === valueKeys.false ? false : undefined,
            );
          },
        }}
      />
    </AggsWrapper>
  );
};