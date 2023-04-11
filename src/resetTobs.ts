import axios from "axios";
import { getServers } from "./serverManager";

// For debug purposes, reset the TOB of all connected app servers, and don't handle errors
export async function resetTobs(){
    const servers = getServers();
    const endpointUrls = servers.map(serverUrl => `${serverUrl}/clearTob`);
    const promises = endpointUrls.map(url => axios.get(url));
    const results = await Promise.allSettled(promises);
    results.forEach((element, index) => {
        if(element.status === "rejected"){
            console.log(`Error reseting TOB of ${servers[index]}`);
        }
    });
}