import axios from "axios";
import { THIS_URL } from "./env";
import { getLamportTimestamp, incrementLamportTimestamp } from "./logicalTimestampMiddleware";
import { getServers } from "./serverManager";

const ACTIVE_PROXIES = [];

async function notifyServersOfFailedProxy(proxyUrl: string){
    const servers = getServers();
    const endpointUrls = servers.map(serverUrl => `${serverUrl}/removeProxy`);
    console.log(endpointUrls);
    incrementLamportTimestamp();
    const headers = {
        'lamportTimestamp': getLamportTimestamp(),
        'originUrl': THIS_URL,
    }
    const promises = endpointUrls.map(url => axios.post(url,{urlToRemove: proxyUrl},{headers}));
    const results = await Promise.allSettled(promises);
    results.forEach((element, index) => {
        if(element.status === "rejected"){
            console.log(`Rejected notifying server ${servers[index]} of proxy ${proxyUrl} fail for reason:`)
            console.log(element.reason);
        }
    });
}

export function initializeProxyServerList(initialUrls: string[]){
    for (let i=0; i < ACTIVE_PROXIES.length; i += 1){
        ACTIVE_PROXIES.pop();
    }
    initialUrls.forEach(url => {
        addProxyServer(url);
    })
}

export function getProxyServers(): string[] {
    return ACTIVE_PROXIES.map(s => s);
}

export function removeProxyServer(proxyUrl: string): boolean {
    if(!proxyUrl) return;
    console.log("Removing proxyserver " + proxyUrl);
    let index = ACTIVE_PROXIES.indexOf(proxyUrl);
    let hasRemoved = false;
    while (index !== -1) {
        hasRemoved = true;
        ACTIVE_PROXIES.splice(index, 1);
        index = ACTIVE_PROXIES.indexOf(proxyUrl);
    }
    notifyServersOfFailedProxy(proxyUrl).catch(e => console.error(e));
    return hasRemoved; 
}

export function addProxyServer(serverUrl: string){
    if(ACTIVE_PROXIES.includes(serverUrl)){
        console.warn(`Warning! Tried to add proxyserver ${serverUrl} but it was already present`);
        return;
    }
    if(serverUrl === THIS_URL){
        return;
    }
    ACTIVE_PROXIES.push(serverUrl);
    console.log("added proxyserver " + serverUrl);
}