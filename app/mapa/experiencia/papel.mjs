// Papel más real (ajustes de la sesión 7; guía 109 §8). Solo presentación.
// - Bordes rasgados generados con código: más quiebres, alguna fibra suelta y alguna muesca.
//   DISTINTOS por panel y FIJOS entre recargas: PRNG con semilla (mulberry32) a partir del id
//   del panel; nunca Math.random. Sin assets nuevos.
// - Relieve y grano (assets/interfaz/papel-fuente/): capas grises (128 = sin efecto) mezcladas
//   en soft-light sobre el crema, con la intensidad en una variable CSS por capa
//   (--papel-arrugas, --papel-grano; papel.css). Las manchas de sangre siguen en su capa aparte.

export function mulberry32(seed){let a=seed>>>0;return ()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
// FNV-1a: la misma cadena da siempre la misma semilla.
export function seedOf(text){let h=2166136261;for(const ch of String(text)){h^=ch.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}

const num=v=>String(Math.round(v*100)/100);
// Un borde (superior o inferior) como lista de [x%, profundidad px]. Profundidad 0 = el filo
// exterior. Pasos irregulares; ~8 % de fibras (punta fina hacia afuera desde una base más
// honda) y ~5 % de muescas (una V más profunda).
function edge(rand,depth){
 const pts=[[0,rand()*depth*.6]];let x=0;
 while(x<100){
  x=Math.min(100,x+.8+rand()*3.6);const y=rand()*depth*.75,roll=rand();
  if(x<99&&x>1&&roll<.05){const w=.5+rand()*.7;pts.push([x-w,y],[x,depth+1.5+rand()*2],[x+w,rand()*depth*.6]);x+=w;}
  else if(x<99&&x>1&&roll<.13){const base=depth*(.7+rand()*.3),w=.12+rand()*.18;pts.push([x-w,base],[x,0],[x+w,base]);x+=w;}
  else pts.push([x,y]);
 }
 return pts.filter(([px])=>px<=100);
}
// Costados: casi rectos, con un temblor de hasta 1,5 px para no tocar el contenido.
function side(rand){const pts=[];let y=0;while(y<100){y=Math.min(100,y+6+rand()*14);if(y<100)pts.push([y,rand()*1.5]);}return pts;}

export function tornPolygon(seed,{depth=4}={}){
 const rand=mulberry32(seed),top=edge(rand,depth),right=side(rand),bottom=edge(rand,depth),left=side(rand);
 const out=[];
 for(const [x,y] of top)out.push(num(x)+'% '+num(y)+'px');
 for(const [y,d] of right)out.push('calc(100% - '+num(d)+'px) '+num(y)+'%');
 for(const [x,y] of bottom.reverse())out.push(num(x)+'% calc(100% - '+num(y)+'px)');
 for(const [y,d] of left.reverse())out.push(num(d)+'px '+num(y)+'%');
 return 'polygon('+out.join(',')+')';
}

// Superficies de papel. `layer`: las que pintan el crema en ::before necesitan un elemento
// propio para el relieve (.papel-relieve); las demás lo llevan en sus ::before y ::after.
export const PAPER_SURFACES=Object.freeze([
 ['#objective-card','layer'],['#crisis-card','layer'],['#action-bar','layer'],['#dossier','layer'],['#stat-tip','layer'],
 ['#bar-fan','own'],['#action-strip','own'],['#move-planner','own'],['#move-sequence','own'],
 ['#search-panel','own'],['#action-panel','own'],['#play-dialog','own'],['#cycle-dialog','own'],['#inventory-dialog','own']
]);
// Variables de un panel: bordes normal y grande, y desplazamiento de las texturas (así dos
// paneles nunca muestran el mismo pedazo de papel).
export function paperStyle(key){
 const seed=seedOf(key),rand=mulberry32(seed^0x9E3779B9);
 return {'--torn':tornPolygon(seed,{depth:4}),'--torn-lg':tornPolygon(seed,{depth:6}),'--papel-x':Math.round(rand()*100)+'%','--papel-y':Math.round(rand()*100)+'%'};
}
export function mountPaper(root=document){
 for(const [selector,kind] of PAPER_SURFACES){const el=root.querySelector(selector);if(!el)continue;
  for(const [k,v] of Object.entries(paperStyle(selector.slice(1))))el.style.setProperty(k,v);
  if(kind==='layer'&&!el.querySelector(':scope>.papel-relieve')){const span=root.createElement?root.createElement('span'):document.createElement('span');span.className='papel-relieve';span.setAttribute('aria-hidden','true');el.prepend(span);}
 }
}
