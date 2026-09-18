// Run from a checkout with frozen dependencies. Arguments: source checkout, copied compiled dist.
// Uses only synthetic data, a unique local D1 store, and its own hidden Wrangler process on port 8790.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawn,spawnSync} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
import {fileURLToPath} from 'node:url';
const checkout=path.resolve(fileURLToPath(new URL('..',import.meta.url))),source=path.resolve(process.argv[2]||checkout),dist=path.resolve(process.argv[3]||path.join(source,'dist'));
const work=path.join(checkout,'work','readonly-proof-'+Date.now()),persist=path.join(source,'work','ro-'+Date.now().toString(36)),config=path.join(work,'wrangler.json'),wrangler=path.join(checkout,'node_modules','wrangler','bin','wrangler.js');
fs.mkdirSync(work,{recursive:true});
const built=JSON.parse(fs.readFileSync(path.join(dist,'server','wrangler.json'),'utf8'));
fs.writeFileSync(config,JSON.stringify({name:'daroub-readonly-verification',main:path.join(dist,'server',built.main),compatibility_date:built.compatibility_date,compatibility_flags:built.compatibility_flags,assets:{directory:path.join(dist,'client')},d1_databases:[{binding:'DB',database_name:'readonly-audit',database_id:'11111111-1111-4111-8111-111111111111'}],vars:{DAROUB_READ_ONLY:'true',DAROUB_OWNER_IDS:'owner-a',DAROUB_EDITOR_IDS:'editor-a'}},null,2));
const environment={...process.env,CI:'true',CLOUDFLARE_CF_FETCH_ENABLED:'false',WRANGLER_SEND_METRICS:'false',WRANGLER_WRITE_LOGS:'false',WRANGLER_LOG_PATH:path.join(work,'logs'),WRANGLER_REGISTRY_PATH:path.join(work,'registry'),MINIFLARE_REGISTRY_PATH:path.join(work,'miniflare-registry')};
function cli(args){const result=spawnSync(process.execPath,[wrangler,...args],{cwd:checkout,env:environment,windowsHide:true,encoding:'utf8',timeout:60000});if(result.status!==0)throw Error('Wrangler command failed: '+result.stdout+'\n'+result.stderr);return result.stdout;}
const options=['--local','--config',config,'--persist-to',persist];
const literal=value=>"'"+String(value).replaceAll("'","''")+"'";
const trip={id:'readonly-trip',schemaVersion:2,title:'Recovery verification',destinationId:'liwa',terrainId:'desert',location:{lat:23,lon:53},startDate:'2026-10-01',endDate:'2026-10-02',groupSize:2,transport:'car',notes:'Synthetic preserved note',checklist:[{id:'lamp',label:'Lamp',category:'equipment',kind:'equipment',done:false,requiredQuantity:4,assignedQuantity:2,packedQuantity:2}],revision:7,updatedAt:'2026-09-17T00:00:00.000Z',activities:['walking'],itinerary:[{id:'day-a',dayOffset:0,entries:[]}],suggestionDecisions:[],catalogRevision:0};
const sql=fs.readdirSync(path.join(source,'drizzle')).filter(name=>name.endsWith('.sql')).sort().map(name=>fs.readFileSync(path.join(source,'drizzle',name),'utf8')).join('\n')+`\nINSERT INTO records(owner,entity,id,payload,revision,deleted,updated_at,last_operation) VALUES('owner-a','trip','readonly-trip',${literal(JSON.stringify(trip))},7,0,'2026-09-17T00:00:00.000Z','seed-op');\nINSERT INTO sync_receipts(owner,operation_id,result,created_at) VALUES('owner-a','seed-op','{"operationId":"seed-op","conflict":false}','2026-09-17T00:00:00.000Z');`;
const seed=path.join(work,'seed.sql');fs.writeFileSync(seed,sql);console.log('Initializing isolated D1 fixture.');cli(['d1','execute','DB',...options,'--file',seed]);
function query(sql){const result=JSON.parse(cli(['d1','execute','DB',...options,'--command',sql,'--json']));return result.flatMap(value=>value.results??[]);}
const before={records:query('SELECT * FROM records ORDER BY owner,entity,id'),receipts:query('SELECT * FROM sync_receipts ORDER BY owner,operation_id')};
const outer='http://127.0.0.1:8790';let base=outer;const identity=(user='owner-a')=>({'oai-authenticated-user-id':user,'oai-authenticated-user-email':user+'@audit.example','X-Daroub-Account':user,'X-Daroub-Protocol':'2'});
let server,logs='',passed=false;const evidence={compiledBuild:fs.readFileSync(path.join(dist,'server','BUILD_ID'),'utf8').trim(),port:8790,checks:[]};
try{
 server=spawn(process.execPath,[wrangler,'dev','--config',config,'--local','--persist-to',persist,'--ip','127.0.0.1','--port','8790','--inspector-port','0'],{cwd:checkout,env:environment,windowsHide:true,stdio:['ignore','pipe','pipe']});server.stdout.on('data',chunk=>{logs+=chunk;});server.stderr.on('data',chunk=>{logs+=chunk;});
 console.log('Started isolated compiled Worker PID '+server.pid+'.');
 let session;for(let attempt=0;attempt<120;attempt++){if(server.exitCode!==null)throw Error('Worker exited: '+logs);try{const response=await fetch(base+'/api/session',{headers:identity(),signal:AbortSignal.timeout(1500)});if(response.ok){session=await response.json();if(session?.userId==='owner-a')break;}}catch{}await delay(500);}
 assert.equal(session?.readOnly,true,'Compiled session must expose recovery mode');evidence.checks.push('Owner session exposes readOnly=true');

 // Wrangler's outer proxy can replace application 503 responses. Locate only this process tree's inner socket.
 const discover=spawnSync('powershell.exe',['-NoProfile','-Command',
  '$allProcesses=Get-CimInstance Win32_Process; $workerIds=[System.Collections.Generic.HashSet[int]]::new(); [void]$workerIds.Add('+server.pid+'); do { $added=$false; foreach($record in $allProcesses){if($workerIds.Contains([int]$record.ParentProcessId) -and $workerIds.Add([int]$record.ProcessId)){$added=$true}} } while($added); @((Get-NetTCPConnection -State Listen | Where-Object {$workerIds.Contains([int]$_.OwningProcess)}).LocalPort) | ConvertTo-Json -Compress'
 ],{windowsHide:true,encoding:'utf8',timeout:15000});
 if(discover.status!==0)throw Error('Could not inspect own worker ports: '+discover.stderr);
 const rawPorts=JSON.parse(discover.stdout),ports=[...new Set(Array.isArray(rawPorts)?rawPorts:[rawPorts])];let direct=false;
 for(const port of ports.filter(port=>port!==8790)){try{const candidate='http://127.0.0.1:'+port,response=await fetch(candidate+'/api/session',{headers:identity(),signal:AbortSignal.timeout(1000)});const body=await response.json();if(response.ok&&body?.userId==='owner-a'&&body.readOnly===true){base=candidate;direct=true;break;}}catch{}}
 assert.equal(direct,true,'Find the owned compiled Worker socket, excluding the outer 8790 proxy');evidence.directWorkerURL=base;console.log('Verifying direct compiled Worker at '+base+'.');
 const editorSession=await(await fetch(base+'/api/session',{headers:identity('editor-a')})).json();assert.equal(editorSession.readOnly,true);evidence.checks.push('Editor session exposes readOnly=true');
 const catalogResponse=await fetch(base+'/api/catalog');assert.equal(catalogResponse.status,200);const catalog=await catalogResponse.json();assert.equal(catalog.schemaVersion,1);assert.ok(catalog.destinations.some(row=>row.id==='liwa'));evidence.checks.push('GET catalog returns the compiled published/seed guide');
 const syncResponse=await fetch(base+'/api/sync',{headers:identity()});assert.equal(syncResponse.status,200);const snapshot=await syncResponse.json();assert.equal(snapshot.records.length,1);assert.deepEqual(snapshot.records[0].record,trip);evidence.checks.push('GET sync preserves complete v2 quantities, itinerary and notes');
 const other=await(await fetch(base+'/api/sync',{headers:identity('editor-a')})).json();assert.deepEqual(other.records,[]);evidence.checks.push('Other account cannot read the seeded private trip');
 for(const user of ['owner-a','editor-a']){
  const editor=await fetch(base+'/api/editor',{headers:identity(user)});assert.equal(editor.status,200);const state=await editor.json();assert.equal(state.role,user==='owner-a'?'owner':'editor');
  for(const [route,body,expected]of [['sync',{operationId:'blocked-'+user,entity:'trip',id:trip.id,protocol:2,baseRevision:7,payload:{...trip,notes:'MUST NOT WRITE'}},'Read-only recovery mode; pending changes retained'],['editor',{action:'save',draft:{id:'blocked-draft',revision:0,baseCatalogRevision:0,snapshot:catalog,reviewedLocales:[],updatedAt:''}},'Read-only recovery mode']]){
   const response=await fetch(base+'/api/'+route,{method:'POST',headers:{...identity(user),Origin:base,'Content-Type':'application/json'},body:JSON.stringify(body)});assert.equal(response.status,503);assert.equal(response.headers.get('retry-after'),'300');assert.match(response.headers.get('cache-control'),/no-store/);assert.deepEqual(await response.json(),{error:expected});evidence.checks.push(user+' POST '+route+': exact read-only 503, Retry-After 300, no-store');
  }
 }
 const after={records:query('SELECT * FROM records ORDER BY owner,entity,id'),receipts:query('SELECT * FROM sync_receipts ORDER BY owner,operation_id')};assert.deepEqual(after,before);assert.deepEqual(query('SELECT * FROM catalog_drafts'),[]);assert.deepEqual(query('SELECT * FROM catalog_versions'),[]);evidence.checks.push('Records and receipts byte-for-byte unchanged; no editorial drafts/publications created');passed=true;
}finally{
 fs.writeFileSync(path.join(work,'worker.log'),logs);
 if(server?.pid){if(process.platform==='win32')spawnSync('taskkill',['/PID',String(server.pid),'/T','/F'],{windowsHide:true,encoding:'utf8'});else server.kill('SIGTERM');await delay(500);}
 fs.writeFileSync(path.join(work,'evidence.json'),JSON.stringify({...evidence,passed,workerStopped:server?.exitCode!==null||server?.signalCode!==null},null,2));
}
let stopped=true;for(const endpoint of new Set([base,outer])){try{await fetch(endpoint+'/api/session',{signal:AbortSignal.timeout(1000)});stopped=false;}catch{}}assert.equal(stopped,true,'Both owned ports must close after verification');console.log(JSON.stringify({...evidence,passed,workerStopped:true,evidence:path.join(work,'evidence.json')},null,2));
