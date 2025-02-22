import React from 'react';
import { capitalize } from 'lodash';
import Query from '../Query';
import defaultApi from '../utils/api';
import { queryFromAgg } from './AggsState';
import { excludeQueryFields } from './AggsState';

export default ({ index = '', aggs = [], sqon = null, api = defaultApi, ...props }) => {
  return !index || !aggs.length ? (
    ''
  ) : (
    <Query
      renderError
      name={`${capitalize(index)}AggregationsQuery`}
      index={index}
      variables={{
        fields: aggs.map((x) => x.field.replace(/__/g, '.')),
        sqon,
      }}
      query={`
        query ${capitalize(index)}AggregationsQuery(
          $fields: [String]
          $sqon: JSON
        ) {
          ${index} {
            extended(fields: $fields)
            aggregations (
              aggregations_filter_themselves: false
              filters: $sqon
            ){
              ${aggs.map(
                (x) =>
                  x.query ||
                  (!excludeQueryFields.some((excludedField) => excludedField === x.field)
                    ? queryFromAgg(x)
                    : x.query),
              )}
            }
          }
        }
      `}
      {...{ api, ...props }}
    />
  );
};
