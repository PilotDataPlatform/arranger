import { get } from 'lodash';

import resolveAggregations from './resolveAggregations';
import resolveHits from './resolveHits';

type TcreateConnectionResolversArgs = {
  type: Object,
};
type TcreateConnectionResolvers = (
  args: TcreateConnectionResolversArgs,
) => Object;
let createConnectionResolvers: TcreateConnectionResolvers = ({
  type,
  indexPrefix,
}) => ({
  [type.name]: {
    mapping: () => {
      // TODO: stitch extended mapping
      return type.mapping;
    },
    extended: (obj, { fields }) => {
      return fields
        ? type.extendedFields.filter(x => fields.includes(x.field))
        : type.extendedFields;
    },
    aggsState: async (obj, { indices }, { es, projectId }) => {
      const data = await es.search({
        index: `${type.indexPrefix}-aggs-state`,
        type: `${type.indexPrefix}-aggs-state`,
        body: {
          sort: [{ timestamp: { order: 'desc' } }],
          size: 1,
        },
      });

      return get(data, 'hits.hits[0]._source', null);
    },
    columnsState: async (obj, t, { es, projectId }) => {
      let data = await es.search({
        index: `${type.indexPrefix}-columns-state`,
        type: `${type.indexPrefix}-columns-state`,
        body: {
          sort: [{ timestamp: { order: 'desc' } }],
          size: 1,
        },
      });

      return get(data, 'hits.hits[0]._source', null);
    },
    hits: resolveHits(type),
    aggregations: resolveAggregations(type),
  },
  [type.name + 'Connection']: {
    edges: edges => edges.hits,
  },
  [type.name + 'Edge']: {
    node: node => node,
  },
});

export default createConnectionResolvers;
