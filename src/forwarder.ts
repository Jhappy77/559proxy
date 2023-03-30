import axios, { isAxiosError } from "axios";
import { findMajority } from "./findMajority";
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

export async function forwardRequest(relativeUrl: string, req: any){
    const servers = getServers();
    const endpointUrls = servers.map(serverUrl => `${serverUrl}${relativeUrl}`);
    console.log(endpointUrls);
    const promises = endpointUrls.map(url => axios(url, {method: req.method, data: req.body}))
    const results = await Promise.allSettled(promises);
    const responses = [];
    results.forEach((element, index) => {
        if(element.status === "rejected"){
            if(shouldRemoveRejected(element)){
                const serverUrl = servers[index];
                console.log("removin " + serverUrl + " from " + servers + " pos " + index);
                removeServer(serverUrl);
                return;
            }
            responses.push(element.reason);
        } else {
            responses.push(element.value); 
        } 
    });
    if(responses.length > 3){
        // Detect Byzantine failures
        const findMajorityRes = findMajority(responses);
        if(findMajorityRes === true) return responses[0];
        if(findMajorityRes === false) throw new Error('No agreement');
        const majorityIndexSet = findMajorityRes;
        for(let i = 0; i<responses.length; i += 1){
            if(!majorityIndexSet.has(i)){
                removeServer(servers[i]);
            }
        }
        const majIndex = majorityIndexSet.values().next().value;
        return responses[majIndex];
    }
    if(responses.length < 1){
        throw new Error('No servers worked!');
    }
    return responses[0];
}