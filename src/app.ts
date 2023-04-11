import bodyParser from 'body-parser';
import express from 'express';
import cors from 'cors';
import errorMiddleware from './errorMiddleware';
import { PORT, THIS_PROXY_ID } from './env';
import { initializeRoutes } from './routes';
import { initializeServerList } from './serverManager';
import { initializeProxyServerList } from './proxyManager';
import { logicalTimestampMiddleware } from './logicalTimestampMiddleware';
import { initialProxyList, initialServerList } from './initialValues';

console.log(`Initializing proxy with id ${THIS_PROXY_ID}`);

const app = express();

console.log("Initializing middleware...");
app.use(errorMiddleware);
// Body parser middleware
app.use(bodyParser.json());
app.use(logicalTimestampMiddleware);
app.use(errorMiddleware);
app.use(cors({ origin: true }));

console.log("Initializing routes...");
initializeRoutes(app);

console.log("Initializing proxies...");
initializeProxyServerList(initialProxyList);

console.log("Initializing servers...");
initializeServerList(initialServerList);

app.listen(PORT);
console.log(`==== App listening on port ${PORT} ====`);