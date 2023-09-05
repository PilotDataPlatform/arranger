import { ARRANGER_API } from './config';
import urlJoin from 'url-join';
import { addDownloadHttpHeaders } from './download';

let alwaysSendHeaders = { 'Content-Type': 'application/json' };

// https://javascript.info/cookie
const getCookie = (name) => {
  let matches = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'),
  );
  return matches ? decodeURIComponent(matches[1]) : undefined;
};

// temp solution for local dev keycloak token as they expire now

// create a function that only runs in dev mode
// function will refresh the token and use keycloak.token ?
// or keep refresh logic separate to reduce number of api calls to keycloak

const defaultApi = ({ endpoint = '', body, headers, method }) => {
  const Token = {
    Authorization: `Bearer ${getCookie('AUTH')}`,
  };

  return fetch(urlJoin(ARRANGER_API, endpoint), {
    method: method || 'POST',
    headers: { ...alwaysSendHeaders, ...headers, ...Token },
    body: JSON.stringify(body),
  }).then((r) => r.json());
  // .catch((e) => {
  //   const errorMsg =
  //     'Something went wrong while attempting to retrieve data from arranger. Please try again later';

  //   const existingMessage = document.querySelectorAll(
  //     '.ant-message-notice .ant-message-error span',
  //   );

  //   console.log(existingMessage);

  //   if (existingMessage?.innerText !== errorMsg) {
  //     message.error(errorMsg, 3.5);
  //   }
  // });
};

export const graphql = (body) => api({ endpoint: 'graphql', body });

export const fetchExtendedMapping = ({ graphqlField, projectId, projectCode, api = defaultApi }) =>
  api({
    endpoint: `/${projectId}/graphql`,
    body: {
      project_code: projectCode,
      query: `
        {
          ${graphqlField}{
            extended
          }
        }
      `,
    },
  }).then((response) => ({
    extendedMapping: response.data[graphqlField].extended,
  }));

export const addHeaders = (headers) => {
  alwaysSendHeaders = { ...alwaysSendHeaders, ...headers };
  addDownloadHttpHeaders(headers);
};

export const getAlwaysAddHeaders = () => alwaysSendHeaders;

export default defaultApi;
