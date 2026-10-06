import * as THREE from 'three';

const frameMaterial=new THREE.MeshStandardMaterial({color:0x252b2a,roughness:.72});
const foamMaterial=new THREE.MeshStandardMaterial({color:0x171d1b,roughness:1});
const strapMaterial=new THREE.MeshStandardMaterial({color:0x323733,roughness:1,side:THREE.DoubleSide});
const lensMaterial=new THREE.MeshPhysicalMaterial({color:0x83978d,roughness:.16,metalness:0,transparent:true,opacity:.64,depthWrite:false,side:THREE.DoubleSide,clearcoat:1,clearcoatRoughness:.12});

/** A continuous curved ballistic lens, raised onto the helmet. +Z faces forward. */
export function createHelmetGoggles():THREE.Group {
  const goggles=new THREE.Group();goggles.name='helmet-goggles';
  const outline=new THREE.Shape();
  outline.moveTo(-.213,.052);
  outline.bezierCurveTo(-.13,.083,.13,.083,.213,.052);
  outline.bezierCurveTo(.239,.038,.238,-.041,.204,-.069);
  outline.bezierCurveTo(.167,-.091,.072,-.091,.049,-.065);
  outline.bezierCurveTo(.031,-.043,.027,-.014,0,-.014);
  outline.bezierCurveTo(-.027,-.014,-.031,-.043,-.049,-.065);
  outline.bezierCurveTo(-.072,-.091,-.167,-.091,-.204,-.069);
  outline.bezierCurveTo(-.238,-.041,-.239,.038,-.213,.052);
  const curveZ=(x:number)=>.324-1.7*x*x;
  const lensGeometry=new THREE.ShapeGeometry(outline,32);
  const positions=lensGeometry.getAttribute('position');
  for(let i=0;i<positions.count;i++)positions.setZ(i,curveZ(positions.getX(i)));
  lensGeometry.computeVertexNormals();
  const lens=new THREE.Mesh(lensGeometry,lensMaterial);lens.position.y=.232;lens.renderOrder=2;goggles.add(lens);
  const points=outline.getPoints(96).map(p=>new THREE.Vector3(p.x,p.y+.232,curveZ(p.x)));
  for(const [offset,radius,material]of [[-.012,.011,foamMaterial],[.002,.008,frameMaterial]] as const){
    const curve=new THREE.CatmullRomCurve3(points.map(p=>p.clone().add(new THREE.Vector3(0,0,offset))),true);
    const rim=new THREE.Mesh(new THREE.TubeGeometry(curve,128,radius,8,true),material);rim.castShadow=true;goggles.add(rim);
  }
  // Wide flat woven strap follows the shell, rather than a round rubber cord.
  const vertices:number[]=[],indices:number[]=[];
  for(let i=0;i<=80;i++){
    const angle=i/80*Math.PI*2;
    for(const y of [.203,.252]){
      const radius=.304*Math.sqrt(1-((y-.142)/(.304*.74))**2);
      vertices.push(Math.sin(angle)*(radius+.006),y,Math.cos(angle)*(radius*.98+.006)-.018);
    }
    if(i<80){const j=i*2;indices.push(j,j+1,j+2,j+1,j+3,j+2);}
  }
  const strapGeometry=new THREE.BufferGeometry();strapGeometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));strapGeometry.setIndex(indices);strapGeometry.computeVertexNormals();
  const strap=new THREE.Mesh(strapGeometry,strapMaterial);strap.castShadow=true;goggles.add(strap);
  for(const side of [-1,1]){
    const tab=new THREE.Mesh(new THREE.BoxGeometry(.024,.055,.076),frameMaterial);tab.position.set(side*.274,.229,.055);tab.rotation.y=side*.25;goggles.add(tab);
    const loop=new THREE.Mesh(new THREE.BoxGeometry(.009,.058,.024),foamMaterial);loop.position.set(side*.285,.229,.043);goggles.add(loop);
  }
  // Small reflections describe the clear lens without covering it with opaque panels.
  const glintMaterial=new THREE.MeshBasicMaterial({color:0xd7e2d9,transparent:true,opacity:.22,depthWrite:false});
  for(const x of [-.14,.135]){
    const glint=new THREE.Mesh(new THREE.PlaneGeometry(.009,.077),glintMaterial);glint.position.set(x,.248,curveZ(x)+.005);glint.rotation.y=Math.atan(3.4*x);glint.rotation.z=-.1;glint.renderOrder=3;goggles.add(glint);
  }
  return goggles;
}
