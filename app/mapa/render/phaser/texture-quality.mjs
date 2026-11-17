// Derivado solo en memoria: conserva tamaño del frame, alfa y pivote del PNG.
// Phaser 4.2.1/WebGL1 genera mipmaps únicamente para texturas potencia de dos.
export function addIllustratedTexture(textures,key,image){
 const w=image.width,h=image.height,surface=document.createElement('canvas');
 surface.width=2**Math.ceil(Math.log2(w));surface.height=2**Math.ceil(Math.log2(h));
 // Un texel de margen donde cabe, sin forzar otra potencia de dos.
 // Extender el borde en el relleno conserva el alfa, sin introducir otro dibujo.
 const x=surface.width>w+1?1:0,y=surface.height>h+1?1:0,ctx=surface.getContext('2d');
 const columns=[[0,1,0,x],[0,w,x,w],[w-1,1,x+w,surface.width-w-x]];
 const rows=[[0,1,0,y],[0,h,y,h],[h-1,1,y+h,surface.height-h-y]];
 for(const [sx,sw,dx,dw]of columns)for(const [sy,sh,dy,dh]of rows)if(dw&&dh)ctx.drawImage(image,sx,sy,sw,sh,dx,dy,dw,dh);
 return textures.addAtlas(key,surface,{frames:{original:{
  frame:{x,y,w,h},sourceSize:{w,h},spriteSourceSize:{x:0,y:0,w,h},trimmed:false,rotated:false
 }}});
}
