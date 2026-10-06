import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import {createHelmetGoggles} from './goggles';
import {createSecurityArmband} from './securityArmband';
import {createHeadSurface,createInfectedMouth} from './faceSurface';
import {createFittedChinStrap} from './chinStrap';
import {addFieldWebbing} from './fieldWebbing';

// Original SAF character recipes. +Z is forward; the origin is between the soles.
const geometryCache = new Map<string, THREE.BufferGeometry>();
const texturePixels = new Uint8Array(128 * 128 * 4);
const camoPalette = [0xa5a27a, 0x87986e, 0x657e58, 0x4e654b, 0x99a87b];
function noise(x:number,y:number) { let n=Math.imul(x+197,73856093)^Math.imul(y+61,19349663); n=Math.imul(n^(n>>>13),1274126177);return (n>>>0)/4294967296; }
for(let y=0;y<128;y++)for(let x=0;x<128;x++) {
  const broad=noise(Math.floor(x/12),Math.floor(y/10));
  const fine=noise(Math.floor(x/4),Math.floor(y/4));
  const colour=y>121?0xffffff:camoPalette[Math.min(4,Math.floor((broad*.82+fine*.18)*5))];
  const i=(y*128+x)*4;texturePixels[i]=colour>>16;texturePixels[i+1]=(colour>>8)&255;texturePixels[i+2]=colour&255;texturePixels[i+3]=255;
}
const atlas=new THREE.DataTexture(texturePixels,128,128);atlas.colorSpace=THREE.SRGBColorSpace;atlas.wrapS=THREE.RepeatWrapping;atlas.magFilter=THREE.NearestFilter;atlas.minFilter=THREE.NearestFilter;atlas.needsUpdate=true;
const matte=new THREE.MeshStandardMaterial({map:atlas,vertexColors:true,roughness:.82,metalness:0});
const eyeFinish=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.25,metalness:0});
// The supplied fabric photograph is used locally as the exact camouflage reference.
// The white strip preserves vertex-coloured skin and hardware on the shared material.
const suppliedFabric = Object.values(import.meta.glob('/public/reference-textures/saf-digital-fabric.png', { eager: true, query: '?url', import: 'default' }))[0] as string | undefined;
if(typeof document!=='undefined' && suppliedFabric){
  const image=new Image();image.onload=()=>{const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=1024;const ctx=canvas.getContext('2d')!;ctx.fillStyle='#fff';ctx.fillRect(0,0,1024,1024);ctx.drawImage(image,0,0,1024,936);const map=new THREE.CanvasTexture(canvas);map.flipY=false;map.colorSpace=THREE.SRGBColorSpace;map.magFilter=THREE.LinearFilter;map.minFilter=THREE.LinearMipmapLinearFilter;map.anisotropy=8;matte.map=map;matte.needsUpdate=true;};image.src=suppliedFabric;
}
type V=[number,number,number];
class Recipe {
  pieces:THREE.BufferGeometry[]=[];
  add(geo:THREE.BufferGeometry,colour:number,p:V=[0,0,0],s:V=[1,1,1],r:V=[0,0,0],camouflage=false) {
    const g=geo.index?geo.toNonIndexed():geo.clone();geo.dispose();
    const uv=g.getAttribute('uv');
    if(uv&&!camouflage)for(let i=0;i<uv.count;i++)uv.setXY(i,.5,.98);
    else if(!uv)g.setAttribute('uv',new THREE.Float32BufferAttribute(Array.from({length:g.getAttribute('position').count*2},(_,i)=>i%2?.98:.5),2));
    const matrix=new THREE.Matrix4().compose(new THREE.Vector3(...p),new THREE.Quaternion().setFromEuler(new THREE.Euler(...r)),new THREE.Vector3(...s));g.applyMatrix4(matrix);
    // Project fabric at a consistent physical scale; spherical UVs stretched the
    // pixels into rings around the helmet and gave every pouch a different scale.
    if(uv&&camouflage){const positions=g.getAttribute('position'),normals=g.getAttribute('normal');
      for(let i=0;i<uv.count;i++){
        const x=positions.getX(i)-p[0],y=positions.getY(i)-p[1],z=positions.getZ(i)-p[2];
        const nx=Math.abs(normals.getX(i)),ny=Math.abs(normals.getY(i)),nz=Math.abs(normals.getZ(i));
        const a=ny>nx&&ny>nz?x:nx>nz?z:x,b=ny>nx&&ny>nz?z:y;
        uv.setXY(i,.5+a/.8,(.5+b/.8)*.91);
      }
    }
    const c=new THREE.Color(colour);const colors=new Float32Array(g.getAttribute('position').count*3);
    for(let i=0;i<colors.length;i+=3){colors[i]=c.r;colors[i+1]=c.g;colors[i+2]=c.b;}
    g.setAttribute('color',new THREE.BufferAttribute(colors,3));this.pieces.push(g);return this;
  }
  ellipsoid(p:V,s:V,c:number){return this.add(new THREE.SphereGeometry(1,24,16),c,p,s);}
  round(p:V,s:V,c:number,r:V=[0,0,0],camo=false){return this.add(new THREE.CapsuleGeometry(.5,1,6,16),c,p,[s[0]*2,s[1]/2,s[2]*2],r,camo);}
  box(p:V,s:V,c:number,r:V=[0,0,0]){return this.add(new RoundedBoxGeometry(...s,2,Math.min(.008,Math.min(...s)/4)),c,p,[1,1,1],r);}
  rod(a:V,b:V,r:number,c:number){const aa=new THREE.Vector3(...a),bb=new THREE.Vector3(...b),d=bb.clone().sub(aa);const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize());const e=new THREE.Euler().setFromQuaternion(q);return this.add(new THREE.CylinderGeometry(r,r,d.length(),8),c,aa.add(bb).multiplyScalar(.5).toArray() as V,[1,1,1],[e.x,e.y,e.z]);}
  mesh(key:string){let g=geometryCache.get(key);if(!g){g=mergeGeometries(this.pieces,false)!;g.computeBoundingSphere();geometryCache.set(key,g);}this.pieces.forEach(p=>p.dispose());const m=new THREE.Mesh(g,matte);m.castShadow=true;m.receiveShadow=true;return m;}
}
type Look={infected:boolean;cook:boolean;medic:boolean;gate:boolean;officer:boolean;store:boolean;maintenance:boolean;runner:boolean;big:boolean;skin:number;hair:number;seed:number;role:string};
function look(kind:string,role:string):Look {
  const r=role.toLowerCase();let hash=11;for(const ch of r)hash=(hash*31+ch.charCodeAt(0))>>>0;
  const infected=['infected','zombie','boss'].includes(kind);
  return {infected,cook:/cook|aunt|uncle/.test(r),medic:/medic|sean/.test(r),gate:/gate|guard|security trooper/.test(r),officer:/officer|izzac|cdf/.test(r),store:/store/.test(r),maintenance:/ashwin|maintenance/.test(r),runner:/runner/.test(r),big:/big e/.test(r),skin:infected?0xafb68c:kind==='player'||kind==='soldier'?0xd9ad84:[0xe6b489,0xc28c64,0xd5a47f,0x9c6e50][hash%4],hair:/aunt|uncle/.test(r)?0x565357:0x262831,seed:hash,role:r};
}
function headRecipe(l:Look):Recipe {
  const b=new Recipe();const skin=l.skin;
  // One continuous surface avoids the seam and recessed-looking mouth created
  // by intersecting a separate jaw sphere with the skull.
  b.add(createHeadSurface(),skin);
  for(const side of [-1,1]) {
    b.ellipsoid([side*.287,-.015,-.005],[.034,.061,.047],skin);
    b.ellipsoid([side*.305,-.015,.019],[.011,.033,.024],l.infected?0x969d76:0xc58d75);
    b.round([side*.092,.058,.246],[.032,.006,.004],l.hair,[0,0,side*(l.infected?.25:.04)]);
  }
  b.ellipsoid([0,-.035,.251],[.02,.03,.022],skin);
  if(!l.infected) {
    const lipPoints=[[-.034,-.12,.241],[-.017,-.121,.244],[0,-.122,.245],[.017,-.121,.244],[.034,-.12,.241]].map(p=>new THREE.Vector3(...p));
    b.add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(lipPoints),20,.0023,6,false),0x9b715c);
  }
  // Sculpted scalp, hairline and small overlapping locks remain visible below headgear.
  const helmeted=!(l.cook||l.officer||l.runner||l.medic||l.maintenance||l.store);
  b.add(new THREE.SphereGeometry(helmeted?.265:.296,24,12,0,Math.PI*2,0,Math.PI*.47),l.hair,[0,.026,-.016],[1,1,.97]);
  if(l.cook||l.officer||l.runner||l.medic||l.maintenance||l.store)for(let i=0;i<6;i++)b.ellipsoid([-.225+i*.082,.152+Math.sin(i)*.018,.152],[.052,.057,.027],l.hair);
  for(const side of [-1,1])b.ellipsoid([side*.25,.048,-.015],[.037,.11,.059],l.hair);
  if(l.cook) {
    // Hairnet follows the scalp, rather than a chef's hat. Fine seams imply mesh.
    b.add(new THREE.SphereGeometry(.308,24,12,0,Math.PI*2,0,Math.PI*.49),0x68676a,[0,.029,-.018],[1,1,.98]);
    for(const side of [-1,1])b.rod([side*.2,.25,-.14],[side*.25,.13,.1],.004,0x969293);
    if(l.role.includes('aunt'))b.ellipsoid([0,.08,-.29],[.1,.08,.065],l.hair);
  } else if(l.officer||l.runner) {
    b.add(new THREE.CylinderGeometry(.256,.27,.085,24),0xffffff,[0,.234,-.005],[1,1,.94],[0,0,0],true);
    b.ellipsoid([0,.194,.203],[.214,.016,.124],0x677e58);
    b.box([0,.231,.258],[.048,.029,.007],0xb7ba85);
  } else if(!l.medic&&!l.maintenance&&!l.store) {
    b.add(new THREE.SphereGeometry(.304,32,18,0,Math.PI*2,0,Math.PI*.54),0xffffff,[0,.142,-.018],[1,.74,.98],[0,0,0],true);
    b.add(new THREE.TorusGeometry(.302,.008,8,40),0x54624b,[0,.114,-.018],[1,1,.97],[Math.PI/2,0,0]);
  }
  if(l.medic||l.role.includes('aunt')) {
    for(const side of [-1,1])b.add(new THREE.TorusGeometry(.059,.005,5,20),0x5c625f,[side*.102,.004,.258],[1,.8,.6],[0,side*.15,0]);
    b.rod([-.045,.009,.269],[.045,.009,.269],.004,0x5c625f);
    for(const side of [-1,1])b.rod([side*.163,.02,.235],[side*.283,.025,.022],.004,0x5c625f);
  }
  return b;
}
function torsoRecipe(l:Look):Recipe {
  const b=new Recipe();const fabric=l.cook?0xe2e4df:l.runner?0x733f35:0xffffff;
  const profile=[[0,0],[.135,.015],[.185,.065],[.204,.16],[.19,.265],[.156,.36],[.105,.395],[0,.415]].map(([x,y])=>new THREE.Vector2(x,y));
  b.add(new THREE.LatheGeometry(profile,32),fabric,[0,.29,0],[1,1,.8],[0,0,0],!l.cook&&!l.runner);
  b.round([0,.694,0],[.079,.09,.066],l.skin);
  b.round([0,.31,0],[.174,.09,.138],l.cook?0x3d4148:0xffffff,[0,0,0],!l.cook);
  for(const side of [-1,1]){b.rod([side*.11,.648,.092],[side*.044,.616,.15],.009,0x859576);b.box([side*.057,.632,.131],[.09,.049,.012],0x879775,[0,0,side*.38]);}
  for(const side of [-1,1]) {
    b.box([side*.092,.573,.135],[.112,.086,.024],l.cook?0xcbd0ce:0x768562);
    b.box([side*.092,.611,.152],[.112,.015,.012],l.cook?0xbac1bf:0x576a4b);
    b.box([side*.09,.656,.12],[.092,.019,.01],0xb5ba8d);
    b.box([side*.146,.676,.054],[.07,.02,.035],0x657b55,[0,0,side*.48]);
  }
  for(let i=0;i<3;i++)b.ellipsoid([0,.56+i*.04,.153],[.006,.006,.004],0x56634a);
  if(l.cook) {
    b.add(new THREE.PlaneGeometry(.29,.34),0xf4f0df,[0,.488,.172]);
    b.box([0,.447,.18],[.172,.088,.01],0xe2dac5);b.rod([-.1,.672,.128],[-.147,.381,.17],.014,0xf4f0df);b.rod([.1,.672,.128],[.147,.381,.17],.014,0xf4f0df);
  } else {
    addFieldWebbing(b);
  }
  if(l.medic) {
    b.round([-.17,.39,-.12],[.115,.2,.06],0xc6c6a7);
    b.box([-.17,.41,-.187],[.075,.021,.007],0xa45041);b.box([-.17,.41,-.19],[.021,.075,.007],0xa45041);
    b.rod([-.05,.66,.19],[.084,.56,.18],.007,0x495853);
  }
  if(l.store) {b.round([0,.48,-.25],[.181,.3,.108],0x9b8965);b.box([0,.46,-.36],[.25,.023,.01],0x746844);}
  if(l.maintenance){b.box([.17,.4,.15],[.063,.12,.042],0x4b5454);b.rod([.17,.44,.18],[.17,.58,.18],.012,0xb4bcb9);}
  if(l.role.includes('muffin')){b.ellipsoid([.16,.375,.232],[.058,.047,.043],0xba8951);b.ellipsoid([.16,.413,.23],[.063,.034,.047],0xd6a66a);}
  if(l.officer)b.box([0,.613,.195],[.037,.013,.006],0xc2b87c);
  return b;
}
function thighRecipe(l:Look):Recipe{
  const b=new Recipe();b.round([0,-.073,0],[.074,.177,.075],l.cook?0x444750:0xffffff,[0,0,0],!l.cook);
  if(!l.cook){b.box([.066,-.087,.016],[.018,.062,.068],0x7b8c68);b.box([.078,-.064,.016],[.008,.015,.066],0x5b7256);}return b;
}
function legRecipe(l:Look):Recipe {
  const b=new Recipe();b.round([0,-.026,0],[.066,.12,.07],l.cook?0x444750:0xffffff,[0,0,0],!l.cook);
  b.round([0,-.068,.008],[.075,.095,.079],0x343e35);
  b.ellipsoid([0,-.113,.047],[.087,.059,.131],0x343b35);
  b.ellipsoid([0,-.153,.049],[.089,.021,.135],0x202c27);
  for(let i=0;i<5;i++)b.rod([-.026,-.062-i*.013,.077], [.026,-.067-i*.013,.087],.0035,0x777f70);
  b.box([0,-.077,-.071],[.033,.018,.012],0x56624e);return b;
}
function upperArm(l:Look):Recipe {
  const b=new Recipe();b.round([0,-.094,0],[.071,.226,.073],l.cook?0xd5dad7:0xffffff,[0,0,0],!l.cook);
  b.round([0,-.178,0],[.065,.037,.066],l.cook?0x414749:0xffffff,[0,0,0],!l.cook);
  b.box([-.071,-.055,0],[.005,.041,.031],0x7c906f);return b;
}
function lowerArm(l:Look):Recipe {
  const b=new Recipe();b.round([0,-.071,0],[.055,.15,.057],l.cook?l.skin:0xffffff,[0,0,0],!l.cook);
  // A covered joint shares the actual elbow pivot. Its overlap stays closed under IK and animation.
  b.add(new THREE.SphereGeometry(1,24,16),l.cook?l.skin:0xffffff,[0,0,0],[.058,.055,.059],[0,0,0],!l.cook);
  b.round([0,-.14,0],[.055,.028,.056],l.cook?0xdddcd3:0x617557);
  const hand=l.cook?0x80b1c5:l.skin;
  b.ellipsoid([0,-.188,.009],[.043,.048,.034],hand);
  b.ellipsoid([-.03,-.175,.028],[.017,.024,.017],hand);
  for(let i=0;i<3;i++)b.rod([-.022+i*.018,-.206,.036],[-.022+i*.018,-.184,.038],.0025,l.infected?0x839071:0xb48a69);
  return b;
}
export function createCharacter(kind:string,role='cadet'):THREE.Group {
  const l=look(kind,role),key=kind+':'+role;const root=new THREE.Group();root.name=role;
  const body=new THREE.Group();root.add(body);
  body.add(torsoRecipe(l).mesh(key+':torso'));
  if(typeof document!=='undefined'&&!l.cook){
    for(const [text,x]of [['SINGAPORE',-.09],['CAMP',.09]] as const){
      const canvas=document.createElement('canvas');canvas.width=256;canvas.height=48;
      const context=canvas.getContext('2d')!;context.fillStyle='#aaa780';context.fillRect(0,0,256,48);
      context.fillStyle='#28392b';context.font='bold 29px Arial';context.textAlign='center';context.textBaseline='middle';context.fillText(text,128,25);
      const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
      const tape=new THREE.Mesh(new THREE.PlaneGeometry(.092,.018),new THREE.MeshStandardMaterial({map:texture,roughness:.95}));tape.position.set(x,.656,.126);body.add(tape);
    }
  }
  const head=new THREE.Group();head.position.y=.973;body.add(head);head.add(headRecipe(l).mesh(key+':head'));
  if(l.infected&&typeof document!=='undefined')head.add(createInfectedMouth());
  if(!(l.cook||l.officer||l.runner||l.medic||l.maintenance||l.store)){head.add(createHelmetGoggles());head.add(createFittedChinStrap());}
  const eyes=new Recipe();for(const side of [-1,1]){eyes.ellipsoid([side*.092,0,0],[.021,.026,.009],l.infected?0x6b5145:0x29342d);eyes.ellipsoid([side*.092+.005,.009,.008],[.004,.005,.002],l.infected?0xe9cd92:0xfffbef);}
  const eyeGroup=new THREE.Group();eyeGroup.position.set(0,-.005,.251);const eyeMesh=eyes.mesh(key+':eyes');eyeMesh.material=eyeFinish;eyeGroup.add(eyeMesh);head.add(eyeGroup);
  const legs:THREE.Group[]=[],knees:THREE.Group[]=[],arms:THREE.Group[]=[],elbows:THREE.Group[]=[];
  for(const side of [-1,1]){
    const leg=new THREE.Group();leg.position.set(side*.091,.331,0);leg.add(thighRecipe(l).mesh(key+':thigh'));body.add(leg);legs.push(leg);
    const knee=new THREE.Group();knee.position.y=-.155;knee.add(legRecipe(l).mesh(key+':leg'));leg.add(knee);knees.push(knee);
    const arm=new THREE.Group();arm.position.set(side*.209,.672,0);arm.add(upperArm(l).mesh(key+':upper'));body.add(arm);
    if(l.gate&&side===-1&&typeof document!=='undefined')arm.add(createSecurityArmband());
    const elbow=new THREE.Group();elbow.position.y=-.205;elbow.add(lowerArm(l).mesh(key+':lower'));arm.add(elbow);arms.push(arm);elbows.push(elbow);
  }
  root.userData={body,head,eyes:eyeGroup,legs,knees,arms,elbows,infected:l.infected,role:l.role,boss:kind==='boss',lastTime:0,blend:0,armed:false};
  if(kind==='player'||kind==='soldier')setCharacterWeapon(root,'SAR 21');
  if(kind==='boss'){const scale=l.big?1.55:l.gate?1.15:l.role.includes('cdf')?1.25:1.08;root.scale.setScalar(scale);if(l.big)body.scale.x=1.25;}
  animateCharacter(root,false,0);return root;
}
function weaponRecipe(name:string):Recipe {
  const b=new Recipe(),dark=0x303833,poly=0x465045;
  if(name==='Pistol'){
    b.box([0,.025,.09],[.064,.058,.199],dark);b.round([0,-.055,.015],[.032,.12,.034],poly,[-.18,0,0]);b.box([0,.055,.005],[.04,.01,.02],0x89988c);b.box([0,.008,-.016],[.025,.034,.023],dark);b.add(new THREE.TorusGeometry(.03,.005,6,14),dark,[0,-.029,.081],[1,1,.7],[0,Math.PI/2,0]);
  } else if(name==='SAF LMG') {
    b.round([0,0,-.063],[.055,.36,.055],dark,[Math.PI/2,0,0]);b.box([0,-.018,-.287],[.066,.112,.192],poly);b.rod([0,.017,.08],[0,.017,.556],.012,dark);
    b.add(new THREE.CylinderGeometry(.084,.084,.075,20),dark,[0,-.122,-.007],[1,1,1],[0,0,Math.PI/2]);
    b.round([0,-.073,.155],[.026,.112,.031],poly);b.round([0,-.075,-.116],[.024,.108,.031],poly);
    b.rod([0,.11,-.05],[0,.11,.09],.013,dark);for(const s of [-1,1])b.rod([s*.027,.014,.36],[s*.063,-.15,.39],.008,dark);
  } else {
    // Compact bullpup: stock and magazine behind the pistol grip, integrated optic above.
    b.ellipsoid([0,0,-.117],[.053,.069,.163],poly);b.box([0,0,-.267],[.075,.123,.018],dark);
    b.box([0,.03,-.081],[.071,.058,.225],0x515b4d);b.box([-.055,.005,-.12],[.008,.069,.114],0x68715e);
    b.round([0,.002,.105],[.044,.256,.048],poly,[Math.PI/2,0,0]);b.rod([0,.011,.195],[0,.011,.408],.011,dark);
    b.add(new THREE.CylinderGeometry(.016,.017,.019,16),dark,[0,.011,.399],[1,1,1],[Math.PI/2,0,0]);
    b.add(new THREE.CircleGeometry(.007,12),0x151d19,[0,.011,.409]);
    b.box([0,-.105,-.124],[.047,.14,.06],0x667258);for(let i=0;i<4;i++)b.box([.024,-.066-i*.024,-.12],[.003,.006,.041],0x455340);
    b.round([0,-.072,.034],[.023,.105,.026],dark,[-.13,0,0]);
    b.box([-.042,.019,.1],[.005,.034,.094],0x64715b);b.ellipsoid([-.047,.04,-.047],[.011,.014,.017],dark);
    b.add(new THREE.TorusGeometry(.041,.007,7,18),dark,[0,-.054,.082],[1,1,.7],[0,Math.PI/2,0]);
    b.rod([0,.033,-.118],[0,.115,-.098],.012,dark);b.rod([0,.031,.094],[0,.115,.068],.012,dark);
    const sharpshooter=name==='SAR 21 Sharpshooter';b.add(new THREE.CylinderGeometry(sharpshooter?.035:.027,sharpshooter?.035:.027,sharpshooter?.2:.17,18),dark,[0,.118,-.018],[1,1,1],[Math.PI/2,0,0]);
    b.add(new THREE.CircleGeometry(sharpshooter?.028:.02,18),0x92b5a8,[0,.118,sharpshooter?.084:.068]);
  }
  return b;
}
export function setCharacterWeapon(group:THREE.Group,name:string):void {
  const body=group.userData.body as THREE.Group;if(!body)return;
  const safe=['SAR 21','SAR 21 Sharpshooter','SAF LMG','Pistol'].includes(name)?name:'SAR 21';if(group.userData.weaponName===safe)return;
  (group.userData.weapon as THREE.Object3D|undefined)?.removeFromParent();const weapon=new THREE.Group();weapon.add(weaponRecipe(safe).mesh('weapon:'+safe));weapon.position.set(.015,.548,.218);weapon.rotation.y=-.16;body.add(weapon);
  group.userData.weapon=weapon;group.userData.weaponName=safe;group.userData.armed=true;
}
export type CharacterMotion='idle'|'walk'|'sprint'|'crawl';
function supportArm(arm:THREE.Group,elbow:THREE.Group,target:THREE.Vector3,side:number){
  const shoulder=arm.position.clone(),delta=target.clone().sub(shoulder),length=Math.min(.403,delta.length()),direction=delta.normalize();
  target=shoulder.clone().addScaledVector(direction,length);
  const upper=.205,lower=.2,a=(upper*upper-lower*lower+length*length)/(2*Math.max(.01,length));
  const bend=new THREE.Vector3(side,-.5,-.2);bend.addScaledVector(direction,-bend.dot(direction)).normalize();
  const joint=shoulder.clone().addScaledVector(direction,a).addScaledVector(bend,Math.sqrt(Math.max(0,upper*upper-a*a)));
  const down=new THREE.Vector3(0,-1,0),upperRotation=new THREE.Quaternion().setFromUnitVectors(down,joint.clone().sub(shoulder).normalize());
  const lowerRotation=new THREE.Quaternion().setFromUnitVectors(down,target.clone().sub(joint).normalize());
  arm.quaternion.copy(upperRotation);elbow.quaternion.copy(upperRotation.clone().invert().multiply(lowerRotation));
}
export function animateCharacter(group:THREE.Group,moving:boolean,time:number,motion?:CharacterMotion):void {
  const u=group.userData;const body=u.body as THREE.Group;if(!body)return;
  const dt=Math.min(.1,Math.max(0,time-(u.lastTime as number)));u.lastTime=time;
  const k=time===0?1:1-Math.exp(-dt*12);u.blend+=(Number(moving)-u.blend)*k;
  const activity=u.blend as number,infected=u.infected as boolean;const state=motion??(moving?'walk':'idle');const sprint=state==='sprint',crawl=state==='crawl';
  u.crawlBlend=(u.crawlBlend??0)+(Number(crawl)-(u.crawlBlend??0))*k;
  const prone=u.crawlBlend as number;
  const stride=Math.sin(time*(crawl?6:sprint?17:infected?7.5:10))*activity;
  const legs=u.legs as THREE.Group[],arms=u.arms as THREE.Group[],elbows=u.elbows as THREE.Group[];
  legs.forEach((leg,i)=>{leg.rotation.x=stride*(i?-1:1)*(crawl?.28:sprint?.8:.46);leg.rotation.z=crawl?(i?.1:-.1):0;});
  (u.knees as THREE.Group[]).forEach((knee,i)=>knee.rotation.x=crawl?.65+Math.sin(time*6+(i?Math.PI:0))*.3:Math.max(0,stride*(i?-1:1))*(sprint?.8:.32));
  arms.forEach((arm,i)=>{const sign=i?1:-1;const armed=u.armed as boolean;
    arm.rotation.x=armed?-.55+Math.sin(time*2)*.015:infected?-.37-stride*.19:stride*sign*.38;
    arm.rotation.z=armed?-sign*.32:sign*(.095+activity*.04);
    arm.rotation.y=armed?-sign*.24:0;
    elbows[i].rotation.x=armed?-.85:infected?-.28:-.14;
  });
  body.position.y=THREE.MathUtils.lerp(Math.sin(time*2.3)*.006+(1-Math.abs(stride))*.025*activity,.145+Math.sin(time*6)*.006,prone);
  body.rotation.x=THREE.MathUtils.lerp(sprint?.17:infected?.09+activity*.045:activity*.025,1.39,prone);body.rotation.z=crawl?stride*.025:infected?Math.sin(time*1.4)*.025:Math.cos(time*5.5)*.014*activity;
  const head=u.head as THREE.Group;head.rotation.x=THREE.MathUtils.lerp(sprint?-.1:0,-1.17,prone);head.rotation.z=infected?-.04+Math.sin(time*.9)*.015:Math.sin(time*.8)*.015;head.rotation.y=u.armed?0:Math.sin(time*.55)*.07;
  const weapon=u.weapon as THREE.Group|undefined;
  if(weapon&&u.armed){
    weapon.position.set(.015,THREE.MathUtils.lerp(.548,.71,prone),THREE.MathUtils.lerp(.218,.14,prone));weapon.rotation.set(THREE.MathUtils.lerp(sprint?.23:0,-1.35,prone),THREE.MathUtils.lerp(-.16,0,prone),0);weapon.updateMatrix();
    for(let i=0;i<2;i++){
      const point=crawl?new THREE.Vector3(i?.08:-.075,-.09,.03):new THREE.Vector3(0,i?-.092:-.023,i?.031:.145);
      point.applyMatrix4(weapon.matrix);supportArm(arms[i],elbows[i],point,i?1:-1);
    }
  }
  const eyes=u.eyes as THREE.Group;eyes.scale.y=(time+(u.role as string).length*.37)%4.7<.11?.18:1;
}
