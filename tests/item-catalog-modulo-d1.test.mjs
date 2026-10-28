// D1.1 — Pruebas del módulo puro (Node sin DOM ni estado de partida).
import test from 'node:test';
import assert from 'node:assert/strict';
import {ItemCatalog} from '../src/item-catalog.mjs';

test('D1.1: catálogo importable sin window, document, game o motor',()=>{
  const catalog=new ItemCatalog(cards=>cards);
  assert.equal(Object.keys(catalog.definitions).length,17);
  assert.equal(catalog.resolve('ration').id,'ration');
  assert.equal(catalog.label('ration'),'🥫 Ración de comida');
  assert.deepEqual(catalog.create('sample',{finderId:'h42'}),{kind:'muestra',cardId:'sample',finderId:'h42'});
});

test('D1.1: fuente autónoma con las seis distribuciones de veinte cartas',()=>{
  const catalog=new ItemCatalog(cards=>cards);
  for(let loc=1;loc<=6;loc++){
    const deck=catalog.deck(loc);
    const expected=Object.entries(catalog.distribution[loc]).flatMap(([id,n])=>Array(n).fill(id));
    assert.deepEqual(deck.map(it=>it.cardId),expected);
    assert.equal(deck.length,20);
    assert.ok(deck.every(it=>typeof it.cardId==='string'&&typeof it.kind==='string'));
  }
});

test('D1.1: inyección de mezclador sin RNG global, una llamada exacta por mazo',()=>{
  let calls=0;
  const catalog=new ItemCatalog(cards=>{calls++;return [...cards].reverse();});
  const expected=Object.entries(catalog.distribution[1]).flatMap(([id,n])=>Array(n).fill(id)).reverse();
  assert.deepEqual(catalog.deck(1).map(it=>it.cardId),expected);
  assert.equal(calls,1);
  catalog.deck(2);
  assert.equal(calls,2);
});

test('D1.1: cada instancia de carta es independiente y los metadatos se preservan',()=>{
  const catalog=new ItemCatalog(cards=>cards);
  const deck=catalog.deck(1);
  const two=deck.filter(x=>x.cardId==='ration');
  assert.ok(two.length>=2);
  assert.notStrictEqual(two[0],two[1]);
  two[0].usedRound=99;
  assert.equal(two[1].usedRound,undefined);
  assert.deepEqual(catalog.create('pistol',{usedRound:2}),{kind:'arma',cardId:'pistol',usedRound:2});
});

test('D1.1: las operaciones de consulta no necesitan el mezclador',()=>{
  const catalog=new ItemCatalog();
  assert.equal(catalog.resolve('medicina').id,'bandage');
  assert.deepEqual(catalog.create('notes'),{kind:'educacion',cardId:'notes'});
  assert.equal(catalog.label('desconocido'),'Objeto desconocido');
  assert.ok(catalog.legend(2).length>0);
  assert.throws(()=>catalog.deck(1),{name:'TypeError',message:'Mezclador requerido para crear el mazo'});
});
