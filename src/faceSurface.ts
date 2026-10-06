import * as THREE from 'three';

export function createHeadSurface():THREE.BufferGeometry {
  const skull=new THREE.SphereGeometry(1,48,32),positions=skull.getAttribute('position');
  for(let i=0;i<positions.count;i++){
    const x=positions.getX(i),y=positions.getY(i),z=positions.getZ(i);
    const jaw=THREE.MathUtils.smoothstep(-y,.2,.9);
    const lowerFace=THREE.MathUtils.smoothstep(-y,.2,.6)*.024*THREE.MathUtils.smoothstep(z,.2,.8);
    positions.setXYZ(i,x*.277*(1-jaw*.18),y*.269,z*.254+lowerFace);
  }
  skull.computeVertexNormals();return skull;
}

let mouthGeometry:THREE.BufferGeometry|undefined,mouthMaterial:THREE.MeshStandardMaterial|undefined;
/** Mouth and teeth share a single decal fitted directly to the actual face mesh. */
export function createInfectedMouth():THREE.Mesh {
  if(!mouthGeometry){
    const surface=new THREE.Mesh(createHeadSurface(),new THREE.MeshBasicMaterial());
    surface.updateMatrixWorld();
    const ray=new THREE.Raycaster(),positions:number[]=[],uv:number[]=[],indices:number[]=[];
    for(let row=0;row<=12;row++)for(let column=0;column<=24;column++){
      const u=column/24,v=row/12,x=(u-.5)*.091,y=-.135+(v-.5)*.056;
      ray.set(new THREE.Vector3(x,y,1),new THREE.Vector3(0,0,-1));
      const hit=ray.intersectObject(surface,false)[0];
      positions.push(x,y,hit.point.z+.0006);uv.push(u,v);
      if(row<12&&column<24){const a=row*25+column;indices.push(a,a+1,a+25,a+1,a+26,a+25);}
    }
    surface.geometry.dispose();(surface.material as THREE.Material).dispose();
    mouthGeometry=new THREE.BufferGeometry();mouthGeometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));mouthGeometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));mouthGeometry.setIndex(indices);mouthGeometry.computeVertexNormals();
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;
    const context=canvas.getContext('2d')!;context.clearRect(0,0,512,256);
    context.beginPath();context.ellipse(256,128,211,91,0,0,Math.PI*2);context.fillStyle='#594a40';context.fill();
    context.save();context.clip();context.fillStyle='#d5ceb6';
    for(let i=0;i<4;i++)context.fillRect(118+i*67,67,60,48);
    context.restore();context.strokeStyle='#747b59';context.lineWidth=8;context.stroke();
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
    mouthMaterial=new THREE.MeshStandardMaterial({map:texture,transparent:true,alphaTest:.03,depthWrite:false,roughness:1,polygonOffset:true,polygonOffsetFactor:-1});
  }
  const mouth=new THREE.Mesh(mouthGeometry,mouthMaterial);mouth.name='fitted-infected-mouth';mouth.renderOrder=1;return mouth;
}
