import React from 'react';
import { Button } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { Arranger, ArrangerContextProvider, ArrangerHeader, Aggregations, Table } from './Arranger';
import KeyCloakMiddleWare from './utils/KeyCloak/KeyCloakMiddleware';
import { keycloak } from './utils/KeyCloak/config';
import { StyleProvider, AVAILABLE_THEMES } from './ThemeSwitcher';
import './App.css';

const ArrangerComponents = ({ ...props }) => (
  <ArrangerContextProvider>
    <ArrangerHeader />
    <div style={{ display: 'flex' }}>
      <Aggregations
        componentProps={{
          getTermAggProps: () => ({
            maxTerms: 3,
          }),
        }}
        {...props}
      />
      <Table {...props} />
    </div>
  </ArrangerContextProvider>
);

const ArrangerLogin = () => (
  <div class="arranger-login">
    <h2>Login with Pilot credentials to access Arranger Components</h2>
    <Button onClick={() => keycloak.login({ redirectUri: window.location.origin })}>
      <UserOutlined
        style={{
          marginRight: 10,
          strokeWidth: '30',
          stroke: 'white',
        }}
      />
      Login
    </Button>
  </div>
);

const App = () => {
  return (
    <KeyCloakMiddleWare>
      <StyleProvider selected="beagle" availableThemes={AVAILABLE_THEMES} />
      <Arranger
        disableSocket
        graphqlField="devalias" // static
        projectId="dev" // static
        projectCode="indoctestproject" // dynamic
        render={(props) => {
          return (
            <>
              {!keycloak?.authenticated ? (
                <ArrangerLogin />
              ) : (
                <ArrangerComponents {...{ ...props, graphqlField: 'devalias', projectId: 'dev' }} />
              )}
            </>
          );
        }}
      />
    </KeyCloakMiddleWare>
  );
};

export default App;
