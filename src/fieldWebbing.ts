import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

type V=[number,number,number];
export interface WebbingRecipe {
 add(geo:THREE.BufferGeometry,colour:number,p?:V,s?:V,r?:V,camouflage?:boolean):unknown;
 box(p:V,s:V,c:number,r?:V):unknown;
 rod(a:V,b:V,r:number,c:number):unknown;
 ellipsoid(p:V,s:V,c:number):unknown;
 round(p:V,s:V,c:number,r?:V,camo?:boolean):unknown;
}
/**
 * Fitted field gear based on the user's supplied vest photograph.
 * +Z is front. Camouflaged fabric panels use the character's shared fabric atlas.
 */
export function addFieldWebbing(b:WebbingRecipe):void {
 const mesh=0x6b7956,web=0x526448,edge=0x798568,hardware=0x354236;
 const cloth=(p:V,s:V,round=.014,rotation:V=[0,0,0])=>
  b.add(new RoundedBoxGeometry(...s,3,Math.min(round,Math.min(...s)/3)),0xffffff,p,[1,1,1],rotation,true);
 // Olive mesh follows the torso, with camouflaged panels above rather than a solid armour slab.
 b.round([0,.539,.137],[.169,.241,.03],mesh);
 b.round([0,.532,-.124],[.159,.231,.026],mesh);
 cloth([0,.543,.163],[.281,.214,.014],.006);
 cloth([0,.534,-.151],[.272,.202,.012],.005);
 // A deliberate shirt gap separates vest bottom from the padded waist belt.
 b.round([0,.371,.137],[.136,.054,.009],0x778267);
 // Broad soft shoulder straps bridge front and rear, and have visible sewn edging.
 for(const side of [-1,1]){
  const x=side*.121;
  b.add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
   new THREE.Vector3(x,.613,.16),new THREE.Vector3(x,.671,.096),
   new THREE.Vector3(x,.68,-.024),new THREE.Vector3(x,.623,-.144)
  ]),16,.019,8,false),web);
  cloth([x,.647,.115],[.044,.081,.012],.004,[side*-.18,0,side*.1]);
  b.rod([x-side*.014,.629,.133],[x-side*.014,.674,.078],.0028,edge);
  b.box([x,.628,.153],[.042,.012,.012],0x697854);
 }
 // Upper-chest ladder MOLLE: three horizontal webbing rows and small vertical stitch breaks.
 for(const y of [.561,.588,.615]){
  for(const x of [-.104,0,.104]){
   b.box([x,y,.177],[.095,.012,.008],web);
   for(const dx of [-.039,.039])b.box([x+dx,y,.183],[.004,.013,.003],edge);
  }
 }
 // Side mesh buckles cinch the carrier to the ribcage.
 for(const side of [-1,1]){
  b.box([side*.164,.473,.073],[.018,.042,.057],web,[0,0,side*.08]);
  b.box([side*.178,.474,.078],[.009,.026,.025],hardware);
 }
 // Two front magazine pouches have softly bulged bodies, curved folded flaps and narrow straps.
 for(const side of [-1,1]){
  const x=side*.074;
  cloth([x,.468,.18],[.129,.143,.051],.014,[0,0,side*.015]);
  // Rounded drop flap is a shallow shield shape, folded over the pouch's upper rim.
  const flap=new THREE.Shape();
  flap.moveTo(-.061,.022);flap.lineTo(.061,.022);flap.lineTo(.058,-.024);
  flap.quadraticCurveTo(.054,-.046,.03,-.05);flap.quadraticCurveTo(0,-.057,-.03,-.05);
  flap.quadraticCurveTo(-.054,-.046,-.058,-.024);flap.closePath();
  b.add(new THREE.ExtrudeGeometry(flap,{depth:.008,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.003,bevelThickness:.002}),0xffffff,[x,.515,.205],[1,1,1],[0,0,side*.025],true);
  b.rod([x-.056,.536,.205],[x+.056,.536,.205],.0038,edge);
  b.box([x,.481,.214],[.014,.06,.006],web,[0,0,side*.05]);
  b.box([x,.467,.218],[.025,.023,.004],0x69775b);
  b.box([x,.467,.221],[.011,.008,.002],hardware);
  b.rod([x-.05,.404,.198],[x+.05,.404,.198],.0025,edge);
 }
 // Radio sits high on the wearer's right chest, in a camouflaged pouch with exposed top and antenna.
 cloth([.142,.619,.181],[.078,.103,.045],.011,[0,0,-.035]);
 b.box([.142,.678,.178],[.056,.034,.028],hardware);
 b.box([.156,.689,.196],[.024,.009,.013],0x6e7e59);
 b.rod([.161,.69,.171],[.165,.796,.177],.0038,0x354133);
 b.ellipsoid([.131,.697,.177],[.006,.008,.006],0x53664c);
 b.box([.142,.611,.206],[.014,.048,.006],web);
 b.box([.142,.594,.211],[.022,.02,.005],0x627453);
 b.add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
  new THREE.Vector3(.125,.677,.199),new THREE.Vector3(.088,.63,.196),
  new THREE.Vector3(.027,.57,.198),new THREE.Vector3(.035,.538,.204)
 ]),18,.0035,6,false),0x3d4d38);
 // The padded digital-camouflage belt wraps the waist with a small black central buckle.
 cloth([0,.32,.124],[.33,.051,.027],.008);
 cloth([0,.319,-.115],[.323,.05,.025],.008);
 for(const side of [-1,1])cloth([side*.166,.32,.005],[.035,.051,.222],.01);
 b.box([0,.32,.142],[.255,.019,.005],web);
 b.box([0,.32,.15],[.043,.033,.009],0x29312b);
 b.box([.007,.32,.156],[.009,.014,.003],0x414b3c);
 // Low utility pouches hang from the padded belt, with individual fold-over flaps and buckles.
 for(const side of [-1,1]){
  cloth([side*.189,.28,.044],[.078,.114,.089],.016,[0,0,side*.05]);
  cloth([side*.193,.307,.087],[.081,.047,.012],.01,[0,0,side*.04]);
  b.box([side*.193,.28,.097],[.014,.042,.006],web);
  b.box([side*.193,.264,.102],[.024,.024,.005],0x69795b);
  b.box([side*.169,.333,.056],[.023,.024,.025],web);
 }
}
