import axios from "axios";
import { resyncBadServers } from "./resyncBadServers";
import { removeServer } from "./serverManager";

async function recoverFromAllRejected(serverUrls: string[]){
    console.log('Recovering from all servers being rejected');
    const promises = serverUrls.map(url => axios.get(`${url}/ping`));
    const fulfilled = await Promise.allSettled(promises);
    fulfilled.forEach((res, i) => {
        if(res.status === `rejected`){
            removeServer(serverUrls[i]);
        } else {
            console.log(`Server ${serverUrls[i]} was actually fine`);
        }
    });
}

export async function handleRejections(allServers: string[], badServers: string[]){
    console.log("Handling rejections");
    if(badServers.length === 0) return;
    const goodServers = allServers.filter(url => !badServers.includes(url));
    if(goodServers.length !== 0){
        resyncBadServers(goodServers, badServers);
        return;
    }
    recoverFromAllRejected(badServers);
}