import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Generic public-security equipment, not a claimed SAF make/model.
const sharedMaterial=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.65,metalness:.16});
let sharedGeometry:THREE.BufferGeometry|undefined;
class Parts {
  geometries:THREE.BufferGeometry[]=[];
  add(geometry:THREE.BufferGeometry,color:number,x:number,y:number,z:number,rotation:THREE.Euler=new THREE.Euler()){
    const g=geometry.index?geometry.toNonIndexed():geometry;g.deleteAttribute('uv');
    g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(rotation),new THREE.Vector3(1,1,1)));
    const c=new THREE.Color(color),values=new Float32Array(g.getAttribute('position').count*3);
    for(let i=0;i<values.length;i+=3){values[i]=c.r;values[i+1]=c.g;values[i+2]=c.b;}g.setAttribute('color',new THREE.BufferAttribute(values,3));this.geometries.push(g);
    if(g!==geometry)geometry.dispose();
  }
  box(x:number,y:number,z:number,w:number,h:number,d:number,color:number){this.add(new THREE.BoxGeometry(w,h,d),color,x,y,z);}
  roller(x:number,y:number,z:number,length:number,radius:number,color:number){this.add(new THREE.CylinderGeometry(radius,radius,length,12),color,x,y,z,new THREE.Euler(0,0,Math.PI/2));}
  build(){const geometry=mergeGeometries(this.geometries,false)!;this.geometries.forEach(g=>g.dispose());geometry.computeBoundingSphere();return geometry;}
}
function makeGeometry():THREE.BufferGeometry {
  const p=new Parts(),white=0xd5ddd9,blue=0x526977,dark=0x25343c,steel=0x879b9c,black=0x252b2b;
  // Walk-through metal detector: independent human screening arch.
  const ax=-.7,az=8.6;
  for(const side of [-1,1]){
    const x=ax+side*.52;
    p.box(x,.12,az,.31,.18,.73,blue);p.box(x,1.12,az,.18,2.08,.49,white);
    p.box(x,1.12,az+.255,.11,1.93,.018,blue);
    p.box(x,1.39,az+.268,.036,.3,.008,0x829989);
    for(let i=0;i<4;i++)p.box(x,1.29+i*.077,az+.275,.018,.03,.007,0x91b487);
    p.box(x,.26,az+.27,.05,.033,.007,steel);
  }
  p.box(ax,2.19,az,1.23,.21,.51,white);p.box(ax,2.19,az+.269,.46,.086,.014,blue);
  p.box(ax+.31,2.19,az+.28,.034,.034,.006,0x93b483);
  p.box(ax,2.335,az,.65,.045,.39,blue);
  // Bag X-ray scanner tunnel: the inspection system is for baggage only.
  const bx=2,bz=8.5;
  p.box(bx,.64,bz,1.22,1.22,2.6,blue);
  p.box(bx,.55,bz,1.29,.37,2.65,dark);
  p.box(bx,1.23,bz,1.26,.07,2.66,steel);
  for(const side of [-1,1]){
    const end=bz+side*1.32;
    p.box(bx,.99,end,1.27,.14,.06,white);
    for(const edge of [-1,1])p.box(bx+edge*.565,.835,end,.1,.23,.07,white);
    p.box(bx,.84,end,.99,.21,.014,black);
    // Flexible black entry/exit strips are visibly separate.
    for(let i=0;i<10;i++)p.box(bx-.444+i*.098,.832,end+side*.016,.089,.25,.027,i%2?0x343b3b:0x202727);
    const conveyZ=bz+side*1.79;
    for(const edge of [-1,1]){
      p.box(bx+edge*.61,.672,conveyZ,.062,.09,1.1,steel);
      p.box(bx+edge*.53,.35,bz+side*2.08,.065,.63,.065,dark);
      p.box(bx+edge*.53,.06,bz+side*2.08,.18,.055,.17,black);
    }
    for(let i=0;i<9;i++)p.roller(bx,.671,bz+side*(1.35+i*.105),1.15,.033,steel);
  }
  // Return trays on the left side, keeping x[4,10] unobstructed.
  p.box(.7,.52,7.4,.53,.05,.76,steel);
  for(const x of [.48,.92])for(const z of [7.12,7.68])p.box(x,.27,z,.04,.48,.04,dark);
  for(let i=0;i<3;i++){
    const y=.575+i*.056;p.box(.7,y,7.4,.46,.026,.64,0xaab5b4);
    for(const s of [-1,1]){p.box(.7+s*.225,y+.027,7.4,.022,.068,.66,white);p.box(.7,y+.027,7.4+s*.315,.46,.068,.02,white);}
  }
  // Soft baggage silhouette sits on the front roller bed.
  p.box(bx,.82,bz+1.75,.5,.25,.46,0x5c6656);p.box(bx,.948,bz+1.75,.5,.017,.46,0x78816d);
  p.box(bx,.82,bz+1.99,.21,.095,.023,0x78816d);
  for(const side of [-1,1])p.box(bx+side*.087,1.005,bz+1.75,.022,.09,.023,dark);
  p.box(bx,1.048,bz+1.75,.197,.022,.027,dark);
  // Small operator workstation, fully below x=4.
  p.box(3.16,.79,8.13,.63,.055,.72,white);
  for(const z of [7.84,8.42])p.box(3.16,.41,z,.07,.72,.06,dark);
  p.box(3.16,.9,7.99,.08,.2,.08,dark);p.box(3.16,1.087,7.95,.59,.37,.065,dark);
  p.box(3.16,1.09,7.989,.51,.29,.006,0x172b35);
  // Abstract fictional luggage outline, no people or simulated radiation display.
  for(const x of [3.035,3.285])p.box(x,1.082,7.996,.009,.13,.003,0x799d93);
  for(const y of [1.017,1.147])p.box(3.16,y,7.996,.25,.009,.003,0x799d93);
  p.box(3.16,1.172,7.996,.083,.008,.003,0x799d93);
  p.box(3.119,1.159,7.996,.009,.025,.003,0x799d93);p.box(3.201,1.159,7.996,.009,.025,.003,0x799d93);
  p.box(3.16,.831,8.31,.4,.022,.155,dark);
  for(let row=0;row<3;row++)for(let col=0;col<8;col++)p.box(3.005+col*.043,.845,8.262+row*.035,.03,.006,.022,steel);
  p.box(3.405,.83,8.31,.071,.024,.105,blue);
  return p.build();
}
export function addSecurityScreeningProps(group:THREE.Group):void {
  sharedGeometry??=makeGeometry();
  const mesh=new THREE.Mesh(sharedGeometry,sharedMaterial);mesh.name='Generic visitor and baggage screening';mesh.position.y=.03;mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);
}
