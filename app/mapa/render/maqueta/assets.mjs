export function makeMockupKit(scene,uploaded,manifest){
 const map=manifest.files.find(a=>a.file===scene.mapFile);
 if(!map||map.width!==scene.bounds.width||map.height!==scene.bounds.height)throw Error('Mapa no coincide con la composición');
 const images=structuredClone(uploaded.assets.filter(a=>a.kind==='image'&&!['hospital','ground'].includes(a.id)));
 for(const a of images){a.reference='map-illustration-provisional';a.scale=a.presentation==='circular-portrait'?44/a.width:a.id==='zombie'?scene.actorScale.zombie:scene.actorScale.barricade;}
 return {assets:[{id:'map',kind:'image',file:'../../kit_arte_h33/'+map.file,width:map.width,height:map.height,bytes:map.bytes,sha256:map.sha256,alpha:false,pivot:{x:0,y:0},scale:1,visibleBounds:{x:0,y:0,width:map.width,height:map.height},provenance:{manifest:'kit_arte_h33/manifest.json',record:map.file,uploadCommit:uploaded.sourceSnapshot},provisional:true},...images],bounds:scene.bounds,buildingPosition:{x:280,y:549},survivorPositions:[],accessPositions:[],sourceSnapshot:uploaded.sourceSnapshot};
}
