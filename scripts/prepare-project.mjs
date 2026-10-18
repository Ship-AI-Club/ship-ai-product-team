import {cp, mkdir, readdir, readFile, writeFile, access} from 'node:fs/promises';
import {resolve, relative, isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {verifyPlugin} from './verify-plugin.mjs';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const at=process.argv.indexOf('--target');
if(at<0||!process.argv[at+1])throw Error('Supply --target with a new project folder.');
const target=resolve(process.argv[at+1]);
const rel=relative(root,target);
if(rel===''||(!rel.startsWith('..')&&!isAbsolute(rel)))throw Error('Target must be outside this plugin.');
const audit=await verifyPlugin(root);if(audit.status!=='PASS')throw Error(`Plugin audit failed: ${audit.errors.join('; ')}`);
try{const existing=await readdir(target);if(existing.length)throw Error('Target contains files. No source was changed.');}catch(e){if(e.code!=='ENOENT')throw e;}
await mkdir(target,{recursive:true});
for(const name of await readdir(resolve(root,'assets/business-site-starter'))){
 await cp(resolve(root,'assets/business-site-starter',name),resolve(target,name),{recursive:true,errorOnExist:true,force:false});
}
await cp(resolve(root,'skills'),resolve(target,'.agents/skills'),{recursive:true,errorOnExist:true,force:false});
await cp(resolve(root,'role-map.json'),resolve(target,'.agents/role-map.json'));
const release=JSON.parse(await readFile(resolve(root,'release-manifest.json'),'utf8'));
const manifest={version:release.version,expectedSkills:release.skills,files:release.files.filter(f=>f.path.startsWith('skills/')).map(f=>({...f,path:`.agents/${f.path}`}))};
await writeFile(resolve(target,'.agents/ship-ai-skills.json'),JSON.stringify(manifest,null,2)+'\n');
await cp(resolve(root,'scripts/verify-project-skills.mjs'),resolve(target,'scripts/verify-project-skills.mjs'));
const pkg=JSON.parse(await readFile(resolve(target,'package.json'),'utf8'));
pkg.scripts['verify:skills']='node scripts/verify-project-skills.mjs';
pkg.scripts.check='npm run verify:skills && '+pkg.scripts.check;
pkg.scripts.prebuild='npm run verify:skills && '+pkg.scripts.prebuild;
pkg.scripts['build:review']='npm run verify:skills && '+pkg.scripts['build:review'];
await writeFile(resolve(target,'package.json'),JSON.stringify(pkg,null,2)+'\n');
await mkdir(resolve(target,'evidence'),{recursive:true});
await writeFile(resolve(target,'evidence/plugin-source.json'),JSON.stringify({...audit,pluginManifestSha256:createHash('sha256').update(await readFile(resolve(root,'plugin.json'))).digest('hex')},null,2)+'\n');
console.log(`Prepared ${target}. All ${release.skills.length} full skills copied. No model run or deployment started.`);
