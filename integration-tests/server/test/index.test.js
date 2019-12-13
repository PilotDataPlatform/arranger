import 'babel-polyfill';
import express from 'express';
import { Server } from 'http';
import addProject from './addProject';
import Arranger from '@arranger/server';
import ajax from '@arranger/server/dist/utils/ajax';
import adminGraphql from '@arranger/admin/dist';

const port = 5678;
const esHost = 'http://127.0.0.1:9200';
const projectId = 'TEST-PROJECT';

const app = express();
const http = Server(app);

const api = ajax(`http://localhost:${port}`);

describe('@arranger/server', () => {
  before(async () => {
    const router = await Arranger({ esHost, enableAdmin: false });
    const adminApp = await adminGraphql({ esHost: ES_HOST });
    const adminPath = '/admin/graphql';
    app.use(router);
    adminApp.applyMiddleware({ app, path: adminPath });
  });

  const env = {
    server: http,
    port,
    esHost,
    api,
    projectId,
    adminPath,
  };
  addProject(env);
});
