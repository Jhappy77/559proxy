import * as dotenv from 'dotenv';
dotenv.config();

export const THIS_PROXY_ID = Number(process.env.id) ?? Math.floor(Math.random()*1000);
export const THIS_URL = process.env.url;
if(!THIS_URL){
    throw new Error('url is not defined in .env!')
}

export const PORT = process.env.PORT || 3005;