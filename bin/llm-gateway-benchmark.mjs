#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { runBenchmark, validateConfig, renderMarkdown } from '../src/benchmark.mjs';
function parse(argv){const out={_:[]}; for(let i=0;i<argv.length;i++){const x=argv[i]; if(x.startsWith('--')){const k=x.slice(2); const n=argv[i+1]; if(!n||n.startsWith('--')) out[k]=true; else out[k]=argv[++i];} else out._.push(x);} return out;}
function help(){console.log('LLM Gateway Benchmark\n\nUsage:\n  llm-gateway-benchmark run --config <path> [--dry-run] [--format json|markdown]\n  llm-gateway-benchmark validate --config <path>');}
const [cmd,...rest]=process.argv.slice(2); const args=parse(rest);
try{
 if(!cmd||cmd==='help'||cmd==='--help') help();
 else if(cmd==='validate'){if(!args.config) throw new Error('--config is required'); const cfg=JSON.parse(readFileSync(args.config,'utf8')); validateConfig(cfg); console.log('config ok');}
 else if(cmd==='run'){if(!args.config) throw new Error('--config is required'); const cfg=JSON.parse(readFileSync(args.config,'utf8')); validateConfig(cfg); const result=await runBenchmark(cfg,{dryRun:Boolean(args['dry-run'])}); console.log(args.format==='json'?JSON.stringify(result,null,2):renderMarkdown(result));}
 else throw new Error(`Unknown command: ${cmd}`);
}catch(e){console.error(e.message); process.exit(1);}
