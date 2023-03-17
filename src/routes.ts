import { Express } from "express";
import axios from 'axios';
import { getServers } from "./serverManager";

export function initializeRoutes(app: Express){
    app.get('/hello', function(req, res){
        res.send('hi');
    })
    
    app.all('/*', async function(req, res){
        
        const target = getServers()[0];
        console.log(getServers());
        const url = req.url;
        const relativeUrl = url.substring(url.indexOf('/')+1);
        const finalUrl = `${target}/${relativeUrl}`;
        console.log(finalUrl)
        const axiosRes = await axios.get(finalUrl);
        res.status(axiosRes.status).send(axiosRes.data);
    });
}