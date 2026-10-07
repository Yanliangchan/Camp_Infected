import {CAMP_PALETTE as P} from './render/campPalette';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const steel=0x637469,cream=0xd7d8c9,olive=0x7b856b,wood=0xa69b7c;
class RestKit{
 parts:THREE.BufferGeometry[]=[];
 add(geo:THREE.BufferGeometry,col:number,x:number,y:number,z:number,rotation=new THREE.Euler(),scale=new THREE.Vector3(1,1,1)){
  const g=geo.index?geo.toNonIndexed():geo.clone();g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(rotation),scale));
  const c=new THREE.Color(col),p=g.getAttribute('position'),colors=new Float32Array(p.count*3);
  for(let i=0;i<p.count;i++){const f=.8+.2*Math.min(1,Math.max(0,p.getY(i)-.03)/.6);colors[i*3]=c.r*f;colors[i*3+1]=c.g*f;colors[i*3+2]=c.b*f;}
  for(const a of Object.keys(g.attributes))if(a!=='position'&&a!=='normal')g.deleteAttribute(a);g.setAttribute('color',new THREE.BufferAttribute(colors,3));this.parts.push(g);geo.dispose();
 }
 box(w:number,h:number,d:number,x:number,y:number,z:number,col:number,r=.025,ry=0){this.add(r?new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/3,h/3,d/3)):new THREE.BoxGeometry(w,h,d),col,x,y,z,new THREE.Euler(0,ry,0));}
 cyl(r:number,h:number,x:number,y:number,z:number,col:number,rb=r,rotation=new THREE.Euler()){this.add(new THREE.CylinderGeometry(r,rb,h,18),col,x,y,z,rotation);}
 sphere(r:number,x:number,y:number,z:number,col:number,sx=1,sy=1,sz=1){this.add(new THREE.SphereGeometry(r,16,12),col,x,y,z,new THREE.Euler(),new THREE.Vector3(sx,sy,sz));}
 tube(points:THREE.Vector3[],r:number,col:number){this.add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),points.length*5,r,8,false),col,0,0,0);}
 finish(group:THREE.Group){const g=mergeGeometries(this.parts,false);this.parts.forEach(p=>p.dispose());if(g){const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.84}));m.name='guard-rest-static-furniture';m.castShadow=true;m.receiveShadow=true;group.add(m);}}
}
function screen(group:THREE.Group,w:number,h:number,x:number,y:number,z:number,draw:(c:CanvasRenderingContext2D)=>void,ry=0){
 if(typeof document==='undefined')return;const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;draw(canvas.getContext('2d')!);
 const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide}));m.position.set(x,y,z);m.rotation.y=ry;group.add(m);
}
function chair(k:RestKit,x:number,z:number,ry=0){
 const piece=(w:number,h:number,d:number,dx:number,y:number,dz:number,col:number)=>k.box(w,h,d,x+Math.cos(ry)*dx+Math.sin(ry)*dz,y,z-Math.sin(ry)*dx+Math.cos(ry)*dz,col,.025,ry);
 piece(.46,.085,.48,0,.5,0,0x8d9980);piece(.46,.38,.06,0,.72,-.21,0x8d9980);
 for(const dx of [-.18,.18])for(const dz of [-.18,.18])piece(.034,.43,.034,dx,.25,dz,steel);
}
function couch(k:RestKit,x:number,z:number,ry:number,col:number){
 const b=(w:number,h:number,d:number,dx:number,y:number,dz:number,c:number,r=.06)=>k.box(w,h,d,x+Math.cos(ry)*dx+Math.sin(ry)*dz,y,z-Math.sin(ry)*dx+Math.cos(ry)*dz,c,r,ry);
 b(2.15,.26,.86,0,.28,0,col);b(2.02,.52,.19,0,.67,-.35,col,.085);
 for(const dx of [-.98,.98])b(.19,.46,.84,dx,.52,0,col,.075);
 for(const dx of [-.61,0,.61]){b(.58,.17,.65,dx,.46,.045,col,.09);b(.55,.39,.1,dx,.67,-.22,col,.065);b(.33,.009,.2,dx+.05,.55,.18,0x6d7463,.04);}
 for(const dx of [-.86,.86])for(const dz of [-.29,.29])b(.07,.12,.07,dx,.09,dz,0x4b594d,.012);
}
function bunk(k:RestKit,x:number,z:number){
 const frame=0xaeb3ac,bolt=0x717d75,sheet=0xe6e7df;
 // Four cylindrical posts with rounded head/foot top corners.
 for(const dz of [-1,1]){
  k.tube([
   new THREE.Vector3(x-.49,.1,z+dz),new THREE.Vector3(x-.49,1.95,z+dz),
   new THREE.Vector3(x-.43,2.075,z+dz),new THREE.Vector3(x+.43,2.075,z+dz),
   new THREE.Vector3(x+.49,1.95,z+dz),new THREE.Vector3(x+.49,.1,z+dz)
  ],.025,frame);
  for(const y of [.64,1.67,1.85])k.tube([new THREE.Vector3(x-.475,y,z+dz),new THREE.Vector3(x+.475,y,z+dz)],.018,frame);
  for(const dx of [-.475,.475])for(const y of [.45,1.42])k.cyl(.028,.016,x+dx,y,z+dz+.027,bolt,.028,new THREE.Euler(Math.PI/2,0,0));
 }
 for(const y of [.45,1.42]){
  for(const dx of [-.47,.47]){
   k.tube([new THREE.Vector3(x+dx,y,z-1),new THREE.Vector3(x+dx,y,z+1)],.025,frame);
   k.box(.04,.085,1.97,x+dx,y-.02,z,frame,.007);
  }
  for(let dz=-.85;dz<.96;dz+=.22)k.box(.91,.025,.047,x,y-.025,z+dz,0x8c978d,.004);
  k.box(.94,.075,1.96,x,y+.045,z,0xd4d8cc,.045);
  // Lightly rumpled white sheets sit above the thin mattress.
  const cloth=new THREE.PlaneGeometry(.94,1.94,18,28);cloth.rotateX(-Math.PI/2);
  const vertices=cloth.getAttribute('position');
  for(let i=0;i<vertices.count;i++){
   const px=vertices.getX(i),pz=vertices.getZ(i);
   vertices.setY(i,.0035*Math.sin(px*9+pz*4)+.002*Math.sin(pz*8)+.002*Math.cos(px*10));
  }
  cloth.computeVertexNormals();k.add(cloth,sheet,x,y+.096,z);
  k.sphere(.3,x,y+.103,z+.62,0xebece4,1.54,.075,.48);
  k.box(.69,.09,.38,x,y+.154,z-.7,0xebede4,.095);
  k.tube([
   new THREE.Vector3(x-.29,y+.192,z-.87),new THREE.Vector3(x,y+.202,z-.88),
   new THREE.Vector3(x+.29,y+.192,z-.87)
  ],.0025,0xc6cdbe);
 }
 // Upper safety rail has short downturned ends and welded supports.
 for(const side of [-1,1]){
  k.tube([
   new THREE.Vector3(x+side*.47,1.43,z-.88),new THREE.Vector3(x+side*.47,1.75,z-.82),
   new THREE.Vector3(x+side*.47,1.77,z+.62),new THREE.Vector3(x+side*.47,1.43,z+.68)
  ],.019,frame);
  for(const dz of [-.62,.35])k.tube([new THREE.Vector3(x+side*.47,1.44,z+dz),new THREE.Vector3(x+side*.47,1.77,z+dz)],.012,frame);
 }
 for(const dx of [.14,.44])k.tube([new THREE.Vector3(x+dx,.1,z+1.038),new THREE.Vector3(x+dx,1.71,z+1.038)],.017,frame);
 for(let y=.22;y<1.7;y+=.23){
  k.tube([new THREE.Vector3(x+.14,y,z+1.038),new THREE.Vector3(x+.44,y,z+1.038)],.016,frame);
  k.cyl(.018,.016,x+.44,y,z+1.061,bolt,.018,new THREE.Euler(Math.PI/2,0,0));
 }
}
function bedsideKit(k:RestKit,x:number,z:number){
 // Olive towel folds over the front rail without extending into the aisle.
 const towel=new THREE.PlaneGeometry(.64,.63,16,18);
 const p=towel.getAttribute('position');
 for(let i=0;i<p.count;i++)p.setZ(i,.014*Math.cos(p.getX(i)*30)+.012*Math.sin(p.getY(i)*15));
 towel.computeVertexNormals();k.add(towel,0x94a071,x-.08,1.44,z+.997);
 k.box(.65,.028,.065,x-.08,1.77,z+.988,0xaab28c,.015);
 // Red stool, camouflage kitbag and boots remain entirely inside the bed's footprint.
 k.cyl(.19,.035,x-.19,.39,z+.56,0xad4335,.2);
 for(let i=0;i<4;i++){const a=i*Math.PI/2;k.box(.052,.29,.055,x-.19+Math.sin(a)*.13,.23,z+.56+Math.cos(a)*.13,0xa74032,.018);}
 k.box(.39,.34,.24,x-.21,.25,z+.2,0x6e8658,.085);
 k.box(.31,.28,.052,x-.21,.27,z+.347,0x8b9c70,.035);
 for(let i=0;i<12;i++)k.box(.055,.032,.005,x-.34+(i%4)*.077,.17+Math.floor(i/4)*.07,z+.377,[0x586d4c,0xa5aa80,0x6c8059][i%3],.006);
 k.tube([new THREE.Vector3(x-.34,.42,z+.23),new THREE.Vector3(x-.21,.49,z+.23),new THREE.Vector3(x-.08,.42,z+.23)],.014,0x516641);
 for(const dx of [.17,.34]){
  k.box(.12,.15,.25,x+dx,.155,z-.05,0x414d40,.045);
  k.box(.108,.15,.12,x+dx,.267,z-.112,0x53624a,.025);
  for(let j=0;j<3;j++)k.box(.07,.008,.02,x+dx,.25+j*.023,z-.04,0x819072,.003);
 }
}
function toilet(k:RestKit,x:number,z:number){
 k.box(.37,.4,.3,x,.28,z-.2,0xe0e2d4,.11);k.sphere(.26,x,.47,z+.045,0xe7e7dc,.83,.65,1.05);
 k.sphere(.195,x,.505,z+.05,0xc0c8b6,.86,.2,1.02);
 k.sphere(.157,x,.525,z+.05,0x9eaf9a,.86,.12,1.08);
 k.box(.42,.57,.16,x,.75,z-.34,0xe0e3d7,.035);k.box(.44,.045,.18,x,1.052,z-.34,0xf0f0e5,.02);
 k.box(.1,.023,.04,x+.1,.98,z-.244,0x7e9183,.004);
 k.cyl(.028,.43,x,.25,z-.3,0x879b8b);
}
export function addGuardRestProps(group:THREE.Group):void{
 if(group.getObjectByName('guard-rest-props'))return;
 const g=new THREE.Group();g.name='guard-rest-props';group.add(g);const k=new RestKit();
 // Off-duty lounge grouped around a low, practical table.
 couch(k,17.1,-4.35,0,P.loungeFabric);couch(k,15.15,-2.3,Math.PI/2,P.loungeFabricDark);
 k.box(1.35,.08,.72,17.1,.43,-2.9,wood,.035);for(const x of [16.58,17.62])for(const z of [-3.13,-2.67])k.box(.055,.37,.055,x,.23,z,steel);
 k.box(.43,.022,.31,16.85,.49,-2.91,0xd0d2bf,.005);for(let i=0;i<4;i++)k.box(.29,.004,.007,16.85,.505,-2.98+i*.035,0x8b9780,.001);
 k.cyl(.07,.1,17.47,.52,-2.81,0xe2e0cf);k.cyl(.045,.006,17.47,.573,-2.81,0x8c8065);
 k.box(1.12,.7,.41,19.2,.4,-4.645,0x87947e,.025);for(const x of [18.84,19.2,19.56]){k.box(.31,.52,.035,x,.4,-4.415,0xacb6a0,.015);k.box(.14,.02,.03,x,.57,-4.389,steel,.004);}
 k.box(1.9,1.06,.095,19.2,1.92,-4.8025,0x38463e,.035);
 screen(g,1.77,.95,19.2,1.93,-4.748,c=>{
  c.fillStyle='#9eb0a2';c.fillRect(0,0,512,256);c.fillStyle='#cbd3bb';c.fillRect(0,0,512,132);
  c.fillStyle='#748d73';c.beginPath();c.moveTo(0,154);c.lineTo(98,76);c.lineTo(182,134);c.lineTo(265,55);c.lineTo(396,140);c.lineTo(512,88);c.lineTo(512,256);c.lineTo(0,256);c.fill();
  c.fillStyle='#3b5645';c.fillRect(0,205,512,51);c.fillStyle='#dae3cf';c.font='bold 21px sans-serif';c.fillText('CAMP CHANNEL  •  REST PERIOD',22,236);
 });
 // Compact dining area; its right edge stays clear of the x21..24 passage.
 k.box(2.7,.085,1.15,17.7,.79,8.3,0xc4c5b3,.04);
 for(const x of [16.57,18.83])for(const z of [7.87,8.73])k.box(.045,.72,.045,x,.4,z,steel,.01);
 for(const x of [16.9,18.5]){chair(k,x,7.35,0);chair(k,x,9.25,Math.PI);}
 for(const x of [17.05,18.4])k.cyl(.13,.024,x,.85,8.3,0xe0dfcf);
 k.box(.21,.19,.21,17.7,.9,8.3,0x809175,.02);for(let i=0;i<3;i++)k.box(.17,.012,.14,17.7,.995+i*.012,8.3,0xe9e5d5,.003);
 // Kitchenette is along the rear edge of the dining zone.
 k.box(4.8,.73,.58,17.5,.4,10.58,0xa9b39d,.035);k.box(4.95,.09,.6,17.5,.81,10.58,0xd6d8c8,.035);
 for(const x of [15.75,17.5,19.25]){k.box(1.56,.62,.03,x,.4,10.24,0xbec6b1,.018);k.box(.21,.025,.045,x,.56,10.216,steel,.004);}
 k.box(.77,.45,.4,15.6,1.08,10.5,0xbfc6b3,.025);k.box(.62,.31,.02,15.52,1.08,10.286,0x465d50,.015);
 k.box(.055,.22,.035,15.945,1.08,10.275,0x859783,.01);for(const y of [.97,1.08,1.18])k.cyl(.019,.02,15.994,y,10.273,0x657d67,.019,new THREE.Euler(Math.PI/2,0,0));
 k.cyl(.13,.29,17.08,1.01,10.5,0xd2d9c6);k.cyl(.1,.035,17.08,1.17,10.5,steel);
 k.add(new THREE.TorusGeometry(.105,.021,6,16,Math.PI*1.6),steel,17.2,1.03,10.5,new THREE.Euler(0,Math.PI/2,0));
 k.box(.34,.015,.3,17.08,.858,10.5,steel,.02);
 for(let i=0;i<5;i++)k.cyl(.135,.015,17.75,.87+i*.016,10.5,0xe0e2d1);
 k.box(.75,.04,.4,18.75,.88,10.5,0x7d9380,.03);k.box(.54,.02,.26,18.75,.902,10.5,0xb7c5b6,.045);
 k.tube([new THREE.Vector3(18.9,.91,10.71),new THREE.Vector3(18.9,1.14,10.71),new THREE.Vector3(18.9,1.16,10.55)],.018,0x7e9382);
 // Four reference-led silver-tube bunks flank a clear central entrance aisle.
 for(const x of [26.4,30.1]){
  bunk(k,x,2.15);
  const start=k.parts.length,z=9.73;
  bunk(k,x,z);
  if(x===26.4)bedsideKit(k,x,z);
  const pivot=new THREE.Matrix4().makeTranslation(x,0,z)
   .multiply(new THREE.Matrix4().makeRotationY(Math.PI))
   .multiply(new THREE.Matrix4().makeTranslation(-x,0,-z));
  for(let i=start;i<k.parts.length;i++)k.parts[i].applyMatrix4(pivot);
 }
 // Grey steel lockers face -X and sit flush against the eastern wall.
 for(const z of [2,3.15,4.3,5.45,6.6,7.75,8.9]){
  const x=32.555,back=32.85,front=32.26,open=z===7.75;
  if(!open)k.box(.59,1.83,.79,x,1.015,z,0x9da79e,.025);
  else{for(const dz of [-.365,.365])k.box(.59,1.83,.045,x,1.015,z+dz,0xa4afa0,.016);for(const y of [.12,1.91])k.box(.59,.045,.73,x,y,z,0xa4afa0,.015);k.box(.035,1.83,.73,32.831,1.015,z,0x879982,.014);}
  if(!open){
   k.box(.038,1.74,.7,front-.02,1.015,z,0xb9c0b5,.018);
   for(let i=0;i<4;i++)k.box(.018,.021,.4,front-.046,.37+i*.073,z,0x7b8c7d,.003);
   k.box(.045,.22,.025,front-.07,1.03,z+.24,0x697b6c,.006);
   k.box(.013,.085,.14,front-.045,1.58,z,0xc9bc76,.003);
  }else{
   // An open side-facing door swings toward the wall-parallel aisle.
   k.box(.05,1.7,.025,32.24,1.02,z-.36,0x7f9181,.014);
   k.box(.68,1.7,.035,31.92,1.02,z-.69,0xb7beb2,.02,Math.PI/3);
   k.box(.025,.085,.14,31.73,1.58,z-.8,0xc9bd79,.003,Math.PI/3);
   k.box(.025,1.55,.61,32.818,1.01,z,0x485d48,.015);
   for(const y of [.3,.67,1.1])k.box(.55,.037,.68,32.5,y,z,0xbac1b3,.011);
   k.tube([new THREE.Vector3(32.51,1.72,z-.28),new THREE.Vector3(32.51,1.72,z+.28)],.012,0x657e68);
   // Folded field clothing and a hanging digital-camouflage shirt.
   k.box(.34,.37,.09,32.46,1.45,z,0x809563,.035);
   for(let i=0;i<8;i++)k.box(.05,.045,.014,32.276,1.28+(i%4)*.08,z-.19+Math.floor(i/4)*.23,[0x6a8155,0x9fa77a,0x526b49][i%3],.005);
   for(const dz of [-.16,.16]){k.box(.21,.1,.1,32.45,1.58,z+dz,0x79905e,.022);k.box(.16,.12,.24,32.42,.42,z+dz,0x4d5b46,.026);}
   k.box(.35,.075,.4,32.49,.75,z,0x8f9f72,.018);
  }
  for(const zSign of [-1,1])k.box(.07,.13,.055,x,.105,z+zSign*.28,0x74866f,.01);
  void back;
 }
 // Toilet cubicles use low front cutaways. Partitions keep plumbing and sanitary fixtures legible.
 for(const x of [25.1,27.2,29.3]){
  toilet(k,x,-3.28);
  k.box(1.75,.12,.06,x,1.4,-1.75,0xa5b49b,.01);
  for(const dx of [-.9,.9])k.box(.055,1.45,.08,x+dx,.785,-1.75,0x7f977a,.009);
  k.box(1.63,.68,.045,x,.43,-1.75,0xbdc7b0,.02);k.box(.07,.025,.055,x+.55,.68,-1.71,0x6c8568,.006);
  k.cyl(.045,.23,x+.66,.73,-2.7,0xe0dfce,.045,new THREE.Euler(0,0,Math.PI/2));
 }
 for(const x of [26.13,28.23,30.33]){k.box(.085,1.42,2.1,x,.78,-2.82,0xa9b99d,.016);k.box(.095,.05,2.13,x,1.51,-2.82,0xd2d9c6,.009);}
 // Three basins and mirrors against the short far-right toilet wall; restrained service details.
 for(const z of [-3.5,-2.35,-1.2]){
  k.box(.54,.085,.7,32.545,.82,z,0xd8e0d0,.055);k.box(.44,.04,.52,32.535,.868,z,0xb1c3b0,.08);
  k.cyl(.025,.3,32.605,1.03,z-.2,0x8a9f8d);k.tube([new THREE.Vector3(32.605,1.16,z-.2),new THREE.Vector3(32.395,1.16,z-.2),new THREE.Vector3(32.395,1.06,z-.2)],.017,0x8a9f8d);
  k.tube([new THREE.Vector3(32.595,.77,z),new THREE.Vector3(32.595,.58,z),new THREE.Vector3(32.795,.58,z)],.025,0x8fa38e);
  k.box(.055,.75,.67,32.8375,1.53,z,0x7e9680,.025);k.box(.012,.65,.57,32.807,1.53,z,0xb9cfbf,.015);
  k.box(.12,.21,.17,32.80,1.07,z+.39,0xb3c3ac,.02);
 }
 // Lounge seams, TV bracket/cable and feet ground the furniture against the shell.
 for(const x of [16.48,17.1,17.72])k.tube([new THREE.Vector3(x,.78,-4.59),new THREE.Vector3(x,.71,-4.57),new THREE.Vector3(x,.58,-4.56)],.0025,0x53624b);
 k.box(.36,.31,.012,19.2,1.88,-4.861,0x5d7060,.02);
 k.tube([new THREE.Vector3(19.22,1.4,-4.858),new THREE.Vector3(19.3,1.01,-4.858),new THREE.Vector3(19.3,.73,-4.7)],.01,0x4f6351);
 for(const x of [18.8,19.6])for(const z of [-4.75,-4.45])k.box(.055,.13,.055,x,.095,z,0x657b61,.01);
 k.box(.15,.2,.028,18.8,1.12,10.84,0xc5cfb9,.014);for(const x of [18.766,18.825])k.box(.014,.045,.01,x,1.12,10.819,0x7c9274,.003);
 k.tube([new THREE.Vector3(17.08,.856,10.5),new THREE.Vector3(17.45,.86,10.69),new THREE.Vector3(18.3,.86,10.72),new THREE.Vector3(18.77,1.1,10.816)],.008,0x64795d);
 k.finish(g);
}




