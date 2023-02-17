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

  save = debounce(async (state) => {
    const { api = defaultApi } = this.props;
    let { data } = await api({
      endpoint: `/${this.props.projectId}/graphql`,
      body: {
        variables: { state },
        query: `
        mutation($state: JSON!) {
          saveColumnsState(
            state: $state
            graphqlField: "${this.props.graphqlField}"
          ) {
            ${columnFields}
          }
        }
      `,
      },
    });
    this.setState({
      config: data.saveColumnsState.state,
    });
  }, 300);

  update = ({ field, key, value }) => {
    let index = this.state.config.columns.findIndex((x) => x.field === field);
    let column = this.state.config.columns[index];
    let temp = {
      ...this.state.config,
      columns: Object.assign([], this.state.config.columns, {
        [index]: { ...column, [key]: value },
      }),
    };

    this.setState({ temp }, () => this.save(temp));
  };

  add = (column) => {
    const { id } = column;
    let existing = this.state.config.columns.find((x) => x.id === id);
    if (existing) return;
    let temp = {
      ...this.state.config,
      columns: [...this.state.config.columns, column],
    };

    this.setState({ temp }, () => this.save(temp));
  };

  saveOrder = (orderedFields) => {
    const columns = this.state.config.columns;
    if (
      orderedFields.every((field) => columns.find((column) => column.field === field)) &&
      columns.every((column) => orderedFields.find((field) => field === column.field))
    ) {
      this.save({
        ...this.state.config,
        columns: sortBy(columns, ({ field }) => orderedFields.indexOf(field)),
      });
    } else {
      console.warn('provided orderedFields are not clean: ', orderedFields);
    }
  };

  render() {
    let { config, extended } = this.state;
    return config
      ? this.props.render({
          loading: false,
          update: this.update,
          add: this.add,
          saveOrder: this.saveOrder,
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
