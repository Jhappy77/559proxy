import express from 'express';
import {createProxyServer} from 'http-proxy';

const PORT = 3005;

const app = express();
// const apiProxy = createProxyServer();
// const serverOne = 'http://localhost:3001';
app.all('/*', function(req, res){
    res.status(200).send('pong!');
})

app.listen(PORT);
console.log(`==== App listening on port ${PORT} ====`);