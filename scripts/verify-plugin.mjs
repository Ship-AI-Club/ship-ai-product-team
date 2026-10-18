import {createHash} from 'node:crypto';
import {readFile, realpath, readdir, stat} from 'node:fs/promises';
import {resolve, relative, isAbsolute, dirname} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

export const EXPECTED_SKILLS=50;
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const inside = (root,path) => {const rel=relative(root,path);return rel!=='..'&&!rel.startsWith('../')&&!isAbsolute(rel);};
const exists = path => stat(path).then(()=>true,()=>false);
const SKIP_DIRS=new Set(['.git','node_modules','.next']);
const EXTERNAL=/^(https?:|mailto:|tel:|data:|#)/;

async function* textFiles(dir){
 for(const e of await readdir(dir,{withFileTypes:true})){
  if(SKIP_DIRS.has(e.name))continue;
  const path=resolve(dir,e.name);
  if(e.isDirectory())yield* textFiles(path);else if(/\.(md|mdc)$/.test(e.name))yield path;
 }
}

// Markdown links anywhere in the package must resolve. Backticked file paths inside a skill
// may be relative to the file, its skill folder or a sibling skill folder.
export async function findBrokenReferences(root){
 const broken=[],skillsDir=resolve(root,'skills');
 const skillNames=(await readdir(skillsDir,{withFileTypes:true})).filter(e=>e.isDirectory()).map(e=>e.name);
 for await(const file of textFiles(root)){
  const text=(await readFile(file,'utf8')).replace(/```[\s\S]*?```/g,'');
  const where=relative(root,file);
  for(const m of text.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)){
   let target=m[1].replace(/^<|>$/g,'');
   if(EXTERNAL.test(target))continue;
   target=decodeURI(target.split('#')[0]);
   if(!target||target.startsWith('/'))continue;
   const path=resolve(dirname(file),target);
   if(!inside(root,path)||!await exists(path))broken.push(`${where}: broken link ${m[1]}`);
  }
  if(!inside(skillsDir,file))continue;
  const skillDir=resolve(skillsDir,relative(skillsDir,file).split('/')[0]);
  for(const m of text.matchAll(/`((?:\.\.\/|references\/|assets\/|evals\/|scripts\/)[\w./-]+\.[a-z]{2,5})`/g)){
   const candidates=[resolve(dirname(file),m[1]),resolve(skillDir,m[1]),...skillNames.map(n=>resolve(skillsDir,n,m[1]))];
   let found=false;for(const c of candidates)if(inside(root,c)&&await exists(c)){found=true;break;}
   if(!found)broken.push(`${where}: missing file ${m[1]}`);
  }
 }
 return broken;
}

// Names from private test runs, stored only as sha256 of the lowercased, space-normalized phrase.
const PRIVATE_PHRASES=new Set(['57b43f1b4a3b9f384966f2b0502fa3da2ccdee4659909473160e15e456f59981','dde9776d1d8f7ff7323002a41f6ab25a8caddb8d6ac3396bfe9ab5d0c3278fd6','a699d1e72ef4611d93f146d9c7759ca01947e15a33a03135a5ceed9e99bcf93a','59962fff6ae3025e5cb84f864090c0f53576fb266fd4aeef3b1d146766ed941c']);
const PRIVATE_PATTERNS=[[/\bbc-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}/i,'a Cloud run ID'],[/cursor\.com\/agents\/bc-/i,'a Cloud run link'],[/\bbc-[0-9a-f]{8}\b/i,'a Cloud run ID fragment']];
const TEXT=/\.(md|mdc|json|mjs|js|jsx|ts|tsx|css|html|txt|ya?ml)$/;
const FONT=/\.(woff2?|ttf|otf|eot)$/i;

export function findPrivateText(text){
 const hits=PRIVATE_PATTERNS.filter(([re])=>re.test(text)).map(([,what])=>what);
 const words=text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
 for(let i=0;i<words.length;i++)for(let n=1;n<=3&&i+n<=words.length;n++)if(PRIVATE_PHRASES.has(digest(words.slice(i,i+n).join(' '))))hits.push('a private demo or client name');
 return [...new Set(hits)];
}

export async function checkProvenance(root,paths){
 const errors=[],sources=JSON.parse(await readFile(resolve(root,'sources.json'),'utf8'));
 const covered=new Map();
 for(const e of sources.skillSources||[]){
  const label=e.repository||e.name;
  if(!e.version)errors.push(`sources.json: ${label} has no pinned version`);
  if(!e.license||!(e.license.spdx||e.license.terms))errors.push(`sources.json: ${label} has no license`);
  if(e.license?.file&&!await exists(resolve(root,e.license.file)))errors.push(`sources.json: ${label} license file ${e.license.file} is missing`);
  for(const f of e.files||[]){
   covered.set(f.file,label);
   if(!e.repository&&!f.sha256)errors.push(`sources.json: ${f.file} has no sha256`);
   if(e.repository&&!f.source&&!f.copyOf)errors.push(`sources.json: ${f.file} has no upstream source`);
   try{if(f.sha256&&digest(await readFile(resolve(root,f.file)))!==f.sha256)errors.push(`${f.file}: does not match its recorded upstream sha256`);}catch{errors.push(`sources.json: ${f.file} is missing`);}
  }
 }
 for(const f of sources.original?.files||[])covered.set(f,'original');
 for(const p of paths){
  if(p.startsWith('skills/')&&!covered.has(p))errors.push(`${p}: no provenance record in sources.json (source, version and license)`);
  if(FONT.test(p)){
   const dir=dirname(resolve(root,p));
   const near=(await readdir(dir)).some(n=>/^(OFL|LICEN[CS]E)/i.test(n));
   if(!near)errors.push(`${p}: font without its OFL or license file beside it`);
   if(!covered.has(p))errors.push(`${p}: font not listed in sources.json`);
  }
 }
 return errors;
}

export async function verifyPlugin(root){
 root=await realpath(root);
 const manifestBytes=await readFile(resolve(root,'release-manifest.json'));
 const manifest=JSON.parse(manifestBytes);
 const report={status:'FAIL',version:manifest.version,manifestSha256:digest(manifestBytes),skillCount:manifest.skills?.length,checkedFiles:0,checkedReferences:false,errors:[],scope:manifest.proofScope};
 if(manifest.name!=='ship-ai-product-team'||manifest.skillCount!==EXPECTED_SKILLS||manifest.skills?.length!==EXPECTED_SKILLS)report.errors.push('Unexpected or incomplete skill inventory.');
 const entries=(await readdir(resolve(root,'skills'),{withFileTypes:true})).filter(x=>x.isDirectory()&&manifest.skills?.includes(x.name));
 if(entries.length!==EXPECTED_SKILLS)report.errors.push('A required skill folder is missing.');
 for(const name of ['plugin.json','package.json']){
  const v=JSON.parse(await readFile(resolve(root,name),'utf8')).version;
  if(v!==manifest.version)report.errors.push(`${name} version ${v} does not match release ${manifest.version}`);
 }
 const seen=new Set();
 for(const f of manifest.files||[]){
  try{
   if(typeof f.path!=='string'||isAbsolute(f.path)||seen.has(f.path)||!inside(root,resolve(root,f.path)))throw Error('Invalid or duplicate path');
   seen.add(f.path);
   const target=await realpath(resolve(root,f.path));if(!inside(root,target))throw Error('Path escapes plugin');
   const bytes=await readFile(target);if(bytes.length!==f.bytes||digest(bytes)!==f.sha256)throw Error('File integrity mismatch');
   report.checkedFiles++;
  }catch(e){report.errors.push(`${f.path}: ${e.message}`);}
 }
 for(const skill of manifest.skills||[])if(!seen.has(`skills/${skill}/SKILL.md`))report.errors.push(`Unlisted skill: ${skill}`);
 if(!manifest.files?.length)report.errors.push('Empty file manifest');
 const roles=JSON.parse(await readFile(resolve(root,'role-map.json'),'utf8'));
 const named=[...roles.common,...Object.values(roles.roles).flat(),...Object.values(roles.conditional).flat(),...(roles.designPrecedence||[]).map(x=>x.skill)];
 for(const name of named)if(!manifest.skills?.includes(name))report.errors.push(`Role references missing skill: ${name}`);
 for(const ref of await findBrokenReferences(root))report.errors.push(ref);
 const paths=[...seen];
 report.errors.push(...await checkProvenance(root,paths));
 for(const p of paths)if(TEXT.test(p))for(const what of findPrivateText(await readFile(resolve(root,p),'utf8').catch(()=>'')))report.errors.push(`${p}: contains ${what}; private run, bot or client material cannot ship`);
 report.checkedProvenance=true;report.checkedPrivateMaterial=true;
 report.checkedReferences=true;
 if(!report.errors.length)report.status='PASS';return report;
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
 try{const report=await verifyPlugin(process.argv[2]||resolve(fileURLToPath(new URL('..',import.meta.url))));console.log(JSON.stringify(report,null,2));if(report.status!=='PASS')process.exitCode=1;}catch(e){console.error(e.message);process.exitCode=1;}
}
