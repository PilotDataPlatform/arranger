import React from 'react';
import { storiesOf } from '@storybook/react';
import { injectGlobal } from 'emotion';

import { Arranger, GetProjects, Aggregations, CurrentSQON, Table } from '../src/Arranger';
import State from '../src/State';
import { StyleProvider, AVAILABLE_THEMES } from '../src/ThemeSwitcher';
import {
  PORTAL_NAME,
  ACTIVE_INDEX,
  ACTIVE_INDEX_NAME,
  PROJECT_ID,
  deleteValue,
  setValue,
} from '../src/utils/config';

injectGlobal`
  html,
  body,
  #root {
    height: 100vh;
    margin: 0;
  }
`;

const ChooseProject = ({ index, projectId, update, projects }) => {
  return (
    <div
      css={`
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 100%;
        justify-content: center;
      `}
    >
      <h2
        css={`
          margin-top: 0;
        `}
      >
        {PORTAL_NAME}
      </h2>
      <select
        value={projectId}
        onChange={(e) => {
          setValue('PROJECT_ID', e.target.value);
          update({
            projectId: e.target.value,
          });
        }}
      >
        <option id="version">Select a version</option>
        {projects.map((x) => (
          <option key={x.id} value={x.id}>
            {x.id}
          </option>
        ))}
      </select>
      <select
        value={index}
        onChange={(e) => {
          setValue('ACTIVE_INDEX', e.target.value);

          let graphqlField = projects
            .find((x) => x.id === projectId)
            ?.types?.types.find((x) => x.index === e.target.value).name;

          setValue('ACTIVE_INDEX_NAME', graphqlField);
          update({
            index: e.target.value,
            graphqlField,
          });
        }}
      >
        <option id="version">Select an index</option>
        {projects
          .find((x) => x.id === projectId)
          ?.types?.types?.map((x) => (
            <option key={x.index} value={x.index}>
              {x.index}
            </option>
          ))}
      </select>
    </div>
  );
};

const Portal = ({ style, ...props }) => {
  return (
    <div style={{ display: 'flex', ...style }}>
      <Aggregations
        componentProps={{
          getTermAggProps: () => ({
            maxTerms: 3,
          }),
        }}
        {...props}
      />
      <div
        css={`
          position: relative;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        `}
      >
        <CurrentSQON {...props} />
        <Table {...props} />
      </div>
    </div>
  );
};

storiesOf('Portal', module).add('Portal', () => (
  <>
    <StyleProvider selected="beagle" availableThemes={AVAILABLE_THEMES} />
    <Arranger
      disableSocket
      index="metadata-items-facet" // static
      graphqlField="m1facetalias" // static
      projectId="m2facet" // static
      projectCode="indoctestproject" // dynamic
      render={(props) => {
        return (
          <>
            <Portal {...{ ...props, graphqlField: 'm1facetalias', projectId: 'm2facet' }} />
          </>
        );
      }}
    />
    {/* <State
      initial={{
        index: 'metadata-items-facet',
        graphqlField: 'm1facetalias',
        projectId: 'm2facet',
      }}
      render={({ index, graphqlField, projectId, update }) => {
        return index && projectId ? (
          <Arranger
            disableSocket
            index={index}
            graphqlField={graphqlField}
            projectId={projectId}
            render={(props) => {
              return (
                <>
                  <Portal {...{ ...props, graphqlField, projectId }} />
                </>
              );
            }}
          />
        ) : (
          <GetProjects
            render={(props) => (
              <ChooseProject {...props} index={index} projectId={projectId} update={update} />
            )}
          />
        );
      }}
    /> */}
  </>
));
