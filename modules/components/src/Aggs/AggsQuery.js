import { capitalize } from 'lodash';

import Query from '../Query';
import defaultApiFetcher from '../utils/api';

import { queryFromAgg } from './AggsState';

const AggsQuery = ({
  index = '',
  aggs = [],
  sqon = null,
  apiFetcher = defaultApiFetcher,
  ...props
}) => {
  return !index || !aggs.length ? (
    ''
  ) : (
    <Query
      renderError
      name={`${capitalize(index)}AggregationsQuery`}
      variables={{
        fieldNames: aggs.map((x) => x.fieldName.replace(/__/g, '.')),
        sqon,
      }}
      query={`
        query ${capitalize(index)}AggregationsQuery(
          $fieldNames: [String]
          $sqon: JSON
        ) {
          ${index} {
            aggregations (
              aggregations_filter_themselves: false
              filters: $sqon
            ){
              ${aggs.map((x) => x.query || queryFromAgg(x))}
            }
            configs {
              extended(fieldNames: $fieldNames)
            }
          }
        }
      `}
      {...{ apiFetcher, ...props }}
    />
  );
};

export default AggsQuery;
