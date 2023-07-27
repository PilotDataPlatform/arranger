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

// temp solution for keycloak token as they expire now
const keycloakToken =
  'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ1X01xak4zbmxoYWl2ZndsSlFBTlJtclNvVFRqbkluaEEyandPbmhlQUtBIn0.eyJleHAiOjE2OTA0OTE5ODAsImlhdCI6MTY5MDQ5MTY4MCwiYXV0aF90aW1lIjoxNjkwNDkxNjY3LCJqdGkiOiI5YjFhZTNlMS0yNWE3LTQ4NzYtODM4Ny1jOGM0NzU2NjdiZDgiLCJpc3MiOiJodHRwczovL2lhbS5kZXYucGlsb3QuaW5kb2NyZXNlYXJjaC5jb20vcmVhbG1zL3BpbG90IiwiYXVkIjpbIm1pbmlvIiwicmVhbG0tbWFuYWdlbWVudCIsImFjY291bnQiXSwic3ViIjoiYTZkYWYyYmYtODc1ZC00Mjk3LWIwZWQtYmUzYTRmYzJkM2JiIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoicmVhY3QtYXBwIiwibm9uY2UiOiI2Y2E1MjhjMC00NzhlLTQ5NjktOGE3NC1mMDJkZWEyOGQ0ZGMiLCJzZXNzaW9uX3N0YXRlIjoiYTg0MjU4MmItMDU2MS00MDg4LWE4NDYtNTI2N2E4ZTkzYjNiIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHBzOi8vYXBpLnBpbG90LmluZG9jcmVzZWFyY2guY29tIiwiaHR0cHM6Ly9kZXYucGlsb3QuaW5kb2NyZXNlYXJjaC5jb20iLCIqIiwiaHR0cDovL2xvY2FsaG9zdDozMDAwIiwiaHR0cHM6Ly9hdXRoLmRldi5waWxvdC5pbmRvY3Jlc2VhcmNoLmNvbSJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiZGVmYXVsdC1yb2xlcy1waWxvdCIsImFkbWluLXJvbGUiLCJvZmZsaW5lX2FjY2VzcyIsInBsYXRmb3JtLWFkbWluIiwib2ZmbGluZV9hY2Nlc3NfdGVzdCIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsicmVhbG0tbWFuYWdlbWVudCI6eyJyb2xlcyI6WyJ2aWV3LWlkZW50aXR5LXByb3ZpZGVycyIsInZpZXctcmVhbG0iLCJtYW5hZ2UtaWRlbnRpdHktcHJvdmlkZXJzIiwiaW1wZXJzb25hdGlvbiIsInJlYWxtLWFkbWluIiwiY3JlYXRlLWNsaWVudCIsIm1hbmFnZS11c2VycyIsInF1ZXJ5LXJlYWxtcyIsInZpZXctYXV0aG9yaXphdGlvbiIsInF1ZXJ5LWNsaWVudHMiLCJxdWVyeS11c2VycyIsIm1hbmFnZS1ldmVudHMiLCJtYW5hZ2UtcmVhbG0iLCJ2aWV3LWV2ZW50cyIsInZpZXctdXNlcnMiLCJ2aWV3LWNsaWVudHMiLCJtYW5hZ2UtYXV0aG9yaXphdGlvbiIsIm1hbmFnZS1jbGllbnRzIiwicXVlcnktZ3JvdXBzIl19LCJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9wZW5pZCBlbWFpbCBwcm9maWxlIGdyb3VwcyIsInNpZCI6ImE4NDI1ODJiLTA1NjEtNDA4OC1hODQ2LTUyNjdhOGU5M2IzYiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoic2FtIHpoYW5nIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiYWRtaW4iLCJnaXZlbl9uYW1lIjoic2FtIiwiZmFtaWx5X25hbWUiOiJ6aGFuZyIsImVtYWlsIjoic3poYW5nQGluZG9jcmVzZWFyY2gub3JnIiwiZ3JvdXAiOltdfQ.GMzLnWD4n0Z-j9M4hpYnN77zVexLGn4UVrGMfNnd5qYeib3gTp4hmYpdPhsOp1i9zgi2oLUmtPGtXeCeAMyA0WWpcLHVfkKEA6ZEK8QFXAANiafumBnxE2i3NqU2131tVdUt9tdCvJaYeRyxiRwkTp2lr5Sk1_xsjJXURTyO5QXcrRo5AhFehRxT6lMBVc_8_Ae0CjSqX-24KQ4A62f3iLykobZYVkWSK9Zw_MdL0cwsLF7CytjG8c11JNyzI6FWHWhVSuNSMCjNdRHvsxgV3A5yWZDrU5meQiDU_OZBFEHiPWUEwO-C8WbrRAFoL8C5ObuRj4gpRO0crDOVKuTflw';

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
