import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../assets/prototipo-hospital/',import.meta.url);
const manifest=JSON.parse(readFileSync(new URL('manifest.json',root)));
for(const asset of manifest.assets)test(`Arte hospital: ${asset.file} conserva el PNG original y su tipo de canal`,()=>{
 const bytes=readFileSync(new URL(asset.file,root));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256);
 assert.equal(bytes.length,asset.bytes);
 assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 assert.equal(bytes.readUInt32BE(16),asset.width);assert.equal(bytes.readUInt32BE(20),asset.height);
 assert.equal(bytes[25],asset.mode==='RGBA'?6:2);
});
