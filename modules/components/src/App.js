import React from 'react';
import { Arranger, ArrangerContextProvider, ArrangerHeader, Aggregations, Table } from './Arranger';
import KeyCloakMiddleWare from './utils/KeyCloak/KeyCloakMiddleware';
import { keycloak } from './utils/KeyCloak/config';
import { StyleProvider, AVAILABLE_THEMES } from './ThemeSwitcher';

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

const App = () => {
  return (
    <KeyCloakMiddleWare>
      <StyleProvider selected="beagle" availableThemes={AVAILABLE_THEMES} />
      <Arranger
        disableSocket
        graphqlField="pilotdevtestalias" // static
        projectId="pilotdev" // static
        projectCode="indoctestproject" // dynamic
        render={(props) => {
          return (
            <>
              {!keycloak?.authenticated ? (
                <button onClick={() => keycloak.login({ redirectUri: window.location.origin })}>
                  Login to Pilot
                </button>
              ) : (
                <ArrangerComponents
                  {...{ ...props, graphqlField: 'pilotdevtestalias', projectId: 'pilotdev' }}
                />
              )}
            </>
          );
        }}
      />
    </KeyCloakMiddleWare>
  );
};

export default App;
