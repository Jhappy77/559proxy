import * as dotenv from 'dotenv';
dotenv.config();

export const THIS_PROXY_ID = Number(process.env.id) ?? Math.floor(Math.random()*1000);
