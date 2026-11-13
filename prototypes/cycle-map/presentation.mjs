const labels={feeding:'Alimentación',waste:'Residuos',crisis:'Crisis',population:'Llegadas por habitantes',noise:'Ruido',round:'Inicio de ronda',contribution:'Aportación entregada',death:'Fallecimiento',zombie:'Incorporación de zombi'};
export function describeCycleStep(step){
 if(!step)return {title:'Ciclo',explanation:'No hay datos de este paso.',changes:[],events:[]};
 const a=step.before,b=step.after,m=step.meta||{},changes=[],events=[];
 let explanation='';
 if(step.kind==='contribution')explanation='Cartas entregadas a la crisis: '+m.given+'.';
 if(step.kind==='death')explanation=m.name+' · '+m.reason;
 if(step.kind==='feeding')explanation=m.sufficient?'El motor cubrió la necesidad de '+m.need+' comidas.':'No alcanzó la comida para la necesidad de '+m.need+'. Se conserva la comida existente y se aplica el hambre acumulada.';
 if(step.kind==='waste')explanation='Penalización de residuos aplicada por V9: '+m.loss+' de moral. El montón no se retira.';
 if(step.kind==='crisis')explanation=(m.success?'Crisis superada.':'Crisis fallida.')+' El motor resolvió '+m.given+' cartas entregadas; '+m.valid+' aportes válidos para un requisito de '+m.required+'. Los aportes ya se retiraron.';
 if(step.kind==='population')explanation='Se resolvieron las llegadas por habitantes en el orden de localidades del motor.';
 if(step.kind==='noise')explanation='Tiradas reales de ruido. Las fichas se limpian al resolver cada localidad; una derrota detiene las restantes.';
 if(step.kind==='round')explanation='El motor preparó la ronda, las reservas de dados y la crisis, reinició los usos por ronda y resolvió la congelación inicial. Pase y decisiones pendientes deben completarse antes de jugar.';
 if(a&&b){
  for(const [key,label]of [['food','Comida'],['morale','Moral'],['waste','Residuos'],['hunger','Hambre'],['samples','Muestras'],['helpless','Indefensos']])if(a[key]!==b[key])changes.push(label+': '+a[key]+' → '+b[key]);
  for(const z of b.locations){const old=a.locations.find(x=>x.index===z.index);for(const [key,label]of [['zombies','zombis'],['barricades','barricadas'],['noise','ruido']])if(old[key]!==z[key])changes.push(z.name+' · '+label+': '+old[key]+' → '+z[key]);}
  for(const p of b.people){const old=a.people.find(x=>x.id===p.id);if(!old){changes.push('Se incorporó '+p.name+'.');continue;}if(p.dead&&!old.dead)changes.push(p.name+' falleció.');for(const [key,label]of [['wounds','heridas'],['frost','congelaciones']])if(p[key]!==old[key])changes.push(p.name+' · '+label+': '+old[key]+' → '+p[key]);}
  for(const e of step.events||[]){const loc=b.locations.find(z=>z.index===e.location)?.name||'';if(e.type==='arrival'&&e.count)events.push(loc+': '+e.count+' llegadas por habitantes.');if(e.type==='zombie')events.push(loc+': '+{added:'se incorporó un zombi.',barricade:'una barricada interceptó al zombi.',overflow:'se resolvió un desbordamiento.'}[e.result]);if(e.type==='noise-roll')events.push(loc+' · ruido '+e.index+'/'+e.count+': dado '+e.value+'.');if(e.type==='death')events.push(e.name+' murió por '+e.reason+'.');}
 }
 return {title:labels[step.kind]||'Resultado público',explanation,changes,events};
}
