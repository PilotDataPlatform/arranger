import { Component } from 'react';
import { debounce, sortBy } from 'lodash';
import defaultApi from '../utils/api';
import { get } from 'lodash';
import { esToAggTypeMap } from '@pilotdataplatform/arranger-mapping-utils';

let aggFields = `
  state {
    field
    show
    active
  }
`;

export const excludeQueryFields = ['created_time', 'last_updated_time'];

export const queryFromAgg = ({ field, type }) =>
  type === 'Aggregations'
    ? `
        ${field} {
          buckets {
            doc_count
            key_as_string
            key
          }
        }
      `
    : `
      ${field} {
        stats {
          max
          min
          count
          avg
          sum
        }
      }
      `;

const getMappingTypeOfField = ({ mapping = {}, field = '' }) => {
  const mappingPath = field.split('__').join('.properties.');
  return esToAggTypeMap[get(mapping, mappingPath)?.type];
};

export default class extends Component {
  state = { aggs: [], temp: [], mapping: {}, loading: false };

  async componentDidMount() {
    this.fetchAggsState(this.props);
  }

  componentWillReceiveProps(next) {
    if (this.props.graphqlField !== next.graphqlField) {
      this.fetchAggsState(next);
    }
  }

  // fetches the available aggregations from graphql
  fetchAggsState = debounce(async ({ graphqlField }) => {
    this.setState({ loading: true });
    const { api = defaultApi } = this.props;
    try {
      let { data } = await api({
        endpoint: `/${this.props.projectId}/graphql/aggsStateQuery`,
        body: {
          project_code: this.props.projectCode,
          query: `query aggsStateQuery
            {
              ${graphqlField} {
                mapping
                aggsState {
                  ${aggFields}
                }
              }
            }
          `,
        },
      });

      this.setState({
        aggs: data[graphqlField].aggsState.state,
        temp: data[graphqlField].aggsState.state,
        mapping: data[graphqlField].mapping,
      });
    } catch (e) {
      this.props.onFetchAggsError(e);
    }
    this.setState({ loading: false });
  }, 300);

  save = debounce(async (state) => {
    const { api = defaultApi } = this.props;
    let { data } = await api({
      endpoint: `/${this.props.projectId}/graphql`,
      body: {
        variables: { state },
        query: `
          mutation($state: JSON!) {
            saveAggsState(
              state: $state
              graphqlField: "${this.props.graphqlField}"
            ) {
              ${aggFields}
            }
          }
        `,
      },
    });

    this.setState({
      aggs: data.saveAggsState.state,
      temp: data.saveAggsState.state,
    });
  }, 300);

  update = ({ field, key, value }) => {
    let agg = this.state.temp.find((x) => x.field === field);
    let index = this.state.temp.findIndex((x) => x.field === field);
    let temp = Object.assign([], this.state.temp, {
      [index]: { ...agg, [key]: value },
    });
    this.setState({ temp }, () => this.save(temp));
  };

  saveOrder = (orderedFields) => {
    const aggs = this.state.temp;
    if (
      orderedFields.every((field) => aggs.find((agg) => agg.field === field)) &&
      aggs.every((agg) => orderedFields.find((field) => field === agg.field))
    ) {
      this.save(sortBy(aggs, (agg) => orderedFields.indexOf(agg.field)));
    } else {
      console.warn('provided orderedFields are not clean: ', orderedFields);
    }
  };

  render() {
    const { mapping } = this.state;
    return this.props.render({
      update: this.update,
      aggs: this.state.temp.map((x) => {
        const type = getMappingTypeOfField({ field: x.field, mapping }) || x.type;
        const agg = {
          ...x,
          type,
          isTerms: type === 'Aggregations',
          ...(!excludeQueryFields.some((excludeField) => excludeField === x.field)
            ? {
                query: queryFromAgg({
                  ...x,
                  type,
                }),
              }
            : {}),
        };

        return agg;
      }),
      saveOrder: this.saveOrder,
      loading: this.state.loading,
    });
  }
}
