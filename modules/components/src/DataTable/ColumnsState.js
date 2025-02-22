import { Component } from 'react';
import { debounce } from 'lodash';

import defaultApi from '../utils/api';

let columnFields = `
  state {
    type
    keyField
    defaultSorted {
      id
      desc
    }
    columns {
      field
      accessor
      show
      type
      sortable
      canChangeShow
      query
      jsonPath
    }
  }
`;

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      config: null,
      extended: [],
    };
  }

  async componentDidMount() {
    this.fetchColumnsState(this.props);
  }

  componentWillReceiveProps(next) {
    if (this.props.graphqlField !== next.graphqlField) {
      this.fetchColumnsState(next);
    }
  }

  generateColumnState(config, extended) {
    return config
      ? {
          loading: false,
          state: {
            ...config,
            columns: config.columns.map((column) => {
              const extendedField = extended.find((e) => e.field === column.field);
              return {
                ...column,
                Header: extendedField?.displayName || column.field,
                extendedType: extendedField?.type,
                isArray: extendedField?.isArray,
                show: column.show,
                extendedDisplayValues: extendedField?.displayValues,
              };
            }),
            defaultColumns: config.columns.filter((column) => column.show),
          },
        }
      : { loading: true, state: { config: null } };
  }

  // fetches available columns from graphql
  fetchColumnsState = debounce(async ({ graphqlField }) => {
    const { api = defaultApi } = this.props;
    try {
      let { data } = await api({
        endpoint: `/${this.props.projectId}/graphql/columnsStateQuery`,
        body: {
          project_code: this.props.projectCode,
          query: `query columnsStateQuery
            {
              ${graphqlField} {
                columnsState {
                  ${columnFields}
                }
              }
            }
          `,
        },
      });

      const config = data[graphqlField].columnsState.state;
      // default sort folders before files
      config.defaultSorted = [
        {
          field: 'type',
          order: 'desc',
        },
      ];
      let {
        data: {
          [this.props.graphqlField]: { extended },
        },
      } = await api({
        endpoint: `/${this.props.projectId}/graphql`,
        body: {
          project_code: this.props.projectCode,
          query: `
          query{
            ${this.props.graphqlField} {
              extended
            }
          }
        `,
        },
      });

      this.setState({
        extended,
        config,
      });

      this.props.setArrangerState({
        columnState: this.generateColumnState(config, extended),
      });
    } catch (e) {
      // console.warn(e);
      this.props.onFetchColumnsError(e);
    }
  }, 300);

  render() {
    let { config, extended } = this.state;
    return this.props.render(this.generateColumnState(config, extended));
  }
}
