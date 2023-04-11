import { Express } from "express";
import { addServer, initializeServerList } from "./serverManager";
import { forwardRequest } from "./forwarder";
import { isAxiosError } from "axios";
import { handshake } from "./handshake";
import { addProxyServer, initializeProxyServerList } from "./proxyManager";
import { initialProxyList, initialServerList } from "./initialValues";
import { resetTobs } from "./resetTobs";
import { getLamportTimestamp } from "./logicalTimestampMiddleware";

export function initializeRoutes(app: Express){
    app.get('/hello', function(req, res){
        res.send('world');
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

    app.post('/registerProxyServer', function(req, res){
        const serverUrl = req.body?.serverUrl;
        if(!serverUrl){
            res.status(400).send('Bad request, no proxy server url');
            return;
        }
        if(typeof(serverUrl) !== `string`){
            res.status(400).send(`Bad request, type of serverUrl is not string`);
             return;
        }
        addProxyServer(serverUrl);
    });

    app.get('/resetToDefaults', function(req,res){
        // For debug purposes
        initializeProxyServerList(initialProxyList);
        initializeServerList(initialServerList);
        resetTobs().catch(e => console.error(`Error resetting TOBs: ${e}`));
        res.status(200).send('Reset to defaults');
    });

    app.get('/resetConnectedTobs', function(req,res){
        resetTobs().catch(e => console.error(`Error resetting TOBs: ${e}`));
        res.status(200).send('Reset TOBs');
    })

    app.get('/err', function(req, res){
        throw new Error('This is an error test!');
    })
    
    app.get('/handshake', async function(req, res){
        handshake();
        res.status(204).setHeader('lamportTimestamp', getLamportTimestamp()).send();
    });

    app.all('/*', async function(req, res){
        try{
            const url = req.url;
            const axiosRes = await forwardRequest(url, req);
            if(isAxiosError(axiosRes)){
                console.log("axiosRes is error");
                res.status(axiosRes.response.status).send(axiosRes.response.data);
                return;
            }
            res.status(axiosRes.status).send(axiosRes.data);
        } catch(reason){
            // console.error(reason);
            if(isAxiosError(reason)){
                console.log("Caught reason");
                console.log(reason.message);
                // console.log(reason);
                res.status(reason.status).send(reason.message);
                return;
            }
            res.status(570).send('Proxy error');
        }
    });
}