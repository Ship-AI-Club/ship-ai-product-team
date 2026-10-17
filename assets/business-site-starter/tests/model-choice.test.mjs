import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateBrief} from '../lib/brief.mjs';
const base=JSON.parse(readFileSync(new URL('../brief/project.json',import.meta.url)));
test('build model is separate from business pricing and permits either approved choice',()=>{
 for(const buildModel of ['sonnet-5.5','opus-5.5']){
  const brief=structuredClone(base);brief.setup={buildModel,effort:'medium'};
  assert.deepEqual(validateBrief(brief),[]);assert.equal(brief.business.pricing.model,'unknown');
 }
});
test('unsupported model and effort do not pass brief validation',()=>{
 for(const setup of [{buildModel:'auto',effort:'medium'},{buildModel:'sonnet-5.5',effort:'high'},{buildModel:'opus-5.5'}])assert.ok(validateBrief({...base,setup}).length>0);
});
