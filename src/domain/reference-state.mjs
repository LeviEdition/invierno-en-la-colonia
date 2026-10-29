// Construcción de estado, sin DOM ni decisión de turnos. Conserva orden de cartas y propiedades.
export function createReferenceState({gameMode,objective,places,catalog}){return {mode:gameMode,objective,round:1,max:objective.rounds,morale:9,food:6,hunger:0,samples:0,goal:objective.need,waste:0,
 humans:[{id:'h0',name:'Mara',loc:0,wounds:0,frost:0,dead:false},{id:'h1',name:'Leo',loc:0,wounds:0,frost:0,dead:false},{id:'h2',name:'Iris',loc:0,wounds:0,frost:0,dead:false}],
 bots:[{id:'a0',name:'Ada',loc:0,wounds:0,frost:0,dead:false},{id:'a1',name:'Bruno',loc:0,wounds:0,frost:0,dead:false},{id:'a2',name:'Sol',loc:0,wounds:0,frost:0,dead:false}],
 zones:places.map((name,i)=>({name,z:i===0?3:1,b:0,noise:0,accessIndex:0})),items:['ration','bandage','crowbar','pistol','canned','gascan','ration'].map(id=>catalog.create(id)),botItems:['ration','bandage','gascan','ration','pistol','repairkit','ration'].map(id=>catalog.create(id)),helpless:0,
 leaders:{human:'h0',ai:'a1'},leaderChosen:false,localLeaderChosen:gameMode!=='local',rescueQueue:[],crossRemaining:[],crossCard:0,crossResolved:false,crossPending:false,crossOwner:'human',crossActorId:null,crossAttempts:0,
 dice:[],crisis:null,ended:false,noReplacement:false,biteResolving:false,log:[],last:'',turn:'human',nextId:6,decks:{}};}
