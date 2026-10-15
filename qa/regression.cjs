const fs=require('fs'),vm=require('vm'),assert=require('assert');
const read=f=>fs.readFileSync('dist/'+f,'utf8');
const list=()=>({add(){},remove(){},toggle(){}});
const style=()=>({setProperty(k,v){this[k]=v;}});
class Observer{constructor(cb){this.cb=cb;}observe(){}disconnect(){}unobserve(){}}
function node(){return {dataset:{},style:style(),classList:list(),isConnected:true,handlers:{},addEventListener(k,v){this.handlers[k]=v;},setAttribute(k,v){this[k]=v;},remove(){this.isConnected=false;}};}
function data(name,file){const context={window:{}};vm.runInNewContext(read(file),context);return context.window[name];}
const projects=data('WORK_PAGE_PROJECTS','work-page-data.js');
assert.equal(projects.length,17);
assert.equal(projects[0].slug,'grand-minaro');
assert(!projects.some(p=>/COVID Updates|Electronic Appliance|Movie Ticket/.test(p.name)));
for(const p of projects)for(const url of [p.caseUrl,p.liveUrl])if(url?.startsWith('/'))assert(fs.existsSync('dist'+url+'index.html'));
function filters(){
 const cards=projects.map(p=>Object.assign(node(),{dataset:{category:p.tags.join('|')}}));
 const buttons=['All','UX/UI','Web','Mobile App','Visual Design','Branding'].map(filter=>Object.assign(node(),{dataset:{workFilter:filter}}));
 const count={},title={},image={};const close=node(),dialog=node();dialog.querySelector=s=>s==='h2'?title:s==='img'?image:close;
 const page=node();page.querySelector=s=>s==='dialog'?dialog:count;page.querySelectorAll=s=>s==='[data-work-project]'?cards:s==='[data-work-filter]'?buttons:[];
 const document={body:{style:{}},querySelectorAll:()=>[page],getElementById:()=>page};
 vm.runInNewContext(read('work-page.js'),{window:{WORK_PAGE_PROJECTS:projects},document,matchMedia:()=>({matches:true}),MutationObserver:Observer});
 for(const button of buttons){button.handlers.click();const expected=button.dataset.workFilter==='All'?17:projects.filter(p=>p.tags.includes(button.dataset.workFilter)).length;assert.equal(count.textContent,expected);assert.equal(cards.filter(c=>!c.hidden).length,expected);assert.equal(button['aria-pressed'],'true');}
}
async function hero(kind,reduced=false){
 let top=0;const queue=[],events={};const hero=node(),track=node(),visual=node();hero.offsetHeight=800;track.getBoundingClientRect=()=>({top});hero.closest=()=>track;
 hero.hasAttribute=s=>s===`data-${kind}-motion`;hero.querySelector=()=>visual;
 const layers=[];visual.appendChild=img=>layers.push(img);
 const media={matches:reduced,addEventListener(){},removeEventListener(){}};
 const document={body:node(),querySelectorAll:()=>[hero],getElementById:()=>node()};
 class Image{constructor(){Object.assign(this,node());}decode(){return Promise.resolve();}}
 vm.runInNewContext(read('hero-motion.js'),{document,window:{},matchMedia:()=>media,innerHeight:800,Image,ResizeObserver:Observer,MutationObserver:Observer,addEventListener:(k,v)=>events[k]=v,removeEventListener(){},requestAnimationFrame:cb=>{queue.push(cb);return queue.length;},cancelAnimationFrame(){}});
 await new Promise(r=>setImmediate(r));
 assert.equal(layers.length,reduced?0:kind==='about'?3:4);
 for(const layer of layers){assert.equal(Number(layer.style.opacity),0);assert(fs.existsSync('dist'+layer.src));}
 if(!reduced){assert.equal(track.style['--hero-blur-travel'],'760px');assert.equal(track.style['--hero-pin-top'],'0px');
 let time=0;function flush(){for(let i=0;i<300&&queue.length;i++){time+=16;queue.shift()(time);}}
 flush();top=-760;events.scroll();flush();for(const layer of layers)assert.equal(Number(layer.style.opacity),1);
 top=0;events.scroll();flush();for(const layer of layers)assert.equal(Number(layer.style.opacity),0);
 }

}
(async()=>{filters();for(const kind of ['about','work','home']){await hero(kind);await hero(kind,true);}console.log('Passed: project inventory, six Work filters, and all three hero configurations with reduced-motion modes.');})().catch(e=>{console.error(e);process.exit(1);});
