import axios from "axios";
import { THIS_PROXY_ID } from "./env";
import { getLamportTimestamp, incrementLamportTimestamp } from "./logicalTimestampMiddleware";
import { getServers, removeServer } from "./serverManager";

export async function handshake(){
    const servers = getServers();
    const endpointUrls = servers.map(serverUrl => `${serverUrl}/ping`);
    console.log(endpointUrls);
    incrementLamportTimestamp();
    const headers = {
        'lamportTimestamp': getLamportTimestamp(),
        'senderId': THIS_PROXY_ID,
    }
    const promises = endpointUrls.map(url => axios.get(url, {headers}));
    const results = await Promise.allSettled(promises);
    results.forEach((element, index) => {
        if(element.status === "rejected"){
            const serverUrl = servers[index];
            removeServer(serverUrl);
            return;
        }
    });
}