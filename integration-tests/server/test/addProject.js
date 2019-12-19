import { expect } from 'chai';
import gql from 'graphql-tag';
import { print } from 'graphql';
import get from 'lodash/get';

export default ({ api, graphqlField, gqlPath }) => {
  it('reads extended mapping properly', async () => {
    let response = await api.post({
      endpoint: gqlPath,
      body: {
        query: print(gql`
          {
            ${graphqlField} {
              extended
            }
          }
        `),
      },
    });
    expect(response.data[graphqlField].extended).to.be.not.empty;
    expect(response.errors).to.be.undefined;
  });
  it('reads elasticsearch mappings properly', async () => {
    let response = await api.post({
      endpoint: gqlPath,
      body: {
        query: print(gql`
          {
            ${graphqlField} {
              mapping
            }
          }
        `),
      },
    });
    expect(response.data[graphqlField].mapping).to.be.not.empty;
    expect(response.errors).to.be.undefined;
  });
  it('reads aggsState properly', async () => {
    let response = await api.post({
      endpoint: gqlPath,
      body: {
        query: print(gql`
          {
            ${graphqlField} {
              aggsState {
                timestamp
                state {
                  field
                  active
                  show
                }
              }
            }
          }
        `),
      },
    });
    expect(get(response, `data[${graphqlField}].aggsState.state`)).to.be.not
      .empty;
    expect(response.errors).to.be.undefined;
  });
  it('reads columns state properly', async () => {
    let response = await api.post({
      endpoint: gqlPath,
      body: {
        query: print(gql`
          {
            ${graphqlField} {
              columnsState {
                state {
                  keyField
                }
              }
            }
          }
        `),
      },
    });
    expect(get(response, `data[${graphqlField}].columnsState.state`)).to.be.not
      .empty;
    expect(response.errors).to.be.undefined;
  });
  it('reads matchbox state properly', async () => {
    let response = await api.post({
      endpoint: gqlPath,
      body: {
        query: print(gql`
          {
            ${graphqlField} {
              matchBoxState {
                state {
                  field
                }
              }
            }
          }
        `),
      },
    });
    expect(get(response, `data[${graphqlField}].matchBoxState.state`)).to.be.not
      .empty;
    expect(response.errors).to.be.undefined;
  });

  it('reads aggregations properly', async () => {
    let response = await api.post({
      endpoint: gqlPath,
      body: {
        query: print(gql`
          {
            ${graphqlField} {
              aggregations {
                clinical_diagnosis__histological_type {
                  buckets {
                    doc_count
                    key
                  }
                }
              }
            }
          }
        `),
      },
    });
    expect(
      get(
        response,
        `data[${graphqlField}].aggregations.clinical_diagnosis__histological_type.buckets`,
      ),
    ).to.be.not.empty;
    expect(response.errors).to.be.undefined;
  });
  it('reads hits properly', async () => {
    let response = await api.post({
      endpoint: gqlPath,
      body: {
        query: print(gql`
          {
            ${graphqlField} {
              hits {
                total
                edges {
                  node {
                    id
                  }
                }
              }
            }
          }
        `),
      },
    });
    expect(get(response, `data[${graphqlField}].hits.edges`)).to.be.not.empty;
    expect(response.errors).to.be.undefined;
  });
};
