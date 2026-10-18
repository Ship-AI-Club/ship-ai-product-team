import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,cp,readFile,writeFile,rm,readdir,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {tmpdir} from 'node:os';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {verifyPlugin,findPrivateText} from '../scripts/verify-plugin.mjs';
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
  const brief=JSON.parse(await readFile(resolve(target,'brief/project.json')));assert.equal(brief.setup.siteBuildModel,null);assert.equal(brief.setup.siteBuildEffort,'medium');assert.equal(brief.setup.siteBuildFast,false);assert.equal(brief.setup.creativeBuildModel,'claude-sonnet-5-5');
  const before=await readFile(resolve(target,'package.json'),'utf8');
  assert.throws(()=>execFileSync(process.execPath,[resolve(root,'scripts/prepare-project.mjs'),'--target',target],{stdio:'pipe'}));
  assert.equal(await readFile(resolve(target,'package.json'),'utf8'),before);
  await rm(resolve(target,' .agents/skills/yc-interface-craft/SKILL.md'.trim()));
  assert.throws(()=>execFileSync(process.execPath,['scripts/verify-project-skills.mjs'],{cwd:target,stdio:'pipe'}));
 }finally{await rm(temp,{recursive:true,force:true});}
});
test('contract tests still pass after the owner supplies an approved priced business brief',async()=>{
 const temp=await mkdtemp(resolve(tmpdir(),'ship-ai-owner-brief-'));const target=resolve(temp,'site');
 try{
  execFileSync(process.execPath,[resolve(root,'scripts/prepare-project.mjs'),'--target',target]);
  const brief=JSON.parse(await readFile(resolve(target,'examples/b2b.json')));
  brief.business.pricing={model:'fixed',display:'Test assessment: $1,500',approved:true};
  brief.setup={buildModel:'opus-5.5',effort:'medium'};
  assert.notEqual(brief.business.pricing.model,'unknown');
  assert.equal(brief.positioning.status,'approved');
  await writeFile(resolve(target,'brief/project.json'),JSON.stringify(brief,null,2)+'\n');
  execFileSync(process.execPath,['--test','tests/brief.test.mjs','tests/model-choice.test.mjs'],{cwd:target,stdio:'pipe'});
 }finally{await rm(temp,{recursive:true,force:true});}
});

const SKIP=new Set(['.git','node_modules','.next']);
async function filesUnder(dir,pred=()=>true){const out=[];for(const e of await readdir(dir,{withFileTypes:true})){if(SKIP.has(e.name))continue;const p=resolve(dir,e.name);if(e.isDirectory())out.push(...await filesUnder(p,pred));else if(pred(p))out.push(p);}return out;}
const textFile=p=>/\.(md|mdc|json|mjs|js|jsx|css|txt|yaml|html)$/.test(p);

test('release versions agree at 1.0.3',async()=>{
 for(const f of ['plugin.json','package.json','release-manifest.json'])assert.equal(JSON.parse(await readFile(resolve(root,f))).version,'1.0.3',f);
});

test('no demo client, brand names, run IDs or bot IDs exist in the reusable sources',async()=>{
 const rev=x=>x.split('').reverse().join('');
 for(const probe of [rev('enihS treseD'),rev('enihs-tresed'),rev('ENIHS_TRESED'),rev('omed IA pihS'),rev('e2e-hserf'),rev('syot moor-gnivil'),'bc-'+'0123abcd','see cursor.com/agents/'+'bc-x'])assert.ok(findPrivateText(probe).length,`deny list misses ${probe}`);
 assert.deepEqual(findPrivateText('A desert trip and a shine kit; fresh eggs'),[]);
 const hits=[];
 for(const file of await filesUnder(root,textFile))for(const what of findPrivateText(await readFile(file,'utf8')))hits.push(`${file.slice(root.length)}: ${what}`);
 assert.deepEqual(hits,[]);
 // skill-sources.json keeps the plugin's copyright attribution; that is provenance, not starter branding.
 for(const file of await filesUnder(resolve(root,'assets/business-site-starter'),textFile))if(!file.endsWith('/skill-sources.json'))assert.ok(!/ship ai/i.test(await readFile(file,'utf8')),`Ship AI branding in the starter: ${file}`);
});

test('every vendored file has source, version and license; fonts keep their OFL beside them',async()=>{
 const sources=JSON.parse(await readFile(resolve(root,'sources.json'),'utf8'));
 const template=sources.skillSources.flatMap(e=>e.files.map(f=>({...f,e}))).find(f=>f.file==='skills/ad-creative/assets/creative-review-template.html');
 assert.equal(template.sha256,'0ca7cce4fa809235aee776606205925d8dc01bde8a8325e2af7197d86394d3b7');
 assert.match(template.source,/coreyhaines31\/marketingskills\/365b412152b9542499ca1439426f7fc3cc92bb65\//);
 assert.equal(template.e.license.spdx,'MIT');
 const notices=await readFile(resolve(root,'THIRD_PARTY_NOTICES.md'),'utf8');
 assert.match(notices,/creative-review-template\.html/);assert.match(notices,/Fonts: this release ships no font files/);
 const temp=await mkdtemp(resolve(tmpdir(),'ship-ai-prov-'));
 try{
  await cp(root,temp,{recursive:true,filter:src=>!src.split('/').includes('.git')&&!src.split('/').includes('node_modules')});
  await writeFile(resolve(temp,'skills/ads/assets-note.md'),'unrecorded upstream file\n');
  await mkdir(resolve(temp,'skills/ads/fonts'),{recursive:true});await writeFile(resolve(temp,'skills/ads/fonts/Example.woff2'),'x');
  const manifest=JSON.parse(await readFile(resolve(temp,'release-manifest.json')));
  for(const p of ['skills/ads/assets-note.md','skills/ads/fonts/Example.woff2']){const b=await readFile(resolve(temp,p));manifest.files.push({path:p,sha256:createHash('sha256').update(b).digest('hex'),bytes:b.length});}
  await writeFile(resolve(temp,'release-manifest.json'),JSON.stringify(manifest));
  const errors=(await verifyPlugin(temp)).errors.join('\n');
  assert.match(errors,/assets-note\.md: no provenance record/);
  assert.match(errors,/Example\.woff2: font without its OFL/);
 }finally{await rm(temp,{recursive:true,force:true});}
});

test('workshop owner language never governs site, visitor or marketing copy',async()=>{
 const scope=[/owner (or|and) (a )?(site )?visitor/i,/visitor text/i,/all text that the owner/i,/text that the owner or/i,/ASD-STE100 (rules )?for all/i,/ASD-STE100 text/i];
 const files=[...await filesUnder(resolve(root,'roles')),...await filesUnder(resolve(root,'templates')),...await filesUnder(resolve(root,'assets/business-site-starter'),textFile),
  ...(await filesUnder(resolve(root,'skills'))).filter(p=>/skills\/(ship-ai-[^/]+|workshop-owner-language|shared-design-library|brief-to-site|README\.md)/.test(p)),resolve(root,'README.md'),resolve(root,'role-map.json')];
 for(const file of files){const text=await readFile(file,'utf8');for(const s of scope)assert.ok(!s.test(text),`${file.slice(root.length)} applies owner language to visitor copy: ${s}`);}
 const skill=await readFile(resolve(root,'skills/workshop-owner-language/SKILL.md'),'utf8');
 assert.match(skill,/does not govern marketing headlines, site copy/);assert.match(skill,/only for/);
 assert.match(await readFile(resolve(root,'skills/shared-design-library/SKILL.md'),'utf8'),/workshop-owner-language: Read before you write owner questions, progress updates, workshop steps or interface help\/error text\./);
 for(const role of ['pm','research','designer','frontend','backend'])assert.match(await readFile(resolve(root,`roles/${role}.md`),'utf8'),/Use workshop-owner-language only for owner questions/);
});

test('design skills follow precedence; scoped skills are never forced',async()=>{
 const roles=JSON.parse(await readFile(resolve(root,'role-map.json')));
 for(const role of ['designer','frontend']){assert.ok(!roles.roles[role].includes('illustration-design-grammar'));assert.ok(roles.roles[role].includes('ship-ai-design-gate'));}
 assert.deepEqual(roles.conditional.illustration,['illustration-design-grammar']);
 assert.deepEqual(roles.designPrecedence.slice(0,3).map(x=>x.skill),['yc-interface-craft','intentional-ui-design','frontend-design']);
 for(const file of [...await filesUnder(resolve(root,'roles')),...await filesUnder(resolve(root,'skills'),p=>/ship-ai-|shared-design-library|README/.test(p)),...await filesUnder(resolve(root,'assets/business-site-starter'),textFile),resolve(root,'design-skill-library.json')]){
  const text=await readFile(file,'utf8');
  assert.ok(!/with all seven supplied files/.test(text),`forced YC load in ${file}`);
  assert.ok(!/Both load[^.]*Illustration Design Grammar/.test(text),`forced illustration load in ${file}`);
  assert.ok(!/present exactly five/.test(text),`owner five-direction default in ${file}`);
 }
});

test('only the PM prepares the one project',async()=>{
 const setup=await readFile(resolve(root,'skills/ship-ai-setup/SKILL.md'),'utf8');
 assert.match(setup,/Only the PM runs the plugin's `scripts\/prepare-project\.mjs/);
 assert.match(setup,/Other roles never prepare their own starter or a review copy/);
 assert.ok(!/Use this skill before work in each Ship AI product role/.test(setup));
 assert.ok(!/starter\//.test((await Promise.all((await filesUnder(resolve(root,'roles'))).map(f=>readFile(f,'utf8')))).join('\n')));
});

test('the verifier fails on a broken internal skill or file reference',async()=>{
 const temp=await mkdtemp(resolve(tmpdir(),'ship-ai-links-'));
 try{
  await cp(root,temp,{recursive:true,filter:src=>!src.split('/').includes('.git')&&!src.split('/').includes('node_modules')});
  const ref=resolve(temp,'skills/ads/references/creative-research-automation.md');
  await rm(resolve(temp,'skills/competitor-profiling/SKILL.md'));
  let report=await verifyPlugin(temp);assert.equal(report.status,'FAIL');assert.ok(report.errors.some(e=>e.includes('broken link')&&e.includes('competitor-profiling')));
  await cp(resolve(root,'skills/competitor-profiling/SKILL.md'),resolve(temp,'skills/competitor-profiling/SKILL.md'));
  await rm(resolve(temp,'skills/ad-creative/assets/creative-review-template.html'));
  report=await verifyPlugin(temp);assert.ok(report.errors.some(e=>e.includes('creative-review-template.html')));
  assert.ok((await readFile(ref,'utf8')).includes('../../customer-research/SKILL.md'));
 }finally{await rm(temp,{recursive:true,force:true});}
});

test('the pinned creative review template matches upstream',async()=>{
 const bytes=await readFile(resolve(root,'skills/ad-creative/assets/creative-review-template.html'));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),'0ca7cce4fa809235aee776606205925d8dc01bde8a8325e2af7197d86394d3b7');
});

test('a freshly prepared project inherits the shell, the gate and the copy scope',async()=>{
 const temp=await mkdtemp(resolve(tmpdir(),'ship-ai-gate-'));const target=resolve(temp,'site');
 try{
  execFileSync(process.execPath,[resolve(root,'scripts/prepare-project.mjs'),'--target',target]);
  for(const f of ['design/contract.md','design/gate.json','lib/design-gate.mjs','scripts/verify-design-gate.mjs','.agents/skills/ship-ai-design-gate/SKILL.md','.agents/skills/customer-research/SKILL.md'])await readFile(resolve(target,f));
  assert.match(await readFile(resolve(target,'.agents/skills/workshop-owner-language/SKILL.md'),'utf8'),/does not govern marketing headlines/);
  assert.match(await readFile(resolve(target,'AGENTS.md'),'utf8'),/Its rules cover only owner questions/);
  const pkg=JSON.parse(await readFile(resolve(target,'package.json')));
  assert.match(pkg.scripts.prebuild,/verify:skills.*verify:design.*verify:gate/);assert.match(pkg.scripts['build:review'],/verify:skills/);
  execFileSync(process.execPath,['scripts/verify-design-gate.mjs'],{cwd:target,stdio:'pipe'});
  const brief=JSON.parse(await readFile(resolve(target,'examples/b2b.json')));brief.isDemo=false;
  await writeFile(resolve(target,'content/site.json'),JSON.stringify(brief));
  let out='';try{execFileSync(process.execPath,['scripts/verify-design-gate.mjs'],{cwd:target,stdio:'pipe'});}catch(e){out=e.stderr.toString();}
  assert.match(out,/placeholder/);assert.match(out,/Gate 1/);
 }finally{await rm(temp,{recursive:true,force:true});}
});

test('first-time owners default to a private review draft, never invented approvals',async()=>{
 for(const file of ['skills/ship-ai-product-manager/SKILL.md','roles/pm.md']){
  const text=await readFile(resolve(root,file),'utf8');
  assert.match(text,/A first-time owner always starts in review mode/);assert.match(text,/never set `isDemo` true for a real business/);
  assert.ok(!/First get positioning confirmed/.test(text),`${file} still requires approval before the first draft`);
 }
 assert.match(await readFile(resolve(root,'skills/ship-ai-setup/SKILL.md'),'utf8'),/first-time owner's brief to `mode` "review"/);
 assert.match(await readFile(resolve(root,'templates/pm.json'),'utf8'),/brief mode \\"review\\"/);
 const temp=await mkdtemp(resolve(tmpdir(),'ship-ai-review-'));const target=resolve(temp,'site');
 try{
  execFileSync(process.execPath,[resolve(root,'scripts/prepare-project.mjs'),'--target',target]);
  for(const f of ['tests/review-mode.test.mjs','tests/fixtures/review-b2b.json','tests/fixtures/review-b2c.json','scripts/verify-release.mjs'])await readFile(resolve(target,f));
  const pkg=JSON.parse(await readFile(resolve(target,'package.json')));
  assert.match(pkg.scripts.prebuild,/verify:release/);
  await writeFile(resolve(target,'content/site.json'),await readFile(resolve(target,'tests/fixtures/review-b2c.json')));
  let out='';try{execFileSync(process.execPath,['scripts/verify-release.mjs','--target','publication'],{cwd:target,stdio:'pipe'});}catch(e){out=e.stderr.toString();}
  assert.match(out,/BLOCKED: publication/);assert.match(out,/positioning, product scope/);
 }finally{await rm(temp,{recursive:true,force:true});}
});

test('visitor forms cannot leak answers without JavaScript in the starter or a prepared project',async()=>{
 for(const file of ['skills/ship-ai-frontend-engineer/SKILL.md','roles/frontend.md','assets/business-site-starter/AGENTS.md'])assert.match(await readFile(resolve(root,file),'utf8'),/components\/VisitorForm\.jsx`?, never a raw `<form>`/);
 assert.match(await readFile(resolve(root,'templates/frontend.json'),'utf8'),/VisitorForm/);
 assert.match(JSON.parse(await readFile(resolve(root,'package.json'))).scripts['test:browser'],/tests\/browser/);
 const temp=await mkdtemp(resolve(tmpdir(),'ship-ai-forms-'));const target=resolve(temp,'site');
 try{
  execFileSync(process.execPath,[resolve(root,'scripts/prepare-project.mjs'),'--target',target]);
  for(const f of ['components/VisitorForm.jsx','lib/forms.mjs','scripts/verify-forms-nojs.mjs','tests/forms.test.mjs'])await readFile(resolve(target,f));
  assert.match(JSON.parse(await readFile(resolve(target,'package.json'))).scripts['verify:forms'],/verify-forms-nojs/);
  assert.match(await readFile(resolve(target,'app/start/experience.jsx'),'utf8'),/<VisitorForm/);
 }finally{await rm(temp,{recursive:true,force:true});}
});

test('a prepared project resolves every license and provenance path it records',async()=>{
 const temp=await mkdtemp(resolve(tmpdir(),'ship-ai-closure-'));const target=resolve(temp,'site');
 const sha=b=>createHash('sha256').update(b).digest('hex');
 try{
  execFileSync(process.execPath,[resolve(root,'scripts/prepare-project.mjs'),'--target',target]);
  assert.equal(sha(await readFile(resolve(target,'.agents/LICENSE'))),sha(await readFile(resolve(root,'LICENSE'))));
  assert.match(await readFile(resolve(target,'.agents/LICENSE'),'utf8'),/MIT License[^]*Copyright \(c\) 2026/);
  assert.equal(sha(await readFile(resolve(target,'.agents/THIRD_PARTY_NOTICES.md'))),sha(await readFile(resolve(root,'THIRD_PARTY_NOTICES.md'))));
  const sources=JSON.parse(await readFile(resolve(target,'skill-sources.json'),'utf8'));
  const missing=[],changed=[];
  const need=async(p,hash)=>{if(!p)return;try{const b=await readFile(resolve(target,p));if(hash&&sha(b)!==hash)changed.push(p);}catch{missing.push(p);}};
  for(const e of sources.skillSources){await need(e.license?.file);await need(e.license?.notices);for(const f of e.files){await need(f.file,f.sha256);await need(f.copyOf);}}
  await need(sources.original.license.file);for(const f of sources.original.files)await need(f);
  assert.deepEqual(missing,[],'paths recorded in skill-sources.json must exist in the prepared project');
  assert.deepEqual(changed,[]);
  assert.equal(sources.original.license.file,'.agents/LICENSE');assert.equal(sources.original.author,'Ship AI');
  for(const lic of ['emilkowalski/LICENSE','coreyhaines31/LICENSE','anthropics/THIRD_PARTY_NOTICES.md'])await readFile(resolve(target,'.agents/licenses',lic));
 }finally{await rm(temp,{recursive:true,force:true});}
});
