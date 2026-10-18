import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {isReview,releaseErrors,briefMode} from '../lib/brief.mjs';

// Hosting providers set these during deploy builds; a private review draft must never reach one.
export const DEPLOY_ENV=['VERCEL','NETLIFY','CF_PAGES','RENDER','RAILWAY_ENVIRONMENT','AMPLIFY_APP_ID','GITHUB_PAGES'];

export function checkRelease(site,target,env=process.env){
 if(target==='build'){
  const host=DEPLOY_ENV.find(k=>env[k]);
  return isReview(site)&&host?[`Refusing to build a private review draft (mode "review") in a deploy environment (${host}). Deployment needs mode "production" and the final owner approvals`]:[];
 }
 return releaseErrors(site,target);
}

if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const args=process.argv.slice(2),at=args.indexOf('--target'),target=at>=0?args[at+1]:'publication';
 if(!['build','production','publication'].includes(target)){console.error('Use --target build, production or publication');process.exit(1);}
 const site=JSON.parse(readFileSync(resolve(process.cwd(),'content/site.json'),'utf8'));
 const errors=checkRelease(site,target);
 if(errors.length){console.error(`BLOCKED: ${target} (${briefMode(site)} brief).`);for(const e of errors)console.error(`• ${e}`);process.exit(1);}
 console.log(target==='build'?`Release guard passed (${briefMode(site)} brief, no deploy environment for a review draft).`:`PASS: ${target} approvals recorded.`);
}
