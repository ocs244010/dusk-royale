// ---------- online play: one player hosts the match, up to 3 friends join by room code ----------
// The host runs the whole world (bots, loot, zone, doors) and sends snapshots; each player moves and aims their own soldier
// and reports it, so the feel stays local. Damage to a player is applied on that player's machine.
const NET={noCpu:false,on:false,host:false,client:false,peer:null,conn:null,conns:[],lobby:[],name:'',myI:0,nid:0,live:false,done:false,
  applying:false,noKill:false,fx:null,hold:{},sT:0,pT:0,invT:0,wsT:0,lastWS:'',byI:[],code:''};
const NETPFX='dusk-sf-',NETVER='44';
const r2=v=>Math.round(v*100)/100;
function peerOpts(){const q=new URLSearchParams(location.search),ps=q.get('ps');if(!ps)return{debug:1};const[h,pt]=ps.split(':');return{host:h,port:+pt||9000,path:'/',secure:false,debug:1}}
function netSend(m){if(NET.conn&&NET.conn.open)try{NET.conn.send(m)}catch(_){}}
function bcast(m,except){for(const c of NET.conns)if(c!==except&&c.open)try{c.send(m)}catch(_){}}
function sendTo(c,m){if(c&&c.open)try{c.send(m)}catch(_){}}
const ser=it=>{const o={n:it.nid,k:it.kind};for(const f of['id','r','optic','lv','hp','amt','noBot','y'])if(it[f]!==undefined&&it[f]!==null)o[f]=it[f];return o};
// items with their position (the start-of-match list needs it, not just new drops)
const serAt=it=>{const q=ser(it);q.x=r2(it.x);q.z=r2(it.z);if(it.y!==undefined)q.y=r2(it.y);return q};
const des=o=>{const it={nid:o.n,kind:o.k};for(const f of['id','r','optic','lv','hp','amt','noBot','y'])if(o[f]!==undefined)it[f]=o[f];return it};
function inv(a){return{s:a.slots.map(s=>s?{id:s.id,r:s.r||0,optic:s.optic||null,mag:s.mag||0}:null),c:a.cur,am:{...a.ammo},b:a.band,m:a.med,ce:a.cell||0,bt:a.bat||0,al:a.armorLv,ar:Math.round(a.armor),hl:a.helmLv,hm:Math.round(a.helm)}}
function applyInv(a,v){if(!v)return;a.slots=v.s.map(s=>s?{...s}:null);a.cur=v.c;a.ammo={...v.am};a.band=v.b;a.med=v.m;a.cell=v.ce||0;a.bat=v.bt||0;a.armorLv=v.al;a.armor=v.ar;a.helmLv=v.hl;a.helm=v.hm}

// ---------- lobby ----------
function netInfo(html){const el=$('netinfo');if(el)el.innerHTML=html}
function lobbyHtml(){const list=NET.lobby.map((p,i)=>`<li>${i===0?'👑 ':''}${esc(p.name)}${(NET.host&&i===0)||(NET.client&&p.me)?'（あなた）':''}</li>`).join('');
  if(NET.host){const url=location.href.split('?')[0].split('#')[0]+'?room='+NET.code;
    return`<label class="netcpu"><input type="checkbox" id="netnocpu" ${NET.noCpu?'checked':''}> CPUを入れない（プレイヤーだけで戦う）</label><p>部屋コード <b class="netcode">${NET.code}</b>　<button class="btn ghost sm" id="netcopy">招待URLをコピー</button></p><p class="netdim">このURLを友達に送る：<br><span class="neturl">${esc(url)}</span></p><ol class="netlist">${list}</ol><p class="netdim">${NET.lobby.length}/4人。そろったら「全員で出撃する」。${NET.noCpu?'CPUは入らない。基地の広さは上で選んだもの。':'足りない人数はCPUが入る。'}</p>`}
  const SZ={small:'小さめ',medium:'広い',large:'とても広い'};return`<p><b>${esc(NET.lobby[0]?NET.lobby[0].name:'')}</b> の部屋に入った（コード ${NET.code}）。基地：${SZ[SIZE]||''}${NET.noCpu?'・CPUなし':'・CPUあり'}</p><ol class="netlist">${list}</ol><p class="netdim">ホストが出撃するのを待っている…</p>`}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function myName(){const v=($('netname')&&$('netname').value.trim())||'';const n=(v||'プレイヤー'+((Math.random()*90|0)+10)).slice(0,10);try{localStorage.setItem('dr_name',n)}catch(_){}return n}
function bindNet(){const nm=$('netname');if(!nm)return;try{nm.value=localStorage.getItem('dr_name')||''}catch(_){}
  const q=new URLSearchParams(location.search).get('room');if(q&&$('netcode'))$('netcode').value=q.toUpperCase();
  if(typeof Peer==='undefined'){netInfo('<p class="netdim">オンライン対戦の部品（PeerJS）が読み込めていない。インターネットにつながっているか確認してください。</p>');$('netcreate').disabled=$('netjoin').disabled=true;return}
  $('netcreate').onclick=netCreate;$('netjoin').onclick=()=>netJoin(($('netcode').value||'').trim().toUpperCase());
  if(NET.on){netInfo(lobbyHtml());netLobbyUi()}
  else if(q)netInfo('<p class="netdim">招待された部屋に入るには、名前を入れて「入る」を押してください。</p>')}
function netLobbyUi(){const st=$('start');if(NET.client){if(st)st.hidden=true;$$('.size').forEach(b=>b.disabled=true)}else if(NET.host&&st)st.textContent='全員で出撃する';
  $('netcreate').hidden=$('netjoinrow').hidden=true;$('netname').disabled=true;
  const nc=$('netnocpu');if(nc)nc.onchange=()=>{NET.noCpu=nc.checked;netInfo(lobbyHtml());netLobbyUi();netLobbyCast()};
  if(NET.host)$$('.size').forEach(b=>{const o=b.onclick;b.onclick=()=>{o&&o();netLobbyCast()}});
  const cp=$('netcopy');if(cp)cp.onclick=()=>{const url=location.href.split('?')[0].split('#')[0]+'?room='+NET.code;try{navigator.clipboard.writeText(url);cp.textContent='コピーした'}catch(_){}}}
function netReset(msg){try{NET.peer&&NET.peer.destroy()}catch(_){}Object.assign(NET,{on:false,host:false,client:false,peer:null,conn:null,conns:[],lobby:[],live:false,done:false,inMatch:false});
  if(ME&&!S.over)S.over=true;$('stage').classList.remove('playing');$('overlay').hidden=false;if(document.pointerLockElement)document.exitPointerLock();$('card').innerHTML=START_HTML;bindStart();if(msg)netInfo(`<p class="netwarn">${msg}</p>`)}
function netCreate(){NET.name=myName();NET.code=Array.from({length:5},()=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[(Math.random()*32)|0]).join('');
  netInfo('<p class="netdim">部屋を作っている…</p>');const peer=new Peer(NETPFX+NET.code,peerOpts());NET.peer=peer;
  peer.on('open',()=>{Object.assign(NET,{on:true,host:true,client:false,conns:[],lobby:[{name:NET.name}],nid:0,done:false});netInfo(lobbyHtml());netLobbyUi()});
  peer.on('error',e=>{if(e.type==='unavailable-id'){peer.destroy();netCreate();return}netInfo(`<p class="netwarn">部屋を作れなかった（${esc(e.type||e)}）。少し待ってもう一度。</p>`)});
  peer.on('connection',c=>{c.on('data',m=>hostRecv(c,m));c.on('close',()=>hostDrop(c));c.on('error',()=>hostDrop(c))})}
function netJoin(code){if(!/^[A-Z0-9]{5}$/.test(code)){netInfo('<p class="netwarn">部屋コードは5文字。</p>');return}NET.name=myName();NET.code=code;
  netInfo('<p class="netdim">部屋につないでいる…</p>');const peer=new Peer(undefined,peerOpts());NET.peer=peer;
  peer.on('open',()=>{const c=peer.connect(NETPFX+code,{reliable:true,serialization:'json'});NET.conn=c;
    const to=setTimeout(()=>{if(!NET.on){netInfo('<p class="netwarn">部屋が見つからない。コードが合っているか、ホストが部屋を開いたままか確認してください。</p>');try{peer.destroy()}catch(_){}}},12000);
    c.on('open',()=>{clearTimeout(to);Object.assign(NET,{on:true,client:true,host:false});c.send({t:'hello',name:NET.name,v:NETVER})});
    c.on('data',clientRecv);c.on('close',()=>{if(NET.client)netReset('ホストとの接続が切れた。')})});
  peer.on('error',e=>{netInfo(`<p class="netwarn">${e.type==='peer-unavailable'?'部屋が見つからない。コードを確かめてください。':'つなげなかった（'+esc(e.type||e)+'）'}</p>`)})}
function netLobbyCast(){if(NET.host)bcast({t:'lobby',l:NET.lobby.map(p=>p.name),code:NET.code,size:SIZE,nc:NET.noCpu})}
function hostDrop(c){const i=NET.conns.indexOf(c);if(i<0)return;NET.conns.splice(i,1);NET.lobby=NET.lobby.filter(p=>p.conn!==c);
  const a=c.actor;if(a&&a.alive&&ME){a.remote=false;a.conn=null;a.mode='loot';a.path=[];a.target=null;a.enemy=null;killFeed(`${esc(a.name)}<span>回線が切れた（CPUが代わりに動く）</span>`);bcast({t:'feed',h:`${esc(a.name)}<span>回線が切れた（CPUが代わりに動く）</span>`})}
  if(!ME||!$('overlay').hidden&&!DROP){netInfo(lobbyHtml());netLobbyUi()}netLobbyCast()}

// ---------- host side ----------
function hostRecv(c,m){
  if(m.t==='hello'){if(m.v!==NETVER){sendTo(c,{t:'deny',why:`ゲームの版が違う（ホスト：${NETVER}／あなた：${m.v||'古い版'}）。Ctrl+Shift+Rで読み込み直してから入ってください`});return}if(NET.lobby.length>=4){sendTo(c,{t:'deny',why:'満員（4人まで）'});return}if(DROP||NET.inMatch){sendTo(c,{t:'deny',why:'試合中。終わってから入ってください'});return}
    NET.conns.push(c);NET.lobby.push({name:String(m.name||'').slice(0,10)||'ゲスト',conn:c});netLobbyCast();
    if(!$('overlay').hidden&&!DROP){netInfo(lobbyHtml());netLobbyUi()}return}
  const a=c.actor;
  if(m.t==='pick'){const p=NET.lobby.find(p=>p.conn===c);if(p){p.pick=m.p;p.ready=true}dropCheck();return}
  if(!a||!ALL.includes(a))return;
  if(m.t==='p'){if(!a.alive||!a.remote)return;a.tx=m.x;a.tz=m.z;a.ty=m.y;a.tf=m.yaw+Math.PI;if(a.y===undefined||Math.hypot(m.x-a.x,m.z-a.z)>6){a.x=m.x;a.z=m.z;a.y=m.y;a.face=a.tf}a.feet=a.y;a.yaw=m.yaw;a.pitch=m.pi;flagsTo(a,m.f);a.walk=m.wk;a.hp=m.hp;a.armorLv=m.al;a.helmLv=m.hl;
    if(m.w){if(!a.slots[a.cur]||a.slots[a.cur].id!==m.w)a.slots[a.cur]={id:m.w,r:m.wr||0,optic:m.wo||null,mag:1}}else a.slots[a.cur]=null;if(m.inv)applyInv(a,m.inv);return}
  if(m.t==='shot'){const W_=WEAP[m.w];if(!W_)return;gunSound(a,W_);for(let k=0;k+5<m.tr.length;k+=6)tracer({x:m.tr[k],y:m.tr[k+1],z:m.tr[k+2]},{x:m.tr[k+3],y:m.tr[k+4],z:m.tr[k+5]});
    a.mesh.fl.visible=true;a.flashT=.05;shotPing(a);bcast({t:'fx',a:a.i,w:m.w,tr:m.tr},c);return}
  if(m.t==='hit'){const v=NET.byI[m.v];if(!v||!v.alive||!a.alive)return;damage(v,m.d,a,m.wn,m.h);return}
  if(m.t==='dead'){if(!a.alive)return;applyInv(a,m.inv);a.hp=0;a.remote=true;kill(a,m.by>=0?NET.byI[m.by]:null,m.wn);return}
  if(m.t==='take'){const it=ITEMS.find(i=>i.nid===m.n);if(it)removeItem(it);return}
  if(m.t==='spawn'){spawnItem(des(m.it),m.x,m.z,m.y);return}
  if(m.t==='use'){if(m.k==='d'){const dd=doors.get(m.key);if(dd)dd.open=!!m.v}else if(m.k==='w'){const w=wins.get(m.key);if(w&&w.state!==m.v)setWin(w,m.v)}else if(m.k==='r'){const dr=drawers.get(m.key);if(dr)openDrawer(dr)}}}
function worldState(){let d='',w='',r='';for(const x of doors.values())d+=(x.open?1:0)+(x.broken?2:0);for(const x of wins.values())w+=x.state[0];for(const x of drawers.values())r+=x.opened?1:0;return{d,w,r}}
function netSendInit(seed){if(NET.noCpu&&NET.lobby.length<2)NET.noCpu=false;NET.done=false;NET.live=true;for(const p of NET.lobby){p.pick=null;p.ready=false}const ws=worldState();NET.lastWS=JSON.stringify(ws);
  bcast({t:'init',seed,size:SIZE,ws,items:ITEMS.map(serAt),z:Z,lobby:NET.lobby.map(p=>p.name)})}
function dropCheck(){if(!NET.host||!DROP)return;if(DROP.hostReady&&NET.lobby.slice(1).every(p=>p.ready))launch(DROP.pick)}
function dropDone(pick,timeout){if(!DROP)return;if(!NET.on){launch(pick);return}
  if(NET.host){DROP.pick=pick;DROP.hostReady=true;if(timeout){launch(pick);return}dropCheck();if(DROP){$('dropinfo').textContent='ほかのプレイヤーが降下地点を選ぶのを待っている…';$('dropgo').disabled=$('droprand').disabled=true}return}
  if(DROP.sent)return;DROP.sent=true;netSend({t:'pick',p:pick});$('dropinfo').textContent='ほかのプレイヤーを待っている…';$('dropgo').disabled=$('droprand').disabled=true}
function netSendGo(){NET.byI=ALL.slice();NET.done=false;NET.inMatch=true;
  for(const c of NET.conns){const me=c.actor;sendTo(c,{t:'go',me:me?me.i:-1,t0:S.t,a:ALL.map(a=>({i:a.i,n:a.name,x:r2(a.x),z:r2(a.z),f:r2(a.face),h:a===ME||!!a.human}))})}}
function flagsOf(a){if(a.me)return(a.alive?1:0)|((S.crouch||S.slide)?2:0)|(ME.moving?4:0)|(S.prone?8:0)|(S.meRun?16:0)|((S.adsK>.3||btn.fire)?32:0)|(ME.healT>0?64:0);
  return(a.alive?1:0)|(a.crouch?2:0)|(a.moving?4:0)|(a.prone?8:0)|(a.running?16:0)|(a.mode==='fight'||(a.mode==='cover'&&a.peek)?32:0)|(a.healT>0?64:0)}
function flagsTo(a,f){a.crouch=!!(f&2);a.moving=!!(f&4);a.prone=!!(f&8);a.running=!!(f&16);a.mode=f&32?'fight':'loot';a.healT=f&64?1:0}
function snapshot(){return{t:'s',st:r2(S.t),z:Z,a:ALL.map(a=>{const w=wpn(a);return[a.i,r2(a.x),r2(a.z),r2(a.me?ME.y:AY(a)),r2(a.me?ME.yaw+Math.PI:a.face),r2(a.pitch||0),flagsOf(a),r2(a.walk),w?w.id:'',w?w.r||0:0,w?w.optic||'':'',Math.round(a.hp),a.armorLv,a.helmLv,a.kills]})}}
function hostWorld(dt){S.t+=dt;updateZone(dt);for(const b of BOTS)botUpdate(b,dt);for(const f of feed)f.life-=dt;if(feed.length&&feed[feed.length-1].life<=0){feed.pop();renderFeed()}
  if(msgT>0){msgT-=dt;if(msgT<=0)$('msg').style.opacity=0}}

// ---------- client side ----------
function clientRecv(m){
  if(m.t==='deny'){netReset(`入れなかった：${esc(m.why)}`);return}
  if(m.t==='lobby'){NET.lobby=m.l.map((n,i)=>({name:n,me:false}));const mine=NET.lobby.slice(1).reverse().find(p=>p.name===NET.name);if(mine)mine.me=true;if(m.size)SIZE=m.size;NET.noCpu=!!m.nc;
    if(!$('overlay').hidden&&!DROP&&(!ME||S.over)){if(!$('netinfo'))return;netInfo(lobbyHtml());netLobbyUi()}return}
  if(m.t==='init'){clientInit(m);return}
  if(m.t==='go'){clientGo(m);return}
  if(!ME||!ALL.length)return;
  if(m.t==='s'){clientSnap(m);return}
  if(m.t==='fx'){const a=NET.byI[m.a];if(!a||a.me)return;const W_=WEAP[m.w];if(W_)gunSound(a,W_);for(let k=0;k+5<m.tr.length;k+=6)tracer({x:m.tr[k],y:m.tr[k+1],z:m.tr[k+2]},{x:m.tr[k+3],y:m.tr[k+4],z:m.tr[k+5]});
    if(a.mesh){a.mesh.fl.visible=true;a.flashT=.05}shotPing(a);
    if(ME.alive&&m.tr.length>=6){const ox=m.tr[0],oz=m.tr[2],ex=m.tr[3]-ox,ez=m.tr[5]-oz,el=Math.hypot(ex,ez)||1,mx=ME.x-ox,mz=ME.z-oz,al=(mx*ex+mz*ez)/el;if(al>2&&al<el+2&&Math.abs(mx*ez-mz*ex)/el<2.5){S.whiz=.2;burst(.08,.05,3000,panAt(a.x,a.z))}}return}
  if(m.t==='dmg'){if(!ME.alive)return;NET.applying=true;try{damage(ME,m.d,m.by>=0?NET.byI[m.by]:null,m.wn,m.h,m.raw)}finally{NET.applying=false}return}
  if(m.t==='kill'){const v=NET.byI[m.v];if(!v)return;NET.inKill=true;try{kill(v,m.by>=0?NET.byI[m.by]:null,m.wn)}finally{NET.inKill=false}return}
  if(m.t==='feed'){killFeed(m.h);return}
  if(m.t==='is'){NET.applying=true;try{for(const o of m.l)if(!ITEMS.some(i=>i.nid===o.n)){const it=des(o);spawnItem(it,o.x,o.z,o.y)}}finally{NET.applying=false}return}
  if(m.t==='ir'){const it=ITEMS.find(i=>i.nid===m.n);if(it){NET.applying=true;try{removeItem(it)}finally{NET.applying=false}}return}
  if(m.t==='ws'){applyWS(m.ws);return}
  if(m.t==='over'){NET.done=true;if(m.w===NET.myI&&ME.alive)end(true);else if(!SPEC.on)netEndCard();return}}
function applyWS(ws){const now=performance.now();NET.applying=true;try{
  let i=0;for(const[k,x]of doors){const c=+ws.d[i++];if((NET.hold[k]||0)>now)continue;x.open=!!(c&1);x.broken=!!(c&2)}
  i=0;for(const[k,x]of wins){const c=ws.w[i++];if((NET.hold[k]||0)>now)continue;const st=c==='o'?'open':c==='b'?'broken':'closed';if(x.state!==st)setWin(x,st)}
  i=0;for(const[k,x]of drawers){const c=ws.r[i++]==='1';if(c&&!x.opened){x.opened=x.searched=true}}}finally{NET.applying=false}}
function clientInit(m){if(DROP){clearInterval(DROP.timer);DROP=null}SIZE=m.size;NET.done=false;ALL=[];BOTS=[];
  try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();ac.resume()}catch(e){}
  setupWorld(m.seed);for(const dr of drawers.values()){dr.loot=[];dr.opened=false}applyWS(m.ws);
  ITEMS=[];NET.applying=true;try{for(const o of m.items){const it=des(o);spawnItem(it,o.x,o.z,o.y)}}finally{NET.applying=false}
  Z=m.z;NET.lobby=m.lobby.map(n=>({name:n}));$('stage').classList.remove('playing');$('overlay').hidden=false;showDrop()}
function clientGo(m){if(DROP){clearInterval(DROP.timer);DROP=null}ALL=[];BOTS=[];NET.byI=[];NET.myI=m.me;
  for(const d of m.a){const me=d.i===m.me,a=newActor(d.i,me,d.x,d.z);a.name=d.n;a.face=a.yaw=d.f;a.human=d.h;a.tx=d.x;a.tz=d.z;a.tf=d.f;a.ty=groundY(d.x,d.z);giveWeapon(a,'pistol');a.ammo.light=24;ALL.push(a);NET.byI[d.i]=a;if(me)ME=a;else BOTS.push(a)}
  if(!ME){netReset('参加に失敗した。');return}{let best=null,bd=1e9;for(const h of HOUSES){const hx=(h.x+h.w/2)*T,hz=(h.y+h.h/2)*T,d=Math.hypot(hx-ME.x,hz-ME.z);if(d<bd){bd=d;best=[hx,hz]}}ME.yaw=best?Math.atan2(-(best[0]-ME.x),-(best[1]-ME.z)):0}S.t=m.t0;ME.r=.3;buildVm('pistol');
  $('stage').classList.add('playing');$('overlay').hidden=true;resize();hud();say(`${ALL.length}人のバトルロイヤル開始。仲間も敵。建物を探して強い武器を拾え`,3.5);lockPointer()}
function clientSnap(m){if(ME.alive||Math.abs(S.t-m.st)>1)S.t=m.st;const st0=Z&&Z.state;Z=m.z;if(st0==='wait'&&Z.state==='shrink')say('安全地帯が縮み始めた！',3);
  for(const e of m.a){const a=NET.byI[e[0]];if(!a||a.me)continue;a.tx=e[1];a.tz=e[2];a.ty=e[3];a.tf=e[4];a.pitch=e[5];flagsTo(a,e[6]);a.walk=e[7];
    a.slots[0]=e[8]?{id:e[8],r:e[9],optic:e[10]||null,mag:1}:null;a.slots[1]=null;a.cur=0;a.hp=e[11];a.armorLv=e[12];a.helmLv=e[13];a.kills=e[14];
    if(!(e[6]&1)&&a.alive){a.alive=false;a.hp=0;if(a.mesh)a.mesh.holder.visible=false}}}

// ---------- every frame ----------
function netFrame(dt){const now=performance.now();
  {const k=Math.min(1,dt*14);for(const a of BOTS){if(a.tx===undefined||(NET.host&&!a.remote))continue;if(Math.hypot(a.tx-a.x,a.tz-a.z)>6){a.x=a.tx;a.z=a.tz}else{a.x+=(a.tx-a.x)*k;a.z+=(a.tz-a.z)*k}
      if(!isFinite(a.ty))a.ty=groundY(a.tx,a.tz);if(!isFinite(a.tf))a.tf=a.face||0;if(!isFinite(a.face))a.face=a.tf;a.y=!isFinite(a.y)?a.ty:a.y+(a.ty-a.y)*k;let df=(a.tf-a.face)%(Math.PI*2);if(df>Math.PI)df-=Math.PI*2;if(df<-Math.PI)df+=Math.PI*2;a.face+=df*k;if(NET.host)a.feet=a.y}}
  if(NET.client){
    if(now-NET.pT>50&&ME.alive){NET.pT=now;const w=wpn(ME),m={t:'p',x:r2(ME.x),z:r2(ME.z),y:r2(ME.y??groundY(ME.x,ME.z)),yaw:r2(ME.yaw),pi:r2(ME.pitch),f:flagsOf(ME),wk:r2(ME.walk),w:w?w.id:'',wr:w?w.r||0:0,wo:w?w.optic||'':'',hp:Math.round(ME.hp),al:ME.armorLv,hl:ME.helmLv};
      if(now-NET.invT>1000){NET.invT=now;m.inv=inv(ME)}netSend(m)}}
  if(NET.host&&ALL.length){if(now-NET.sT>50){NET.sT=now;bcast(snapshot())}
    if(now-NET.wsT>250){NET.wsT=now;const ws=worldState(),j=JSON.stringify(ws);if(j!==NET.lastWS){NET.lastWS=j;bcast({t:'ws',ws})}}}}

// ---------- hooks into the single-player code ----------
{const f=spawnItem;spawnItem=function(it,x,z,y){
  if(NET.client&&!NET.applying){netSend({t:'spawn',it:ser(it),x:r2(x),z:r2(z),y:y===undefined?undefined:r2(y)});return it}
  if(NET.host&&!it.nid)it.nid=++NET.nid;const r=f(it,x,z,y);
  if(NET.host&&NET.live&&NET.conns.length){const o=ser(it);o.x=r2(x);o.z=r2(z);if(y!==undefined)o.y=r2(y);bcast({t:'is',l:[o]})}return r}}
{const f=removeItem;removeItem=function(it){f(it);if(!it.nid)return;if(NET.client&&!NET.applying)netSend({t:'take',n:it.nid});else if(NET.host&&NET.live)bcast({t:'ir',n:it.nid})}}
{const f=setWin;setWin=function(w,st){f(w,st);if(NET.client&&!NET.applying){const k=kk(w.x,w.y);NET.hold[k]=performance.now()+1500;netSend({t:'use',k:'w',key:k,v:st})}}}
{const f=openDrawer;openDrawer=function(dr){if(NET.client&&!NET.applying){if(dr.opened)return;dr.opened=dr.searched=true;const k=kk(dr.x,dr.y);NET.hold[k]=performance.now()+1500;burst(.12*vAt(dr.px,dr.pz),.2,900,panAt(dr.px,dr.pz));netSend({t:'use',k:'r',key:k});return}f(dr)}}
{const f=myUse;myUse=function(c){const wasOpen=c&&c.type==='door'?c.dd.open:null;f(c);if(NET.client&&c&&c.type==='door'&&c.dd.open!==wasOpen){const k=kk(c.dd.x,c.dd.y);NET.hold[k]=performance.now()+1500;netSend({t:'use',k:'d',key:k,v:c.dd.open})}}}
{const f=tracer;tracer=function(a,b){f(a,b);if(NET.fx&&NET.fx.tr.length<18)NET.fx.tr.push(r2(a.x),r2(a.y),r2(a.z),r2(b.x),r2(b.y),r2(b.z))}}
{const f=fire;fire=function(a){if(!NET.on)return f(a);const w=wpn(a);NET.fx={a:a.i,w:w?w.id:null,tr:[]};let r;try{r=f(a)}finally{const fx=NET.fx;NET.fx=null;
    if(r&&fx.w&&wpn(a)){if(NET.host)bcast({t:'fx',a:a.i,w:fx.w,tr:fx.tr},null);else if(NET.client&&a.me)netSend({t:'shot',w:fx.w,tr:fx.tr})}}return r}}
{const f=damage;damage=function(v,dmg,by,wname,head,raw){
  if(NET.host&&v.remote){if(!v.alive||NET.done)return null;sendTo(v.conn,{t:'dmg',by:by?by.i:-1,d:r2(dmg),h:!!head,wn:wname,raw:!!raw});v.lastHitBy=by;if(by){v.hitAt=S.t;by.dmgDone+=dmg;if(by.me)ME.dmgTo[v.i]=(ME.dmgTo[v.i]||0)+dmg}
    if(by&&!by.me){if(by.dmgOn!==v||S.t-by.dmgOnT>6)by.dmgOnAmt=0;by.dmgOn=v;by.dmgOnAmt+=dmg;by.dmgOnT=S.t}return{dmg,abs:0,broke:false,killed:false}}
  if(NET.client&&!v.me&&!NET.applying){if(!v.alive)return null;netSend({t:'hit',v:v.i,d:r2(dmg),h:!!head,wn:wname});NET.noKill=true;try{return f(v,dmg,by,wname,head,raw)}finally{NET.noKill=false}}
  return f(v,dmg,by,wname,head,raw)}}
{const f=kill;kill=function(v,by,wn){
  if(NET.noKill)return;
  if(NET.client){if(v.me){if(NET.inKill){killFeed(by&&by!==v?`<b>${esc(by.name)}</b> ▸ ${esc(v.name)}<span>${wn||''}</span>`:`${esc(v.name)}<span>${wn||'安全地帯の外で倒れた'}</span>`);return}
      if(!v.alive)return;v.alive=false;v.hp=0;{netSend({t:'dead',by:by?by.i:-1,wn,inv:inv(ME)});
        if(by)S.recap.push({t:S.t,txt:`<b>${esc(by.name)}</b>に倒された（${wn||''}・${Math.round(Math.hypot(by.x-ME.x,by.z-ME.z))}m）`});ME.place=ALL.filter(a=>a.alive).length+1;end(false)}return}
    if(!NET.inKill)return;const was=v.alive;v.alive=false;v.hp=0;if(v.mesh)v.mesh.holder.visible=false;
    killFeed(by&&by!==v?`<b>${esc(by.name)}</b> ▸ ${esc(v.name)}<span>${wn||''}</span>`:`${esc(v.name)}<span>${wn||'安全地帯の外で倒れた'}</span>`);
    if(was&&by&&by.me){ME.kills++;const alive=ALL.filter(a=>a.alive).length;S.hitMark=.35;S.killMark=.6;sfx.kill();S.fovKick=5;say(`${v.name}を倒した（残り${alive}人）`);
      S.recap.push({t:S.t,txt:`<b>${esc(v.name)}</b>を倒した（${wn||'素手'}・${Math.round(Math.hypot(v.x-ME.x,v.z-ME.z))}m）`})}return}
  if(!NET.host){f(v,by,wn);return}
  if(!v.alive&&!v.remote)return;const meAlive=ME.alive;f(v,by,wn);bcast({t:'kill',v:v.i,by:by?by.i:-1,wn:wn||''});
  const al=ALL.filter(a=>a.alive);if(al.length<=1&&!NET.done){NET.done=true;NET.inMatch=false;bcast({t:'over',w:al[0]?al[0].i:-1});if(!(meAlive&&ME.alive&&al[0]===ME))setTimeout(netEndCard,1300)}}}
// the result card online: the host restarts for everyone once the match is over; the others wait for the host
{const f=end;end=function(win){f(win);if(NET.on)setTimeout(netEndCard,win?450:1250)}}
function netEndCard(){if(!NET.on||$('overlay').hidden)return;const st=$('start'),mn=$('menu');if(!st||!mn)return;
  const left=ALL.filter(a=>a.alive).length;let note=$('netwait');if(!note){note=document.createElement('p');note.id='netwait';note.className='netdim';st.before(note)}
  mn.textContent='部屋を抜ける';mn.onclick=()=>netReset();
  if(NET.host){st.textContent='全員でもう一度';st.disabled=!NET.done;note.textContent=NET.done?'試合が終わった。全員でもう一度遊べる。':`まだ試合が続いている（残り${left}人）。終わるまで待ってください。`;
    st.onclick=()=>{if(NET.done)startGame()};if(!NET.done)setTimeout(netEndCard,1000)}
  else{st.hidden=true;note.textContent=NET.done?'試合が終わった。ホストが次の試合を始めるのを待っている…':`まだ試合が続いている（残り${left}人）。`;if(!NET.done)setTimeout(netEndCard,1000)}}
