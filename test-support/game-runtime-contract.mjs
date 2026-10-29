// Contrato semántico que reemplaza la búsqueda literal de declaraciones de clase.
import assert from 'node:assert/strict';
export function assertGameRuntimeContract(runtime){
 const callable=expression=>assert.equal(runtime.run('typeof '+expression),'function',expression+' debe ser invocable');
 for(const [constructor,methods] of [
  ['catalog.constructor',['resolve','create','deck','legend','label']],
  ['TurnController',['group','hand','dice','display']],
  ['ItemEngine',['has','equipped','equip','attack','moveWithFuel','use']],
  ['DeathDirector',['record','open','continue','wait','reset']],
 ]){
  callable(constructor);
  for(const method of methods)callable(constructor+'.prototype.'+method);
 }
 assert.equal(runtime.run('catalog.constructor!==Object'),true,'catálogo construido, no objeto vacío');
 for(const method of ['canContribute','add','fromHand','fromEquipment'])callable('CrisisManager.'+method);
 callable('CrisisManager');
 for(const name of ['create','paint','renderSite','colony','botTurn'])callable(name);
 assert.equal(runtime.run('catalog.resolve("ration").id'),'ration');
 assert.equal(runtime.run('new TurnController().group()===game.humans'),true);
 assert.equal(runtime.run('new ItemEngine().has({equipment:[]},"pistol")'),false);
 assert.equal(runtime.run('new DeathDirector().pending.length'),0);
 assert.equal(runtime.run('CrisisManager.canContribute(catalog.create(game.crisis.type))'),true);
 assert.equal(runtime.run('CrisisManager.canContribute(catalog.create(game.crisis.type==="comida"?"bandage":"ration"))'),false);
}
