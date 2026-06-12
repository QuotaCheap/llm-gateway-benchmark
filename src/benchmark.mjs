import { performance } from 'node:perf_hooks';
export function validateConfig(config){
 if(!config || typeof config!=='object') throw new Error('config must be an object');
 if(!Array.isArray(config.gateways)||!config.gateways.length) throw new Error('config.gateways must be a non-empty array');
 if(!Array.isArray(config.scenarios)||!config.scenarios.length) throw new Error('config.scenarios must be a non-empty array');
 for(const gateway of config.gateways){ if(!gateway.name) throw new Error('gateway.name is required'); if(!gateway.baseUrl) throw new Error(`gateway ${gateway.name} missing baseUrl`); if(!gateway.model) throw new Error(`gateway ${gateway.name} missing model`); }
 for(const scenario of config.scenarios){ if(!scenario.name) throw new Error('scenario.name is required'); if(!Array.isArray(scenario.messages)||!scenario.messages.length) throw new Error(`scenario ${scenario.name} missing messages`); }
 return true;
}
export async function runBenchmark(config,{dryRun=false}={}){
 validateConfig(config); const runs=Number(config.runs||1); const rows=[];
 for(const gateway of config.gateways){ for(const scenario of config.scenarios){ const samples=[]; for(let i=0;i<runs;i++){ samples.push(dryRun ? fakeSample(gateway,scenario) : await callGateway(gateway,scenario,config)); } rows.push(summarize(gateway,scenario,samples)); } }
 return { generatedAt:new Date().toISOString(), dryRun, rows };
}
function fakeSample(){ return { ok:true, latencyMs:1, inputTokens:0, outputTokens:0, estimatedCostUsd:0 }; }
async function callGateway(gateway,scenario,config){
 const apiKey=gateway.apiKeyEnv ? process.env[gateway.apiKeyEnv] : gateway.apiKey;
 if(!apiKey) return { ok:false, latencyMs:0, error:`missing API key for ${gateway.name}` };
 const body={ model:gateway.model, messages:scenario.messages, stream:false };
 const started=performance.now();
 try{ const res=await fetch(`${gateway.baseUrl.replace(/\/$/,'')}/chat/completions`,{method:'POST',headers:{authorization:`Bearer ${apiKey}`,'content-type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(Number(config.timeoutMs||30000))}); const latencyMs=Math.round(performance.now()-started); const data=await res.json().catch(()=>({})); if(!res.ok) return {ok:false,latencyMs,error:data.error?.message||res.statusText}; const usage=data.usage||{}; return {ok:true,latencyMs,inputTokens:usage.prompt_tokens||0,outputTokens:usage.completion_tokens||0,estimatedCostUsd:0}; }
 catch(e){ return {ok:false,latencyMs:Math.round(performance.now()-started),error:e.message}; }
}
function percentile(values,p){ if(!values.length) return 0; const s=[...values].sort((a,b)=>a-b); return s[Math.min(s.length-1,Math.floor((p/100)*s.length))]; }
function summarize(gateway,scenario,samples){ const ok=samples.filter(s=>s.ok); return { gateway:gateway.name, scenario:scenario.name, runs:samples.length, successRate: samples.length ? ok.length/samples.length : 0, p50Ms:percentile(ok.map(s=>s.latencyMs),50), p95Ms:percentile(ok.map(s=>s.latencyMs),95), estimatedCostUsd: ok.reduce((sum,s)=>sum+(s.estimatedCostUsd||0),0), errors:samples.filter(s=>!s.ok).map(s=>s.error) }; }
export function renderMarkdown(result){ const lines=['| Gateway | Scenario | Runs | Success | p50 ms | p95 ms | Est. cost |','|---|---|---:|---:|---:|---:|---:|']; for(const r of result.rows) lines.push(`| ${r.gateway} | ${r.scenario} | ${r.runs} | ${Math.round(r.successRate*100)}% | ${r.p50Ms} | ${r.p95Ms} | $${r.estimatedCostUsd.toFixed(6)} |`); return lines.join('\n'); }
