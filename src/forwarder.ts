import axios, { isAxiosError } from "axios";
import { v4 as uuidv4 } from 'uuid';
import { THIS_URL } from "./env";
import {  Request } from 'express';
import { findMajority } from "./findMajority";
import { sendHandshakes } from "./handshake";
import { getLamportTimestamp, incrementLamportTimestamp } from "./logicalTimestampMiddleware";
import { getServers, removeServer } from "./serverManager";
import { resyncBadServers } from "./resyncBadServers";
import { handleRejections } from "./handleRejections";

function shouldRemoveRejected(result, serverUrl: string): boolean{
    console.log(`AppServer ${serverUrl} failed because ${result.reason}`);
    const {reason} = result;
    if(isAxiosError(reason)){
        const status = reason?.response?.status;
        if(status && status > 499 && status < 600){
            console.log(reason.message);
            console.log("Is 500 level error, rejecting");
            return true;
        }
        return false;
    }
    return true;
}

export async function forwardRequest(relativeUrl: string, req: Request){
    const servers = getServers();
    const endpointUrls = servers.map(serverUrl => `${serverUrl}${relativeUrl}`);
    console.log(endpointUrls);
    incrementLamportTimestamp();
    const ct = req.header('content-type');
    const headers = {
        'lamportTimestamp': getLamportTimestamp(),
        'originUrl': THIS_URL,
        'tob': 1,
        'requestId': uuidv4(),
        'Content-Type': ct,
    }
    const promises = endpointUrls.map(url => axios(url, {method: req.method, data: req.body, headers, timeout: 2000}))
    sendHandshakes().catch(e => {console.log("Error sending handshakes")});

    const results = await Promise.allSettled(promises);
    const responses = [];
    const rejectedServers = [];
    results.forEach((element, index) => {
        if(element.status === "rejected"){
            if(shouldRemoveRejected(element, servers[index])){
                const serverUrl = servers[index];
                rejectedServers.push(serverUrl);
                return;
            }
            responses.push(element.reason);
        } else {
            responses.push(element.value); 
        } 
    });
    handleRejections(servers, rejectedServers).catch(e => {console.log("error handling rejections")});
    
    if(responses.length >= 3){
        console.log('Checking for byzantine errors');
        // Compares response data (success) or AxiosResponse data (failure) or reason (all else failed)
        const toCompare = responses.map(r => r?.data ?? r?.response?.data ?? r);
        console.log(toCompare);
        const findMajorityRes = findMajority(toCompare);
        if(findMajorityRes === true) return responses[0]; // All in agreement 
        if(findMajorityRes === false) throw new Error('No agreement');

        const majorityIndexSet = findMajorityRes;
        const allIndexes = new Set(Array(servers.length).keys());
        const faultyIndexes = new Set([...allIndexes].filter(x => !majorityIndexSet.has(x)));
        const goodServers = Array.from(majorityIndexSet).map(i => servers[i]);
        const badServers = Array.from(faultyIndexes).map(i => servers[i]);
        console.log(goodServers);
        console.log(badServers);
        resyncBadServers(goodServers, badServers);

        const majIndex = majorityIndexSet.values().next().value;
        return responses[majIndex];
    }
    if(responses.length < 1){
        throw new Error('No servers worked!');
    }
    return responses[0]; 
} 