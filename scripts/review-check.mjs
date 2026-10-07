import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
const page=await browser.newPage({viewport:{width:1440,height:900}});const errors=[];page.on('pageerror',e=>errors.push(String(e)));
await page.goto('http://127.0.0.1:5173/review.html');
await page.getByRole('button',{name:'First room'}).click();
await page.waitForFunction(()=>Number(document.querySelector('#review-app').dataset.ambientTime)>.15,{},{timeout:90000});
await page.getByRole('button',{name:'Ambient animation: on'}).click();
await page.getByRole('button',{name:'Pass counter',exact:true}).click();
await page.screenshot({path:'artifacts/review-map.png'});
await page.getByRole('button',{name:'Soldier',exact:false}).click();
await page.getByRole('button',{name:'Walk',exact:true}).click();
await page.waitForFunction(()=>document.querySelector('#review-app').dataset.motion==='walk');
await page.screenshot({path:'artifacts/review-soldier.png'});
await page.emulateMedia({reducedMotion:'reduce'});
await page.getByRole('button',{name:'First room'}).click();
assert.equal(await page.getByRole('button',{name:'Ambient animation: off'}).getAttribute('aria-pressed'),'false');
assert.deepEqual(errors,[]);console.log('Inspector model, animation, map controls and reduced-motion checks passed');
}finally{await browser.close();}
