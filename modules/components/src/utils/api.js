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
const keycloakToken =
  'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ1X01xak4zbmxoYWl2ZndsSlFBTlJtclNvVFRqbkluaEEyandPbmhlQUtBIn0.eyJleHAiOjE2OTIyMTg2NTMsImlhdCI6MTY5MjIxODM1MywiYXV0aF90aW1lIjoxNjkyMjE3NTQ1LCJqdGkiOiJmOTc2NjlhNS0yZjEzLTQ5MDctODg5Mi1mZGJmZjhkMTc3MGMiLCJpc3MiOiJodHRwczovL2lhbS5kZXYucGlsb3QuaW5kb2NyZXNlYXJjaC5jb20vcmVhbG1zL3BpbG90IiwiYXVkIjpbIm1pbmlvIiwicmVhbG0tbWFuYWdlbWVudCIsImFjY291bnQiXSwic3ViIjoiYTZkYWYyYmYtODc1ZC00Mjk3LWIwZWQtYmUzYTRmYzJkM2JiIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoicmVhY3QtYXBwIiwibm9uY2UiOiJmNzAyYTRkNi1jZTMyLTRkYTktOGM2ZS04MDc0NDczZTM1MzQiLCJzZXNzaW9uX3N0YXRlIjoiOGYzZGFiYTQtOGNmZC00MjI3LWIwNTEtMDdkNmM2NTY1MzE0IiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHBzOi8vYXBpLnBpbG90LmluZG9jcmVzZWFyY2guY29tIiwiaHR0cHM6Ly9kZXYucGlsb3QuaW5kb2NyZXNlYXJjaC5jb20iLCIqIiwiaHR0cDovL2xvY2FsaG9zdDozMDAwIiwiaHR0cHM6Ly9hdXRoLmRldi5waWxvdC5pbmRvY3Jlc2VhcmNoLmNvbSJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiZGVmYXVsdC1yb2xlcy1waWxvdCIsImFkbWluLXJvbGUiLCJvZmZsaW5lX2FjY2VzcyIsInBsYXRmb3JtLWFkbWluIiwib2ZmbGluZV9hY2Nlc3NfdGVzdCIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsicmVhbG0tbWFuYWdlbWVudCI6eyJyb2xlcyI6WyJ2aWV3LWlkZW50aXR5LXByb3ZpZGVycyIsInZpZXctcmVhbG0iLCJtYW5hZ2UtaWRlbnRpdHktcHJvdmlkZXJzIiwiaW1wZXJzb25hdGlvbiIsInJlYWxtLWFkbWluIiwiY3JlYXRlLWNsaWVudCIsIm1hbmFnZS11c2VycyIsInF1ZXJ5LXJlYWxtcyIsInZpZXctYXV0aG9yaXphdGlvbiIsInF1ZXJ5LWNsaWVudHMiLCJxdWVyeS11c2VycyIsIm1hbmFnZS1ldmVudHMiLCJtYW5hZ2UtcmVhbG0iLCJ2aWV3LWV2ZW50cyIsInZpZXctdXNlcnMiLCJ2aWV3LWNsaWVudHMiLCJtYW5hZ2UtYXV0aG9yaXphdGlvbiIsIm1hbmFnZS1jbGllbnRzIiwicXVlcnktZ3JvdXBzIl19LCJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9wZW5pZCBlbWFpbCBwcm9maWxlIGdyb3VwcyIsInNpZCI6IjhmM2RhYmE0LThjZmQtNDIyNy1iMDUxLTA3ZDZjNjU2NTMxNCIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoic2FtIHpoYW5nIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiYWRtaW4iLCJnaXZlbl9uYW1lIjoic2FtIiwiZmFtaWx5X25hbWUiOiJ6aGFuZyIsImVtYWlsIjoic3poYW5nQGluZG9jcmVzZWFyY2gub3JnIiwiZ3JvdXAiOltdfQ.FeJ9j9ifnFTg-euPm7iEUuSIZHq7yqPbskDB_4vUCIIAX_OlXg-yOz8pOen4GW38brf7HMPz8JYbheXoT6we36QLaN5Gd1DBuNmuOxmMnxTgofecYf0VCQrkK4lrhXa-hliOS8NV3gBtKQ5wgACzEB-PilY0wUMzN__tJ-bMNnR7z6cNxbSTE1h4zDKiIPy6QxSOURSyL-YuTrYDCQU_Nw5_96vkz_27Y0EO7Bu8OeNvFlvUQUKY8JePssjqZQLZeiXdmLK1VxFJXc5ZIxiTQRYjfhquoA8GkdSvTfA6bMA_iy47jbum_PYmapahSJkEprUxAMNbrcbb9Ra1gAvPaQ';

const defaultApi = ({ endpoint = '', body, headers, method }) => {
  const Token = {
    Authorization: `Bearer ${
      process.env.STORYBOOK_ENV === 'dev' ? keycloakToken : getCookie('AUTH')
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
