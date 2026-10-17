import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,cp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {verifyPlugin} from '../scripts/verify-plugin.mjs';
const root=fileURLToPath(new URL('..',import.meta.url));
test('full release passes; changed reference and reduced inventory fail',async()=>{
 const temp=await mkdtemp(resolve(tmpdir(),'ship-ai-integrity-'));
 try{
  await cp(root,temp,{recursive:true,filter:src=>!src.split('/').includes('.git')});
  assert.equal((await verifyPlugin(temp)).status,'PASS');
  const reference=resolve(temp,'skills/yc-interface-craft/references/company-index.json');const saved=await readFile(reference);
  await writeFile(reference,'{}');assert.equal((await verifyPlugin(temp)).status,'FAIL');await writeFile(reference,saved);
  const path=resolve(temp,'release-manifest.json');const manifest=JSON.parse(await readFile(path));manifest.skills.pop();await writeFile(path,JSON.stringify(manifest));
  assert.equal((await verifyPlugin(temp)).status,'FAIL');
 }finally{await rm(temp,{recursive:true,force:true});}
});
test('new project has full design library and setup choice; existing source is not overwritten',async()=>{
 const temp=await mkdtemp(resolve(tmpdir(),'ship-ai-project-'));const target=resolve(temp,'site');
 try{
  execFileSync(process.execPath,[resolve(root,'scripts/prepare-project.mjs'),'--target',target]);
  execFileSync(process.execPath,['scripts/verify-project-skills.mjs'],{cwd:target});
  execFileSync(process.execPath,['scripts/verify-design-skills.mjs'],{cwd:target});
  const brief=JSON.parse(await readFile(resolve(target,'brief/project.json')));assert.equal(brief.setup.buildModel,null);assert.equal(brief.setup.effort,'medium');
  const before=await readFile(resolve(target,'package.json'),'utf8');
  assert.throws(()=>execFileSync(process.execPath,[resolve(root,'scripts/prepare-project.mjs'),'--target',target],{stdio:'pipe'}));
  assert.equal(await readFile(resolve(target,'package.json'),'utf8'),before);
  await rm(resolve(target,' .agents/skills/yc-interface-craft/SKILL.md'.trim()));
  assert.throws(()=>execFileSync(process.execPath,['scripts/verify-project-skills.mjs'],{cwd:target,stdio:'pipe'}));
 }finally{await rm(temp,{recursive:true,force:true});}
});
