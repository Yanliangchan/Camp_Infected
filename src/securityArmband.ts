import * as THREE from 'three';

/** Black fabric cuff with a raised shield panel, fitted to the right upper arm. */
export function createSecurityArmband():THREE.Group {
  const band=new THREE.Group();band.name='security-trooper-armband';
  const fabric=new THREE.MeshStandardMaterial({color:0x272b29,roughness:1});
  const cuff=new THREE.Mesh(new THREE.CylinderGeometry(.074,.074,.094,32,1,true),fabric);
  cuff.position.y=-.119;cuff.castShadow=true;band.add(cuff);
  const vertices:number[]=[],uv:number[]=[],indices:number[]=[];
  for(let row=0;row<=8;row++)for(let column=0;column<=32;column++){
    const u=column/32,v=row/8,angle=-.72+(u-.5)*2.35;
    const top=-.032+Math.pow(Math.abs(u-.5)*2,1.6)*.043;
    vertices.push(Math.sin(angle)*.078,THREE.MathUtils.lerp(-.169,top,v),Math.cos(angle)*.078);
    uv.push(u,v);
    if(row<8&&column<32){const a=row*33+column;indices.push(a,a+1,a+33,a+1,a+34,a+33);}
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=384;
  const context=canvas.getContext('2d')!;context.fillStyle='#252a28';context.fillRect(0,0,512,384);
  // Subtle woven variation and edge stitching remain visible in close-up.
  context.strokeStyle='#303633';context.lineWidth=1;
  for(let y=0;y<384;y+=4){context.beginPath();context.moveTo(0,y);context.lineTo(512,y);context.stroke();}
  context.strokeStyle='#555b53';context.setLineDash([5,5]);context.strokeRect(8,8,496,368);context.setLineDash([]);
  context.fillStyle='#ed7138';context.textAlign='center';context.font='bold 69px Arial';
  context.fillText('SECURITY',256,201,468);context.fillText('TROOPER',256,286,468);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;
  const panel=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({map:texture,roughness:1,side:THREE.DoubleSide}));panel.castShadow=true;band.add(panel);
  return band;
}
