import * as THREE from 'three';

/** Subtle presentation atmosphere. Does not create room geometry or affect simulation. */
export function buildLandingAtmosphere(scene:THREE.Scene):{
 group:THREE.Group;update:(time:number,reducedMotion:boolean)=>void
}{
 const group=new THREE.Group();group.name='landing-atmosphere';scene.add(group);
 const count=92,positions=new Float32Array(count*3),base=new Float32Array(count*3),phase=new Float32Array(count);
 let seed=31241;const rand=()=>{seed=seed*16807%2147483647;return seed/2147483647;};
 for(let i=0;i<count;i++){
  base[i*3]=-6+rand()*19;base[i*3+1]=.3+rand()*4.1;base[i*3+2]=-6+rand()*17;phase[i]=rand()*Math.PI*2;
 }
 positions.set(base);
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
 // Shader gives each point a feathered circular profile without image assets.
 const dustMaterial=new THREE.ShaderMaterial({
  transparent:true,depthWrite:false,blending:THREE.NormalBlending,
  uniforms:{color:{value:new THREE.Color(0xc9bfa4)},opacity:{value:.15},pointSize:{value:2.6}},
  vertexShader:'uniform float pointSize; void main(){vec4 p=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*p;gl_PointSize=pointSize;}',
  fragmentShader:'uniform vec3 color; uniform float opacity; void main(){float r=length(gl_PointCoord-vec2(0.5))*2.0;float a=(1.0-smoothstep(0.15,1.0,r))*opacity;if(a<0.005)discard;gl_FragColor=vec4(color,a);}'
 });
 const dust=new THREE.Points(geometry,dustMaterial);dust.frustumCulled=false;group.add(dust);
 // One subdued amber accent rather than a rapid flashing warning effect.
 const beaconPosition=new THREE.Vector3(4.75,2.9,-4.8);
 const glow=new THREE.Mesh(new THREE.SphereGeometry(.085,14,10),new THREE.MeshBasicMaterial({color:0xc98d45,transparent:true,opacity:.7,toneMapped:false}));
 glow.position.copy(beaconPosition);group.add(glow);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(.13,.012,6,24),new THREE.MeshBasicMaterial({color:0xc79a57,transparent:true,opacity:.3,toneMapped:false,depthWrite:false}));
 ring.position.copy(beaconPosition);group.add(ring);
 const beacon=new THREE.PointLight(0xe1a253,.45,4,2);beacon.position.copy(beaconPosition);group.add(beacon);
 // A broad dim light slowly shifts across the checkpoint wall. It remains steady with reduced motion.
 const sweep=new THREE.SpotLight(0xbcbdab,.18,14,Math.PI*.29,.85,1.5);sweep.position.set(7,4.8,-3.4);sweep.castShadow=false;
 const target=new THREE.Object3D();target.position.set(1.4,.8,-1.8);group.add(target);sweep.target=target;group.add(sweep);
 return{
  group,
  update(time:number,reducedMotion:boolean){
   if(!group.visible)return;
   const t=reducedMotion?0:time;
   for(let i=0;i<count;i++){
    positions[i*3]=base[i*3]+(reducedMotion?0:Math.sin(t*.11+phase[i])*.16);
    positions[i*3+1]=base[i*3+1]+(reducedMotion?0:Math.sin(t*.085+phase[i]*1.7)*.18);
    positions[i*3+2]=base[i*3+2]+(reducedMotion?0:Math.cos(t*.09+phase[i])*.11);
   }
   (geometry.getAttribute('position') as THREE.BufferAttribute).needsUpdate=true;
   const breathing=reducedMotion?0:(Math.sin(t*.55)+1)*.5;
   beacon.intensity=.32+breathing*.13;
   (glow.material as THREE.MeshBasicMaterial).opacity=.6+breathing*.1;
   (ring.material as THREE.MeshBasicMaterial).opacity=.23+breathing*.07;
   target.position.x=1.4+(reducedMotion?0:Math.sin(t*.12)*1.65);
   target.position.z=-1.8+(reducedMotion?0:Math.sin(t*.09)*.65);
  }
 };
}
