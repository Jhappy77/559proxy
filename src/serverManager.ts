const ACTIVE_SERVERS = [];

export function initializeServerList(initialUrls: string[]){
    initialUrls.forEach(url => {
        addServer(url);
    })
}

export function getServers(): string[] {
    return ACTIVE_SERVERS.map(s => s);
}

export function removeServer(serverUrl: string): boolean {
    if(!serverUrl) return;
    console.log("Removing server " + serverUrl);
    let index = ACTIVE_SERVERS.indexOf(serverUrl);
    let hasRemoved = false;
    while (index !== -1) {
        hasRemoved = true;
        ACTIVE_SERVERS.splice(index, 1);
        index = ACTIVE_SERVERS.indexOf(serverUrl);
    }
    return hasRemoved; 
}

export function addServer(serverUrl: string){
    if(ACTIVE_SERVERS.includes(serverUrl)){
        console.warn(`Warning! Tried to add server ${serverUrl} but it was already present`);
    }
    ACTIVE_SERVERS.push(serverUrl);
    console.log("added server " + serverUrl);
}