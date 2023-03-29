import React from 'react';
import { sortBy } from 'lodash';
import { Spin } from 'antd';

import AggregrationBar from './AggregationBar';
import { AggsState, AggsQuery } from '../Aggs';
import aggComponents from '../Aggs/aggComponentsMap.js';

export { AggsWrapper } from '../Aggs';

const BaseWrapper = ({ className, ...props }) => (
  <div {...props} className={`aggregations ${className}`} />
);

export const AggregationsListDisplay = ({
  data,
  onValueChange = () => {},
  aggs,
  graphqlField,
  setSQON,
  sqon,
  containerRef,
  componentProps = {
    getTermAggProps: () => ({}),
    getRangeAggProps: () => ({}),
    getBooleanAggProps: () => ({}),
    getDatesAggProps: () => ({}),
  },
  getCustomItems = ({ aggs }) => [], // Array<{index: number, component: Component | Function}>
  customFacets = [],
  removeAggs = ['zone'],
}) => {
  aggs = aggs.filter((agg) => !removeAggs.find((removeAgg) => removeAgg === agg.field));
  const aggComponentInstances =
    data &&
    aggs
      .map((agg) => {
        return {
          ...agg,
          ...data[graphqlField].aggregations[agg.field],
          ...data[graphqlField].extended.find((x) => x.field.replace(/\./g, '__') === agg.field),
          onValueChange: ({ sqon, value }) => {
            onValueChange(value);
            setSQON(sqon);
          },
          key: agg.field,
          sqon,
          containerRef,
        };
      })
      .map((agg) => {
        const customContent =
          customFacets.find((x) => x.content.field === agg.field)?.content || {};

        return {
          ...agg,
          ...customContent,
        };
      })
      .map((agg) => {
        return aggComponents[agg.type]?.({ ...agg, ...componentProps });
      });

  if (aggComponentInstances) {
    // sort the list by the index specified for each component to prevent order bumping
    const componentListToInsert = sortBy(getCustomItems({ aggs }), 'index');
    // go through the list of inserts and inject them by splitting and joining
    const inserted = componentListToInsert.reduce((acc, { index, component }) => {
      const firstChunk = acc.slice(0, index);
      const secondChunk = acc.slice(index, acc.length);
      return [...firstChunk, component(), ...secondChunk];
    }, aggComponentInstances);
    return inserted;
  } else {
    return aggComponentInstances;
  }
};

export const AggregationsList = ({
  onValueChange = () => {},
  setSQON,
  sqon,
  setAggregations,
  projectId,
  projectCode,
  graphqlField,
  api,
  containerRef,
  componentProps = {
    getTermAggProps: () => ({}),
    getRangeAggProps: () => ({}),
    getBooleanAggProps: () => ({}),
    getDatesAggProps: () => ({}),
  },
  aggs = [],
  getCustomItems,
  customFacets = [],
}) => (
  <AggsQuery
    api={api}
    debounceTime={300}
    projectId={projectId}
    projectCode={projectCode}
    index={graphqlField}
    sqon={sqon}
    aggs={aggs}
    setAggregations={setAggregations}
    render={({ data }) =>
      AggregationsListDisplay({
        data,
        onValueChange,
        aggs,
        graphqlField,
        setSQON,
        sqon,
        containerRef,
        componentProps,
        getCustomItems,
        customFacets,
      })
    }
  />
);

/**
 * customFacets allows custom content to be passed to each facet in the aggregation list.
 *   This can overwrite any property in the agg object in the aggregation list
 *   The structure of this property is:
 *   [
 *     {
 *       content: {
 *         field: 'field_name', // identify which facet this object customizes
 *         displayName: 'New Display Name for This Field', // modify displayName of the facet
 *       },
 *     },
 *   ]
 *
 */
const Aggregations = ({
  onValueChange = () => {},
  onFetchAggsError = () => {},
  setSQON,
  sqon,
  setAggregations,
  projectId,
  projectCode,
  graphqlField,
  className = '',
  style,
  api,
  Wrapper = BaseWrapper,
  containerRef,
  componentProps = {
    getTermAggProps: () => ({}),
    getRangeAggProps: () => ({}),
    getBooleanAggProps: () => ({}),
    getDatesAggProps: () => ({}),
  },
  customFacets = [],
}) => {
  return (
    <Wrapper
      style={{
        ...style,
        minWidth: '280px',
        backgroundColor: 'white',
        borderBottomLeftRadius: '6px',
      }}
      className={className}
    >
      <AggsState
        api={api}
        projectId={projectId}
        graphqlField={graphqlField}
        onFetchAggsError={onFetchAggsError}
        render={(aggsState) => {
          const aggs = aggsState.aggs.filter((x) => x.show);
          return (
            <>
              <AggregrationBar aggs={aggs} onButtonClick={() => setSQON(null)} />
              {aggsState.loading ? (
                <Spin style={{ display: 'block', margin: '35% auto 0 auto' }} />
              ) : (
                <AggregationsList
                  onValueChange={onValueChange}
                  setSQON={setSQON}
                  setAggregations={setAggregations}
                  style={style}
                  Wrapper={Wrapper}
                  containerRef={containerRef}
                  componentProps={componentProps}
                  api={api}
                  debounceTime={300}
                  projectId={projectId}
                  projectCode={projectCode}
                  graphqlField={graphqlField}
                  sqon={sqon}
                  aggs={aggs}
                  customFacets={customFacets}
                />
              )}
            </>
          );
        }}
      />
    </Wrapper>
  );
};

export default Aggregations;
