import {env} from 'cloudflare:workers';
/** Compatible recovery mode: reads/exports work; no mutations or receipts are accepted. */
export function preparationReadOnly(){return (env as unknown as Record<string,unknown>).DAROUB_READ_ONLY==='true'}
