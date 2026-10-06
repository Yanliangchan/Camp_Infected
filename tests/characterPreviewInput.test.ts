import {describe,it,expect} from 'vitest';
import {CharacterPreviewInput} from '../src/characterPreviewInput';
describe('character preview controls',()=>{
  it('requires two separate W presses, rather than keyboard repeat, to sprint',()=>{
    const input=new CharacterPreviewInput();input.setKey('KeyW',true,100);
    input.setKey('KeyW',true,160);expect(input.motion).toBe('walk');
    input.setKey('KeyW',false,180);input.setKey('KeyW',true,240);
    expect(input.motion).toBe('sprint');input.setKey('KeyW',false,260);expect(input.motion).toBe('idle');
    input.setKey('KeyW',true,800);expect(input.motion).toBe('walk');
  });
  it('crawls with either shift key and movement, overriding sprint, and resets on blur',()=>{
    const input=new CharacterPreviewInput();input.setKey('KeyD',true,0);
    input.setKey('ShiftRight',true,1);expect(input.motion).toBe('crawl');
    input.setKey('KeyD',false,2);expect(input.motion).toBe('idle');
    input.reset();expect(input.active).toBe(false);
  });
});
