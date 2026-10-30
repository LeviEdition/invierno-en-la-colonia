// Compara composiciones reales dentro de cada backend para no confundir filtros con oclusión.
export async function capturePhaser(page,kind='normal'){
 await page.evaluate(async kind=>{const app=await import('/dist/hospital-phaser/game.mjs');await app.diagnosticFrame(kind);},kind);
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 return (await page.locator('#scene').screenshot({animations:'disabled'})).toString('base64');
}
export async function compareOcclusion(page){
 const actual=await capturePhaser(page),base=await capturePhaser(page,'no-actor'),full=await capturePhaser(page,'actor-front');
 await page.evaluate(async()=>{await(await import('/dist/hospital-phaser/game.mjs')).diagnosticFrame('normal');});
 return page.evaluate(async({actual,base,full})=>{
  async function pixels(data){const image=new Image();image.src='data:image/png;base64,'+data;await image.decode();const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const x=canvas.getContext('2d',{willReadFrequently:true});x.drawImage(image,0,0);return x.getImageData(0,0,canvas.width,canvas.height);}
  const shots=await Promise.all([actual,base,full].map(pixels));
  function fraction(a,b,c){let visible=0,total=0;for(let i=0;i<a.length;i+=4){const difference=(x,y)=>Math.abs(x[i]-y[i])+Math.abs(x[i+1]-y[i+1])+Math.abs(x[i+2]-y[i+2]);if(difference(a,b)>16)visible++;if(difference(c,b)>16)total++;}return {visible,total,ratio:visible/total};}
  const phaser=fraction(...shots.map(x=>x.data));
  const {scene}=await import('/prototypes/hospital/scene.mjs'),{loadImages,renderScene}=await import('/prototypes/hospital/renderer.mjs');
  const app=(await import('/dist/hospital-phaser/game.mjs')).inspect().app,images=await loadImages();
  const viewport={...app.viewport,dpr:shots[0].width/app.viewport.width};
  const originalPose=scene.positions[app.position],blank=document.createElement('canvas');blank.width=images.zombie.width;blank.height=images.zombie.height;
  function reference(assets,pose){const surface=document.createElement('canvas');surface.width=shots[0].width;surface.height=shots[0].height;const ctx=surface.getContext('2d',{willReadFrequently:true});renderScene(ctx,{images:assets,camera:app.camera,viewport,pose,showHidden:app.showHidden});return ctx.getImageData(0,0,surface.width,surface.height).data;}
  const referenceActual=reference(images,originalPose),referenceBase=reference({...images,zombie:blank},originalPose),referenceFull=reference(images,{...originalPose,layer:'front'});
  const canvas=fraction(referenceActual,referenceBase,referenceFull);
  return {position:app.position,showHidden:app.showHidden,phaser,canvas,absoluteDifference:Math.abs(phaser.ratio-canvas.ratio),tolerance:.03,toleranceReason:'3 puntos porcentuales: banda estrecha de paridad perceptual para minificación Canvas/WebGL; se verifica además geometría exacta, sin mover pivotes o posiciones'};
 },{actual,base,full});
}
