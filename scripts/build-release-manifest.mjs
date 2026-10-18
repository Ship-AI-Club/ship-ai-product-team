import {createHash} from 'node:crypto';
import {readFile, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

// Maintainer tool: refreshes design-library hashes, then lists every shipped file in release-manifest.json.
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');

for(const path of ['design-skill-library.json','assets/business-site-starter/design-skill-library.json']){
 const library=JSON.parse(await readFile(resolve(root,path),'utf8'));
 for(const f of library.files)f.sha256=digest(await readFile(resolve(root,f.path.replace(/^\.agents\//,''))));
 await writeFile(resolve(root,path),JSON.stringify(library,null,2)+'\n');
}

const sources=JSON.parse(await readFile(resolve(root,'sources.json'),'utf8'));
const inProject=p=>typeof p==='string'&&p.startsWith('skills/')?`.agents/${p}`:p;
const starterSources={...sources,note:'Mirror of the plugin sources.json. Paths are relative to a prepared project, where prepare-project installs each file and copies the plugin LICENSE, THIRD_PARTY_NOTICES.md and licenses/ into .agents/.',skillSources:sources.skillSources.map(e=>({...e,...(e.license?{license:{...e.license,file:inProject(e.license.file),notices:inProject(e.license.notices)}}:{}),files:e.files.map(f=>({...f,file:inProject(f.file),...(f.copyOf?{copyOf:inProject(f.copyOf)}:{})}))})),original:{...sources.original,license:{...sources.original.license,file:'.agents/LICENSE'},files:sources.original.files.map(inProject)}};
await writeFile(resolve(root,'assets/business-site-starter/skill-sources.json'),JSON.stringify(starterSources,null,2)+'\n');

const listed=execFileSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{cwd:root}).toString().split('\0').filter(Boolean);
const paths=[...new Set(listed)].filter(p=>p!=='release-manifest.json').sort();
const previous=JSON.parse(await readFile(resolve(root,'release-manifest.json'),'utf8'));
const pkg=JSON.parse(await readFile(resolve(root,'package.json'),'utf8'));
const skills=[...new Set(paths.filter(p=>/^skills\/[^_/][^/]*\/SKILL\.md$/.test(p)).map(p=>p.split('/')[1]))].sort();
const files=[];
for(const path of paths){
 let bytes;try{bytes=await readFile(resolve(root,path));}catch{continue;}
 files.push({path,sha256:digest(bytes),bytes:bytes.length});
}
const manifest={schemaVersion:1,name:previous.name,version:pkg.version,skills,skillCount:skills.length,files,proofScope:previous.proofScope};
await writeFile(resolve(root,'release-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(`release-manifest.json: ${manifest.version}, ${skills.length} skills, ${files.length} files.`);
