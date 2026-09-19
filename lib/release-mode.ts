import {env} from 'cloudflare:workers';
/** Compatible recovery mode: reads/exports work; no mutations or receipts are accepted. */
export function preparationReadOnly(){return (env as unknown as Record<string,unknown>).DAROUB_READ_ONLY==='true'}
/** ChatGPT Sites injects `oai-authenticated-*` headers at its edge; anywhere else a client could forge them,
 *  so header identity is only honoured when the deployment declares it runs inside Sites. */
export function chatGPTHeadersTrusted(){return (env as unknown as Record<string,unknown>).DAROUB_CHATGPT_SITES==='true'}
