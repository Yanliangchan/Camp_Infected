import * as THREE from 'three';
import {createHeadSurface} from './faceSurface';

const webbing=new THREE.MeshStandardMaterial({color:0x59664c,roughness:1,side:THREE.DoubleSide});
/** Flat webbing projected onto the sculpted cheeks rather than straight rods hanging off them. */
export function createFittedChinStrap():THREE.Group{
 const group=new THREE.Group();group.name='fitted-chin-strap';
 const face=new THREE.Mesh(createHeadSurface(),new THREE.MeshBasicMaterial());face.updateMatrixWorld();const ray=new THREE.Raycaster();
 const project=(p:THREE.Vector3)=>{const radial=new THREE.Vector3(p.x,0,p.z).normalize();ray.set(new THREE.Vector3(radial.x,p.y,radial.z),radial.clone().negate());const hit=ray.intersectObject(face)[0];return hit?hit.point.clone().addScaledVector(hit.face!.normal,.0028):p;};
 for(const side of [-1,1]){
  const seeds=[new THREE.Vector3(side*.28,.09,.055),new THREE.Vector3(side*.26,-.025,.078),new THREE.Vector3(side*.205,-.135,.108),new THREE.Vector3(side*.125,-.225,.11),new THREE.Vector3(side*.045,-.26,.052),new THREE.Vector3(0,-.266,.04)];
  const curve=new THREE.CatmullRomCurve3(seeds),vertices:number[]=[],indices:number[]=[];
  for(let i=0;i<=64;i++){const center=project(curve.getPoint(i/64)),tangent=curve.getTangent(i/64);const outward=new THREE.Vector3(center.x,center.y*.85,center.z).normalize();const width=new THREE.Vector3().crossVectors(tangent,outward).normalize().multiplyScalar(.007);
   for(const sign of [-1,1]){const p=project(center.clone().addScaledVector(width,sign));vertices.push(p.x,p.y,p.z);}
   if(i<64){const k=i*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);}
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();const strap=new THREE.Mesh(geometry,webbing);strap.castShadow=true;group.add(strap);
  // Rear branch meets the same side adjuster, following the ear rather than projecting past the jaw.
  const rearCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(side*.277,.08,-.09),new THREE.Vector3(side*.275,-.035,-.028),project(seeds[2])]);
  const branch=new THREE.Mesh(new THREE.TubeGeometry(rearCurve,24,.004,6,false),webbing);group.add(branch);
  if(side===1){const p=project(new THREE.Vector3(.205,-.135,.108));const buckle=new THREE.Mesh(new THREE.BoxGeometry(.014,.02,.007),new THREE.MeshStandardMaterial({color:0x344139,roughness:.9}));buckle.position.copy(p).add(new THREE.Vector3(.002,0,.002));buckle.rotation.y=1.05;group.add(buckle);}
 }
 face.geometry.dispose();(face.material as THREE.Material).dispose();return group;
}
