import test from 'node:test';
import assert from 'node:assert/strict';
import { validateConfig, runBenchmark, renderMarkdown } from '../src/benchmark.mjs';
const cfg={runs:2,gateways:[{name:'demo',baseUrl:'https://example.com/v1',model:'demo'}],scenarios:[{name:'short',messages:[{role:'user',content:'hi'}]}]};
test('validates config',()=>assert.equal(validateConfig(cfg),true));
test('dry run produces rows',async()=>{const res=await runBenchmark(cfg,{dryRun:true}); assert.equal(res.rows.length,1); assert.equal(res.rows[0].runs,2);});
test('renders markdown table',async()=>{const md=renderMarkdown(await runBenchmark(cfg,{dryRun:true})); assert.match(md,/Gateway/); assert.match(md,/demo/);});
