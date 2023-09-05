import Keycloak from 'keycloak-js';

const DEFAULT_AUTH_URL = process.env.DEFAULT_AUTH_URL;
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM;

const keycloakConfig = {
  realm: KEYCLOAK_REALM,
  url: DEFAULT_AUTH_URL + '/',
  'ssl-required': 'all',
  resource: 'react-app',
  'public-client': true,
  'verify-token-audience': true,
  'use-resource-role-mappings': true,
  'confidential-port': 0,
  clientId: 'react-app',
};

const keycloak = new Keycloak(keycloakConfig);
export { keycloak };

function toKeycloakPromise(promise) {
  promise.__proto__ = KeycloakPromise.prototype;
  return promise;
}

function KeycloakPromise(executor) {
  return toKeycloakPromise(new Promise(executor));
}

function createPromise() {
  // Need to create a native Promise which also preserves the
  // interface of the custom promise type previously used by the API
  var p = {
    setSuccess: function (result) {
      p.resolve(result);
    },

    setError: function (result) {
      p.reject(result);
    },
  };
  p.promise = new KeycloakPromise(function (resolve, reject) {
    p.resolve = resolve;
    p.reject = reject;
  });
  return p;
}

export const customAdapter = {
  login: function (options) {
    const url = keycloak.createLoginUrl(options);
    if (options && options.prompt) {
      return createPromise().promise;
    }
    window.location.replace(url);
    return createPromise().promise;
  },

  logout: function (options) {
    window.location.replace(keycloak.createLogoutUrl(options));
    return createPromise().promise;
  },

  redirectUri: function (options, encodeHash) {
    if (arguments.length === 1) {
      encodeHash = true;
    }
    if (options && options.redirectUri) {
      return options.redirectUri;
    } else if (keycloak.redirectUri) {
      return keycloak.redirectUri;
    } else {
      return window.location.href;
    }
  },
};
