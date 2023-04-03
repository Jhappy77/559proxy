import axios, { isAxiosError } from "axios";
import { THIS_URL } from "./env";
import {  Request } from 'express';
import { findMajority } from "./findMajority";
import { sendHandshakes } from "./handshake";
import { getLamportTimestamp, incrementLamportTimestamp } from "./logicalTimestampMiddleware";
import { getServers, removeServer } from "./serverManager";

function shouldRemoveRejected(result): boolean{
    console.log(`Failed for ${result.reason}`);
    const {reason} = result;
    if(isAxiosError(reason)){
        const status = reason.response.status;
        if(status && status > 499 && status < 600){
            console.log(reason);
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
        'Content-Type': ct,
    }
    const promises = endpointUrls.map(url => axios(url, {method: req.method, data: req.body, headers}))
    sendHandshakes();
    const results = await Promise.allSettled(promises);
    const responses = [];
    results.forEach((element, index) => {
        if(element.status === "rejected"){
            if(shouldRemoveRejected(element)){
                const serverUrl = servers[index];
                removeServer(serverUrl);
                return;
            }
            responses.push(element.reason);
        } else {
            responses.push(element.value); 
        } 
    });
    if(responses.length >= 3){
        console.log('Checking for byzantine errors');
        // Compares response data (success) or AxiosResponse data (failure)
        const toCompare = responses.map(r => r?.data ?? r.response.data);
        console.log(toCompare);
        // Detect Byzantine failures
        const findMajorityRes = findMajority(toCompare);
        if(findMajorityRes === true) return responses[0]; // All in agreement 
        if(findMajorityRes === false) throw new Error('No agreement');
        const majorityIndexSet = findMajorityRes;
        for(let i = 0; i<responses.length; i += 1){
            if(!majorityIndexSet.has(i)){
                removeServer(servers[i]);
            }
        }
        const majIndex = majorityIndexSet.values().next().value;
        return responses[majIndex];
        // return responses[0];
    }
    if(responses.length < 1){
        throw new Error('No servers worked!');
    }
    return responses[0]; 
} 