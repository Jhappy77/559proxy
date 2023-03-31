import * as dotenv from 'dotenv';
dotenv.config();

export const THIS_PROXY_ID = Number(process.env.id) ?? Math.floor(Math.random()*1000);
export const THIS_URL = process.env.url ?? 'http://localhost:3005';
