import { THIS_URL } from "./env";

const ACTIVE_PROXIES = [];

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

export function removeProxyServer(serverUrl: string): boolean {
    if(!serverUrl) return;
    console.log("Removing proxyserver " + serverUrl);
    let index = ACTIVE_PROXIES.indexOf(serverUrl);
    let hasRemoved = false;
    while (index !== -1) {
        hasRemoved = true;
        ACTIVE_PROXIES.splice(index, 1);
        index = ACTIVE_PROXIES.indexOf(serverUrl);
    }
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