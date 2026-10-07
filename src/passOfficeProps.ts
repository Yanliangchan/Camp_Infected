import {CAMP_PALETTE as P} from './render/campPalette';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const sourceGeometry=new Map<string,THREE.BufferGeometry>();
const propGeometry=new Map<string,THREE.BufferGeometry>();
const furnitureMaterial=new THREE.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.78});
const steel=0x63716a,lightSteel=0x9ca49b,laminate=0xdadbd0,trim=0x6f7d6c,paper=0xe9e6d8,navy=P.upholstery;
const shape=(key:string,create:()=>THREE.BufferGeometry)=>{let g=sourceGeometry.get(key);if(!g){g=create();sourceGeometry.set(key,g);}return g;};
class PropBuilder{
 private parts:THREE.BufferGeometry[]=[];
 offsetX=0;offsetZ=0;
 add(source:THREE.BufferGeometry,col:number,x:number,y:number,z:number,rot=new THREE.Euler()){
  const g=source.index?source.toNonIndexed():source.clone();g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x+this.offsetX,y,z+this.offsetZ),new THREE.Quaternion().setFromEuler(rot),new THREE.Vector3(1,1,1)));
  const c=new THREE.Color(col),p=g.getAttribute('position'),values=new Float32Array(p.count*3);
  for(let i=0;i<p.count;i++){const ao=.83+.17*Math.min(1,Math.max(0,p.getY(i)-.08)/.55);values[i*3]=c.r*ao;values[i*3+1]=c.g*ao;values[i*3+2]=c.b*ao;}
  for(const a of Object.keys(g.attributes))if(a!=='position'&&a!=='normal')g.deleteAttribute(a);
  g.setAttribute('color',new THREE.BufferAttribute(values,3));this.parts.push(g);
 }
 box(w:number,h:number,d:number,x:number,y:number,z:number,col:number,r=.02,rot=new THREE.Euler()){
  this.add(shape(['b',w,h,d,r].join(':'),()=>r?new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/3,h/3,d/3)):new THREE.BoxGeometry(w,h,d)),col,x,y,z,rot);
 }
 cyl(r:number,h:number,x:number,y:number,z:number,col:number,rotation=new THREE.Euler()){
  this.add(shape(['c',r,h].join(':'),()=>new THREE.CylinderGeometry(r,r,h,18)),col,x,y,z,rotation);
 }
 cable(points:THREE.Vector3[],radius:number,color:number){
  this.add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),Math.max(8,points.length*4),radius,6,false),color,0,0,0);
 }
 finish(group:THREE.Group,key:string){
  let g=propGeometry.get(key);if(!g){g=mergeGeometries(this.parts,false)||undefined;if(g)propGeometry.set(key,g);}this.parts.forEach(p=>p.dispose());
  if(g){const mesh=new THREE.Mesh(g,furnitureMaterial);mesh.name=key;mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);}
 }
}
function canvasTexture(w:number,h:number,draw:(ctx:CanvasRenderingContext2D)=>void){
 const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;draw(canvas.getContext('2d')!);
 const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;return tex;
}
function print(group:THREE.Group,w:number,h:number,x:number,y:number,z:number,draw:(ctx:CanvasRenderingContext2D)=>void,ry=0){
 if(typeof document==='undefined')return;
 const tex=canvasTexture(512,256,draw);
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide}));mesh.position.set(x,y,z);mesh.rotation.y=ry;group.add(mesh);
}
function officeChair(k:PropBuilder,x:number,z:number){
 k.cyl(.065,.32,x,.27,z,steel);k.cyl(.22,.05,x,.11,z,steel);
 for(let i=0;i<5;i++){const a=i*Math.PI*2/5;k.box(.04,.04,.4,x+Math.sin(a)*.15,.11,z+Math.cos(a)*.15,steel,.015,new THREE.Euler(0,a,0));k.cyl(.037,.08,x+Math.sin(a)*.3,.1,z+Math.cos(a)*.3,0x37433f,new THREE.Euler(Math.PI/2,0,0));}
 k.box(.56,.105,.55,x,.5,z,navy,.055);k.box(.5,.52,.105,x,.79,z-.22,navy,.065,new THREE.Euler(-.07,0,0));
 for(const sx of [-1,1]){k.box(.045,.24,.045,x+sx*.3,.64,z-.03,steel);k.box(.07,.045,.35,x+sx*.3,.77,z,0x41514e,.024);}
}
function monitor(k:PropBuilder,group:THREE.Group,x:number,z:number,y=1.05){
 k.box(.94,.57,.065,x,y+.39,z-.13,0x394741,.025);
 k.box(.065,.22,.075,x,y+.12,z-.13,steel);k.box(.42,.032,.25,x,y+.013,z-.08,steel);
 print(group,.85,.48,x,y+.39,z-.094,c=>{
  c.fillStyle='#233733';c.fillRect(0,0,512,256);c.fillStyle='#8aab91';c.fillRect(14,14,484,30);
  c.fillStyle='#1c302d';c.font='bold 17px sans-serif';c.fillText('PASS OFFICE  /  VISITOR REGISTER',26,35);
  c.fillStyle='#aec4ae';c.font='14px monospace';for(let i=0;i<6;i++){c.fillRect(18,60+i*28,474,1);c.fillText((104+i)+'  VISITOR RECORD   ESCORT REQUIRED',24,79+i*28);}
 });
 k.box(.71,.025,.24,x,y+.025,z+.28,0x77827a,.012);
 for(let row=0;row<3;row++)for(let col=0;col<11;col++)k.box(.045,.008,.045,x-.31+col*.057,y+.044,z+.21+row*.066,0xbfc4b6,.004);
 k.box(.14,.047,.19,x+.48,y+.035,z+.23,0x3b4d45,.03);
 k.cable([new THREE.Vector3(x+.47,y+.03,z+.12),new THREE.Vector3(x+.62,y+.02,z-.1),new THREE.Vector3(x+.53,y-.17,z-.3)],.008,0x34473e);
}
export function addPassOfficeProps(group:THREE.Group):void{
 if(group.getObjectByName('pass-office-props'))return;
 const props=new THREE.Group();props.name='pass-office-props';group.add(props);const k=new PropBuilder();
 // Public counter: institutional laminate, kickboard and service glazing with an actual open paper slot.
 k.box(4.94,.8,.69,-3,.55,-1.1,0xb6bfb0,.035);k.box(5,.09,.75,-3,1.05,-1.1,laminate,.045);
 k.box(4.98,.13,.72,-3,.19,-1.1,trim,.012);
 for(const x of [-4.62,-3,-1.38]){k.box(1.53,.69,.035,x,.57,-.737,0xd0d4c8,.015);k.box(.19,.026,.034,x,.8,-.708,steel,.004);}
 for(const x of [-5.45,-.55])k.box(.055,1.12,.06,x,1.66,-1.1,trim,.008);
 k.box(4.95,.055,.06,-3,2.22,-1.1,trim,.008);k.box(4.94,.035,.06,-3,1.36,-1.1,trim,.008);
 const glassMat=new THREE.MeshStandardMaterial({color:0xbacbc3,transparent:true,opacity:.3,roughness:.27,metalness:.05,side:THREE.DoubleSide,depthWrite:false});
 const glass=(w:number,h:number,x:number,y:number)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),glassMat);m.position.set(x,y,-1.1);props.add(m);};
 glass(4.84,.81,-3,1.79);
 glass(2.52,.24,-4.16,1.215);glass(1.3,.24,-1.24,1.215);
 for(const x of [-2.87,-2.06])k.box(.025,.25,.035,x,1.225,-1.1,trim,.004);
 k.box(.8,.022,.42,-2.47,1.11,-1.08,0x76867c,.014);
 // Counter tray, logbook, temporary passes and a grounded telephone.
 k.box(.56,.025,.37,-4.63,1.115,-1.1,0x7c897d,.012);
 for(let i=0;i<4;i++)k.box(.47,.007,.29,-4.63+i*.008,1.136+i*.009,-1.1,paper,.003);
 k.box(.67,.035,.45,-3.8,1.12,-1.14,0x5b6f56,.014);k.box(.6,.015,.4,-3.8,1.145,-1.14,paper,.008);
 for(let i=0;i<6;i++)k.box(.48,.008,.002,-3.8,1.158,-1.28+i*.045,0x849079,.001);
 k.box(.58,.09,.26,-1.13,1.145,-1.13,0x8c9686,.02);for(let i=0;i<3;i++){k.box(.18,.015,.13,-1.3+i*.16,1.2,-1.13,0xc5cbaa,.006);k.box(.04,.005,.018,-1.3+i*.16,1.211,-1.11,0x7b8c65,.001);}
 print(props,1.75,.25,-3,.63,-.71,c=>{c.fillStyle='#b7c2af';c.fillRect(0,0,512,256);c.fillStyle='#3e5645';c.font='bold 39px sans-serif';c.textAlign='center';c.fillText('VISITOR PASS OFFICE',256,150);});
 // Staff station set close to the rear wall so the public circulation remains clear.
 k.offsetZ=-.64;
 const staffPrints=new THREE.Group();staffPrints.position.z=-.64;props.add(staffPrints);
 k.box(2.7,.11,1.22,-4,.96,-3.6,laminate,.05);
 for(const x of [-5.15,-2.85])for(const z of [-4.06,-3.14])k.box(.065,.84,.065,x,.5,z,steel,.012);
 k.box(.84,.7,.98,-4.85,.51,-3.6,0xa3aea0,.025);
 for(const y of [.33,.58,.77]){k.box(.76,.13,.038,-4.85,y,-3.08,0xc3cbba,.008);k.box(.19,.025,.04,-4.85,y,-3.054,steel,.004);}
 monitor(k,staffPrints,-3.75,-3.62,1.03);officeChair(k,-4,-2.48);
 k.box(.38,.12,.27,-5.06,1.12,-3.45,0x55675b,.03);k.box(.4,.055,.11,-5.06,1.207,-3.4,0x35483d,.027);
 for(let i=0;i<3;i++)for(let j=0;j<3;j++)k.box(.037,.009,.03,-5.14+i*.065,1.19,-3.51+j*.037,0xbbc3aa,.004);
 k.cable([new THREE.Vector3(-5.26,1.21,-3.4),new THREE.Vector3(-5.34,1.1,-3.2),new THREE.Vector3(-5.19,1.05,-3.1),new THREE.Vector3(-5.12,1.17,-3.34)],.014,0x3f5043);
 for(let i=0;i<3;i++)k.box(.11,.35,.32,-2.86+i*.12,1.215,-3.78,[0x637860,0x9b9c83,0x747f6f][i],.005);
 k.box(.36,.13,.2,-3.05,1.13,-3.15,0x778571,.016);k.box(.26,.009,.08,-3.05,1.202,-3.12,paper,.002);
 k.offsetZ=0;
 // Filing cabinet has independent drawer fronts, card labels and broad pull handles.
 k.offsetZ=-.8;
 k.box(1.12,1.3,.72,-6,.73,-3.7,0x9aa794,.028);
 for(const y of [.34,.74,1.14]){k.box(1.04,.36,.045,-6,y,-3.315,0xb4c0aa,.018);k.box(.28,.028,.05,-6,y+.055,-3.279,steel,.008);k.box(.23,.074,.012,-6,y-.07,-3.279,paper,.003);}
 for(let i=0;i<4;i++)k.box(.09,.28,.31,-6.36+i*.15,1.515,-3.75,[0x7c8c6c,0xa19e7a,0x6b7b68,0xb9b693][i],.004);
 k.offsetZ=0;
 // Linked public seats use subdued plastic shells on a single institutional steel beam.
 k.box(3.62,.095,.11,-5,.48,2.5,steel,.025);
 for(const x of [-6.45,-3.55]){k.box(.075,.43,.075,x,.3,2.5,steel,.01);k.box(.49,.045,.59,x,.1,2.5,steel,.018);}
 for(const x of [-6.16,-5,-3.84]){
  k.box(.91,.12,.69,x,.58,2.5,navy,.085);k.box(.9,.61,.105,x,.88,2.19,navy,.075,new THREE.Euler(-.11,0,0));
  for(const dx of [-.29,0,.29])k.box(.014,.24,.02,x+dx,.94,2.248,0x6e8996,.004);
 }
 // Uniform storage is internal, well away from the visitor's direct path.
 k.offsetX=2.2;k.offsetZ=-1.2;
 k.box(1.03,1.94,.68,5.8,1.1,-3.3,0x8b9b83,.035);k.box(.93,1.83,.04,5.8,1.1,-2.94,0xb0bea3,.022);
 for(let i=0;i<5;i++)k.box(.62,.02,.025,5.8,1.79-i*.075,-2.91,0x61785d,.003);
 k.box(.052,.26,.069,6.12,1.13,-2.883,steel,.009);k.box(.2,.11,.017,5.8,1.56,-2.91,paper,.005);
 for(const x of [5.44,6.16])k.box(.074,.17,.07,x,.13,-3.3,steel,.01);
 k.offsetX=0;k.offsetZ=0;
 // Pedestal fan: wire rings, hub and visible curved blades.
 k.cyl(.31,.06,-6.14,.115,.25,0x7c8b7a);k.cyl(.03,1.23,-6.14,.75,.25,steel);k.box(.18,.12,.18,-6.14,1.36,.25,0x8b9b86,.03);
 for(const r of [.14,.27,.39])k.add(new THREE.TorusGeometry(r,.013,6,32),0x6a7e69,-6.14,1.76,.24);
 for(let i=0;i<10;i++){const a=i*Math.PI/5;k.box(.015,.78,.016,-6.14,1.76,.24,0x778d76,.004,new THREE.Euler(0,0,a));}
 const rotor=new THREE.Group();rotor.name='pedestal-fan-rotor';rotor.position.set(-6.14,1.76,.255);props.add(rotor);
 const bladeMaterial=new THREE.MeshStandardMaterial({color:0xb7c2a7,roughness:.8});
 for(let i=0;i<3;i++){const a=i*Math.PI*2/3;const blade=new THREE.Mesh(new THREE.BoxGeometry(.14,.27,.03),bladeMaterial);blade.position.set(Math.sin(a)*.14,Math.cos(a)*.14,0);blade.rotation.z=-a;rotor.add(blade);}
 k.cyl(.069,.065,-6.14,1.76,.3,0x8c9c83,new THREE.Euler(Math.PI/2,0,0));
 // Noticeboard and visitor instructions are original fictional paperwork.
 k.box(.13,1.32,2.2,-6.8,1.97,.35,0xa89b78,.035);
 // Flush mounting pads and a slim frame around the cork/paper surface.
 for(const z of [-.59,1.29])for(const y of [1.39,2.55])k.box(.02,.064,.07,-6.858,y,z,steel,.004);
 for(const y of [1.32,2.62])k.box(.023,.035,2.17,-6.721,y,.35,0x7f886f,.009);
 for(const z of [-.72,1.42])k.box(.023,1.32,.035,-6.721,1.97,z,0x7f886f,.009);
 print(props,2.07,1.19,-6.722,1.97,.35,c=>{
  c.fillStyle='#ae9c74';c.fillRect(0,0,512,256);c.fillStyle='#4b624a';c.font='bold 22px sans-serif';c.fillText('VISITOR INFORMATION',18,30);
  const tones=['#e9e5d1','#c7d1b7','#ded5b2'];for(let i=0;i<3;i++){const x=18+i*162;c.fillStyle=tones[i];c.fillRect(x,48,145,189);c.fillStyle='#61715b';c.font='bold 16px sans-serif';c.fillText(['CHECK IN','ESCORT','EMERGENCY'][i],x+9,74);for(let j=0;j<7;j++)c.fillRect(x+10,99+j*16,110-(j%3)*13,2);c.fillStyle='#876b53';c.beginPath();c.arc(x+72,52,3,0,Math.PI*2);c.fill();}
 },Math.PI/2);
 k.box(1.85,.62,.008,-4,2.22,-4.87,steel,.005);
 for(const x of [-4.86,-3.14])k.box(.025,.025,.01,x,2.22,-4.864,0xc2c9b8,.003);
 print(props,1.8,.57,-4,2.22,-4.865,c=>{c.fillStyle='#d4d9c9';c.fillRect(0,0,512,256);c.fillStyle='#4a6150';c.font='bold 32px sans-serif';c.textAlign='center';c.fillText('REPORT TO DUTY CLERK',256,110);c.font='23px sans-serif';c.fillText('Photo ID • Visitor Pass • Escort',256,166);});
 // Numbered key cabinet and duty equipment stay against service-side walls.
 k.box(1.13,1.18,.19,.4,1.75,-4.76,0x899883,.032);
 for(const x of [-.09,.89])for(const y of [1.23,2.27])k.box(.06,.05,.01,x,y,-4.862,steel,.005);
 k.box(1.04,1.08,.035,.4,1.75,-4.648,0xb8c1ad,.012);
 k.box(.035,1.08,.047,.88,1.75,-4.623,0x64795e,.006);
 for(let i=0;i<8;i++){
  const x=.06+(i%4)*.225,y=1.92-Math.floor(i/4)*.44;
  k.box(.045,.07,.052,x,y,-4.598,0x60745c,.005);
  k.add(new THREE.TorusGeometry(.043,.008,5,14),0xb9b99a,x,y-.08,-4.556);
  k.box(.023,.16,.02,x,y-.186,-4.554,0xbebfa5,.004);
  k.box(.047,.028,.02,x+.01,y-.25,-4.554,0xbebfa5,.004);
  k.box(.048,.075,.016,x-.034,y-.12,-4.54,i%2?0xbdad7f:0xbac6a6,.007);
 }
 print(props,.91,.16,.4,2.245,-4.619,c=>{
  c.fillStyle='#b8c1ad';c.fillRect(0,0,512,256);c.fillStyle='#526d54';c.font='bold 45px sans-serif';c.textAlign='center';c.fillText('DUTY KEYS',256,150);
 });
 for(let row=0;row<2;row++)print(props,.88,.095,.4,2.02-row*.44,-4.618,c=>{
  c.fillStyle='#b8c1ad';c.fillRect(0,0,512,256);c.fillStyle='#60705a';c.font='bold 60px monospace';c.textAlign='center';
  for(let col=0;col<4;col++)c.fillText(String(row*4+col+1).padStart(2,'0'),62+col*127,164);
 });
 // Desktop radio in its charging cradle, distinct from the visitor telephone.
 k.offsetZ=-.64;
 k.box(.18,.08,.19,-4.9,1.078,-3.4,0x62765f,.026);
 k.box(.118,.31,.085,-4.9,1.262,-3.415,0x374c3b,.022);
 k.box(.069,.058,.012,-4.9,1.302,-3.366,0x8da181,.006);
 for(let i=0;i<3;i++)k.box(.076,.01,.016,-4.9,1.23-i*.026,-3.364,0x829174,.003);
 k.cyl(.008,.23,-4.933,1.53,-3.417,0x40533f);
 k.cyl(.013,.018,-4.872,1.431,-3.414,0x748768);
 k.cable([new THREE.Vector3(-4.98,1.054,-3.43),new THREE.Vector3(-5.15,1.045,-3.55),new THREE.Vector3(-5.12,.89,-3.64)],.006,0x3d513e);
 k.offsetZ=0;
 // Discreet workstation cable run secured against the wall, above the skirting.
 k.cable([new THREE.Vector3(-4.5,.17,-4.856),new THREE.Vector3(-4.5,.65,-4.856),new THREE.Vector3(-4.62,.86,-4.72)],.009,0x788574);
 for(const y of [.23,.43,.63])k.box(.028,.018,.014,-4.5,y,-4.854,lightSteel,.003);
 // Wall first-aid cabinet faces inward along +X; no medical equipment blocks the public lane.
 k.box(.17,.44,.43,-6.78,1.2,1.1,0xd0d8c4,.025);
 for(const z of [.94,1.26])k.box(.009,.055,.04,-6.864,1.2,z,steel,.003);
 k.box(.025,.4,.39,-6.684,1.2,1.1,0xe8ecdb,.017);
 k.box(.012,.205,.059,-6.665,1.2,1.1,0x668461,.008);
 k.box(.013,.061,.205,-6.664,1.2,1.1,0x668461,.008);
 k.box(.02,.09,.03,-6.655,1.2,1.258,0x8b9d7e,.006);
 // Fire extinguisher: a proper cylinder, foot ring, valve, handle and descending rubber hose.
 k.cyl(.1,.5,-6.45,.37,1.2,0xac5142);
 k.cyl(.104,.037,-6.45,.115,1.2,0x76463d);
 k.cyl(.07,.055,-6.45,.646,1.2,0xa95444);
 k.cyl(.03,.08,-6.45,.708,1.2,0x838d78);
 k.box(.18,.023,.055,-6.425,.76,1.2,0x4e6051,.008);
 k.box(.018,.056,.047,-6.5,.742,1.2,0x4e6051,.006);
 k.box(.097,.14,.016,-6.45,.42,1.302,0xe1d8b9,.007);
 k.box(.071,.015,.019,-6.45,.442,1.314,0x7c8c69,.003);
 k.cable([new THREE.Vector3(-6.42,.728,1.19),new THREE.Vector3(-6.28,.61,1.19),new THREE.Vector3(-6.285,.26,1.19)],.015,0x344939);
 k.finish(props,'pass-office-furniture-batch');
}

