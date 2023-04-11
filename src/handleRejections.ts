import axios from "axios";
import { resyncBadServers } from "./resyncBadServers";
import { removeServer } from "./serverManager";

// If every request was rejected, try pinging every server again.
// If they all return 200, then they were probably fine, so restore them
// This helps prevent catastrophes where a weird error causes everything to go down
async function recoverFromAllRejected(serverUrls: string[]){
    console.log('Recovering from all servers being rejected');
    const promises = serverUrls.map(url => axios.get(`${url}/ping`, {timeout: 1500}));
    const fulfilled = await Promise.allSettled(promises);
    fulfilled.forEach((res, i) => {
        if(res.status === `rejected`){
            removeServer(serverUrls[i]);
        } else {
            console.log(`Server ${serverUrls[i]} was actually fine`);
        }
    });
}


// How to handle servers which rejected our request?
// If just some rejected, try to revive them by syncing them with good servers
// If all were rejected, see if they are actually okay behind the scenes
export async function handleRejections(allServers: string[], badServers: string[]){
    if(badServers.length === 0) return;
    console.log("Handling rejections");
    const goodServers = allServers.filter(url => !badServers.includes(url));
    console.log(`Good servers: ${goodServers}`);
    if(goodServers.length !== 0){
        resyncBadServers(goodServers, badServers).catch(e => {console.error("error resyncing bad servers")});
        return;
    }
    recoverFromAllRejected(badServers).catch(e => {console.error("error recovering from all rejected")});
}