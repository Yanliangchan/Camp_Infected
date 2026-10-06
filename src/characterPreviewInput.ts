import type {CharacterMotion} from './characters';

/** Preview-only controls; they never start a game or send network input. */
export class CharacterPreviewInput {
  private keys=new Set<string>();
  private lastW=-Infinity;
  private sprint=false;
  setKey(code:string,down:boolean,time:number):void {
    if(down){
      if(this.keys.has(code))return;
      if(code==='KeyW'){this.sprint=time-this.lastW<=300;this.lastW=time;}
      this.keys.add(code);
    }else{this.keys.delete(code);if(code==='KeyW')this.sprint=false;}
  }
  get active():boolean{return this.keys.size>0;}
  get motion():CharacterMotion {
    const moving=['KeyW','KeyA','KeyS','KeyD'].some(key=>this.keys.has(key));
    if(!moving)return 'idle';
    if(this.keys.has('ShiftLeft')||this.keys.has('ShiftRight'))return 'crawl';
    return this.sprint&&this.keys.has('KeyW')?'sprint':'walk';
  }
  reset():void{this.keys.clear();this.sprint=false;this.lastW=-Infinity;}
}
