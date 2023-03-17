const ACTIVE_SERVERS = [];

export function initializeServerList(initialUrls: string[]){
    initialUrls.forEach(url => {
        addServer(url);
    })
}

export function getServers(): string[] {
    return ACTIVE_SERVERS;
}

export function addServer(serverUrl: string){
    if(ACTIVE_SERVERS.includes(serverUrl)){
        console.warn(`Warning! Tried to add server ${serverUrl} but it was already present`);
    }
    ACTIVE_SERVERS.push(serverUrl);
    console.log("added server " + serverUrl);
}