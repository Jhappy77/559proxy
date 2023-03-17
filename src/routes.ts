import { Express } from "express";
import axios from 'axios';
import { getServers } from "./serverManager";
import { forwardRequest } from "./forwarder";

export function initializeRoutes(app: Express){
    app.get('/hello', function(req, res){
        res.send('hi');
    })

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