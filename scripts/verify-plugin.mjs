import {createHash} from 'node:crypto';
import {readFile, realpath, readdir} from 'node:fs/promises';
import {resolve, relative, isAbsolute} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const inside = (root,path) => {const rel=relative(root,path);return rel!=='..'&&!rel.startsWith('../')&&!isAbsolute(rel);};
export async function verifyPlugin(root){
 root=await realpath(root);
 const manifestBytes=await readFile(resolve(root,'release-manifest.json'));
 const manifest=JSON.parse(manifestBytes);
 const report={status:'FAIL',version:manifest.version,manifestSha256:digest(manifestBytes),skillCount:manifest.skills?.length,checkedFiles:0,errors:[],scope:manifest.proofScope};
 if(manifest.name!=='ship-ai-product-team'||manifest.skillCount!==47||manifest.skills?.length!==47)report.errors.push('Unexpected or incomplete skill inventory.');
 const entries=(await readdir(resolve(root,'skills'),{withFileTypes:true})).filter(x=>x.isDirectory()&&manifest.skills?.includes(x.name));
 if(entries.length!==47)report.errors.push('A required skill folder is missing.');
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
 for(const list of [roles.common,...Object.values(roles.roles),...Object.values(roles.conditional)])for(const name of list)if(!manifest.skills?.includes(name))report.errors.push(`Role references missing skill: ${name}`);
 if(!report.errors.length)report.status='PASS';return report;
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
 try{const report=await verifyPlugin(process.argv[2]||resolve(fileURLToPath(new URL('..',import.meta.url))));console.log(JSON.stringify(report,null,2));if(report.status!=='PASS')process.exitCode=1;}catch(e){console.error(e.message);process.exitCode=1;}
}
