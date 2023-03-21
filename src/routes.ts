import { Express } from "express";
import { addServer } from "./serverManager";
import { forwardRequest } from "./forwarder";

export function initializeRoutes(app: Express){
    app.get('/ping', function(req, res){
        res.send('pong');
    })

    app.post('/registerServer', function(req, res){
        const serverUrl = req.body?.serverUrl;
        if(!serverUrl){
            res.status(400).send('Bad request, no server url');
            return;
        }
        if(typeof(serverUrl) !== `string`){
            res.status(400).send(`Bad request, type of serverUrl is not string`);
             return;
        }
        addServer(serverUrl);
    });

    app.get('/err', function(req, res){
        throw new Error('This is an error test!');
    })
    
    app.all('/*', async function(req, res){
        try{
            const url = req.url;
            const axiosRes = await forwardRequest(url, req);
            console.log(`Got response! ${axiosRes.data} `)
            res.status(axiosRes.status).send(axiosRes.data);
        } catch(reason){
            throw new Error(reason);
        }
    });
}