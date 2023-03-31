import bodyParser from 'body-parser';
import express from 'express';
import {createProxyServer} from 'http-proxy';
import errorMiddleware from './errorMiddleware';
import { THIS_PROXY_ID } from './initializeId';
import { initializeRoutes } from './routes';
import { initializeServerList } from './serverManager';

const PORT = 3005;

console.log(`Initializing proxy with id ${THIS_PROXY_ID}`);

const app = express();

console.log("Initializing middleware...");
app.use(errorMiddleware);
// Body parser middleware
app.use(bodyParser.json());

console.log("Initializing routes...");
initializeRoutes(app);

console.log("Initializing servers...");
const serverOne = 'https://cpsc-559-project.vercel.app';
const serverTwo = `https://cpsc-559-project-2.vercel.app`;
const serverThree = `https://cpsc-559-project-dl.vercel.app`
initializeServerList([serverOne, serverTwo, serverThree]);

app.listen(PORT);
console.log(`==== App listening on port ${PORT} ====`);