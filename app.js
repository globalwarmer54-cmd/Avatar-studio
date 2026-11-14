const $=s=>document.querySelector(s),cv=$('#cv'),cx=cv.getContext('2d');
let W=1280,H=720,port=0;
const A={};['head','body','legL','legR','armL','armR'].forEach(k=>{A[k]=new Image;A[k].src='assets/'+k+'.png';A[k].onload=()=>{show();strip()}});
// pose = [legL, legR, head, body, lift, armL, armR]
const P={stand:[0,0,0,0,0,4,-4],walk1:[22,-22,2,1,-6,-25,25],walk2:[-22,22,2,1,-6,25,-25],run1:[40,-40,-4,6,-14,-55,55],run2:[-40,40,-4,6,-14,55,-55],back1:[38,-38,-6,-10,-14,50,-50],back2:[-38,38,-6,-10,-14,-50,50],jump:[15,-10,-8,-3,-70,-150,150],shock:[0,0,-14,-4,-30,-120,120],wave:[0,0,8,-6,0,4,-150],wave2:[0,0,8,-6,0,4,-120],point:[0,0,-8,5,0,4,-85],shrug:[0,0,10,0,0,-35,35]};
const IC={img:'🖼',txt:'T',aud:'🔊',bg:'🎬'},CH=[['Head',2],['Body',3],['Arm L',5],['Arm R',6],['Leg L',0],['Leg R',1],['Lift',4]];
let F=[],C=[],cur=0,tool='move',onion=1,sel='av',rs=2,uid=1,timers=[],playing=0,exporting=0,fps=12,open='',mr=null,t0=0,c0=0;
const mk=()=>{const d=document.createElement('canvas');d.width=W;d.height=H;return d};
const cp=d=>{const n=mk();n.getContext('2d').drawImage(d,0,0);return n};
const newF=(s,b)=>s?{d:b?mk():cp(s.d),av:{...s.av,r:s.av.r&&[...s.av.r]}}:{d:mk(),av:{x:W*.3,y:H*.9,s:1,flip:0,pose:'stand',r:null}};
const getC=id=>C.find(c=>c.id==id),act=(c,i)=>i>=c.s&&i<c.s+c.l,vis=(t,i)=>C.filter(c=>c.t==t&&act(c,i));
const rot=(c,x,y,a)=>{c.translate(x,y);c.rotate(a*Math.PI/180);c.translate(-x,-y)};
function av(c,a){const p=a.r||P[a.pose]||P.stand;c.save();c.translate(a.x,a.y+p[4]*a.s);c.scale(a.s*.6*(a.flip?-1:1),a.s*.6);c.translate(-630,-905);
 const D=(k,x,y)=>c.drawImage(A[k],x,y);
 c.save();rot(c,600,680,p[5]);D('armL',520,672);c.restore();
 [['legL',545,775,600,780,p[0]],['legR',650,775,690,780,p[1]]].forEach(([k,x,y,px,py,r])=>{c.save();rot(c,px,py,r);D(k,x,y);c.restore()});
 c.save();rot(c,630,790,p[3]);D('body',540,630);c.save();rot(c,625,640,p[2]);D('head',409,355);c.restore();c.restore();
 c.save();rot(c,700,680,p[6]);D('armR',668,672);c.restore();c.restore()}
function alpha(c,i){let a=c.op??1;if(c.fi)a*=Math.min(1,(i-c.s+1)/c.fi);if(c.fo)a*=Math.min(1,(c.s+c.l-i)/c.fo);return a}
function dc(g,c,i){g.save();g.globalAlpha=alpha(c,i);
 if(c.t=='bg')try{g.drawImage(c.el,0,0,W,H)}catch(e){}
 else if(c.t=='img'){g.translate(c.x+c.w/2,c.y+c.h/2);g.rotate(c.rot*Math.PI/180);g.drawImage(c.el,-c.w/2,-c.h/2,c.w,c.h)}
 else{g.translate(c.x,c.y);g.rotate(c.rot*Math.PI/180);g.font=`bold ${c.h}px system-ui`;g.lineJoin='round';g.lineWidth=c.h/8;g.strokeStyle='#000';g.strokeText(c.txt,0,0);g.fillStyle=c.col;g.fillText(c.txt,0,0)}
 g.restore()}
function render(c=cx,i=cur,ghost=onion&&!playing&&!exporting){c.fillStyle='#f3ece1';c.fillRect(0,0,W,H);
 vis('bg',i).forEach(k=>dc(c,k,i));
 if(ghost&&i>0){c.globalAlpha=.25;av(c,F[i-1].av);c.drawImage(F[i-1].d,0,0);c.globalAlpha=1}
 vis('img',i).forEach(k=>dc(c,k,i));av(c,F[i].av);c.drawImage(F[i].d,0,0);vis('txt',i).forEach(k=>dc(c,k,i))}
function box(k){if(k=='av'){const a=F[cur].av;return[a.x-140*a.s,a.y-340*a.s,280*a.s,345*a.s]}const c=getC(k);if(!c||!act(c,cur))return;
 if(c.t=='img')return[c.x,c.y,c.w,c.h];if(c.t=='txt'){cx.font=`bold ${c.h}px system-ui`;return[c.x,c.y-c.h,cx.measureText(c.txt).width,c.h*1.25]}}
function show(){if(!F[cur])return;render();if(tool=='move'&&!playing&&!exporting){const b=box(sel);if(b){cx.save();cx.setLineDash([10,8]);cx.strokeStyle='#d98b4a';cx.lineWidth=3;cx.strokeRect(...b);cx.restore()}}}
function th(i){const t=$('#frames').children[i];if(!t)return;const c=t.getContext('2d');c.save();c.scale(t.width/W,t.height/H);render(c,i,false);c.restore()}
function strip(){const s=$('#frames');s.innerHTML='';F.forEach((f,i)=>{const t=document.createElement('canvas');t.width=W/6.5|0;t.height=H/6.5|0;t.onclick=()=>{if(!playing)go(i)};s.append(t);th(i)});go(cur)}
function go(i){cur=Math.max(0,Math.min(F.length-1,i));[...$('#frames').children].forEach((t,k)=>t.className=k==cur?'on':'');
 $('#frames').children[cur]?.scrollIntoView({inline:'center',block:'nearest'});$('#info').textContent=(cur+1)+'/'+F.length;show()}
// pointer
const pt=e=>{const r=cv.getBoundingClientRect();return[(e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height]};
let drag=0,last;
cv.onpointerdown=e=>{if(playing)return;cv.setPointerCapture(e.pointerId);const[x,y]=pt(e);last=[x,y];drag=1;
 if(tool=='move'){const ks=[...vis('txt',cur).map(c=>c.id).reverse(),'av',...vis('img',cur).map(c=>c.id).reverse()];
  const h=ks.find(k=>{const b=box(k);return b&&x>=b[0]&&x<=b[0]+b[2]&&y>=b[1]&&y<=b[1]+b[3]});if(h!==undefined)sel=h;show();if(open=='tl')sheet()}else stroke(x,y,x,y)};
cv.onpointermove=e=>{if(!drag)return;const[x,y]=pt(e);
 if(tool=='move'){const o=sel=='av'?F[cur].av:getC(sel);if(o){o.x+=x-last[0];o.y+=y-last[1]}show()}else{stroke(last[0],last[1],x,y);show()}last=[x,y]};
cv.onpointerup=()=>{if(drag){drag=0;th(cur)}};
function stroke(a,b,c,d){const g=F[cur].d.getContext('2d');g.lineCap=g.lineJoin='round';g.lineWidth=+$('#sz').value*(tool=='erase'?3:1);
 g.globalCompositeOperation=tool=='erase'?'destination-out':'source-over';g.strokeStyle=$('#col').value;g.beginPath();g.moveTo(a,b);g.lineTo(c+.01,d);g.stroke();g.globalCompositeOperation='source-over'}
document.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{tool=b.dataset.t;document.querySelectorAll('[data-t]').forEach(x=>x.classList.toggle('on',x==b));show()});
$('#onion').onclick=e=>{onion=!onion;e.target.classList.toggle('on',onion);show()};
$('#fps').onchange=e=>fps=+e.target.value;
// orientation
$('#ori').onclick=()=>{port=!port;const ow=W,oh=H;W=port?720:1280;H=port?1280:720;cv.width=W;cv.height=H;const k=Math.min(W/ow,H/oh);
 F.forEach(f=>{const o=f.d,n=mk();n.getContext('2d').drawImage(o,(W-ow*k)/2,(H-oh*k)/2,ow*k,oh*k);f.d=n;f.av.x=W/2+(f.av.x-ow/2)*k;f.av.y=H/2+(f.av.y-oh/2)*k;f.av.s*=k});
 C.forEach(c=>{if(c.t=='bg')return;c.x=W/2+(c.x-ow/2)*k;c.y=H/2+(c.y-oh/2)*k;c.h*=k;if(c.w)c.w*=k});
 $('#stage').className=port?'port':'';strip()};
// frames
$('#add').onclick=()=>{F.splice(cur+1,0,newF(F[cur],1));cur++;strip()};
$('#dup').onclick=()=>{F.splice(cur+1,0,newF(F[cur]));cur++;strip()};
$('#hold').onclick=()=>{for(let k=0;k<10;k++)F.splice(cur+1,0,newF(F[cur]));strip()};
$('#del').onclick=()=>{if(F.length>1){F.splice(cur,1);cur=Math.min(cur,F.length-1);strip()}};
function auto(ps,dx,n,flip){let f=F[cur];for(let k=0;k<n;k++){const g=newF(f,1);g.av.pose=ps[k%ps.length];g.av.r=null;g.av.x+=dx;if(flip!=null)g.av.flip=flip;F.splice(cur+1,0,g);cur++;f=g}strip()}
function fit(){const m=Math.max(0,...C.map(c=>c.s+c.l));if(m>F.length){while(F.length<m)F.push(newF(F[F.length-1],1));strip()}}
function addC(c){c.id=uid++;c.s=cur;c.l=c.l||Math.max(12,F.length-cur);c.fi=c.fi||0;c.fo=c.fo||0;c.op=1;c.rot=c.rot||0;C.push(c);sel=c.id;fit();th(cur);if(open=='media')open='tl';sheet();show()}
function addAud(name,url,dur){const el=new Audio(url),c={t:'aud',name,url,el,vol:1,rate:1,off:0,l:Math.ceil((dur||5)*fps)};
 if(!dur)el.onloadedmetadata=()=>{if(isFinite(el.duration)){c.l=Math.ceil(el.duration*fps);fit();sheet()}};addC(c)}
function pick(acc,cb,multi){const i=document.createElement('input');i.type='file';i.accept=acc;i.multiple=!!multi;i.onchange=()=>[...i.files].forEach(cb);i.click()}
// sheets
document.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{open=open==b.dataset.s?'':b.dataset.s;sheet()});
const lab=(t,k,mn,mx,v,st=1)=>`<label>${t}<input type="range" data-k="${k}" min="${mn}" max="${mx}" step="${st}" value="${v}"></label>`;
function sheet(){const sh=$('#sheet');sh.hidden=!open;if(!open)return;const f=F[cur];let h='';
 if(open=='pose')h=Object.keys(P).map(k=>`<button data-p="${k}">${k}</button>`).join('')+`<hr><button data-a="walk">Walk →</button><button data-a="run">Run →</button><button data-a="back">Run back ←</button><button data-a="scare">Scare!</button><button data-a="wave">Wave hi</button><button data-a="flip">Flip</button>`;
 if(open=='rig'){const r=f.av.r||P[f.av.pose]||P.stand;h=CH.map(([n,i])=>`<button data-r="${i}" class="${i==rs?'on':''}">${n}</button>`).join('')+`<label>${rs==4?'Lift':'Angle'}<input type="range" id="rg" min="${rs==4?-150:-180}" max="${rs==4?30:180}" value="${r[rs]}"></label><label>Size<input type="range" id="asz" min=".4" max="2" step=".05" value="${f.av.s}"></label><button data-a="reset">Reset pose</button><button data-a="flip">Flip</button>`}
 if(open=='media')h=`<button data-m="bg" class="pri">+ Scene (image/video)</button><button data-m="img">+ Image / sticker</button><button data-m="txt">+ Text</button>`;
 if(open=='audio')h=`<button data-o="vo" class="pri">${mr?'■ Stop':'🎙 Record voiceover'}</button><button data-o="mus">+ Music / sound effect</button>`;
 if(open=='tl'){const n=F.length,c=getC(sel);h=`<div id="tl">${C.map(c=>`<div class="r${c.id==sel?' on':''}" data-c="${c.id}"><span>${IC[c.t]} ${c.name||c.txt||'clip'}</span><i style="left:${c.s/n*100}%;width:${Math.max(2,c.l/n*100)}%"></i></div>`).join('')||'<small>&nbsp;Add scenes, images, text or audio — they appear here.</small>'}<b id="ph" style="left:${cur/n*100}%"></b></div>`;
  if(c){h+=lab('Start','s',0,n-1,c.s)+lab('Length','l',1,Math.max(n,c.l),c.l)+(c.t=='aud'?lab('Volume','vol',0,1,c.vol,.05)+lab('Speed','rate',.5,2,c.rate,.1):lab('Opacity','op',0,1,c.op,.05)+lab('Fade in','fi',0,24,c.fi)+lab('Fade out','fo',0,24,c.fo));
   if(c.t=='img')h+=lab('Size','w',40,W,c.w)+lab('Rotate','rot',-180,180,c.rot);if(c.t=='txt')h+=lab('Size','h',20,300,c.h)+lab('Rotate','rot',-180,180,c.rot)+`<button data-a="txt">Edit text</button>`;
   h+=`<button data-a="split">✂ Split</button><button data-a="cdel">Delete clip</button>`}h+=`<button data-a="fit">Fit frames</button>`}
 sh.innerHTML=h}
$('#sheet').oninput=e=>{const t=e.target,f=F[cur],v=+t.value;
 if(t.id=='asz'){f.av.s=v;show();th(cur)}
 if(t.id=='rg'){f.av.r=f.av.r||[...(P[f.av.pose]||P.stand)];f.av.r[rs]=v;show();th(cur)}
 const k=t.dataset.k,c=getC(sel);if(k&&c){if(k=='w'){c.h=c.h*v/c.w}c[k]=v;if(k=='vol')c.el.volume=v;if(k=='rate')c.el.playbackRate=v;
  if(k=='s'||k=='l'){const i=$('#tl .on i'),n=F.length;i.style.left=c.s/n*100+'%';i.style.width=Math.max(2,c.l/n*100)+'%'}show();th(cur)}};
$('#sheet').onclick=e=>{const b=e.target.closest('button,.r');if(!b)return;const d=b.dataset,f=F[cur];
 if(d.p){f.av.pose=d.p;f.av.r=null;show();th(cur)}
 if(d.r){rs=+d.r;sheet()}
 if(d.c){sel=+d.c;sheet();show()}
 const a=d.a;if(a=='walk')auto(['walk1','stand','walk2','stand'],16,12,0);if(a=='run')auto(['run1','run2'],42,10,0);if(a=='back')auto(['back1','back2'],-46,12,0);
 if(a=='scare')auto(['shock','shock','jump','stand'],0,4);if(a=='wave')auto(['wave','wave2','wave','wave2','stand'],0,5);
 if(a=='flip'){f.av.flip=!f.av.flip;show();th(cur)}if(a=='reset'){f.av.r=null;f.av.pose='stand';sheet();show();th(cur)}
 if(a=='fit')fit();
 const c=getC(sel);
 if(a=='cdel'&&c){C=C.filter(x=>x!=c);c.el&&c.el.pause&&c.el.pause();sel='av';sheet();show();th(cur)}
 if(a=='split'&&c&&cur>c.s&&cur<c.s+c.l){const n={...c,id:uid++,s:cur,l:c.s+c.l-cur};if(c.t=='aud'){n.off=c.off+(cur-c.s)/fps*c.rate;n.el=new Audio(c.url);n.el.volume=c.vol;n.el.playbackRate=c.rate}c.l=cur-c.s;C.splice(C.indexOf(c)+1,0,n);sel=n.id;sheet();show();th(cur)}
 if(a=='txt'&&c){const t=prompt('Text',c.txt);if(t){c.txt=t;show();th(cur);sheet()}}
 if(d.m=='bg')pick('image/*,video/*',x=>{const u=URL.createObjectURL(x);if(x.type.startsWith('video')){const v=document.createElement('video');v.src=u;v.loop=v.muted=v.playsInline=true;v.play();addC({t:'bg',name:x.name.slice(0,16),el:v})}else{const i=new Image;i.onload=()=>addC({t:'bg',name:x.name.slice(0,16),el:i});i.src=u}});
 if(d.m=='img')pick('image/*',x=>{const u=URL.createObjectURL(x),i=new Image;i.onload=()=>{const w=Math.min(400,W*.5);addC({t:'img',name:x.name.slice(0,16),el:i,x:(W-w)/2,y:H*.15,w,h:w*i.naturalHeight/i.naturalWidth})};i.src=u},1);
 if(d.m=='txt'){const t=prompt('Text');if(t)addC({t:'txt',txt:t,x:W*.1,y:H*.2,h:Math.round(Math.min(W,H)/8),col:'#ffffff'})}
 if(d.o=='mus')pick('audio/*',x=>addAud(x.name.slice(0,16),URL.createObjectURL(x)));if(d.o=='vo')vo()}
async function vo(){if(mr){mr.stop();return}
 try{const s=await navigator.mediaDevices.getUserMedia({audio:true}),ch=[],m=mr=new MediaRecorder(s),st=performance.now(),at=cur;
  m.ondataavailable=e=>ch.push(e.data);m.onstop=()=>{const dur=(performance.now()-st)/1000;s.getTracks().forEach(t=>t.stop());mr=null;stop();cur=at;go(at);addAud('Voice',URL.createObjectURL(new Blob(ch,{type:ch[0].type})),dur)};
  m.start();play()}catch(e){alert('Microphone permission needed')}sheet()}
// playback
function sched(L,from){L.forEach(([c,e])=>{if(c.s+c.l<=from)return;let dl=(c.s-from)/fps*1000,off=c.off;if(dl<0){off+=-dl/1000*c.rate;dl=0}e.playbackRate=c.rate;
 timers.push(setTimeout(()=>{e.currentTime=off;e.play()},dl),setTimeout(()=>e.pause(),(c.s+c.l-from)/fps*1000))})}
function play(){if(playing){stop();return}playing=1;$('#play').textContent='⏸';c0=cur>=F.length-1?0:cur;cur=c0;t0=performance.now();
 C.forEach(c=>{if(c.t=='bg'&&c.el.play)c.el.play();if(c.t=='aud')c.el.volume=c.vol});sched(C.filter(c=>c.t=='aud').map(c=>[c,c.el]),c0);tick()}
function tick(){if(!playing)return;const i=c0+Math.floor((performance.now()-t0)*fps/1000);if(i>=F.length){stop();return}
 if(i!=cur){cur=i;$('#info').textContent=(cur+1)+'/'+F.length}render();requestAnimationFrame(tick)}
function stop(){playing=0;$('#play').textContent='▶';timers.forEach(clearTimeout);timers=[];C.forEach(c=>c.t=='aud'&&c.el.pause());if(mr&&mr.state!='inactive')mr.stop();go(cur)}
$('#play').onclick=play;
setInterval(()=>{if(!playing&&!exporting&&C.some(c=>c.t=='bg'&&c.el.tagName=='VIDEO'))show()},100);
// export
$('#exp').onclick=async()=>{if(playing)stop();exporting=1;const keep=cur,ac=new AudioContext();await ac.resume();const dst=ac.createMediaStreamDestination();
 const L=C.filter(c=>c.t=='aud').map(c=>{const e=new Audio(c.url),g=ac.createGain();g.gain.value=c.vol;ac.createMediaElementSource(e).connect(g).connect(dst);return[c,e]});
 const s=cv.captureStream(fps);dst.stream.getAudioTracks().forEach(a=>s.addTrack(a));
 const mt=MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')?'video/webm;codecs=vp9,opus':'video/webm',ch=[],m=new MediaRecorder(s,{mimeType:mt});
 m.ondataavailable=e=>ch.push(e.data);
 m.onstop=async()=>{exporting=0;cur=keep;go(cur);const bl=new Blob(ch,{type:'video/webm'}),K=window.Capacitor;
  if(K&&K.isNativePlatform&&K.isNativePlatform()){try{const b64=await new Promise(r=>{const fr=new FileReader;fr.onload=()=>r(fr.result.split(',')[1]);fr.readAsDataURL(bl)});
   const o=await K.Plugins.Filesystem.writeFile({path:'AvatarStudio/animation-'+Date.now()+'.webm',data:b64,directory:'DOCUMENTS',recursive:true});
   await K.Plugins.Share.share({title:'My animation',url:o.uri})}catch(e){alert('Save failed: '+e.message)}}
  else{const a=document.createElement('a');a.href=URL.createObjectURL(bl);a.download='animation.webm';a.click()}};
 C.forEach(c=>c.t=='bg'&&c.el.play&&c.el.play());
 const st=performance.now();m.start();sched(L,0);
 (function R(){const i=Math.floor((performance.now()-st)*fps/1000);if(i>=F.length){m.stop();timers.forEach(clearTimeout);timers=[];L.forEach(([,e])=>e.pause());return}cur=i;render();requestAnimationFrame(R)})()};
F=[newF()];strip();
