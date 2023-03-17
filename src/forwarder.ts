import axios, { AxiosResponse } from "axios";
import { getServers, removeServer } from "./serverManager";

export async function forwardRequest(relativeUrl: string, req: any){
    const servers = getServers();
    const endpointUrls = servers.map(serverUrl => `${serverUrl}/${relativeUrl}`)
    const promises = endpointUrls.map(url => axios(url, {method: req.method, data: req.body}))
    const results = await Promise.allSettled(promises);
    const values = [];
    results.forEach((element, index) => {
        if(element.status === "rejected"){
            const serverUrl = servers[index];
            removeServer(serverUrl);
            return;
        }
        values.push(element.value); 
    });
    return values[0];
}