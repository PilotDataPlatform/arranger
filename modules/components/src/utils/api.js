import { ARRANGER_API } from './config';
import urlJoin from 'url-join';
import { addDownloadHttpHeaders } from './download';
import { message } from 'antd';

let alwaysSendHeaders = { 'Content-Type': 'application/json' };

// https://javascript.info/cookie
const getCookie = (name) => {
  let matches = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'),
  );
  return matches ? decodeURIComponent(matches[1]) : undefined;
};

const defaultApi = ({ endpoint = '', body, headers, method }) => {
  const Token = {
    Authorization: `Bearer ${
      process.env.STORYBOOK_ENV === 'dev' ? process.env.STORYBOOK_TOKEN : getCookie('AUTH')
    }`,
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
