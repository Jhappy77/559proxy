import axios from "axios"
import { removeServer } from "./serverManager";

// If servers have an issue (such as Byzantine errors) we can use
// this function to sync them back up via a working "good server".
export async function resyncBadServers(goodServers: string[], badServers: string[]){
    for (const badServer of badServers){
        let fixed = false;
        // We try multiple good servers if necessary
        for (const goodServer of goodServers){
            const reqUrl = `${goodServer}/requestSync`
            console.log(`Attempting reset of ${badServer} via ${goodServer} - reqUrl: ${reqUrl}`)
            try {
                const res = await axios.put(reqUrl, {url: badServer});
                if(res.status === 200){
                    console.log(`Fixed ${badServer} via ${goodServer}`);
                    fixed = true;
                    break;
                } else {
                    console.error(`Bad request sync res: ${res.status}`);
                }
            } catch(e) {
            console.error(`Could not sync ${badServer} via ${goodServer}..`)
            }
        }
        if(!fixed){
            removeServer(badServer);
        }
    }
}