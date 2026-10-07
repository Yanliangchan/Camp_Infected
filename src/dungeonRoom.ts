import {CAMP_PALETTE as P} from './render/campPalette';
import {addRoomSurfaces} from './render/roomSurfaces';
import * as THREE from 'three';
import type {AmbientFixture} from './render/atmosphere';
import {addPassOfficeProps} from './passOfficeProps';
import {addGuardRestProps} from './guardRestProps';
import {addSecurityScreeningProps} from './securityScreeningProps';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

function canvasTexture(draw:(c:CanvasRenderingContext2D)=>void,size=512){const canvas=document.createElement('canvas');canvas.width=canvas.height=size;draw(canvas.getContext('2d')!);const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=8;return map;}
function noise(seed:number){return()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};}
function surface(kind:'plaster'|'tile'|'concrete',base:string){
 const map=canvasTexture(c=>{const random=noise(93);c.fillStyle=base;c.fillRect(0,0,512,512);
  for(let i=0;i<24000;i++){c.fillStyle=i%2?'rgba(20,30,23,.045)':'rgba(250,247,224,.055)';c.fillRect(random()*512,random()*512,1+random()*2,1+random()*2);}
  if(kind==='tile')for(let x=0;x<512;x+=128)for(let y=0;y<512;y+=128){c.fillStyle='rgba(28,34,28,.4)';c.fillRect(x,y,512,2);c.fillRect(x,y,2,512);c.fillStyle='rgba(241,239,212,.13)';c.fillRect(x+3,y+3,122,1);}
  if(kind==='plaster')for(let i=0;i<70;i++){c.fillStyle='rgba(76,76,56,.06)';c.beginPath();c.ellipse(random()*512,random()*512,5+random()*24,2+random()*8,random()*6,0,Math.PI*2);c.fill();}
 });map.wrapS=map.wrapT=THREE.RepeatWrapping;return new THREE.MeshStandardMaterial({map,roughness:kind==='tile'?.77:.96});
}
export function buildDungeonRoom(scene:THREE.Scene):THREE.Group {
 const fixtures:AmbientFixture[]=[];
 const room=new THREE.Group();room.name='pass-office-dungeon-review';scene.add(room);
 const plaster=surface('plaster',P.plaster),paint=surface('plaster',P.lowerWall),concrete=surface('concrete',P.concrete),tiles=surface('tile','#9caaa1');
 const steel=new THREE.MeshStandardMaterial({color:0x4f5d55,metalness:.35,roughness:.68});
 const dark=new THREE.MeshStandardMaterial({color:0x303a34,roughness:.9});
 const trim=new THREE.MeshStandardMaterial({color:0x8c9386,roughness:.75});
 const box=(w:number,h:number,d:number,x:number,y:number,z:number,material:THREE.Material,ry=0)=>{const geometry=new THREE.BoxGeometry(w,h,d);const uv=geometry.getAttribute('uv');for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*Math.max(w,d)/2,uv.getY(i)*h/2);const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.rotation.y=ry;mesh.castShadow=true;mesh.receiveShadow=true;room.add(mesh);return mesh;};
 const cylinder=(radius:number,height:number,x:number,y:number,z:number,material:THREE.Material)=>{const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,height,16),material);mesh.position.set(x,y,z);mesh.castShadow=true;room.add(mesh);return mesh;};
 const sign=(text:string,sub:string,w:number,h:number,x:number,y:number,z:number,bg='#263c32',ry=0)=>{
  const map=canvasTexture(c=>{c.fillStyle=bg;c.fillRect(0,0,512,512);c.strokeStyle='#b5c0ad';c.lineWidth=5;c.strokeRect(12,12,488,488);c.fillStyle='#e9ead9';c.textAlign='center';c.font='bold 61px Arial';c.fillText(text,256,sub?244:280,465);if(sub){c.font='27px Arial';c.fillText(sub,256,342,465);}});
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map,roughness:.85,side:THREE.DoubleSide}));mesh.position.set(x,y,z);mesh.rotation.y=ry;room.add(mesh);
 };
 // Expanded 20 x 16 metre encounter room; furniture retains its original scale. The public counter stays separate
 // from the staff side, with one controlled onward opening at the rear.
 box(20.5,.48,16.5,3,-.22,3,dark);const floor=new THREE.Mesh(new THREE.PlaneGeometry(20,16),tiles);floor.rotation.x=-Math.PI/2;floor.position.set(3,.03,3);floor.receiveShadow=true;const uv=floor.geometry.getAttribute('uv');for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*10,uv.getY(i)*8);room.add(floor);
 const wall=(w:number,d:number,x:number,z:number,height=3.05)=>{box(w,1.12,d,x,.59,z,paint);box(w,height-1.12,d,x,1.12+(height-1.12)/2+.03,z,plaster);box(w+.03,.12,d+.03,x,.09,z,dark);box(w+.02,.045,d+.02,x,1.15,z,trim);box(w+.035,.12,d+.035,x,height+.03,z,concrete);};
 wall(10.4,.26,-1.8,-5);wall(7.7,.26,9.15,-5);wall(.26,16,-7,3);
 // Cutaway front/right walls retain the sense of enclosure without hiding actors.
 box(4,.48,.23,-5,.27,11,paint);box(12.4,.48,.23,6.8,.27,11,paint);
 // An adjoining guard rest wing doubles the floor area without enlarging furniture.
 box(20.5,.48,16.5,23,-.22,3,dark);
 const restFloor=new THREE.Mesh(new THREE.PlaneGeometry(20,16),tiles);restFloor.rotation.x=-Math.PI/2;restFloor.position.set(23,.03,3);restFloor.receiveShadow=true;
 const restUV=restFloor.geometry.getAttribute('uv');for(let i=0;i<restUV.count;i++)restUV.setXY(i,restUV.getX(i)*10,restUV.getY(i)*8);room.add(restFloor);
 wall(20,.26,23,-5);
 box(20,.48,.23,23,.27,11,paint);box(.23,.48,16,33,.27,3,paint);
 // The washroom retains enough wall to mount basins and mirrors; other foreground walls are cut away.
 wall(.26,6,33,-2,2.1);
 // Standard single doors, parked flat against their walls. No swing leaf crosses the route.
 box(.23,.7,4.4,13,.38,-2.8,paint);box(.23,.7,10.4,13,.38,5.8,paint);
 const doorway=(x:number,z:number,label:string)=>{
  for(const dz of [-.67,.67])box(.22,2.27,.12,x,1.165,z+dz,dark);
  box(.22,.13,1.46,x,2.32,z,dark);
  box(.07,2.12,1.19,x+.155,1.09,z-1.255,steel);
  box(.014,1.93,1.04,x+.198,1.09,z-1.255,paint);
  box(.04,.06,.15,x+.238,1.03,z-1.65,trim);
  for(const y of [.3,1.1,1.94])box(.035,.07,.035,x+.126,y,z-.665,trim);
  sign(label,'',1.22,.22,x-.116,2.33,z,'#263c32',-Math.PI/2);
 };
 doorway(13,0,'GUARD REST');
 // Separate toilet and bunk entrances. The bunk door opens onto the central aisle.
 box(.18,.72,4.4,24,.39,-2.8,paint);box(.18,.72,4.275,24,.39,2.7375,paint);box(.18,.72,4.875,24,.39,8.5625,paint);
 box(8.9,.72,.18,28.45,.39,1,paint);
 doorway(24,0,'TOILETS');doorway(24,5.5,'BUNKS');
 for(const x of [14,20.5,26.5,32.7]){box(.24,3.14,.29,x,1.6,-4.89,concrete);box(.34,.14,.36,x,.12,-4.89,dark);}
 for(const x of [15.4,28.6]){box(1.9,.88,.07,x,2.2,-4.79,dark);for(let i=0;i<5;i++)box(1.82,.045,.09,x,1.88+i*.15,-4.73,trim);}
 for(const y of [.28,2.77])box(19.6,.033,.04,23,y,-4.81,steel);
 for(const x of [-6.8,-1.6,3.6,6.8,12.8]){box(.31,3.18,.32,x,1.62,-4.89,concrete);box(.4,.18,.42,x,.13,-4.89,dark);}
 // Service louvres and weathered aluminium frames along the back wall.
 for(const x of [-5.1,-2.4,9.7]){
  box(2.08,1.05,.06,x,2,-4.82,dark);box(1.95,.91,.035,x,2,-4.775,new THREE.MeshStandardMaterial({color:0x7b9990,roughness:.4}));
  for(let i=0;i<6;i++){const blade=box(1.95,.045,.105,x,1.62+i*.15,-4.71,trim);blade.rotation.x=-.18;}
  for(const dx of [-1,0,1])box(.035,1.04,.08,x+dx,2,-4.67,steel);box(2.2,.08,.32,x,1.45,-4.76,concrete);
 }
 // Wall conduit, sockets, rain drain and a secured fuse box.
 for(const y of [.25,2.77])box(19.6,.033,.04,3,y,-4.82,steel);
 box(.04,2.6,.04,-6.33,1.5,-4.79,steel);box(.46,.66,.16,2.7,2.16,-4.74,steel);box(.032,.19,.03,2.86,2.16,-4.64,trim);
 sign('DANGER','ELECTRICAL',.28,.18,2.7,2.23,-4.647,'#847649');
 for(const x of [-5.6,-1.5,2.6]){box(.19,.13,.025,x,.42,-4.82,trim);for(const dx of [-.042,.042])box(.022,.035,.01,x+dx,.43,-4.8,dark);}
 box(.5,.015,15.8,12.62,.048,3,dark);for(let z=-4.8;z<10.9;z+=.13)box(.45,.022,.022,12.62,.06,z,steel);
 // Entry threshold and security turnstile define a public-to-controlled route.
 box(3.6,.055,.55,-1.2,.058,10.96,concrete);
 for(const x of [-3.03,.63])box(.18,2.5,.2,x,1.27,10.95,steel);
 sign('PASS OFFICE','VISITOR REGISTRATION',3.6,.42,-1.2,2.39,10.96);
 box(.43,.88,.95,2.1,.48,-.55,steel);box(.3,.2,.3,2.1,1.03,-.6,dark);
 const hub=cylinder(.076,.19,2.35,.94,-.55,steel);hub.rotation.z=Math.PI/2;
 const start=new THREE.Vector3(2.38,.94,-.55);
 for(const direction of [new THREE.Vector3(.67,0,0),new THREE.Vector3(.46,-.37,-.3),new THREE.Vector3(.46,-.37,.3)]){
  const arm=new THREE.Mesh(new THREE.CylinderGeometry(.023,.023,direction.length(),12),steel);
  arm.position.copy(start).addScaledVector(direction,.5);arm.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.clone().normalize());arm.castShadow=true;room.add(arm);
 }
 box(.16,.025,.23,2.1,1.15,-.6,new THREE.MeshStandardMaterial({color:0x87b79a,emissive:0x417257,emissiveIntensity:.3,roughness:.3}));
 box(.2,.68,.2,3.15,.39,-.55,steel);sign('ESCORT','REQUIRED',.57,.36,2.5,1.44,-.85,'#7d6c43');
 // The onward exit is a substantial steel door, not a decorative arch.
 box(1.95,2.56,.16,4.75,1.31,-4.88,steel);box(1.73,2.35,.035,4.75,1.31,-4.777,paint);
 for(const x of [3.68,5.82])box(.15,2.72,.26,x,1.39,-4.85,dark);box(2.3,.15,.27,4.75,2.77,-4.85,dark);
 box(.61,.42,.05,4.75,1.91,-4.733,dark);for(let i=0;i<5;i++)box(.013,.36,.035,4.5+i*.12,1.91,-4.69,steel);
 box(.055,.24,.075,5.38,1.18,-4.68,trim);for(const y of [.44,1.45,2.36])box(.05,.11,.12,3.9,y,-4.74,dark);
 sign('CONTROLLED AREA','AUTHORISED PERSONNEL',1.35,.33,4.75,1.04,-4.73);
 const red=new THREE.MeshStandardMaterial({color:0x9e4832,emissive:0xe55a35,emissiveIntensity:.8,roughness:.4});cylinder(.065,.15,5.92,2.3,-4.67,red);
 const alert=new THREE.PointLight(0xff633d,1.2,3.7,2);alert.position.set(5.92,2.35,-4.3);room.add(alert);fixtures.push({light:alert,material:red,baseIntensity:1.2,baseEmission:.8,kind:'beacon',phase:0});
 sign('EXIT →','',.64,.24,4.75,2.96,-4.8,'#2c664e');
 // Black/yellow threshold stripes, scuffs, drip stains and quiet outbreak traces.
 const hazard=canvasTexture(c=>{c.fillStyle='#a39358';c.fillRect(0,0,512,512);c.fillStyle='#303a32';for(let i=-512;i<1024;i+=100){c.beginPath();c.moveTo(i,0);c.lineTo(i+45,0);c.lineTo(i+557,512);c.lineTo(i+512,512);c.fill();}});
 const strip=new THREE.Mesh(new THREE.PlaneGeometry(2.1,.42),new THREE.MeshStandardMaterial({map:hazard,roughness:1}));strip.rotation.x=-Math.PI/2;strip.position.set(4.75,.047,-4.35);room.add(strip);
 const scuffMap=canvasTexture(c=>{const rand=noise(11);c.clearRect(0,0,512,512);for(let i=0;i<160;i++){c.strokeStyle=`rgba(29,40,32,${.03+rand()*.08})`;c.lineWidth=1+rand()*2;c.beginPath();const x=rand()*512,y=rand()*512;c.moveTo(x,y);c.lineTo(x+rand()*35,y+rand()*6);c.stroke();}});
 for(const [x,z,w,d]of [[-3,1,5,3],[2,-.5,3,3],[4.7,-3.7,2.4,1.5]]){const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshBasicMaterial({map:scuffMap,transparent:true,depthWrite:false}));mesh.rotation.x=-Math.PI/2;mesh.position.set(x,.051,z);room.add(mesh);}
 const dirt=canvasTexture(c=>{const grad=c.createLinearGradient(0,0,0,512);grad.addColorStop(0,'rgba(24,33,26,.42)');grad.addColorStop(.5,'rgba(24,33,26,.08)');grad.addColorStop(1,'rgba(24,33,26,0)');c.fillStyle=grad;c.fillRect(0,0,512,512);});
 const edge=new THREE.Mesh(new THREE.PlaneGeometry(20,.58),new THREE.MeshBasicMaterial({map:dirt,transparent:true,depthWrite:false}));edge.rotation.x=-Math.PI/2;edge.position.set(3,.055,-4.7);room.add(edge);
 const paperMaterial=new THREE.MeshStandardMaterial({color:0xc4c4ab,roughness:1});for(let i=0;i<8;i++){const paper=box(.19,.006,.27,1.1+Math.sin(i*2)*.68,.055,1.1+Math.cos(i)*.9,paperMaterial,i*.7);paper.castShadow=false;}
 // Practical fluorescent fittings supply a cool institutional light, contrasted
 // with a single amber security lamp at the blocked onward door.
 const tube=new THREE.MeshStandardMaterial({color:0xd5e2d7,emissive:0xd5e2d7,emissiveIntensity:1.2});
 for(const x of [-4.2,.2,9.5]){box(1.7,.12,.22,x,2.91,-4.76,steel);const bulb=tube.clone();box(1.5,.04,.14,x,2.84,-4.66,bulb);const light=new THREE.PointLight(0xd4e4d9,11,8,2);light.position.set(x,2.68,-2.7);room.add(light);if(x!==-4.2)fixtures.push({light,material:bulb,baseIntensity:11,baseEmission:1.2,kind:'fluorescent',phase:x===.2?0:5.7});}
 box(.4,.22,.23,-6.76,2.75,2.6,steel);box(.24,.08,.15,-6.73,2.66,2.6,tube);const light=new THREE.PointLight(0xedd7a6,5,6,2);light.position.set(-6.4,2.55,2.6);room.add(light);
 // The added floor stays open for squad movement. Small perimeter storage
 // clusters preserve the military detail without filling the combat lanes.
 for(const z of [4.1,8.7]){
  box(.8,.12,2.1,12.46,.56,z,steel);for(const dz of [-.85,.85])box(.09,.49,.08,12.46,.29,z+dz,dark);
  for(const dz of [-.5,.5]){box(.58,.39,.65,12.46,.81,z+dz,paint);box(.63,.055,.69,12.46,1.03,z+dz,trim);box(.16,.08,.022,12.16,.83,z+dz,steel);}
 }
 box(.055,3,.055,-6.81,1.6,8,steel);box(.42,.22,.23,-6.76,2.75,8,steel);box(.24,.08,.15,-6.73,2.66,8,tube);
 const entryLight=new THREE.PointLight(0xe0dbc4,7,10,2);entryLight.position.set(-4.8,2.55,7.6);room.add(entryLight);
 const combatFill=new THREE.PointLight(0xd4e4d9,10,13,2);combatFill.position.set(7.5,3.1,6.5);room.add(combatFill);
 addPassOfficeProps(room);
 addSecurityScreeningProps(room);
 addGuardRestProps(room);
 for(const [x,z]of [[17,-1],[18,6],[27,-2],[28,6]]){if(z<0){box(1.6,.12,.22,x,2.91,-4.76,steel);box(1.4,.04,.14,x,2.84,-4.66,tube);}const practical=new THREE.PointLight(0xd4e4d9,12,10,2);practical.position.set(x,2.66,z);room.add(practical);}
 // Static fixtures sharing a material render together; the extra close-up
 // detail need not become a separate draw call for every tile or conduit.
 const batches=new Map<string,THREE.Mesh[]>();
 for(const child of room.children){if(!(child instanceof THREE.Mesh)||Array.isArray(child.material)||child.material.transparent)continue;
  const key=child.material.uuid+':'+child.castShadow+':'+child.receiveShadow;
  const batch=batches.get(key)??[];batch.push(child);batches.set(key,batch);
 }
 for(const batch of batches.values()){if(batch.length<2)continue;
  const geometries=batch.map(mesh=>{mesh.updateMatrix();const geometry=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone();geometry.applyMatrix4(mesh.matrix);return geometry;});
  const merged=mergeGeometries(geometries,false);geometries.forEach(g=>g.dispose());if(!merged)continue;
  const mesh=new THREE.Mesh(merged,batch[0].material);mesh.castShadow=batch[0].castShadow;mesh.receiveShadow=batch[0].receiveShadow;room.add(mesh);batch.forEach(m=>m.removeFromParent());
 }
 // Optional art-review overlay makes the intended continuous circulation easy to inspect.
 const routes=new THREE.Group();routes.name='circulation-review';routes.visible=false;room.add(routes);room.userData.routePreview=routes;
 for(const path of [[[-.7,10.9],[-.7,7],[6,7],[6,0],[22.5,0],[22.5,5.5],[30.7,5.5]],[[22.5,0],[29,0]],[[22.5,5.5],[22.5,8]],[[6,0],[6,-2],[4.75,-2],[4.75,-4.25]]]){
  const geometry=new THREE.BufferGeometry().setFromPoints(path.map(([x,z])=>new THREE.Vector3(x,.075,z)));
  const line=new THREE.Line(geometry,new THREE.LineDashedMaterial({color:0xd7c08c,dashSize:.25,gapSize:.15,transparent:true,opacity:.8,depthWrite:false}));line.computeLineDistances();routes.add(line);
 }
 addRoomSurfaces(room);
 room.userData.ambientFixtures=fixtures;
 return room;
}
