import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
test('H3.2: referencia Canvas, PNG originales y evidencia PR16 conservan sus bytes',async()=>{
 const manifest=JSON.parse(await readFile(new URL('../test-support/h32-reference.json',import.meta.url)));
 assert.equal(manifest.sourceCommit,'ba1d93a4ae73a91a6f07660584e2374b53043a67');
 for(const file of manifest.files){const bytes=await readFile(new URL('../'+file.path,import.meta.url));assert.equal(bytes.length,file.bytes,file.path);assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256,file.path);}
});
