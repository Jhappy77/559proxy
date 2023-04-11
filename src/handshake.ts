import axios from "axios";
import { THIS_PROXY_ID, THIS_URL } from "./env";
import { getLamportTimestamp, incrementLamportTimestamp } from "./logicalTimestampMiddleware";
import { getProxyServers, removeProxyServer } from "./proxyManager";
import { getServers, removeServer } from "./serverManager";

// Recieve handshake (ping all servers)
export async function handshake(){
    const servers = getServers();
    const endpointUrls = servers.map(serverUrl => `${serverUrl}/ping`);
    console.log(endpointUrls);
    incrementLamportTimestamp();
    const headers = {
        'lamportTimestamp': getLamportTimestamp(),
        'originUrl': THIS_URL,
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

// Send handshakes to other proxies (tell them to ping all servers)
export async function sendHandshakes(){
    const proxies = getProxyServers();
    const handshakeUrls = proxies.map(proxyUrl => `${proxyUrl}/handshake`);
    incrementLamportTimestamp();
    const headers = {
        'lamportTimestamp': getLamportTimestamp(),
        'senderId': THIS_PROXY_ID,
        'originUrl': THIS_URL,
    }
    const promises = handshakeUrls.map(url => axios.get(url, {headers, timeout: 1500}));
    const results = await Promise.allSettled(promises);
    results.forEach((element, index) => {
        if(element.status === "rejected"){
            const proxyUrl = proxies[index];
            console.error(element.reason);
            removeProxyServer(proxyUrl);
            return;
        } 
    });
}