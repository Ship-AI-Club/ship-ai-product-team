import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {cp,mkdtemp,readFile,rm,writeFile,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

const root=fileURLToPath(new URL('../..',import.meta.url));
const run=(cmd,args,cwd)=>execFileSync(cmd,args,{cwd,stdio:'pipe',encoding:'utf8',env:{...process.env,NEXT_TELEMETRY_DISABLED:'1'}});
// The design gate is tested elsewhere; these builds call next directly so the probe pages can render.
const nextBuild=cwd=>run(process.execPath,['node_modules/next/dist/bin/next','build'],cwd);

async function prepared(){
 const temp=await mkdtemp(resolve(tmpdir(),'forms-nojs-'));const site=resolve(temp,'site');
 run(process.execPath,[resolve(root,'scripts/prepare-project.mjs'),'--target',site],root);
 const cache=process.env.STARTER_NODE_MODULES;
 if(cache&&existsSync(cache))await cp(cache,resolve(site,'node_modules'),{recursive:true,verbatimSymlinks:true});
 else run('npm',['ci','--no-audit','--no-fund'],site);
 const {checkFormsWithoutJs}=await import(pathToFileURL(resolve(site,'scripts/verify-forms-nojs.mjs')).href);
 return {temp,site,check:opts=>checkFormsWithoutJs(site,opts)};
}
const show=(label,report)=>console.log(`${label}: ${JSON.stringify({status:report.status,review:report.review,pages:report.pages,forms:report.forms,errors:report.errors})}`);

test('prepared starter: no visitor answers reach a URL or a request with JavaScript disabled',{timeout:600000},async t=>{
 const {temp,site,check}=await prepared();
 try{
  await t.test('control: a plain named form without method leaks via GET, and the checker catches it',async()=>{
   const original=await readFile(resolve(site,'app/start/experience.jsx'),'utf8');
   await writeFile(resolve(site,'app/start/experience.jsx'),"export default function Experience(){return <form><label><input type=\"radio\" name=\"stage\" value=\"act\"/>Act</label><button type=\"submit\">Go</button></form>}\n");
   nextBuild(site);
   const report=await check({review:false});show('control (expected FAIL)',report);
   assert.equal(report.status,'FAIL');
   assert.ok(report.errors.some(e=>e.includes('query string')));
   await writeFile(resolve(site,'app/start/experience.jsx'),original);
  });

  await t.test('demo starter: the assessment form submits nothing without JavaScript',async()=>{
   run('npm',['run','build'],site);
   const report=await check({});show('demo starter',report);
   assert.equal(report.review,false);
   const start=report.forms.find(f=>f.path==='/start');
   assert.ok(start,'the /start visitor form was found and tested');
   assert.ok(start.fields.length>0&&start.submitted,'fields were filled and submit was clicked');
   assert.equal(start.method,'post');assert.equal(start.inertWithoutJs,true);
   for(const f of report.forms){assert.equal(new URL(f.finalUrl).search,'',`query string on ${f.path}`);assert.deepEqual(f.errors,[]);}
   assert.equal(report.status,'PASS');
  });

  await t.test('no real write: a sending form is stubbed in the browser, an external action is refused, and a live base is rejected',async()=>{
   const marker=resolve(site,'lead-written.txt');
   await mkdir(resolve(site,'app/api/lead'),{recursive:true});
   await writeFile(resolve(site,'app/api/lead/route.js'),"import {writeFileSync} from 'node:fs';\nexport async function POST(request){writeFileSync('lead-written.txt',await request.text());return new Response('stored');}\n");
   await mkdir(resolve(site,'app/lead-probe'),{recursive:true});
   await writeFile(resolve(site,'app/lead-probe/page.jsx'),"import VisitorForm from '../../components/VisitorForm';\nexport default function Page(){return <><VisitorForm action=\"/api/lead\"><label>Email <input type=\"email\" name=\"email\"/></label><button type=\"submit\">Send</button></VisitorForm><VisitorForm action=\"https://example.com/lead\"><label>Name <input name=\"name\"/></label><button type=\"submit\">Send</button></VisitorForm></>}\n");
   nextBuild(site);
   const report=await check({review:false,paths:['/lead-probe']});show('no real write',report);
   const [local,external]=report.forms.filter(f=>f.path==='/lead-probe');
   assert.ok(local.submitted&&local.requests.length>0,'the same-origin POST was attempted and intercepted');
   assert.ok(local.requests.every(r=>r.stubbed));
   assert.ok(local.requests.some(r=>r.intentionalPost&&r.method==='POST'&&r.postData.includes('secret')),'the POST body is classified as intentional, not a leak');
   assert.equal(new URL(local.finalUrl).search,'');assert.deepEqual(local.errors,[]);
   assert.equal(external.submitted,false);assert.deepEqual(external.requests,[]);
   assert.ok(external.errors.some(e=>e.startsWith('Refused to submit')));
   assert.equal(report.status,'FAIL','an external action fails the check rather than being sent');
   assert.equal(existsSync(marker),false,'the lead route was never reached');
   await assert.rejects(check({base:'https://example.com'}),/Refusing to submit forms on https:\/\/example.com/);
   await rm(resolve(site,'app/api'),{recursive:true,force:true});await rm(resolve(site,'app/lead-probe'),{recursive:true,force:true});
  });

  await t.test('review mode: no visitor form sends any request, including a form that would send',async()=>{
   const brief=JSON.parse(await readFile(resolve(site,'tests/fixtures/review-b2b.json'),'utf8'));
   brief.product.journey='assessment';
   await writeFile(resolve(temp,'review.json'),JSON.stringify(brief));
   run(process.execPath,['scripts/configure.mjs','--brief',resolve(temp,'review.json')],site);
   await mkdir(resolve(site,'app/send-probe'),{recursive:true});
   await writeFile(resolve(site,'app/send-probe/page.jsx'),"import VisitorForm from '../../components/VisitorForm';\nexport default function Page(){return <VisitorForm action=\"/start\"><label>Email <input type=\"email\" name=\"email\"/></label><label>Message <textarea name=\"message\"/></label><button type=\"submit\">Send</button></VisitorForm>}\n");
   nextBuild(site);
   const report=await check({paths:['/send-probe']});show('review mode',report);
   assert.equal(report.review,true);
   assert.ok(report.forms.some(f=>f.path==='/start')&&report.forms.some(f=>f.path==='/send-probe'));
   for(const f of report.forms){
    assert.ok(f.submitted,`submit clicked on ${f.path}`);
    assert.equal(new URL(f.finalUrl).search,'');
    assert.deepEqual(f.requests,[],`review mode sent a request from ${f.path}`);
   }
   const probe=report.forms.find(f=>f.path==='/send-probe');
   assert.equal(probe.action,null,'a review draft renders no submit target');assert.equal(probe.inertWithoutJs,true);
   assert.equal(report.status,'PASS');
  });
 }finally{await rm(temp,{recursive:true,force:true});}
});
