import React, { useState, useEffect } from 'react';
import { ReactKeycloakProvider as KeycloakProvider } from '@react-keycloak/web';
import { Spin } from 'antd';
import './keycloak.css';

import { keycloak } from './config';
import { tokenTimer } from './tokenTimer';
import tokenManager from './tokenManager';

const checkRefreshInterval = 60; // (s) every checkRefreshInterval will be a checkpoint
let refreshTokenLifeTime = 30 * 60; // (s) refresh token life time, which equals to SSO session idle.

const KeyCloakMiddleWare = ({ children }) => {
  const [isKeycloakReady, setIsKeycloakReady] = useState(false);

  const onEvent = (event, error) => {
    switch (event) {
      case 'onReady':
        setIsKeycloakReady(true);
        break;
      case 'onAuthSuccess':
        tokenManager.setLocalCookies({ AUTH: keycloak.token });
        break;
      case 'onAuthRefreshSuccess':
        tokenManager.setLocalCookies({ AUTH: keycloak.token });
        break;
      default:
        break;
    }
  };

  const refreshConfig = {
    condition: (timeRemain, accessTimeRemain, lastTimeRemain) => {
      return (
        timeRemain < refreshTokenLifeTime &&
        timeRemain > 0 &&
        (timeRemain % checkRefreshInterval === 0 || lastTimeRemain - timeRemain >= 10)
      );
    },
    func: async () => {
      try {
        const isRefresh = await keycloak.updateToken(300);
        if (!isRefresh) {
          console.log('fail to refresh token');
        } else {
          tokenTimer.resetLastTimeRemain();
        }
      } catch {
        console.log('fail to refresh token');
      }
    },
  };

  useEffect(() => {
    tokenTimer.addListener(refreshConfig);
  }, []);

  return (
    <KeycloakProvider
      onEvent={onEvent}
      authClient={keycloak}
      autoRefreshToken={false}
      initOptions={{
        checkLoginIframe: false,
      }}
    >
      {!isKeycloakReady ? (
        <Spin className="keycloak__loading" tip="Loading Keycloak" size="large" />
      ) : (
        children
      )}
    </KeycloakProvider>
  );
};

export default KeyCloakMiddleWare;
