import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const colors={cream:0xf4eedc,sage:0xa1b29a,trim:0x5c7464,wood:0xc09c70,metal:0x5d7069,navy:0x354b48,terracotta:0xb97e62,leaf:0x699557};
class DioramaKit{
 parts:THREE.BufferGeometry[]=[];
 add(geometry:THREE.BufferGeometry,color:number,x:number,y:number,z:number,rotation=new THREE.Euler(),scale=new THREE.Vector3(1,1,1)){
  const g=geometry.index?geometry.toNonIndexed():geometry.clone();
  g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(rotation),scale));
  const c=new THREE.Color(color),p=g.getAttribute('position'),arr=new Float32Array(p.count*3);
  for(let i=0;i<p.count;i++){const f=.86+.14*Math.min(1,Math.max(0,p.getY(i))/.7);arr[i*3]=c.r*f;arr[i*3+1]=c.g*f;arr[i*3+2]=c.b*f;}
  for(const a of Object.keys(g.attributes))if(a!=='position'&&a!=='normal')g.deleteAttribute(a);
  g.setAttribute('color',new THREE.BufferAttribute(arr,3));this.parts.push(g);geometry.dispose();
 }
 box(w:number,h:number,d:number,x:number,y:number,z:number,col:number,r=.035,ry=0,rz=0){this.add(r?new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/3,h/3,d/3)):new THREE.BoxGeometry(w,h,d),col,x,y,z,new THREE.Euler(0,ry,rz));}
 cyl(r:number,h:number,x:number,y:number,z:number,col:number,rb=r,rotation=new THREE.Euler()){this.add(new THREE.CylinderGeometry(r,rb,h,16),col,x,y,z,rotation);}
 sphere(r:number,x:number,y:number,z:number,col:number,sx=1,sy=1,sz=1){this.add(new THREE.SphereGeometry(r,14,10),col,x,y,z,new THREE.Euler(),new THREE.Vector3(sx,sy,sz));}
 finish(group:THREE.Group){const geometry=mergeGeometries(this.parts,false);this.parts.forEach(p=>p.dispose());if(geometry){const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.82}));mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);}}
}
function texture(draw:(c:CanvasRenderingContext2D)=>void,w=512,h=512){const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;draw(canvas.getContext('2d')!);const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=8;return tex;}
function seeded(seed:number){return()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};}
function flooring(kind:'tiles'|'grass'|'road'){
 const tex=texture(c=>{
  const rand=seeded(kind==='grass'?11:17);
  if(kind==='grass'){
   c.fillStyle='#92b779';c.fillRect(0,0,512,512);
   for(let i=0;i<110;i++){c.fillStyle=i%2?'rgba(115,155,84,.23)':'rgba(186,209,145,.28)';c.beginPath();c.ellipse(rand()*512,rand()*512,8+rand()*28,6+rand()*20,rand()*3,0,Math.PI*2);c.fill();}
   for(let i=0;i<1600;i++){const x=rand()*512,y=rand()*512;c.strokeStyle=i%2?'#a8c78a':'#7d9f65';c.lineWidth=.8;c.beginPath();c.moveTo(x,y);c.lineTo(x+rand()*2,y-2-rand()*3);c.stroke();}
  }else if(kind==='road'){
   c.fillStyle='#77857f';c.fillRect(0,0,512,512);for(let i=0;i<16000;i++){c.fillStyle=i%2?'rgba(27,47,41,.07)':'rgba(233,240,221,.12)';c.fillRect(rand()*512,rand()*512,rand()*2+1,rand()*2+1);}
  }else{
   const tones=['#d8d6c7','#dedbca','#d4d3c4','#e1dece'];
   for(let x=0;x<512;x+=64)for(let y=0;y<512;y+=64){
    c.fillStyle=tones[Math.floor(rand()*4)];c.fillRect(x,y,64,64);
    c.fillStyle='rgba(87,110,92,.2)';c.fillRect(x,y,64,1.5);c.fillRect(x,y,1.5,64);
    c.fillStyle='rgba(255,255,241,.45)';c.fillRect(x+2,y+2,61,1);
    for(let i=0;i<65;i++){c.fillStyle=i%2?'rgba(121,125,108,.1)':'rgba(255,255,245,.2)';c.fillRect(x+rand()*62,y+rand()*62,1.2,1.2);}
   }
  }
 });
 tex.wrapS=tex.wrapT=THREE.RepeatWrapping;return new THREE.MeshStandardMaterial({map:tex,roughness:kind==='tiles'?.82:1});
}
function plane(group:THREE.Group,w:number,d:number,x:number,z:number,y:number,material:THREE.Material,repeat=4){const geo=new THREE.PlaneGeometry(w,d);geo.rotateX(-Math.PI/2);const uv=geo.getAttribute('uv');for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w/repeat,uv.getY(i)*d/repeat);const mesh=new THREE.Mesh(geo,material);mesh.position.set(x,y,z);mesh.receiveShadow=true;group.add(mesh);return mesh;}
function decal(group:THREE.Group,w:number,h:number,x:number,y:number,z:number,draw:(c:CanvasRenderingContext2D)=>void,ry=0){const tex=texture(draw,512,256);const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide}));mesh.position.set(x,y,z);mesh.rotation.y=ry;group.add(mesh);}
function label(group:THREE.Group,text:string,w:number,h:number,x:number,y:number,z:number,bg='#435d4f',ry=0,sub=''){
 decal(group,w,h,x,y,z,c=>{c.fillStyle=bg;c.fillRect(0,0,512,256);c.strokeStyle='#ecedda';c.lineWidth=5;c.strokeRect(12,12,488,232);c.fillStyle='#f9f5df';c.textAlign='center';c.font='700 40px sans-serif';c.fillText(text,256,sub?111:149,470);if(sub){c.font='19px sans-serif';c.fillText(sub,256,169,470);}},ry);
}
function shadowTexture(){return texture(c=>{const g=c.createRadialGradient(256,256,20,256,256,256);g.addColorStop(0,'rgba(32,45,31,.3)');g.addColorStop(.5,'rgba(32,45,31,.12)');g.addColorStop(1,'rgba(32,45,31,0)');c.fillStyle=g;c.fillRect(0,0,512,512);});}
function softShadow(group:THREE.Group,material:THREE.Material,x:number,z:number,w:number,d:number,y=.065){const mesh=plane(group,w,d,x,z,y,material,1);const uv=mesh.geometry.getAttribute('uv');for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/w,uv.getY(i)/d);mesh.renderOrder=2;}
function chair(k:DioramaKit,x:number,z:number,ry=0){
 const local=(dx:number,dz:number)=>[x+Math.cos(ry)*dx+Math.sin(ry)*dz,z-Math.sin(ry)*dx+Math.cos(ry)*dz];
 const b=(w:number,h:number,d:number,dx:number,y:number,dz:number,c:number)=>{const p=local(dx,dz);k.box(w,h,d,p[0],y,p[1],c,.045,ry);};
 b(.66,.12,.64,0,.52,0,0xcbd1b5);b(.66,.53,.11,0,.85,-.26,0xcbd1b5);
 for(const dx of [-.24,.24])for(const dz of [-.24,.24])b(.06,.49,.06,dx,.27,dz,colors.metal);
}
function plant(k:DioramaKit,x:number,z:number,s=1){
 k.cyl(.29*s,.5*s,x,.31*s,z,colors.terracotta,.22*s);k.cyl(.32*s,.1*s,x,.55*s,z,0xd09779,.31*s);
 for(let i=0;i<6;i++){const a=i*Math.PI/3;k.sphere(.22*s,x+Math.sin(a)*.18*s,.95*s,z+Math.cos(a)*.18*s,i%2?0x6d995b:0x87aa68,.65,1.6,.5);}
}
function palm(k:DioramaKit,x:number,z:number,s=1){
 k.cyl(.14*s,3.8*s,x,1.9*s,z,0xa28d68,.24*s);
 for(let i=0;i<9;i++)k.cyl(.16*s,.04*s,x,.7*s+i*.31*s,z,0x8e795d,.16*s);
 for(let i=0;i<10;i++){
  const a=i*Math.PI/5;
  for(let j=0;j<3;j++){
   const distance=(.45+j*.66)*s,drop=j*j*.16*s;
   k.add(new THREE.SphereGeometry(1,14,9),[0x537e47,0x679451,0x83a961][(i+j)%3],x+Math.sin(a)*distance,3.98*s-drop,z+Math.cos(a)*distance,new THREE.Euler(.1+j*.28,a,0),new THREE.Vector3((.48-j*.065)*s,.13*s,.79*s));
  }
 }
 k.sphere(.43*s,x,3.86*s,z,0x598044,1,.68,1);
 for(const dx of [-.18,.18])k.sphere(.13*s,x+dx*s,3.6*s,z+.1*s,0x8d8060);
}
function desk(k:DioramaKit,g:THREE.Group,x:number,z:number){
 k.box(3.4,.13,1.55,x,.94,z,colors.wood,.07);
 for(const dx of [-1.42,1.42])for(const dz of [-.54,.54])k.box(.075,.92,.075,x+dx,.47,z+dz,colors.metal);
 k.box(1.2,.65,.045,x+.3,1.38,z-.28,colors.navy,.025);k.box(.19,.27,.17,x+.3,1.06,z-.28,colors.metal);
 k.box(.5,.055,.32,x+.3,.99,z-.28,colors.metal);
 decal(g,1.08,.55,x+.3,1.39,z-.25,c=>{c.fillStyle='#182d29';c.fillRect(0,0,512,256);for(let i=0;i<4;i++){c.fillStyle=i%2?'#688c72':'#557969';c.fillRect((i%2)*256+7,Math.floor(i/2)*128+7,240,112);c.strokeStyle='#9eb99a';c.beginPath();c.moveTo((i%2)*256+15,Math.floor(i/2)*128+85);c.lineTo((i%2)*256+85,Math.floor(i/2)*128+45);c.lineTo((i%2)*256+220,Math.floor(i/2)*128+72);c.stroke();}c.fillStyle='#e2ce93';c.font='15px monospace';c.fillText('CHECKPOINT CCTV  06:42',16,26);});
 k.box(.75,.04,.3,x+.3,1.03,z+.28,0x718478,.015);
 for(let i=0;i<9;i++)k.box(.046,.012,.18,x+.02+i*.055,1.057,z+.28,0xc0cabb,.002);
 k.box(.16,.05,.24,x+.87,1.04,z+.26,0x3b4f43,.03);
 k.box(.46,.25,.35,x-1.15,1.12,z-.15,0x637763,.03);k.cyl(.013,.7,x-1.33,1.54,z-.24,0x405545);k.box(.17,.1,.01,x-1.15,1.17,z+.031,0xd2b56b);
 for(let i=0;i<4;i++)k.box(.026,.12,.025,x-1.31+i*.09,1.2,z+.04,0x344c40,.001);
 for(let i=0;i<3;i++)k.box(.55,.012,.42,x-.54+i*.02,1.025+i*.013,z+.28,0xf3ecce,.002,-.15);
 k.box(.19,.03,.18,x-.63,1.1,z+.32,0xb29872,.01);
 k.cyl(.12,.2,x+1.15,1.12,z+.08,0xdddec6);k.cyl(.084,.012,x+1.15,1.225,z+.08,0x7d7552);
 chair(k,x,z+1.3,Math.PI);
}
export function buildPreviewRoom(scene:THREE.Scene):THREE.Group{
 const group=new THREE.Group();group.name='checkpoint-art-preview';scene.add(group);const k=new DioramaKit();
 const shade=new THREE.MeshBasicMaterial({map:shadowTexture(),transparent:true,depthWrite:false,toneMapped:false});
 k.box(30,.65,25,0,-.4,.5,0x697e61,.25);
 plane(group,30,25,0,.5,-.045,flooring('grass'));
 k.box(13.8,.21,12.8,-5.5,.04,-3,0xd3d4bd,.12);
 plane(group,13,12,-5.5,-3,.16,flooring('tiles'));
 plane(group,8,24,7,.5,.035,flooring('road'));
 plane(group,21,4,-2,6,.047,flooring('tiles'));
 // A composed cutaway shell: cream upper wall, sage lower wainscot and substantial trim.
 const wall=(x:number,z:number,len:number,axis:'x'|'z',height:number)=>{
  const w=axis==='x'?len:.24,d=axis==='x'?.24:len,rail=Math.min(.92,height);
  k.box(w,rail,d,x,.17+rail/2,z,colors.sage,.018);
  if(height>rail)k.box(w,height-rail,d,x,.17+rail+(height-rail)/2,z,colors.cream,.018);
  k.box(w+.045,.08,d+.045,x,.17+rail,z,0xbfcab1,.02);
  k.box(w+.03,.12,d+.03,x,.23,z,colors.trim,.01);
  k.box(w+.08,.09,d+.08,x,.17+height,z,0xe8e9d5,.025);
 };
 wall(-5.5,-9,13.4,'x',2.8);wall(-12,-3,12,'z',2.8);
 wall(1,-3,12,'z',.46);wall(-9,3,6,'x',.46);wall(-.7,3,3.4,'x',.46);
 // Exterior dark-red columns echo publicly inspected institutional SAF architecture.
 for(const x of [-12,1]){k.box(.42,3,.42,x,1.6,-9,0xa16f5c);k.box(.5,.35,.5,x,.32,-9,colors.trim);}
 k.box(13.7,.22,.7,-5.5,3.17,-9,0xad8264);k.box(.6,.2,12.7,-12,3.16,-3,0xad8264);
 for(const x of [-5.9,-2.6]){k.box(.18,2.35,.28,x,1.35,3,0xc4b18d);k.box(.25,.1,.35,x,2.56,3,0xe6dcc0);}
 k.box(3.4,.05,.5,-4.25,.2,3,0xb9c1a8);k.box(3.6,.19,.52,-4.25,2.55,3,0xb09d75);
 label(group,'GUARDROOM',2.2,.45,-4.25,2.56,3.28,'#526a53');
 // Louvre window banks, solid frames, sills, air vents.
 for(const x of [-9,-3]){
  k.box(3.6,1.15,.09,x,1.85,-8.82,0x6e8475,.018);
  k.box(3.45,1,.035,x,1.85,-8.755,0xb9d8cb,.008);
  for(let i=0;i<7;i++)k.box(3.35,.035,.08,x,1.39+i*.15,-8.71,0xeff0d8,.004);
  for(const dx of [-1.7,0,1.7])k.box(.06,1.05,.1,x+dx,1.85,-8.68,0x8a9d86,.006);
  k.box(3.8,.095,.35,x,1.27,-8.7,0xe7e6cf,.025);
 }
 for(let i=0;i<5;i++)k.box(1.3,.035,.08,-11.83,2.03+i*.11,-2,0x7d9080,.008,Math.PI/2);
 // Floor/wall contact gradients and furniture contact shadows.
 const aoTex=texture(c=>{const grad=c.createLinearGradient(0,0,0,512);grad.addColorStop(0,'rgba(48,56,32,.32)');grad.addColorStop(1,'rgba(48,56,32,0)');c.fillStyle=grad;c.fillRect(0,0,512,512);});
 const aoMat=new THREE.MeshBasicMaterial({map:aoTex,transparent:true,depthWrite:false});
 const a=plane(group,13,1,-5.5,-8.5,.172,aoMat,1);a.geometry.getAttribute('uv').array.set([0,1,1,1,0,0,1,0]);
 const b=plane(group,1,12,-11.5,-3,.173,aoMat,1);b.geometry.getAttribute('uv').array.set([1,0,0,0,1,1,0,1]);
 desk(k,group,-7,-6.9);softShadow(group,shade,-7,-6.6,4.8,3.5,.181);
 // Wall-mounted rack stores compact SAR-21 inspired silhouettes against a locked green backing.
 k.box(2.3,1.4,.18,-11.73,1.05,-7.1,0x63775e,.04,Math.PI/2);
 for(let i=0;i<3;i++){
  const z=-7.9+i*.75;
  k.box(.11,.12,.46,-11.56,1.17,z,0x344636,.025,Math.PI/2);
  k.box(.2,.045,.04,-11.39,1.17,z,0x27382d,.008);
  k.box(.1,.18,.08,-11.65,1.08,z,0x697860,.008);
  k.box(.08,.045,.2,-11.53,1.33,z,0x354935,.008);
  k.box(.04,.13,.04,-11.53,1.26,z-.06,0x354935,.004);
 }
 // Three metal lockers have doors, feet, ventilation slots and handles.
 for(let i=0;i<3;i++){const x=-10.65+i*.85;
  k.box(.77,2.15,.62,x,1.25,-.7,0x80947d,.04);k.box(.69,2.02,.045,x,1.25,-.365,0xa7b79a,.025);
  for(let j=0;j<4;j++)k.box(.43,.028,.04,x,2-j*.095,-.327,0x5c785f,.003);
  k.box(.055,.28,.09,x+.23,1.15,-.3,0xd3d1ab,.008);
  for(const dx of [-.25,.25])k.box(.055,.2,.055,x+dx,.21,-.65,colors.metal);
  label(group,String(i+1).padStart(2,'0'),.22,.15,x,1.69,-.32,'#657d61');
 }
 softShadow(group,shade,-9.8,-.65,3.7,1.9,.181);
 // Duty bench, shelf of records, water dispenser and incident board.
 for(const z of [.6,1.02])k.box(3.1,.095,.18,-9.4,.58,z,colors.wood,.025);
 for(const x of [-10.65,-8.15])for(const z of [.57,1.05])k.box(.07,.48,.07,x,.3,z,colors.metal);
 k.box(3.1,.42,.08,-9.4,.86,.49,colors.wood,.03);
 k.box(1.25,1.75,.5,-2.2,1.09,-7.9,0xad9271,.025);
 for(const y of [.58,1.05,1.53])k.box(1.22,.08,.52,-2.2,y,-7.9,0xd3b48a,.018);
 for(let i=0;i<7;i++)k.box(.12,.34,.26,-2.67+i*.145,1.28,-7.85,[0x729479,0x9c6655,0xcdc4a2][i%3],.008);
 k.box(.66,1.04,.57,-1.15,.69,-2.2,0xe4e7d3);k.cyl(.24,.48,-1.15,1.46,-2.2,0xb2d4d1,.25);k.cyl(.25,.04,-1.15,1.21,-2.2,0x5f7770);k.box(.37,.14,.055,-1.15,1,-1.89,0x75968a);
 for(const x of [-1.26,-1.03])k.box(.08,.08,.07,x,.98,-1.83,x<-1.1?0x638caa:0xbe7b63,.01);
 k.box(.45,.04,.28,-1.15,.77,-1.9,0x789086);
 label(group,'DUTY ROSTER',2.3,1.4,-11.82,1.92,-5.4,'#b69d79',Math.PI/2,'CHECK IN • REPORT • RELIEVE');
 decal(group,2.2,1.25,-5.1,1.95,-8.73,c=>{c.fillStyle='#b19d73';c.fillRect(0,0,512,256);c.fillStyle='#425747';c.font='bold 28px sans-serif';c.fillText('CAMP ORDERS',20,36);for(let i=0;i<4;i++){const x=20+i*121;c.fillStyle=i%2?'#e9e0ba':'#d7ddd0';c.fillRect(x,55,105,167);c.fillStyle='#7d886a';for(let j=0;j<6;j++)c.fillRect(x+12,78+j*18,75-j%3*10,3);}});
 // Wall clock with modeled hands, small AC housing, ceiling fan suspended only at back.
 k.cyl(.31,.07,-.2,2.4,-8.74,0x607560,.31,new THREE.Euler(Math.PI/2,0,0));k.cyl(.275,.075,-.2,2.4,-8.695,0xf4efd9,.275,new THREE.Euler(Math.PI/2,0,0));
 k.box(.022,.19,.016,-.2,2.45,-8.644,0x536954,.002,0,-.35);k.box(.018,.14,.016,-.25,2.4,-8.64,0x536954,.002,0,1.3);
 k.box(2,.43,.27,-7,2.71,-8.69,0xe8e8d6,.06);for(let i=0;i<8;i++)k.box(.018,.17,.035,-7.66+i*.18,2.66,-8.54,0x8f9c86,.002);
 k.cyl(.035,.4,-8.8,2.84,-5.8,0x7c8d78);k.cyl(.16,.12,-8.8,2.62,-5.8,0xe4e6ce);
 for(let i=0;i<3;i++)k.box(.28,.035,1.55,-8.8+Math.sin(i*Math.PI*2/3)*.62,2.6,-5.8+Math.cos(i*Math.PI*2/3)*.62,0xd6ddc5,.06,i*Math.PI*2/3);
 plant(k,-11.2,1.8);plant(k,-1.8,1.3,.8);
 // Functional corner clusters keep a clear central circulation lane through the guardroom.
 // Desk return, a visitor registration station and an equipment cage complete the guard post.
 k.box(1.6,.12,1.05,-9.8,.93,-6.6,0xbd9b70,.07);
 k.box(1.42,.78,.88,-9.8,.47,-6.6,0x8ea085,.04);
 for(const y of [.32,.59,.79]){k.box(1.31,.15,.04,-9.8,y,-6.13,0xb4bba0,.012);k.box(.22,.03,.045,-9.8,y,-6.1,0x6b7d63,.005);}
 for(let i=0;i<4;i++)k.box(.14,.36,.4,-10.3+i*.17,1.16,-6.69,[0x788f6c,0xb89072,0x9eaa83,0x647d70][i],.008);
 k.box(.37,.11,.28,-9.34,1.04,-6.52,0x3b5144,.035);
 k.box(.32,.055,.17,-9.34,1.115,-6.54,0x6d816c,.018);
 k.box(.07,.025,.065,-9.42,1.147,-6.5,0xc8c6a5,.005);
 // Registration counter: lower cabinetry, raised return and forms, with a central aisle to its right.
 k.box(4.4,.86,.9,-9.2,.64,2.08,0x8c9d7d,.06);
 k.box(4.6,.11,1.05,-9.2,1.12,2.08,0xd8bd92,.05);
 for(const x of [-10.35,-9.2,-8.05]){
  k.box(1.04,.6,.045,x,.64,2.55,0xb0bea0,.025);k.box(.19,.035,.055,x,.79,2.6,0x61785f,.008);
 }
 k.box(1.1,.48,.04,-10.2,1.38,2.05,0x40584a,.03);
 decal(group,.97,.35,-10.2,1.4,2.079,c=>{c.fillStyle='#23463b';c.fillRect(0,0,512,256);c.fillStyle='#adc8a2';c.font='bold 32px monospace';c.fillText('REGISTRATION',32,83);c.font='24px monospace';c.fillText('CHECK ID / ISSUE PASS',32,148);});
 for(let i=0;i<3;i++)k.box(.64,.016,.45,-8.55+i*.018,1.19+i*.014,2.05,0xede9d3,.003);
 k.box(.23,.22,.22,-7.73,1.3,2.04,0x6b8a68,.03);for(let i=0;i<3;i++)k.cyl(.013,.23,-7.8+i*.055,1.51,2.06,0xb99265);
 label(group,'VISITOR REGISTRATION',2.25,.29,-9.2,.76,2.591,'#547053');
 softShadow(group,shade,-9.2,2.05,5.2,1.8,.181);
 // Briefing corner with a tactile tabletop map, binders and two proper visitor chairs.
 k.box(2.65,.12,1.65,-8.5,.94,-3.2,0xc3a476,.065);
 for(const x of [-9.55,-7.45])for(const z of [-3.78,-2.62])k.box(.065,.91,.065,x,.49,z,0x627663);
 k.box(1.64,.018,.96,-8.5,1.015,-3.2,0xc7d2b7,.012);
 const map=texture(c=>{c.fillStyle='#d0d9bb';c.fillRect(0,0,512,512);c.strokeStyle='#769878';c.lineWidth=18;for(let i=0;i<5;i++){c.beginPath();c.moveTo(15,55+i*92);c.lineTo(480,40+i*92);c.stroke();}c.strokeStyle='#c2ad73';c.lineWidth=24;c.beginPath();c.moveTo(160,0);c.lineTo(206,512);c.stroke();for(let i=0;i<9;i++){c.fillStyle=i%2?'#8c9e7c':'#a99673';c.fillRect(45+(i%3)*150,55+Math.floor(i/3)*150,80,60);}c.fillStyle='#586d58';c.font='bold 28px sans-serif';c.fillText('CAMP SECTOR PLAN',28,487);});
 const mapMesh=plane(group,1.6,.94,-8.5,-3.2,1.033,new THREE.MeshBasicMaterial({map}),1);mapMesh.geometry.getAttribute('uv').array.set([0,1,1,1,0,0,1,0]);
 k.box(.46,.07,.38,-7.49,1.065,-3.52,0x778e70,.014);k.box(.41,.018,.33,-7.49,1.11,-3.52,0xcdd0ad,.005);
 chair(k,-9.25,-1.9,Math.PI);chair(k,-7.7,-1.9,Math.PI);
 softShadow(group,shade,-8.5,-3,3.7,3.1,.181);
 // Equipment cage: mesh panels, shelves, secured ammunition boxes and helmets.
 k.box(1.63,.1,3.05,.05,.27,-5.55,0x73866d,.04);
 for(const x of [-.71,.8])for(const z of [-6.95,-4.15])k.box(.065,2.08,.065,x,1.32,z,0x61785e,.008);
 for(const y of [.6,1.28,2.28])k.box(1.58,.065,2.95,.05,y,-5.55,0x92a585,.016);
 for(let z=-6.85;z<-4.1;z+=.17)k.box(.018,1.94,.018,.79,1.3,z,0x7e9776,.002);
 for(let x=-.64;x<.77;x+=.17)k.box(.018,1.94,.018,x,1.3,-4.12,0x7e9776,.002);
 for(const y of [.7,1,1.3,1.6,1.9,2.2]){k.box(.018,.015,2.8,.79,y,-5.55,0x849c7d,.002);k.box(1.4,.015,.018,.05,y,-4.11,0x849c7d,.002);}
 for(const z of [-6.35,-5.35]){
  k.box(.92,.43,.58,.03,.87,z,0x718363,.035);k.box(.88,.055,.62,.03,1.1,z,0xa4ad83,.018);
  k.box(.14,.43,.62,.03,.87,z,0x4b624c,.008);k.box(.16,.1,.035,.03,.88,z+.315,0xcdb47c,.01);
  k.sphere(.21,-.26,1.48,z,0x738760,1,.65,1);k.sphere(.21,.25,1.48,z,0x8d9d76,1,.65,1);
 }
 label(group,'EQUIPMENT / SIGN OUT',1.4,.3,.04,2.13,-4.089,'#4d6750');
 softShadow(group,shade,.05,-5.55,2.4,3.7,.181);
 // A waiting cluster uses the right-hand wall while the four-metre central approach stays open.
 for(const z of [.2,1.15,2.1])chair(k,.43,z,-Math.PI/2);
 k.box(.08,1.65,.08,.9,1.05,-.7,0x68826b);k.box(.08,1.65,.08,.9,1.05,-2.1,0x68826b);
 k.box(.08,1.2,1.65,.9,1.58,-1.4,0xc4b994,.035);
 label(group,'VISITOR INFORMATION',1.45,.95,.84,1.61,-1.4,'#7f9474',-Math.PI/2,'ID REQUIRED / ESCORT REQUIRED');
 // Evacuation diagrams, clip charts and notice clusters make the inhabited wall legible.
 decal(group,1.35,.75,-10.2,1.72,-8.69,c=>{
  c.fillStyle='#e9e7cb';c.fillRect(0,0,512,256);c.fillStyle='#5b765c';c.font='bold 25px sans-serif';c.fillText('EMERGENCY ROUTE',20,35);
  c.strokeStyle='#91a782';c.lineWidth=12;c.strokeRect(42,61,400,157);c.beginPath();c.moveTo(155,61);c.lineTo(155,150);c.moveTo(280,61);c.lineTo(280,218);c.stroke();
  c.strokeStyle='#b77555';c.lineWidth=9;c.beginPath();c.moveTo(80,112);c.lineTo(200,112);c.lineTo(200,200);c.lineTo(442,200);c.stroke();c.fillStyle='#b77555';c.fillText('EXIT →',322,191);
 });
 for(const x of [-6,-5.4,-4.8]){
  k.box(.42,.6,.035,x,1.75,-8.67,0xe6e5c8,.015);k.box(.13,.07,.045,x,2.06,-8.64,0x758969,.01);
  for(let y=1.59;y<1.97;y+=.085)k.box(.29,.014,.02,x,y,-8.637,0x9baa86,.002);
 }
 // Short covered approach beyond the gate establishes the single onward route without adding a room.
 for(const z of [-5,-8.5])for(const x of [3,11])k.box(.09,2.75,.09,x,1.43,z,0x8d9e7a,.01);
 for(const z of [-5,-8.5])k.box(8.2,.12,1.08,7,2.85,z,0xa7b790,.03);
 for(let x=3.2;x<10.9;x+=.4)for(const z of [-5,-8.5])k.box(.025,.025,1.08,x,2.93,z,0x879b73,.002);
 for(const x of [2.4,11.55]){k.box(.56,.13,4.3,x,.1,-6.8,0xbfc9a3,.045);for(let z=-8.5;z<-4.8;z+=.6)k.sphere(.28,x,.39,z,z%1>.5?0x6f935b:0x8daa6c,1.15,.85,1.1);}
 // Checkpoint road: lane studs, barrier mechanism, striped arm, posts and security signage.
 for(const x of [3.1,10.9])k.box(.17,.11,23.8,x,.1,.5,0xd5d9b7,.02);
 for(let z=-9;z<12;z+=4)k.box(.15,.012,1.6,7,.057,z,0xece5bd,.001);
 for(const x of [4.8,6.1,7.4,8.7,10])k.box(.75,.015,1.9,x,.06,7.3,0xebe7c4,.002);
 for(const x of [3,11]){
  k.box(.38,3.6,.38,x,1.85,-2,colors.trim,.03);k.box(.55,.15,.55,x,3.73,-2,0xe9e5c9,.025);
  k.cyl(.09,.8,x,3.92,-2,0xe2d4ae);
 }
 k.box(8.2,.57,.25,7,3.4,-2,colors.trim,.04);
 label(group,'CAMP CHECKPOINT',7.5,.44,7,3.42,-1.856,'#405c46',0,'STOP • IDENTIFY • REPORT');
 k.box(.65,1.22,.6,3.3,.64,1.2,0xe1d8ba,.08);k.box(.37,.45,.07,3.3,.91,1.54,0x627961,.02);
 k.box(7.2,.15,.15,6.9,1.27,1.2,0xebead6,.025);
 for(let i=0;i<11;i++)k.box(.3,.155,.158,3.52+i*.63,1.27,1.2,0xb36e58,.001);
 for(const x of [2.5,11.6])for(let z=4.7;z<11;z+=2.2){k.cyl(.08,.76,x,.42,z,colors.trim);k.cyl(.081,.1,x,.68,z,0xd0c696);}
 // Fine wire perimeter fence, landscaped planting beds and drainage gratings.
 for(let z=-10;z<12;z+=1.5){k.cyl(.035,1.7,12,1,z,0x758d76);for(const y of [.6,1.5])k.box(.035,.045,1.5,12,y,z+.75,0x8aa386,.003);}
 for(let z=-10;z<12;z+=.24)k.box(.009,1.4,.012,12,1.04,z,0x9bac8d,.001);
 for(const z of [-10.7,11.8]){k.box(30,.12,.6,0,.06,z,0xb8c6a7,.06);for(let x=-14;x<14;x+=.3)k.box(.18,.016,.4,x,.128,z,0x607967,.002);}
 for(const [x,z]of [[-13.7,-9],[-13.7,2.5],[-11.8,10],[13.4,-9],[13.3,9]]){palm(k,x,z,.9);softShadow(group,shade,x,z,4.4,4.4);}
 for(let i=0;i<13;i++){const x=-12+i*.68;k.sphere(.48,x,.38,11.15,i%2?0x6b975c:0x86aa66,1,.72,1);if(i%3===0)k.sphere(.09,x,.72,11.1,0xd7b48a);}
 k.box(5.6,.14,2.8,-5.5,.1,8.9,0x8d967e,.1);plane(group,5.4,2.6,-5.5,8.9,.183,flooring('tiles'));
 for(const x of [-7.8,-3.2])k.box(.12,2.6,.12,x,1.43,9.8,colors.trim);
 k.box(5.9,.15,1.8,-5.5,2.76,9.8,0x8c9f81,.05);for(let x=-8.2;x<-2.8;x+=.35)k.box(.023,.025,1.8,x,2.85,9.8,0x6b8366,.002);
 label(group,'VISITORS WAIT HERE',2.8,.52,-5.5,1.9,9.73,'#647953');
 for(const x of [-7.5,-5.5,-3.5])chair(k,x,9.3,Math.PI);
 label(group,'NO UNAUTHORISED ENTRY',2.5,.75,11.25,1.7,4.1,'#a8795d',Math.PI/8);
 for(const x of [-.2,.4]){k.box(.06,1.22,.07,x,.76,4.1,colors.trim);k.box(.6,.64,.055,.1,1.12,4.1,0xd7c89f,.04);}
 label(group,'CHECK IN',.53,.5,.1,1.14,4.14,'#58755e');

 k.finish(group);
 return group;
}



