import { Component } from 'react';
import { debounce, sortBy } from 'lodash';

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

  fetchColumnsState = debounce(async ({ graphqlField }) => {
    const { api = defaultApi } = this.props;
    try {
      let { data } = await api({
        endpoint: `/${this.props.projectId}/graphql/columnsStateQuery`,
        body: {
          project_code: 'indoctestproject',
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
      config.defaultSorted = [
        {
          field: config.defaultSorted[0].id,
          order: config.defaultSorted[0].desc ? 'desc' : 'asc',
        },
      ];
      let {
        data: {
          [this.props.graphqlField]: { extended },
        },
      } = await api({
        endpoint: `/${this.props.projectId}/graphql`,
        body: {
          project_code: 'indoctestproject',
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
    } catch (e) {
      console.warn(e);
      // this.setState({ })
    }
  }, 300);

  render() {
    let { config, extended } = this.state;
    return config
      ? this.props.render({
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
        })
      : this.props.render({ loading: true, state: { config: null } });
  }
}
