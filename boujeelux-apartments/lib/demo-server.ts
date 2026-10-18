import 'server-only';
import {headers} from 'next/headers';
import {isLocalDemo} from './domain';
export async function demoEnabled(){const h=await headers();return isLocalDemo(process.env.NODE_ENV,process.env.BOUJEELUX_LOCAL_DEMO,h.get('host')||'');}
