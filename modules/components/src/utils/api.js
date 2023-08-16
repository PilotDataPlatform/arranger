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
  'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ1X01xak4zbmxoYWl2ZndsSlFBTlJtclNvVFRqbkluaEEyandPbmhlQUtBIn0.eyJleHAiOjE2OTIwNDk5NDcsImlhdCI6MTY5MjA0OTY0NywiYXV0aF90aW1lIjoxNjkyMDQ5NjE5LCJqdGkiOiI1YzNkNGZjOS00Y2QxLTRjOGMtOWExZS1kMDhjNmFlMjUyNjIiLCJpc3MiOiJodHRwczovL2lhbS5kZXYucGlsb3QuaW5kb2NyZXNlYXJjaC5jb20vcmVhbG1zL3BpbG90IiwiYXVkIjpbIm1pbmlvIiwicmVhbG0tbWFuYWdlbWVudCIsImFjY291bnQiXSwic3ViIjoiYTZkYWYyYmYtODc1ZC00Mjk3LWIwZWQtYmUzYTRmYzJkM2JiIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoicmVhY3QtYXBwIiwibm9uY2UiOiIyOTcyY2RkYy01ZmNhLTRiMjYtOGMyNC1jOTY4YjgxNDM4NTgiLCJzZXNzaW9uX3N0YXRlIjoiZWM5ZDA2OWYtMzAyYS00MTlkLTg4ODgtNGM5NDIyODI4MGRmIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHBzOi8vYXBpLnBpbG90LmluZG9jcmVzZWFyY2guY29tIiwiaHR0cHM6Ly9kZXYucGlsb3QuaW5kb2NyZXNlYXJjaC5jb20iLCIqIiwiaHR0cDovL2xvY2FsaG9zdDozMDAwIiwiaHR0cHM6Ly9hdXRoLmRldi5waWxvdC5pbmRvY3Jlc2VhcmNoLmNvbSJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiZGVmYXVsdC1yb2xlcy1waWxvdCIsImFkbWluLXJvbGUiLCJvZmZsaW5lX2FjY2VzcyIsInBsYXRmb3JtLWFkbWluIiwib2ZmbGluZV9hY2Nlc3NfdGVzdCIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsicmVhbG0tbWFuYWdlbWVudCI6eyJyb2xlcyI6WyJ2aWV3LWlkZW50aXR5LXByb3ZpZGVycyIsInZpZXctcmVhbG0iLCJtYW5hZ2UtaWRlbnRpdHktcHJvdmlkZXJzIiwiaW1wZXJzb25hdGlvbiIsInJlYWxtLWFkbWluIiwiY3JlYXRlLWNsaWVudCIsIm1hbmFnZS11c2VycyIsInF1ZXJ5LXJlYWxtcyIsInZpZXctYXV0aG9yaXphdGlvbiIsInF1ZXJ5LWNsaWVudHMiLCJxdWVyeS11c2VycyIsIm1hbmFnZS1ldmVudHMiLCJtYW5hZ2UtcmVhbG0iLCJ2aWV3LWV2ZW50cyIsInZpZXctdXNlcnMiLCJ2aWV3LWNsaWVudHMiLCJtYW5hZ2UtYXV0aG9yaXphdGlvbiIsIm1hbmFnZS1jbGllbnRzIiwicXVlcnktZ3JvdXBzIl19LCJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9wZW5pZCBlbWFpbCBwcm9maWxlIGdyb3VwcyIsInNpZCI6ImVjOWQwNjlmLTMwMmEtNDE5ZC04ODg4LTRjOTQyMjgyODBkZiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoic2FtIHpoYW5nIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiYWRtaW4iLCJnaXZlbl9uYW1lIjoic2FtIiwiZmFtaWx5X25hbWUiOiJ6aGFuZyIsImVtYWlsIjoic3poYW5nQGluZG9jcmVzZWFyY2gub3JnIiwiZ3JvdXAiOltdfQ.3pbAnAn5EZdQ3O016b4VT874vq8mxXIl2RAjj19_Ga999aYhz3QNVNmaeAUr_TWheztpKLjw79pVe_c8d4izK0Ynx2PS2NMvLbz59pSPvs2S0UIhZbfQcv3fQZfxc51HKZaHo7vvI-qp-s_Lj5rnExrCr-t5994IeYguUud1EV1CGHeoOAwiVLpQAmlFOQ62VBxSigWsgMSp2qlqZ8XWDoLMgFrYiA_-zqaoUnn--OL6BUPEI9MNYykNTzzXJN-_RjUpueQXXSW1mM-7e6J0-W26EtLBn4SrFuipEkBzT-dGd56FkfWAffhiQd6Pm7CqDowU0nC8KY1KWUNDCtMbwA';

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
