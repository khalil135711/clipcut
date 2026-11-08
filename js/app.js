const $=i=>document.getElementById(i),cv=$('cv'),cx=cv.getContext('2d'),PPS=40;
let clips=[],texts=[],sel=-1,t=0,playing=false,rec=null,ac,dest;
const dur=c=>(c.end-c.start)/c.sp,total=()=>clips.reduce((a,c)=>a+dur(c),0);
const offs=i=>{let s=0;for(let k=0;k<i;k++)s+=dur(clips[k]);return s};
const at=x=>{let s=0;for(let i=0;i<clips.length;i++){const d=dur(clips[i]);if(x<s+d||i==clips.length-1)return i;s+=d}return -1};
const fmt=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
function mk(url,name,start,end){const v=document.createElement('video');v.src=url;v.preload='auto';v.playsInline=true;
 try{ac=ac||new AudioContext();dest=dest||ac.createMediaStreamDestination();const s=ac.createMediaElementSource(v);s.connect(ac.destination);s.connect(dest)}catch(e){}
 const c={url,name,v,start:start||0,end:end||0,sp:1,fl:'none',max:0};
 v.onloadedmetadata=()=>{c.max=v.duration;if(!c.end)c.end=v.duration;if(sel<0)sel=0;render();draw()};return c}
$('f').onchange=e=>{[...e.target.files].forEach(f=>clips.push(mk(URL.createObjectURL(f),f.name)));sel=sel<0?0:sel;e.target.value='';if(ac)ac.resume()};
function draw(){cx.fillStyle='#000';cx.fillRect(0,0,1280,720);const i=at(t);
 if(i>=0){const c=clips[i],v=c.v;if(v.videoWidth){const r=Math.min(1280/v.videoWidth,720/v.videoHeight),w=v.videoWidth*r,h=v.videoHeight*r;cx.filter=c.fl;cx.drawImage(v,(1280-w)/2,(720-h)/2,w,h);cx.filter='none'}}
 texts.forEach(x=>{if(t>=x.at&&t<x.at+x.d){cx.font='bold 56px system-ui,sans-serif';cx.textAlign='center';cx.lineWidth=8;cx.strokeStyle='#000';cx.fillStyle='#fff';cx.strokeText(x.s,640,640);cx.fillText(x.s,640,640)}})}
function seek(x){t=Math.max(0,Math.min(x,total()));const i=at(t);clips.forEach(c=>c.v.pause());if(i>=0){const c=clips[i];c.v.currentTime=c.start+(t-offs(i))*c.sp;c.v.onseeked=draw}draw();ui()}
function toggle(){playing?pause():play()}
function play(){if(!clips.length)return;if(ac)ac.resume();if(t>=total()-.05)seek(0);playing=true;$('pl').textContent='⏸ Pause'}
function pause(){playing=false;clips.forEach(c=>c.v.pause());$('pl').textContent='▶ Play'}
function tick(){if(playing){const i=at(t),c=clips[i],v=c.v;
 if(v.paused){v.playbackRate=c.sp;v.play().catch(()=>{})}
 if(v.currentTime>=c.end-.03){v.pause();if(i==clips.length-1){pause();t=total();if(rec){rec.stop();rec=null}}else{t=offs(i+1);clips[i+1].v.currentTime=clips[i+1].start}}
 else t=offs(i)+(v.currentTime-c.start)/c.sp;
 draw();ui()}requestAnimationFrame(tick)}
function ui(){$('tm').textContent=fmt(t)+' / '+fmt(total());$('ph').style.left=t*PPS+'px'}
function render(){const n=$('in');n.innerHTML='<div id="ph"></div>';n.style.width=Math.max(total(),10)*PPS+'px';
 for(let s=0;s<=Math.max(total(),10);s+=2){const k=document.createElement('span');k.className='tk';k.style.left=s*PPS+2+'px';k.textContent=fmt(s);n.appendChild(k)}
 clips.forEach((c,i)=>{const b=document.createElement('div');b.className='blk'+(i==sel?' s':'');b.style.left=offs(i)*PPS+'px';b.style.width=dur(c)*PPS+'px';b.textContent=c.name;b.onclick=e=>{e.stopPropagation();sel=i;render();seek(offs(i)+0.001)};n.appendChild(b)});
 texts.forEach(x=>{const b=document.createElement('div');b.className='txb';b.style.left=x.at*PPS+'px';b.style.width=x.d*PPS+'px';b.textContent=x.s;n.appendChild(b)});
 const c=clips[sel];['ts','te','sp','fl'].forEach(k=>$(k).disabled=!c);
 if(c){$('ts').max=$('te').max=c.max;$('ts').value=c.start;$('te').value=c.end;$('sp').value=c.sp;$('fl').value=c.fl;$('a1').textContent=c.start.toFixed(1)+'s';$('a2').textContent=c.end.toFixed(1)+'s'}
 $('tx').innerHTML=texts.map((x,i)=>`<div class="tl2"><span>${x.s.replace(/</g,'&lt;')} <span class="mu">@${x.at.toFixed(1)}s</span></span><button onclick="texts.splice(${i},1);render();draw()">✕</button></div>`).join('');
 $('hint').style.display=clips.length?'none':'block';ui()}
$('ts').oninput=e=>{const c=clips[sel];c.start=Math.min(+e.target.value,c.end-.1);render();seek(offs(sel))};
$('te').oninput=e=>{const c=clips[sel];c.end=Math.max(+e.target.value,c.start+.1);render();seek(offs(sel)+dur(c)-.05)};
$('sp').onchange=e=>{clips[sel].sp=+e.target.value;render()};
$('fl').onchange=e=>{clips[sel].fl=e.target.value;draw()};
$('tl').onclick=e=>{const r=$('in').getBoundingClientRect();seek((e.clientX-r.left)/PPS)};
function split(){if(sel<0)return;const i=at(t),c=clips[i],p=c.start+(t-offs(i))*c.sp;if(p<=c.start+.1||p>=c.end-.1)return;
 const n=mk(c.url,c.name,p,c.end);n.sp=c.sp;n.fl=c.fl;n.max=c.max;c.end=p;clips.splice(i+1,0,n);sel=i;render()}
function del(){if(sel<0)return;pause();clips.splice(sel,1);sel=clips.length?Math.min(sel,clips.length-1):-1;render();seek(0)}
function mv(d){const j=sel+d;if(sel<0||j<0||j>=clips.length)return;[clips[sel],clips[j]]=[clips[j],clips[sel]];sel=j;render();draw()}
function addT(){const s=$('tt').value.trim();if(!s)return;texts.push({s,at:t,d:+$('td').value||3});$('tt').value='';render();draw()}
function exportV(){if(!clips.length)return;if(ac)ac.resume();seek(0);const cs=cv.captureStream(30);
 if(dest)dest.stream.getAudioTracks().forEach(k=>cs.addTrack(k));
 const mt=['video/webm;codecs=vp9,opus','video/webm'].find(m=>MediaRecorder.isTypeSupported(m));const ch=[];
 rec=new MediaRecorder(cs,{mimeType:mt});rec.ondataavailable=e=>e.data.size&&ch.push(e.data);
 rec.onstop=()=>{$('rv').src=URL.createObjectURL(new Blob(ch,{type:'video/webm'}));$('dg').showModal();$('ex').textContent='Export'};
 rec.start();$('ex').textContent='Exporting…';setTimeout(play,300)}
render();tick();
