
// ======================= DUSK ROYALE: battle royale on the generated village =======================
const WEAP={
  // hip: hip-fire spread multiplier, mv: extra spread while moving, ads/draw: seconds to aim/draw, pat: recoil pattern phase, botAcc: bot hit-chance multiplier
  pistol:{kick:.014,bl:.004,hip:1.4,mv:.8,ads:.14,draw:.3,pat:0,botAcc:1.3,name:'ハンドガン',tier:1,dmg:19,iv:.2,mag:12,ammo:'light',spread:.012,range:55,fall:[18,40,.6],auto:false,reload:1.2,col:0x2a2c30,len:.26,snd:[1400,.18]},
  smg:{kick:.011,bl:.004,hip:1.3,mv:.5,ads:.16,draw:.35,pat:1.7,botAcc:.85,name:'サブマシンガン',tier:2,dmg:10,iv:.075,mag:30,ammo:'light',spread:.026,range:40,fall:[15,32,.6],auto:true,reload:1.8,col:0x3a3f46,len:.42,snd:[1700,.12]},
  shotgun:{kick:.055,bl:0,hip:1,mv:.3,ads:.2,draw:.45,pat:0,botAcc:1,name:'ショットガン',tier:2,dmg:12,pellets:9,iv:.8,mag:5,ammo:'shell',spread:.055,range:26,fall:[8,24,.3],auto:false,reload:.52,perShell:true,open:.3,col:0x5a3a24,len:.62,snd:[700,.32]},
  rifle:{kick:.014,bl:.005,hip:1.9,mv:1.4,ads:.22,draw:.45,pat:4.1,botAcc:1,name:'アサルトライフル',tier:2,dmg:16,iv:.13,mag:30,ammo:'medium',spread:.018,range:80,fall:[45,75,.8],auto:true,reload:2.2,col:0x4a4f38,len:.66,snd:[1100,.2]},
  sniper:{kick:.07,bl:0,hip:1,mv:2,ads:.3,draw:.55,pat:0,botAcc:1,name:'ボルトアクション',tier:2,dmg:80,iv:1.2,mag:1,fixedMag:true,ammo:'heavy',spread:.002,range:160,fall:[999,999,1],auto:false,reload:1.7,col:0x3a2e22,len:.85,snd:[800,.36],scope:true}};
for(const k in WEAP)WEAP[k].id=k;
// damage multiplier by distance: full until f[0] m, then linear down to f[2] at f[1] m
function falloff(W_,d){const f=W_.fall;if(d<=f[0])return 1;if(d>=f[1])return f[2];return 1-(1-f[2])*(d-f[0])/(f[1]-f[0])}
// optics are loot: pick one up to mount it on a gun that takes it (iron sights otherwise; the bolt-action has a built-in 4x)
const OPTICS={dot:{n:'1倍ホロサイト',s:'ホロ',fov:55,rk:0},x2:{n:'2倍スコープ',s:'2倍',fov:34,rk:0},x3:{n:'3倍スコープ',s:'3倍',fov:26,rk:1},x4:{n:'4倍スコープ',s:'4倍',fov:20,rk:1},x8:{n:'8倍スコープ',s:'8倍',fov:11,rk:2}};
const OPTFIT={pistol:['dot'],smg:['dot','x2'],shotgun:['dot'],rifle:['dot','x2','x3','x4'],sniper:['x8']},BASESIGHT={sniper:'x4',pistol:'dot',smg:'dot',shotgun:'dot',rifle:'dot'};
const sightW=w=>w?(w.optic||BASESIGHT[w.id]||'iron'):'iron',scopedW=w=>!!w&&/^x/.test(sightW(w))&&sightW(w)!=='x2'&&sightW(w)!=='x3',adsFovW=w=>OPTICS[sightW(w)]?OPTICS[sightW(w)].fov:58;
const fitsOptic=(w,o)=>!!w&&OPTFIT[w.id].includes(o);
// the player's sights are chosen on the start screen and fitted to every gun of that type they pick up
const SIGHTCH={pistol:['dot'],smg:['dot','x2'],shotgun:['dot'],rifle:['dot','x2','x3','x4'],sniper:['x4','x8']};
const SIGHTLBL={iron:'アイアン',dot:'ホロ',x2:'2倍',x3:'3倍',x4:'4倍',x8:'8倍'};
let SIGHT={pistol:'dot',smg:'dot',shotgun:'dot',rifle:'dot',sniper:'x4'};try{const v=JSON.parse(localStorage.getItem('dr_sight2')||'{}');for(const k in SIGHTCH)if(SIGHTCH[k].includes(v[k]))SIGHT[k]=v[k]}catch(_){}
const myOptic=id=>{const c=SIGHT[id];return c==='iron'||c===BASESIGHT[id]?null:c};
const HEADX={pistol:1.8,smg:1.5,shotgun:1.4,rifle:1.7,sniper:2.5};
// rarity: higher tiers have less recoil and a faster reload; magazine size is the same at every rarity (damage stays the same so fights stay readable)
const RAR=[{n:'ノーマル',c:'#d8d4cc',h:0xd8d4cc},{n:'レア',c:'#4aa0ff',h:0x4aa0ff},{n:'エピック',c:'#b47cff',h:0xb47cff}];
const VEST=[null,{cap:50,abs:.35},{cap:75,abs:.45},{cap:100,abs:.55}],HELM=[null,{cap:30,abs:.3},{cap:50,abs:.4},{cap:70,abs:.5}];
const wMag=w=>WEAP[w.id].mag,wKick=w=>WEAP[w.id].kick*(1-.15*(w.r||0)),wReload=w=>WEAP[w.id].reload*(1-.1*(w.r||0));
const wScore=w=>w?WEAP[w.id].tier*3+(w.r||0)+(w.id==='pistol'?0:1):-1;
function rollR(){const q=Math.random();return q<.6?0:q<.9?1:2}
function rollLv(){const q=Math.random();return q<.6?1:q<.9?2:3}
const AMMONAME={light:'小口径弾',shell:'散弾',medium:'中口径弾',heavy:'大口径弾'},AMMOCOL={light:0xd8b040,shell:0xc03a2a,medium:0xb07a3a,heavy:0x5a8a3a};
const BOTNAMES=['ソラ','レン','ハル','ミオ','カイ','ユイ','リク','アオイ','ナギ','コウ','ヒナ','トワ','ルイ','シオン','マコ','タク','ノア','イオ','サキ','ケイ','ジン','ユズ','ロク','ミナト'];
const $$=s=>document.querySelectorAll(s);
let ME,BOTS=[],ALL=[],ITEMS=[],Z,G={};
let paused=false,locked=false;

// ---------- materials for actors and items ----------
const AM={skin:L_({color:0xc89a78}),jeans:L_({color:0x2c3a52}),shoe:L_({color:0x1a1a1a}),hair:[0x2a1c12,0x4a3420,0x111111,0x6a4a2a].map(c=>L_({color:c})),
  gun:L_({color:0x26282c}),vest:L_({color:0x3a4434}),white:L_({color:0xe8e4da}),red:L_({color:0xc0302a}),
  flash:new THREE.SpriteMaterial({map:(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);
    gr.addColorStop(0,'rgba(235,250,255,1)');gr.addColorStop(.3,'rgba(110,210,255,.8)');gr.addColorStop(1,'rgba(40,120,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c)})(),
    blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,fog:false})};
const JK=[0x3a6a8a,0x8a3a34,0x4a7a3a,0xa8822a,0x5a4a8a,0x2a6a6a,0x6a6a6a,0x8a5a3a];
// ======================= realistic weapons, first-person rig and characters =======================
// ---------- runtime environment map (dusk gradient) so metal reads as metal ----------
function texC(size,draw,rep=1){const c=document.createElement('canvas');c.width=c.height=size;draw(c.getContext('2d'),size);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep,rep);t.anisotropy=4;return t}
const GTX={
  metal:texC(128,(g,s)=>{g.fillStyle='#8a8c90';g.fillRect(0,0,s,s);for(let i=0;i<2200;i++){const v=110+Math.random()*60|0;g.fillStyle=`rgba(${v},${v},${v+4},.35)`;g.fillRect(Math.random()*s,Math.random()*s,1,1)}
    g.strokeStyle='rgba(220,220,225,.25)';for(let i=0;i<26;i++){const x=Math.random()*s,y=Math.random()*s;g.beginPath();g.moveTo(x,y);g.lineTo(x+(Math.random()-.5)*30,y+(Math.random()-.5)*4);g.stroke()}},2),
  poly:texC(128,(g,s)=>{g.fillStyle='#808080';g.fillRect(0,0,s,s);for(let i=0;i<3000;i++){const v=100+Math.random()*80|0;g.fillStyle=`rgb(${v},${v},${v})`;g.fillRect(Math.random()*s,Math.random()*s,1,1)}},3),
  stipple:texC(64,(g,s)=>{g.fillStyle='#6a6a6a';g.fillRect(0,0,s,s);for(let y=0;y<s;y+=4)for(let x=(y/4%2)*2;x<s;x+=4){g.fillStyle='#9a9a9a';g.fillRect(x,y,2,2);g.fillStyle='#3a3a3a';g.fillRect(x+1,y+1,1,1)}},6),
  wood:texC(256,(g,s)=>{g.fillStyle='#8a5a34';g.fillRect(0,0,s,s);for(let i=0;i<160;i++){g.strokeStyle=`rgba(${Math.random()<.5?'50,28,12':'170,120,80'},${.12+Math.random()*.25})`;g.lineWidth=1+Math.random()*2;const y=Math.random()*s;g.beginPath();g.moveTo(0,y);
    g.bezierCurveTo(s*.3,y+(Math.random()-.5)*20,s*.6,y+(Math.random()-.5)*20,s,y+(Math.random()-.5)*8);g.stroke()}},1),
  cloth:texC(64,(g,s)=>{g.fillStyle='#909090';g.fillRect(0,0,s,s);for(let y=0;y<s;y+=2){g.fillStyle='rgba(0,0,0,.12)';g.fillRect(0,y,s,1)}for(let x=0;x<s;x+=2){g.fillStyle='rgba(255,255,255,.06)';g.fillRect(x,0,1,s)}},4)};
const SM=(o)=>new THREE.MeshStandardMaterial(Object.assign({envMap:ENV,envMapIntensity:1},o));
const GM={steel:SM({color:0x4a5464,map:GTX.metal,metalness:.85,roughness:.32}),steelDark:SM({color:0x2a2c30,map:GTX.metal,metalness:.8,roughness:.45}),
  alu:SM({color:0x8c96a2,metalness:.35,roughness:.38,envMapIntensity:.9}),aluD:SM({color:0x3a3d42,map:GTX.metal,metalness:.6,roughness:.5,side:THREE.DoubleSide}),
  poly:SM({color:0x2a2b2e,map:GTX.poly,metalness:0,roughness:.75,envMapIntensity:.45}),grip:SM({color:0x2c2d30,map:GTX.stipple,metalness:0,roughness:.92,envMapIntensity:.3}),
  wood:SM({color:0x9aa2ac,metalness:.25,roughness:.42,envMapIntensity:.8}),glass:SM({color:0x6688aa,metalness:.3,roughness:.04,envMapIntensity:2.2,transparent:true,opacity:.35,depthWrite:false}),
  brass:SM({color:0xc8a050,metalness:1,roughness:.28}),shell:SM({color:0x8a2a22,metalness:0,roughness:.6}),dot:new THREE.MeshBasicMaterial({color:0xff2a1a}),
  holoGlass:SM({color:0x9fc4d8,metalness:.1,roughness:.03,envMapIntensity:1.2,transparent:true,opacity:.12,depthWrite:false}),
  holo:new THREE.MeshBasicMaterial({map:(()=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.strokeStyle=x.fillStyle='#ff5a32';x.shadowColor='#ff3a1a';x.shadowBlur=6;
    x.shadowBlur=10;x.fillStyle='#ff2a14';x.beginPath();x.arc(64,64,8,0,7);x.fill();x.shadowBlur=0;x.fillStyle='#ffd0c0';x.beginPath();x.arc(64,64,3,0,7);x.fill();
    const t=new THREE.CanvasTexture(c);t.minFilter=THREE.LinearFilter;return t})(),transparent:true,depthWrite:false,blending:THREE.NormalBlending,side:THREE.DoubleSide}),
  cshell:SM({color:0x343a40,metalness:.3,roughness:.45,envMapIntensity:.8}),accent:new THREE.MeshBasicMaterial({color:0x5ae0ff}),
  band:[null,SM({color:0x2f6fc0,metalness:.55,roughness:.35,emissive:0x0a1a33}),SM({color:0x7a4ac0,metalness:.55,roughness:.35,emissive:0x1a0a33})],
  glove:SM({color:0x2c2824,metalness:0,roughness:.85,envMapIntensity:.3,map:GTX.cloth}),sleeve:SM({color:0x4a5040,metalness:0,roughness:.95,envMapIntensity:.25,map:GTX.cloth}),
  cuff:SM({color:0x1e1e1c,metalness:0,roughness:.8,envMapIntensity:.3})};
// side-profile extrusion: points are [forward m, up m]; forward maps to -z, width is centred on x
function sideGeo(pts,w,bev=0,holes){const s=new THREE.Shape();s.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)s.lineTo(pts[i][0],pts[i][1]);
  if(holes)for(const h of holes){const p=new THREE.Path();p.moveTo(h[0][0],h[0][1]);for(let i=1;i<h.length;i++)p.lineTo(h[i][0],h[i][1]);s.holes.push(p)}
  const g=new THREE.ExtrudeGeometry(s,{depth:w,bevelEnabled:bev>0,bevelThickness:bev,bevelSize:bev,bevelSegments:1,curveSegments:5});g.translate(0,0,-w/2);g.rotateY(Math.PI/2);return g}
const cylZ=(rRear,rFront,len,seg=12,open=false)=>{const c=new THREE.CylinderGeometry(rRear,rFront,len,seg,1,open);c.rotateX(Math.PI/2);return c};
const GUARD=[[[0,.002],[.058,.002],[.064,-.008],[.058,-.036],[.03,-.04],[0,-.03]],[[.006,-.004],[.052,-.004],[.056,-.01],[.052,-.031],[.03,-.034],[.007,-.026]]];
// ---------- the five weapons (generic, original designs) ----------
function gunModel(id,lod,rar,sight){const g=new THREE.Group(),parts={},P={};sight=sight||BASESIGHT[id]||'iron';
  const add=(geo,mat,x=0,y=0,z=0,rx=0,ry=0,rz=0,par=g)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);par.add(m);return m};
  const grp=(x=0,y=0,z=0,par=g)=>{const o=new THREE.Group();o.position.set(x,y,z);par.add(o);return o};
  const V=(x,y,z)=>new THREE.Vector3(x,y,z),det=!lod;
  const guard=(x,y,z,sc=1)=>{const gg=sideGeo(GUARD[0].map(p=>[p[0]*sc,p[1]*sc]),.008,0,[GUARD[1].map(p=>[p[0]*sc,p[1]*sc])]);add(gg,GM.poly,x,y,z);add(BOX(.006,.018,.006),GM.steel,x,y-.014*sc,z-.022*sc,.3)};
  const band=(geo,x,y,z,rx=0)=>{if(rar>0)add(geo,GM.band[rar],x,y,z,rx)};
  // energy coil ring around a barrel (z axis)
  const coil=(r,z,y=0,par=g)=>add(new THREE.TorusGeometry(r,.0018,6,18),GM.accent,0,y,z,0,0,0,par);
  // 1x holographic sight: open box window with a large glowing ring reticle (original design); returns the sight line height
  const dotOn=(rb,z,par=g,k=1)=>{const hw=.0145*k,hh=.0115*k,y=rb+.004+hh;add(BOX(.018*k,.004,.024),GM.steelDark,0,rb+.002,z,0,0,0,par);
    // small thin window: slim posts and bars around the glass
    for(const sx of[-1,1])add(BOX(.0014,hh*2,.005),GM.steelDark,sx*hw,y,z-.01,0,0,0,par);for(const yy of[y+hh,y-hh])add(BOX(hw*2+.0014,.0014,.005),GM.steelDark,0,yy,z-.01,0,0,0,par);
    const gl=add(new THREE.PlaneGeometry(hw*2,hh*2),GM.holoGlass,0,y,z-.01,0,0,0,par);const rt=add(new THREE.PlaneGeometry(.019*Math.sqrt(k),.019*Math.sqrt(k)),GM.holo,0,y,z-.009,0,0,0,par);rt.renderOrder=5;gl.renderOrder=4;return y};
  // 2x prism sight: short boxy body with the slim window on its front
  const x2On=(rb,z,par=g,k=1.65)=>{const bw=.03*k/1.65;add(BOX(bw,.012,.04+(k-1.65)*.03),GM.steelDark,0,rb+.006,z+.006,0,0,0,par);add(BOX(bw*.8,.004,.022),GM.steelDark,0,rb+.013,z+.016,0,0,0,par);if(det){add(BOX(.006,.008,.01),GM.alu,bw/2+.002,rb+.008,z+.012,0,0,0,par);if(k>1.7)add(BOX(bw*.9,.002,.004),GM.accent,0,rb+.0125,z-.012,0,0,0,par)}return dotOn(rb+.011,z-.006,par,k)};
  // magnified scope on two rings; len/bell grow with power
  const scopeOn=(rb,zc,len,bell)=>{const y=rb+.032;for(const z of[zc+len*.28,zc-len*.28]){add(BOX(.022,.02,.014),GM.steelDark,0,rb+.01,z);add(new THREE.TorusGeometry(.0145,.0035,6,16),GM.steelDark,0,y,z)}
    add(cylZ(.013,.013,len,16),GM.steelDark,0,y,zc);add(cylZ(.013,bell,.05,16),GM.steelDark,0,y,zc-len/2-.025);add(cylZ(.016,.013,.035,16),GM.steelDark,0,y,zc+len/2+.017);
    add(cylZ(bell-.002,bell-.002,.002,16),GM.glass,0,y,zc-len/2-.051);add(cylZ(.014,.014,.002,16),GM.glass,0,y,zc+len/2+.035);if(len>.13)add(new THREE.CylinderGeometry(.008,.008,.016,10),GM.steel,0,y+.019,zc);return y};
  if(id==='pistol'){
    const sl=parts.slide=grp();
    add(sideGeo([[-.035,.012],[.155,.012],[.16,.02],[.158,.042],[-.03,.042],[-.036,.034]],.028,.002),GM.alu,0,0,0,0,0,0,sl);add(BOX(.006,.0012,.15),GM.accent,0,.0426,-.06,0,0,0,sl);
    if(det){for(let i=0;i<7;i++)add(BOX(.0296,.022,.0022),GM.steel,0,.028,.03-i*.0042,0,0,0,sl);add(BOX(.003,.011,.042),GM.steel,.0135,.034,-.045,0,0,0,sl)}
    add(BOX(.008,.007,.006),GM.steelDark,.006,.0455,.022,0,0,0,sl);add(BOX(.008,.007,.006),GM.steelDark,-.006,.0455,.022,0,0,0,sl);
    add(BOX(.004,.0075,.004),GM.steelDark,0,.0455,-.148,0,0,0,sl);if(det)add(BOX(.0015,.0015,.001),GM.dot,0,.048,-.1458,0,0,0,sl);
    add(cylZ(.006,.006,.012,10),GM.steelDark,0,.027,-.16,0,0,0,sl);
    add(sideGeo([[-.032,0],[.152,0],[.152,.014],[-.032,.014]],.026,.0015),GM.poly);
    if(det)add(BOX(.022,.004,.05),GM.poly,0,-.002,-.12);
    guard(0,.0,-.0,1);
    add(sideGeo([[-.03,.002],[.006,.002],[.001,-.03],[-.011,-.105],[-.047,-.11],[-.051,-.1],[-.041,-.02],[-.044,0]],.03,.003),GM.grip);
    const mg=parts.mag=grp(0,-.106,.03);mg.rotation.x=-.22;add(BOX(.032,.008,.046),GM.steelDark,0,0,0,0,0,0,mg);add(BOX(.022,.1,.032),GM.steel,0,.052,0,0,0,0,mg);
    band(BOX(.0305,.006,.03),0,.006,-.06);
    for(const sx of[-1,1])add(BOX(.0012,.004,.13),GM.accent,sx*.0143,.031,-.06,0,0,0,sl);coil(.0085,-.163,.027,sl);if(det)add(BOX(.033,.003,.003),GM.accent,0,-.0,-.0,0,0,0,parts.mag);
    P.grip=V(0,-.045,.022);P.gripRot=-.25;P.support=V(-.006,-.06,.015);P.supRot='cup';if(sight==='dot'){const y=dotOn(.042,-.045,parts.slide);P.sight=V(0,y,-.02);P.eye=.3}else{P.sight=V(0,.0485,.022);P.eye=.32}P.muzzle=V(0,.027,-.17);P.port=V(0,-.1,.03);
    P.hip=V(.11,-.11,-.34);P.kick=[.035,.13];P.len=.2}
  else if(id==='smg'){
    add(sideGeo([[-.08,0],[.17,0],[.17,.055],[-.07,.055],[-.08,.045]],.034,.003),GM.alu);
    add(BOX(.022,.008,.21),GM.steelDark,0,.059,-.05);if(det)for(let i=0;i<11;i++)add(BOX(.024,.004,.006),GM.steelDark,0,.065,.04-i*.018);
    add(cylZ(.017,.017,.09,10),GM.steel,0,.03,-.215);if(det)for(let i=0;i<4;i++)add(BOX(.035,.006,.012),GM.steelDark,0,.03,-.19-i*.02);
    add(cylZ(.008,.008,.07,10),GM.steelDark,0,.03,-.29);
    const mg=parts.mag=grp(0,0,-.082);add(sideGeo([[-.014,0],[.016,0],[.026,-.16],[-.006,-.163]],.026,.002),GM.poly,0,0,0,0,0,0,mg);add(BOX(.03,.008,.04),GM.steelDark,0,-.165,-.012,0,0,0,mg);
    add(sideGeo([[-.012,0],[.026,0],[.022,-.02],[.006,-.1],[-.026,-.1],[-.018,-.02]],.028,.003),GM.grip,0,0,0);
    guard(0,-.002,-.045,.8);
    for(const s of[-1,1])add(cylZ(.004,.004,.2,6),GM.steel,s*.012,.032,.17);
    add(sideGeo([[-.27,-.07],[-.25,-.07],[-.25,.03],[-.27,.03]],.034,.004),GM.poly);
    if(sight==='iron'){add(new THREE.TorusGeometry(.0075,.002,6,14),GM.steelDark,0,.075,.06);add(BOX(.006,.016,.008),GM.steelDark,0,.062,.06);
    add(BOX(.0035,.011,.003),GM.steelDark,0,.0715,-.19);if(det)add(new THREE.TorusGeometry(.009,.0018,6,14),GM.steelDark,0,.075,-.19);add(BOX(.008,.01,.008),GM.steelDark,0,.063,-.19);}
    add(new THREE.CylinderGeometry(.012,.014,.075,10),GM.poly,0,-.035,-.17);
    band(BOX(.0345,.006,.05),0,.01,-.02);
    for(const sx of[-1,1])add(BOX(.0012,.005,.2),GM.accent,sx*.0172,.038,-.05);for(let i=0;i<3;i++)coil(.0185,-.19-i*.022,.03);add(BOX(.0012,.1,.006),GM.accent,.0132,-.08,.0,0,0,0,parts.mag);
    let sy=0;if(sight==='dot')sy=dotOn(.065,-.03);else if(sight==='x2')sy=x2On(.065,-.03);
    P.grip=V(0,-.045,.005);P.gripRot=-.22;P.support=V(0,-.04,-.17);P.supRot='vert';P.sight=sight==='dot'||sight==='x2'?V(0,sy,-.01):V(0,.075,.06);P.eye=sight==='dot'?.25:sight==='x2'?.22:.3;P.muzzle=V(0,.03,-.33);P.port=V(0,-.17,-.08);
    P.hip=V(.14,-.15,-.36);P.kick=[.014,.03];P.len=.45}
  else if(id==='shotgun'){
    add(sideGeo([[-.06,-.005],[.17,-.005],[.17,.05],[-.05,.05],[-.06,.04]],.038,.003),GM.steelDark);
    add(cylZ(.011,.011,.56,12),GM.steel,0,.035,-.45);add(BOX(.006,.004,.55),GM.steelDark,0,.048,-.45);add(BOX(.004,.022,.006),GM.steelDark,0,.061,-.715);if(sight==='iron'){add(new THREE.TorusGeometry(.009,.0025,6,16),GM.steelDark,0,.075,.0);for(const sx of[-1,1])add(BOX(.004,.022,.012),GM.steelDark,sx*.011,.06,.0)}
    add(cylZ(.012,.012,.47,10),GM.steel,0,.006,-.405);add(cylZ(.013,.013,.012,10),GM.steelDark,0,.006,-.64);
    const pm=parts.pump=grp(0,.006,-.33);add(cylZ(.025,.025,.17,14),GM.poly,0,0,0,0,0,0,pm);if(det)for(let i=0;i<7;i++)add(new THREE.TorusGeometry(.025,.0025,5,16),GM.poly,0,0,-.07+i*.023,0,0,0,pm);
    guard(0,-.004,-.03,.85);if(det)add(BOX(.03,.004,.06),GM.steelDark,0,-.006,-.08);
    add(sideGeo([[-.055,.04],[-.12,.012],[-.4,-.012],[-.41,-.016],[-.41,-.13],[-.37,-.13],[-.09,-.045],[-.062,-.045],[-.056,-.004]],.036,.004),GM.wood);
    add(BOX(.038,.12,.022),GM.cuff,0,-.072,.412);
    band(cylZ(.0255,.0255,.01,14),0,.006,-.4);
    for(const sx of[-1,1])add(BOX(.0012,.006,.2),GM.accent,sx*.0192,.025,.05);for(let i=0;i<4;i++)coil(.0135,-.6-i*.025,.035);coil(.0262,-.06,0,parts.pump);coil(.0262,.06,0,parts.pump);
    add(BOX(.0012,.06,.18),GM.accent,.0185,-.04,.25,0,0,-.08);
    parts.shellG=grp();const sh=add(cylZ(.0095,.0095,.06,10),GM.shell,0,0,0,0,0,0,parts.shellG);add(cylZ(.0098,.0098,.012,10),GM.brass,0,0,.03,0,0,0,parts.shellG);parts.shellG.visible=false;
    P.grip=V(0,-.03,.09);P.gripRot=-.75;P.support=V(0,-.018,-.33);P.supRot='under';if(sight==='dot'){const y=dotOn(.064,-.01);P.sight=V(0,y,.01);P.eye=.25}else{P.sight=V(0,.075,0);P.eye=.28}P.muzzle=V(0,.035,-.74);P.port=V(0,-.03,-.08);
    P.hip=V(.14,-.15,-.38);P.kick=[.08,.18];P.len=.95}
  else if(id==='rifle'){
    // original near-future carbine: light composite shell, dark internals, thin cyan accent lights
    add(sideGeo([[-.165,.004],[.25,.004],[.33,.016],[.345,.05],[.32,.07],[-.13,.07],[-.175,.05]],.04,.004),GM.cshell);
    if(det){for(const sx of[-1,1]){for(const z of[-.02,.17,.3])add(BOX(.002,.05,.003),GM.steelDark,sx*.0202,.036,-z);add(BOX(.002,.003,.2),GM.steelDark,sx*.0202,.06,-.1)}add(BOX(.03,.003,.08),GM.steelDark,0,.071,.02)}
    add(sideGeo([[-.12,.07],[.23,.07],[.23,.076],[-.12,.076]],.024,.001),GM.steelDark);if(det)for(let i=0;i<18;i++)add(BOX(.028,.004,.006),GM.steelDark,0,.078,.11-i*.018);
    add(sideGeo([[.02,.004],[.12,.004],[.11,-.03],[.03,-.03]],.04,.003),GM.poly);
    for(const sx of[-1,1]){add(BOX(.002,.005,.26),GM.accent,sx*.0212,.046,-.12);add(BOX(.002,.022,.05),GM.poly,sx*.0212,.03,-.29);if(det)add(BOX(.002,.003,.1),GM.accent,sx*.0212,.016,-.18)}
    add(BOX(.008,.004,.18),GM.accent,0,.0712,-.12)
    add(sideGeo([[.33,.018],[.42,.022],[.42,.054],[.33,.06]],.038,.003),GM.poly);for(let i=0;i<3;i++)add(BOX(.04,.004,.012),GM.steelDark,0,.038,-.36-i*.02);
    add(cylZ(.0095,.0095,.14,10),GM.steel,0,.038,-.49);const mz=new THREE.CylinderGeometry(.016,.016,.06,6);mz.rotateX(Math.PI/2);add(mz,GM.steelDark,0,.038,-.58);if(det)for(const sx of[-1,1])add(BOX(.003,.008,.03),GM.accent,sx*.0155,.038,-.58);
    const mg=parts.mag=grp(0,-.03,-.03);add(BOX(.03,.15,.06),GM.poly,0,-.07,0,-.12,0,0,mg);add(BOX(.032,.012,.064),GM.steelDark,0,-.148,.008,-.12,0,0,mg);add(BOX(.0015,.03,.008),GM.accent,.0158,-.04,-.018,-.12,0,0,mg);
    add(sideGeo([[-.006,.004],[.03,.004],[.022,-.02],[.004,-.098],[-.03,-.098],[-.024,-.02]],.03,.004),GM.grip,0,0,.004);
    guard(0,-.002,-.012,.85);
    // skeletal stock: two struts and a butt pad
    add(sideGeo([[-.16,.06],[-.3,.05],[-.3,.04],[-.16,.045]],.024,.002),GM.poly);add(sideGeo([[-.16,-.01],[-.3,-.05],[-.3,-.06],[-.16,-.024]],.024,.002),GM.poly);
    add(sideGeo([[-.29,.06],[-.315,.06],[-.315,-.075],[-.29,-.075]],.042,.004),GM.cshell);if(det)add(BOX(.044,.12,.01),GM.cuff,0,-.008,.312);
    if(sight==='iron'){add(BOX(.022,.012,.026),GM.steelDark,0,.082,.09);add(new THREE.TorusGeometry(.0075,.0022,6,14),GM.steelDark,0,.097,.09);for(const sx of[-1,1])add(BOX(.003,.02,.012),GM.steelDark,sx*.011,.093,.09);
      add(BOX(.022,.014,.02),GM.steelDark,0,.083,-.21);for(const sx of[-1,1])add(BOX(.003,.018,.006),GM.steelDark,sx*.009,.096,-.21);add(BOX(.003,.013,.003),GM.steelDark,0,.0905,-.21)}
    let ry_=0;if(sight==='x4')ry_=scopeOn(.076,0,.2,.023);
    let hy_=0;if(sight==='dot')hy_=dotOn(.076,-.02);else if(sight==='x2')hy_=x2On(.076,-.02);else if(sight==='x3')hy_=x2On(.076,-.02,g,1.9);
    band(BOX(.048,.012,.012),0,.038,-.2);
    P.grip=V(0,-.044,.006);P.gripRot=-.25;P.support=V(0,.006,-.3);P.supRot='under';P.sight=sight==='iron'?V(0,.097,.09):ry_?V(0,ry_,.15):V(0,hy_,0);P.eye=sight==='iron'?.13:ry_?.07:.24;P.muzzle=V(0,.038,-.62);P.port=V(0,-.2,-.06);
    P.hip=V(.14,-.15,-.36);P.kick=[.02,.04];P.len=.9}
  else if(id==='sniper'){
    add(sideGeo([[.42,.02],[.42,-.02],[.12,-.032],[.06,-.05],[.0,-.055],[-.028,-.105],[-.062,-.105],[-.05,-.045],[-.1,-.032],[-.36,-.055],[-.4,-.055],[-.4,.042],[-.36,.042],[-.1,.034],[.05,.022]],.045,.004),GM.wood);
    add(BOX(.047,.1,.02),GM.cuff,0,-.006,.407);
    add(cylZ(.017,.017,.2,14),GM.steelDark,0,.036,-.0);
    const bl=parts.bolt=grp(0,.036,.06);add(cylZ(.009,.009,.08,10),GM.steel,0,0,0,0,0,0,bl);add(new THREE.CylinderGeometry(.004,.004,.045,8),GM.steel,.02,-.012,.02,0,0,-1.0,bl);add(new THREE.SphereGeometry(.0085,10,8),GM.steelDark,.04,-.026,.02,0,0,0,bl);
    add(cylZ(.0135,.009,.64,12),GM.steelDark,0,.036,-.42);add(BOX(.024,.02,.05),GM.steelDark,0,.036,-.76);if(det)for(const s of[-1,1])add(BOX(.0245,.004,.03),GM.cuff,0,.036+s*.004,-.76);
    const mg=parts.mag=grp(0,-.03,-.02);add(BOX(.03,.04,.07),GM.steelDark,0,-.01,0,0,0,0,mg);
    guard(0,-.03,.02,.9);
    add(cylZ(.013,.013,.27,16),GM.steelDark,0,.086,0);add(sight==='x8'?cylZ(.013,.03,.1,16):cylZ(.013,.022,.07,16),GM.steelDark,0,.086,sight==='x8'?-.185:-.17);add(cylZ(.017,.013,.05,16),GM.steelDark,0,.086,.16);
    add(sight==='x8'?cylZ(.028,.028,.002,16):cylZ(.02,.02,.002,16),GM.glass,0,.086,sight==='x8'?-.236:-.206);add(cylZ(.015,.015,.002,16),GM.glass,0,.086,.186);
    add(new THREE.CylinderGeometry(.0095,.0095,.022,12),GM.steel,0,.108,0);add(new THREE.CylinderGeometry(.0095,.0095,.022,12),GM.steel,.022,.086,0,0,0,Math.PI/2);
    for(const z of[-.07,.07]){add(new THREE.TorusGeometry(.0145,.004,6,16),GM.steel,0,.086,z);add(BOX(.012,.03,.012),GM.steel,0,.06,z)}
    band(cylZ(.0175,.0175,.01,14),0,.036,-.12);
    for(let i=0;i<6;i++)coil(.016-i*.0006,-.22-i*.07,.036);for(const sx of[-1,1])add(BOX(.0012,.006,.3),GM.accent,sx*.0232,.0,.2);add(BOX(.0012,.03,.0012),GM.accent,.0152,-.01,0,0,0,0,parts.mag);
    P.grip=V(0,-.064,.045);P.gripRot=-.45;P.support=V(0,-.03,-.3);P.supRot='under';P.sight=V(0,.086,.19);P.eye=.08;P.muzzle=V(0,.036,-.79);P.port=V(0,-.07,-.02);
    P.hip=V(.14,-.15,-.38);P.kick=[.07,.2];P.len=1.2;P.glint=V(0,.086,-.21)}
  return{g,parts,P}}
// low-detail merged copies for bots' hands and the ground (one draw call per material)
const GUNLOD={};
function gunLOD(id,rar,optic){const key=id+(rar||0)+(optic||'');if(!GUNLOD[key]){const m=gunModel(id,true,rar||0,optic);m.g.updateMatrixWorld(true);const by=new Map();
    m.g.traverse(o=>{if(o.isMesh){if(!by.has(o.material))by.set(o.material,[]);by.get(o.material).push([o.geometry,o.matrixWorld.clone()])}});
    GUNLOD[key]={list:[...by].map(([mat,a])=>[mergeGeos(a),mat]),P:m.P}}
  const L=GUNLOD[key],g=new THREE.Group();for(const[geo,mat]of L.list)g.add(new THREE.Mesh(geo,mat));g.userData.P=L.P;return g}

// ---------- first-person view: own scene + camera, rendered after the world with a cleared depth buffer ----------
const vmScene=new THREE.Scene(),vmCam=new THREE.PerspectiveCamera(54,1,.01,10);// narrower screens get a wider view-model lens so the gun stays in frame
vmScene.add(new THREE.HemisphereLight(0x9ab8dc,0x3a2e3a,.8));{const l=new THREE.DirectionalLight(0xdce8ff,1.0);l.position.set(-.6,1,.4);vmScene.add(l);const l2=new THREE.DirectionalLight(0x8a90c0,.35);l2.position.set(.8,.2,-.5);vmScene.add(l2)}
const VM={root:new THREE.Group(),model:null,id:null,r:0,kz:0,kr:0,ky:0,swX:0,swY:0,sprK:0,healK:0};vmScene.add(VM.root);
const vmFlash=new THREE.Sprite(AM.flash.clone());vmFlash.visible=false;
function makeHand(kind){const h=new THREE.Group(),m=GM.glove,f=(len,r=.0085)=>{const c=new THREE.CylinderGeometry(r,r*.9,len,8);return c};
  const add=(geo,x,y,z,rx=0,ry=0,rz=0,mat=m)=>{const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);h.add(o);return o};
  if(kind==='grip'){add(BOX(.03,.085,.07),.022,-.008,.012);
    for(let i=0;i<3;i++){const y=-.012-i*.022;add(f(.048),.002,y,-.028,0,0,Math.PI/2);add(f(.03),-.022,y,-.012,Math.PI/2,0,0)}
    add(f(.05,.0082),.02,.026,-.03,Math.PI/2,0,0);add(f(.045,.0095),-.02,.028,-.01,Math.PI/2,0,.2);add(BOX(.032,.03,.03),.02,-.055,.04,0,0,0,GM.cuff)}
  else{add(BOX(.07,.022,.085),0,-.03,0);for(let i=0;i<4;i++){add(f(.046),-.034,-.008,-.032+i*.021,0,0,.15)}add(f(.045,.0095),.033,-.008,.005,0,0,-.2);add(BOX(.06,.03,.03),0,-.035,.055,0,0,0,GM.cuff)}
  h.wrist=new THREE.Object3D();h.wrist.position.set(kind==='grip'?.018:0,kind==='grip'?-.06:-.035,kind==='grip'?.045:.06);h.add(h.wrist);return h}
VM.gripHand=makeHand('grip');VM.supHand=makeHand('support');
const segGeo=new THREE.CylinderGeometry(1,1,1,10);VM.arms=[0,1,2,3].map(i=>{const m=new THREE.Mesh(segGeo,GM.sleeve);VM.root.add(m);return m});
const _a=new THREE.Vector3(),_b=new THREE.Vector3(),_d=new THREE.Vector3(),UPV=new THREE.Vector3(0,1,0);
function seg(mesh,a,b,r){_d.copy(b).sub(a);const L=_d.length();mesh.position.copy(a).addScaledVector(_d,.5);mesh.quaternion.setFromUnitVectors(UPV,_d.normalize());mesh.scale.set(r,L,r)}
function buildVm(id,r){if(VM.model){VM.root.remove(VM.model.g)}VM.model=null;VM.id=id;if(r===undefined){const w=ME&&ME.slots?wpn(ME):null;r=w&&w.id===id?(w.r||0):0}VM.r=r;
  if(!id){VM.root.add(VM.gripHand,VM.supHand);VM.gripHand.position.set(.12,-.13,-.28);VM.supHand.position.set(-.1,-.14,-.3);VM.gripHand.rotation.set(0,0,0);VM.supHand.rotation.set(.3,0,0);return}
  const vw=ME&&ME.slots?wpn(ME):null;const m=gunModel(id,false,VM.r,vw&&vw.id===id?sightW(vw):null);VM.model=m;VM.root.add(m.g);m.g.add(VM.gripHand,VM.supHand);
  VM.gripHand.position.copy(m.P.grip);VM.gripHand.rotation.set(m.P.gripRot,0,0);
  VM.supHand.position.copy(m.P.support);VM.supHand.rotation.set(0,0,0);if(m.P.supRot==='vert')VM.supHand.rotation.set(Math.PI/2,0,0);if(m.P.supRot==='cup'){VM.supHand.rotation.set(.2,0,-1.25)}
  m.g.add(vmFlash);vmFlash.position.copy(m.P.muzzle).add(new THREE.Vector3(0,0,-.03));vmFlash.scale.set(.16,.16,1);
  m.base={mag:m.parts.mag&&m.parts.mag.position.clone(),pump:m.parts.pump&&m.parts.pump.position.clone(),bolt:m.parts.bolt&&m.parts.bolt.position.clone(),slide:m.parts.slide&&m.parts.slide.position.clone()}}
const vmS=(t,a,b)=>{const k=Math.max(0,Math.min(1,(t-a)/(b-a)));return k*k*(3-2*k)};
// per-frame first-person animation: hip/ADS blend aligned on the real sight, sprint, bob, sway, recoil, reload, pump/bolt/slide, draw
function updateVm(dt,ek){const m=VM.model,g=m?m.g:null;VM.sprK+=((S.meRun?1:0)-VM.sprK)*Math.min(1,dt*9);VM.healK+=((ME.healT>0?1:0)-VM.healK)*Math.min(1,dt*7);
  const dec=Math.exp(-dt*15);VM.kz*=dec;VM.kr*=dec;VM.ky*=dec;VM.swX*=Math.exp(-dt*9);VM.swY*=Math.exp(-dt*9);
  if(!m){VM.gripHand.position.y=-.13+Math.sin(ME.walk)*.01;VM.supHand.position.y=-.14+Math.cos(ME.walk)*.01;return}
  const P=m.P,hip=P.hip,ads=_a.set(-P.sight.x,-P.sight.y,-P.eye-P.sight.z),mv=Math.min(1,S.moveAmt||0),k=1-ek*.85;
  const pos=_b.copy(hip);pos.x*=Math.max(.42,Math.min(1,vmCam.aspect/1.5));pos.lerp(ads,ek);let rx=0,ry=.03*(1-ek),rz=0;
  pos.x+=VM.sprK*.02;pos.y-=VM.sprK*.05;pos.z+=VM.sprK*.03;rx-=VM.sprK*.32;ry+=VM.sprK*.62;rz+=VM.sprK*.28;
  pos.x+=Math.sin(ME.walk)*.011*mv*k;pos.y-=Math.abs(Math.cos(ME.walk))*.011*mv*k;rz+=Math.sin(ME.walk)*.012*mv*k;
  ry+=Math.sin(S.t*.8)*.004*k+VM.swX;rx+=Math.sin(S.t*1.13)*.003*k+VM.swY;
  pos.z+=VM.kz;rx+=VM.kr;ry+=VM.ky;
  const dw=WEAP[VM.id].draw||.4,dk=Math.min(1,(S.drawT||0)/dw);pos.y-=dk*.22;rx-=dk*.9;
  pos.y-=VM.healK*.16;rx-=VM.healK*.7;pos.y-=(S.land||0)*.5;if(S.prone){pos.y+=.01*(1-ek);rz-=.06*(1-ek)}// prone cant only at the hip: aiming keeps the sight on the screen centre
  // reload choreography
  const w=wpn(ME),rk=ME.reloadT>0&&ME.reloadTot?1-ME.reloadT/ME.reloadTot:-1;const sup=VM.supHand,mag=m.parts.mag;
  sup.position.copy(P.support);if(mag){mag.position.copy(m.base.mag);mag.visible=true}
  VM.sg=(VM.sg||0)+(((ME.reloadT>0&&ME.shellRun)?1:0)-(VM.sg||0))*.18;
  if(VM.id==='shotgun'&&rk<0&&VM.sg>.01){rz-=VM.sg*.3;rx+=VM.sg*.18;pos.x-=VM.sg*.07;pos.y+=VM.sg*.05;pos.z+=VM.sg*.04}
  if(rk>=0){const sgS=VM.id==='shotgun'&&ME.shellRun,tilt=sgS?VM.sg:vmS(rk,0,.15)*(1-vmS(rk,.85,1));rz-=tilt*(VM.id==='shotgun'?.3:.35);rx+=tilt*.18;pos.x-=tilt*.07;pos.y+=tilt*.05;pos.z+=tilt*.04;
    if(VM.id==='shotgun'){const op=ME.reloadTot>wReload(w||{id:'shotgun'})+.01?WEAP.shotgun.open/ME.reloadTot:0,f=Math.max(0,Math.min(1,(rk-op)/(1-op))),load=sgS&&rk>op;
      m.parts.shellG.visible=load&&f<.6;const port=P.port;sup.position.lerpVectors(P.support,_d.set(port.x,port.y-.05-.06*Math.sin(f*Math.PI),port.z+.03),load?1:vmS(rk,.05,.15));m.parts.shellG.position.copy(sup.position).add(_d.set(0,.03,-.02))}
    else if(mag&&VM.id!=='sniper'){const drop=vmS(rk,.15,.3),ins=vmS(rk,.5,.72);mag.position.y=m.base.mag.y-.3*drop*(1-ins)-(rk>.3&&rk<.5?.3:0);mag.visible=!(rk>.32&&rk<.5);
      const toMag=vmS(rk,.08,.2)*(1-vmS(rk,.78,.92)),away=vmS(rk,.3,.4)*(1-vmS(rk,.45,.55));_d.copy(mag.position).add(_a.set(0,-.12,0));_d.y-=away*.2;sup.position.lerp(_d,toMag)}
    if(VM.id==='sniper'){const b=m.parts.bolt,o=vmS(rk,.05,.15)*(1-vmS(rk,.85,.95));b.rotation.z=o*1.1;b.position.z=m.base.bolt.z+vmS(rk,.08,.15)*(1-vmS(rk,.85,.9))*.07}}
  else if(m.parts.shellG)m.parts.shellG.visible=false;
  // actions between shots
  const since=S.t-(S.lastShot||-9);
  if(m.parts.pump){const p=since>.1&&since<.6?Math.sin((since-.1)/.5*Math.PI):0;m.parts.pump.position.z=m.base.pump.z+p*.085;if(rk<0)sup.position.z+=p*.085;rx+=p*.03}
  if(m.parts.bolt&&rk<0){const p=since>.25&&since<1?(since-.25)/.75:0,lift=vmS(p,0,.2)*(1-vmS(p,.75,1)),back=vmS(p,.2,.4)*(1-vmS(p,.55,.75));m.parts.bolt.rotation.z=lift*1.1;m.parts.bolt.position.z=m.base.bolt.z+back*.07;rz+=lift*.06}
  if(m.parts.slide){const lock=w&&w.id==='pistol'&&w.mag===0&&!(rk>.85);m.parts.slide.position.z=m.base.slide.z+(lock?.024:since<.07?.024*(1-since/.07):0)}
  g.position.copy(pos);g.rotation.set(rx,ry,rz,'YXZ');
  vmFlash.visible=S.flashT>0;if(vmFlash.visible){vmFlash.material.rotation=Math.random()*6.28;const s=.12+Math.random()*.08;vmFlash.scale.set(s,s,1)}
  // sleeves from each wrist to an elbow behind/below, then to the shoulder off screen
  VM.root.updateMatrixWorld(true);
  const arm=(hand,side,i)=>{hand.wrist.getWorldPosition(_a);const el=_b.set(_a.x+side*.07,_a.y-.17,_a.z+.2);seg(VM.arms[i],_a,el,.042);const sh=_d.set(side*.22,-.32,.3);seg(VM.arms[i+1],el,sh,.055)};
  arm(VM.gripHand,1,0);arm(VM.supHand,-1,2)}
function vmKick(W_){if(!VM.model)return;const k=VM.model.P.kick,a=1-.4*(S.adsK||0);VM.kz+=k[0]*a;VM.kr+=k[1]*a;VM.ky+=(Math.random()-.5)*k[1]*.25}

// ---------- wearable gear and pickups: one set of procedural parts shared by the characters and the ground items ----------
// colours by level: Lv1 olive soft gear, Lv2 coyote plate carrier / railed helmet, Lv3 charcoal heavy gear
const GC=[null,{v:0x5f6247,s:0x3f4134,h:0x52553f},{v:0x7b6a4d,s:0x544835,h:0x6f644c},{v:0x35383b,s:0x222426,h:0x2a2c2f}];
// soft rounded slab in the XY plane (extruded along z, centred); notch>0 cuts a neck scoop out of the top edge
function gSlab(w,h,d,notch=0,bev=.006){const s=new THREE.Shape(),x=w/2,y=h/2,r=Math.min(.03,w*.15);
  s.moveTo(-x+r,-y);s.lineTo(x-r,-y);s.quadraticCurveTo(x,-y,x,-y+r);s.lineTo(x,y-r);s.quadraticCurveTo(x,y,x-r,y);
  if(notch>0){s.lineTo(notch,y);s.quadraticCurveTo(0,y-notch*.9,-notch,y)}s.lineTo(-x+r,y);s.quadraticCurveTo(-x,y,-x,y-r);s.lineTo(-x,-y+r);s.quadraticCurveTo(-x,-y,-x+r,-y);
  const g=new THREE.ExtrudeGeometry(s,{depth:Math.max(.002,d-2*bev),bevelEnabled:true,bevelThickness:bev,bevelSize:bev,bevelSegments:2,curveSegments:4});
  g.translate(0,0,-(d-2*bev)/2);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*3,uv.getY(i)*3);return g}
const dome=(r,seg,ring,arc)=>new THREE.SphereGeometry(r,seg,ring,0,Math.PI*2,0,arc);
// parts are [geometry, colour, matrix, finish] in body space (feet at y=0, facing +z). finish: f fabric, h hard shell, m metal, p painted, g glass, c card, r red plastic
function gearParts(kind,lv,ground){const out=[],A=(g,c,m,f='f')=>out.push([g,c,m,f]),C=GC[lv];
  if(kind==='vest'){const th=[0,.026,.05,.062][lv],w=lv===3?.33:.31,hh=lv===1?.34:.32,y=1.29,zf=.105+th/2,fz=.105+th;
    const pn=gSlab(w,hh,th,.075);A(pn,C.v,MX(0,y,zf));A(pn.clone(),C.v,MX(0,y,-zf,Math.PI));
    for(const sx of[-1,1])A(BOX(.066,lv>1?.03:.02,.25),C.v,MX(sx*.1,1.452,0));
    if(lv===1){for(const yy of[1.2,1.31])for(const sx of[-1,1])A(BOX(.034,.045,.21),C.s,MX(sx*.166,yy,0));
      A(BOX(.11,.065,.006),C.s,MX(.05,1.35,fz+.003));for(const k of[0,1])A(BOX(.26,.006,.004),C.s,MX(0,1.16+k*.21,fz+.002))}
    else{for(const sx of[-1,1])A(BOX(.04,.17,.22),C.v,MX(sx*.172,1.235,0));
      for(let k=0;k<3;k++){A(BOX(w*.84,.012,.006),C.s,MX(0,1.33+k*.036,-fz-.003));A(BOX(w*.84,.012,.006),C.s,MX(0,1.33+k*.034,fz+.003))}
      const np=lv===2?3:4;for(let k=0;k<np;k++){const x=(k-(np-1)/2)*.072;A(gSlab(.064,.11,.045),C.v,MX(x,1.19,fz+.022));A(BOX(.066,.026,.05),C.s,MX(x,1.247,fz+.024));A(BOX(.02,.012,.008),0x141414,MX(x,1.235,fz+.05))}
      A(BOX(.09,.022,.03),C.s,MX(0,1.432,-fz-.012));A(BOX(.12,.06,.006),C.s,MX(.0,1.37,fz+.004));
      if(lv===3){const col=new THREE.TorusGeometry(.125,.032,6,14,Math.PI*1.25);col.rotateZ(-.125*Math.PI);col.rotateX(-Math.PI/2);col.scale(1,1,.85);A(col,C.v,MX(0,1.475,-.01));
        for(const sx of[-1,1])A(dome(.085,10,5,Math.PI/2),C.v,MX(sx*.215,1.4,0,0,0,sx*-.62,1,.42,1.25));
        A(gSlab(.17,.13,.03),C.v,MX(0,1.075,fz-.01,0,.12));A(BOX(.06,.13,.05),C.s,MX(.2,1.21,-.05));A(BOX(.012,.16,.012),0x111111,MX(.2,1.33,-.05),'m')}}}
  else if(kind==='helm'){const y=1.635;
    if(lv===1){A(dome(.12,16,8,Math.PI*.5),C.h,MX(0,y,-.004,0,0,0,1,.9,1.1),'h');A(new THREE.CylinderGeometry(.121,.123,.014,16,1,true),0x1c1c1a,MX(0,y+.004,-.004,0,0,0,1,1,1.1),'f');
      for(const k of[-1,0,1])A(BOX(.012,.006,.035),0x1a1a1a,MX(k*.035,y+.104,-.02),'h');if(!ground)for(const sx of[-1,1])A(BOX(.006,.075,.012),0x2a2a26,MX(sx*.112,y-.05,.01),'f')}
    else{const R=lv===2?.13:.136;A(dome(R,18,9,Math.PI*.54),C.h,MX(0,y,-.006,0,0,0,1,.97,1.08),'h');A(new THREE.CylinderGeometry(R*.995,R*1.01,.014,18,1,true),0x161616,MX(0,y-.008,-.006,0,0,0,1,1,1.08),'f');
      for(const sx of[-1,1]){A(BOX(.012,.022,.11),0x1e1f22,MX(sx*R*.99,y+.02,-.004,0,0,sx*-.12),'h');for(const k of[-1,1])A(BOX(.006,.008,.008),0x0e0e0e,MX(sx*(R+.006),y+.02,k*.03),'m')}
      A(BOX(.05,.032,.014),0x1e1f22,MX(0,y+.075,R*1.03,0,-.5),'m');A(BOX(.07,.045,.004),C.s,MX(0,y+.118,-.02,0,-.05),'f');A(BOX(.06,.04,.012),0x1e1f22,MX(0,y+.04,-R*1.05,0,.25),'h');
      if(lv===2&&!ground)for(const sx of[-1,1])A(BOX(.006,.075,.012),0x2a2a26,MX(sx*.118,y-.055,.01),'f');
      else{for(const sx of[-1,1]){A(new THREE.CylinderGeometry(.05,.05,.045,14),0x1b1c1e,MX(sx*.122,y-.028,.004,0,0,Math.PI/2),'h');A(BOX(.01,.05,.018),0x111111,MX(sx*.146,y+.02,.004),'h')}
        const vz=new THREE.CylinderGeometry(R*1.08,R*1.08,.075,16,1,true,-Math.PI*.38,Math.PI*.76);A(vz,0x1c232b,MX(0,y+.025,-.006,0,0,0,1,1,1.08),'g');
        A(BOX(.17,.012,.02),0x1e1f22,MX(0,y+.066,R*1.06),'h')}}}
  return out}
function itemParts(key){const out=[],A=(g,c,m,f)=>out.push([g,c,m,f]),cy=(a,b,h,s=10)=>new THREE.CylinderGeometry(a,b,h,s);
  if(key==='bandage'){for(const[x,z,ry]of[[-.045,0,.1],[.05,.012,-.15]]){A(cy(.034,.034,.085,14),0xe6e0d0,MX(x,.034,z,ry,0,Math.PI/2),'f');A(cy(.012,.012,.087,8),0xb8b0a0,MX(x,.034,z,ry,0,Math.PI/2),'c')}
    A(BOX(.07,.003,.11),0xe6e0d0,MX(-.03,.0015,.09,.3),'f');A(gSlab(.13,.08,.016),0x5e6450,MX(.02,.008,-.085,.25,-Math.PI/2),'c');A(BOX(.07,.002,.03),0xd8d4c8,MX(.02,.017,-.085,.25),'c')}
  else if(key==='medkit'){A(gSlab(.27,.18,.085),0x7a1f1b,MX(0,.0425,0,0,-Math.PI/2),'f');A(BOX(.26,.006,.004),0x1a1a1a,MX(0,.07,.0875),'m');
    A(BOX(.12,.01,.04),0xe8e4da,MX(0,.087,0),'f');A(BOX(.04,.01,.12),0xe8e4da,MX(0,.0875,0),'f');for(const sx of[-1,1])A(BOX(.02,.012,.07),0x2a1210,MX(sx*.1,.087,0),'f');
    A(BOX(.012,.02,.06),0x1a1a1a,MX(.14,.055,0),'m');for(let k=0;k<3;k++)A(BOX(.26,.01,.004),0x4a1512,MX(0,.02+k*.02,-.0915),'f')}
  else if(key==='ammo_light'){A(BOX(.11,.045,.075),0xb59a62,MX(0,.0225,0),'c');A(BOX(.112,.012,.077),0x2a2a2a,MX(0,.03,0),'c');
    for(const[x,z,ry]of[[.08,.03,.4],[.085,-.01,.9],[.06,-.05,2.2]]){A(cy(.0045,.0045,.02,8),0xc8a050,MX(x,.0045,z,ry,0,Math.PI/2),'m');A(new THREE.ConeGeometry(.0045,.012,8),0xb06a3a,MX(x+Math.cos(ry)*.016,.0045,z-Math.sin(ry)*.016,ry,0,-Math.PI/2),'m')}}
  else if(key==='ammo_shell'){A(BOX(.15,.035,.095),0x8a3326,MX(0,.0175,0),'c');A(BOX(.15,.004,.095),0x3a1814,MX(0,.0355,0),'c');A(BOX(.15,.003,.09),0x8a3326,MX(0,.075,-.088,0,-1.1),'c');
    for(let i=0;i<5;i++)for(let j=0;j<3;j++){const x=-.056+i*.028,z=-.028+j*.028;A(cy(.0105,.0105,.03,10),0xa02a20,MX(x,.045,z),'r');A(cy(.0115,.0115,.012,10),0xc8a050,MX(x,.066,z),'m');A(cy(.003,.003,.002,6),0x9a7a3a,MX(x,.0725,z),'m')}
    for(const[x,z,ry]of[[.11,.04,.5],[.12,-.03,1.3]]){A(cy(.0105,.0105,.05,10),0xa02a20,MX(x,.0105,z,ry,0,Math.PI/2),'r');A(cy(.0115,.0115,.012,10),0xc8a050,MX(x+Math.cos(ry)*.031,.0105,z-Math.sin(ry)*.031,ry,0,Math.PI/2),'m')}}
  else if(key.startsWith('optic_')){const o=key.slice(6);
    if(o==='dot'){A(BOX(.05,.018,.07),0x2a2c30,MX(0,.009,0),'m');A(cy(.032,.032,.07,16),0x3a3d42,MX(0,.05,0,Math.PI/2),'p');A(cy(.029,.029,.003,16),0x5a8a9a,MX(0,.05,-.036,Math.PI/2),'g');A(new THREE.SphereGeometry(.004,6,4),0xff3a2a,MX(0,.05,-.03),'r')}
    else{const L={x2:.2,x3:.3,x4:.38,x8:.46}[o],Bl={x2:.034,x3:.04,x4:.046,x8:.06}[o];A(cy(.026,.026,L,16),0x26282c,MX(0,.06,0,Math.PI/2),'m');A(cy(.026,Bl,.1,16),0x26282c,MX(0,.06,-L/2-.05,Math.PI/2),'m');A(cy(.032,.026,.07,16),0x26282c,MX(0,.06,L/2+.035,Math.PI/2),'m');
      A(cy(Bl-.003,Bl-.003,.004,16),0x5a8a9a,MX(0,.06,-L/2-.1,Math.PI/2),'g');for(const z of[L*.28,-L*.28]){A(BOX(.04,.03,.03),0x2a2c30,MX(0,.015,z),'m')}if(L>.25)A(cy(.016,.016,.03,10),0x3a3d42,MX(0,.1,0),'p')}}
  else if(key==='ammo_medium'){A(BOX(.16,.06,.1),0x8a6a40,MX(0,.03,0),'c');A(BOX(.162,.01,.102),0x6a4e2c,MX(0,.062,0),'c');A(BOX(.12,.03,.002),0xd8c8a0,MX(0,.032,.051),'p');
    for(const[x,z,ry]of[[.11,.03,.3],[.115,-.02,1.1],[.09,-.06,2.4]]){A(cy(.0055,.0055,.03,8),0xc8a050,MX(x,.0055,z,ry,0,Math.PI/2),'m');A(new THREE.ConeGeometry(.0045,.016,8),0xb06a3a,MX(x+Math.cos(ry)*.023,.0055,z-Math.sin(ry)*.023,ry,0,-Math.PI/2),'m')}}
  else if(key==='ammo_heavy'){A(BOX(.26,.13,.095),0x4a5236,MX(0,.065,0),'p');A(BOX(.268,.03,.103),0x434a31,MX(0,.135,0),'p');A(BOX(.27,.012,.106),0x3a4029,MX(0,.12,0),'p');
    A(BOX(.12,.012,.022),0x1e1e1c,MX(0,.162,0),'h');for(const sx of[-1,1])A(BOX(.008,.025,.012),0x1e1e1c,MX(sx*.06,.152,0),'m');
    A(BOX(.012,.07,.03),0x3a4029,MX(-.136,.1,0),'m');A(BOX(.16,.018,.002),0xc8b048,MX(.0,.075,.0485),'p');A(BOX(.1,.012,.002),0xc8b048,MX(-.03,.05,.0485),'p')}
  return out}
// merge parts per finish into vertex-coloured geometries
function mergeColored(parts){const by={};for(const[g,c,m,f]of parts)(by[f]=by[f]||[]).push([g,c,m]);const res={},C=new THREE.Color();
  for(const f in by){let n=0;const arr=by[f].map(([g,c,m])=>{const q=g.index?g.toNonIndexed():g.clone();q.applyMatrix4(m);if(!q.attributes.normal)q.computeVertexNormals();n+=q.attributes.position.count;return[q,c]});
    const pos=new Float32Array(n*3),nor=new Float32Array(n*3),uv=new Float32Array(n*2),col=new Float32Array(n*3);let o=0;
    for(const[q,c]of arr){const k=q.attributes.position.count;pos.set(q.attributes.position.array,o*3);nor.set(q.attributes.normal.array,o*3);if(q.attributes.uv)uv.set(q.attributes.uv.array,o*2);C.setHex(c);
      for(let i=0;i<k;i++){col[(o+i)*3]=C.r;col[(o+i)*3+1]=C.g;col[(o+i)*3+2]=C.b}o+=k}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setAttribute('color',new THREE.BufferAttribute(col,3));res[f]=g}
  return res}
const cardTex=texC(128,(g,s)=>{g.fillStyle='#a0a0a0';g.fillRect(0,0,s,s);for(let i=0;i<1600;i++){const v=140+Math.random()*60|0;g.fillStyle=`rgba(${v},${v},${v},.5)`;g.fillRect(Math.random()*s,Math.random()*s,1,1)}
  g.fillStyle='rgba(30,30,30,.55)';g.fillRect(0,s*.36,s,s*.26);g.fillStyle='rgba(255,255,255,.75)';g.font='bold 22px sans-serif';g.textAlign='center';g.fillText('— 50 —',s/2,s*.56)},1);
const IM={f:SM({vertexColors:true,map:GTX.cloth,metalness:0,roughness:.94,envMapIntensity:.3}),h:SM({vertexColors:true,map:GTX.poly,metalness:.05,roughness:.6,envMapIntensity:.6}),
  m:SM({vertexColors:true,map:GTX.metal,metalness:.85,roughness:.32}),p:SM({vertexColors:true,map:GTX.metal,metalness:.35,roughness:.62,envMapIntensity:.7}),
  g:SM({vertexColors:true,metalness:.2,roughness:.05,envMapIntensity:2,transparent:true,opacity:.6,depthWrite:false}),c:SM({vertexColors:true,map:cardTex,metalness:0,roughness:.85,envMapIntensity:.3}),
  r:SM({vertexColors:true,metalness:0,roughness:.42,envMapIntensity:.8})};
const ITEMCACHE={},SCL={ammo_light:1.5,ammo_medium:1.35,ammo_shell:1.3,bandage:1.3,medkit:1.15};
function itemKey(it){return it.kind==='optic'?'optic_'+it.id:it.kind==='armor'?'vest'+it.lv:it.kind==='helmet'?'helm'+it.lv:it.kind==='ammo'?'ammo_'+it.id:it.kind}
function itemModel(it){const key=itemKey(it);let c=ITEMCACHE[key];
  if(!c){const parts=key.startsWith('vest')?gearParts('vest',+key[4]):key.startsWith('helm')?gearParts('helm',+key[4],true):itemParts(key);const gs=mergeColored(parts);
    const bb=new THREE.Box3(),tmp=new THREE.Box3();for(const f in gs){const g=gs[f];if(key.startsWith('vest')){g.translate(0,-1.29,0);const pa=g.attributes.position;for(let i=0;i<pa.count;i++){const z=pa.getZ(i),a=Math.abs(z);pa.setZ(i,a<=.09?z*.07:Math.sign(z)*(a-.0837))}g.rotateX(-Math.PI/2)}else if(SCL[key])g.scale(SCL[key],SCL[key],SCL[key]);if(key.startsWith('helm'))g.rotateX(-.06);g.computeBoundingBox();tmp.copy(g.boundingBox);bb.union(tmp)}
    const ctr=bb.getCenter(new THREE.Vector3());for(const f in gs)gs[f].translate(-ctr.x,-bb.min.y+.002,-ctr.z);c=ITEMCACHE[key]=gs}
  const g=new THREE.Group();for(const f in c){const m=new THREE.Mesh(c[f],IM[f]);m.castShadow=f!=='g';if(f==='g')m.renderOrder=2;g.add(m)}return g}
// small line-art pictograms (also used for the HUD and pickup toasts)
const ICONS={
  optic:id=>`<svg viewBox="0 0 24 24">${id==='dot'?'<rect x="5" y="8" width="14" height="9" rx="2" fill="currentColor" fill-opacity=".22" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12.5" r="1.6" fill="currentColor"/><path d="M7 20h10" stroke="currentColor" stroke-width="1.5"/>':'<path d="M3 10h3l2-2h8l2 2h3v5h-3l-2 2H8l-2-2H3z" fill="currentColor" fill-opacity=".22" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M9 18v2M15 18v2" stroke="currentColor" stroke-width="1.5"/>'}</svg>`,
  armor:lv=>`<svg viewBox="0 0 24 24"><path d="M8 3h2.5c.4 1.6 1 2.3 1.5 2.3S13.1 4.6 13.5 3H16l1 3 2 1v12.5c0 .8-.7 1.5-1.5 1.5h-11C5.7 21 5 20.3 5 19.5V7l2-1z" fill="currentColor" fill-opacity=".22" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>${lv>1?'<path d="M8 13.5h8M8 16.5h8" stroke="currentColor" stroke-width="1.4"/>':''}${lv>2?'<path d="M5 7.5 2.5 9.5 3.5 12.5 5 12M19 7.5l2.5 2-1 3-1.5-.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>':''}</svg>`,
  helmet:lv=>`<svg viewBox="0 0 24 24"><path d="M3.5 16C3.5 9.5 7.3 5 12 5s8.5 4.5 8.5 11z" fill="currentColor" fill-opacity=".22" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M2.5 16h19" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>${lv>1?'<path d="M5 12.5h3M16 12.5h3" stroke="currentColor" stroke-width="1.6"/>':''}${lv>2?'<path d="M5.5 16.5v2.5h13v-2.5" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="4.5" cy="16" r="2" fill="currentColor"/><circle cx="19.5" cy="16" r="2" fill="currentColor"/>':''}</svg>`,
  bandage:()=>`<svg viewBox="0 0 24 24"><ellipse cx="9" cy="12" rx="4" ry="6" fill="currentColor" fill-opacity=".22" stroke="currentColor" stroke-width="1.5"/><ellipse cx="9" cy="12" rx="1.4" ry="2.2" stroke="currentColor" stroke-width="1.2" fill="none"/><path d="M9 6h8l3 4-3 2H9" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
  medkit:()=>`<svg viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2.5" fill="currentColor" fill-opacity=".22" stroke="currentColor" stroke-width="1.5"/><path d="M9 7V5h6v2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 10.5v6M9 13.5h6" stroke="currentColor" stroke-width="2.2"/></svg>`,
  light:()=>`<svg viewBox="0 0 24 24">${[6,11,16].map(x=>`<path d="M${x} 20v-9c0-2.5 1.2-5 2-6 .8 1 2 3.5 2 6v9z" fill="currentColor" fill-opacity=".22" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>`).join('')}</svg>`,
  shell:()=>`<svg viewBox="0 0 24 24">${[5,13].map(x=>`<rect x="${x}" y="4" width="6" height="12" rx="1" fill="currentColor" fill-opacity=".22" stroke="currentColor" stroke-width="1.4"/><rect x="${x-.5}" y="16" width="7" height="4" fill="currentColor"/>`).join('')}</svg>`,
  medium:()=>`<svg viewBox="0 0 24 24">${[7,14].map(x=>`<path d="M${x} 21v-10c0-3 1.3-6 2-7 .7 1 2 4 2 7v10z" fill="currentColor" fill-opacity=".22" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M${x} 17h4" stroke="currentColor" stroke-width="1.1"/>`).join('')}</svg>`,
  heavy:()=>`<svg viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="12" rx="1" fill="currentColor" fill-opacity=".22" stroke="currentColor" stroke-width="1.5"/><path d="M3 11h18M9 8V5.5h6V8" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`,
  weapon:()=>`<svg viewBox="0 0 24 24"><path d="M2 10h13l1-1.5h6V11h-3v2h-4l-1 1h-2l-1.5 4H7.5l1-4H5l-3-1.5z" fill="currentColor" fill-opacity=".3" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>`};
const itemIcon=it=>it.kind==='optic'?ICONS.optic(it.id):it.kind==='ammo'?ICONS[it.id]():it.kind==='armor'||it.kind==='helmet'?ICONS[it.kind](it.lv):ICONS[it.kind](0);
const LVCOL=['#cfcabd','#d9d4c6','#8fbbe6','#c3a2f0'];
// ---------- characters: one skinned mesh per actor (rigid parts bound to bones), vertex colours, gear shown by bone scale ----------
// vertex colours are linearised once; the material gain keeps dark clothing readable under tone mapping
// people: 4x2 detail atlas (grey-scale, tinted by vertex colour) so clothes and skin read as cloth/skin instead of plastic
// 0 knit  1 twill+seams  2 skin  3 leather  4 hair  5 ripstop nylon  6 plain  7 webbing
const RIGATLAS=(()=>{const c=document.createElement('canvas');c.width=512;c.height=256;const g=c.getContext('2d'),T=128,rnd=Math.random;
  const cell=(i,f)=>{const x0=(i%4)*T,y0=((i/4)|0)*T;g.save();g.beginPath();g.rect(x0,y0,T,T);g.clip();g.translate(x0,y0);f();g.restore()};
  const base=(v)=>{g.fillStyle=`rgb(${v},${v},${v})`;g.fillRect(0,0,T,T)},noise=(n,a,d=1)=>{for(let i=0;i<n;i++){const v=rnd()<.5?0:255;g.fillStyle=`rgba(${v},${v},${v},${rnd()*a})`;g.fillRect(rnd()*T,rnd()*T,d+rnd()*d,d+rnd()*d)}};
  cell(0,()=>{base(212);for(let y=0;y<T;y+=3)for(let x=0;x<T;x+=4){g.fillStyle=`rgba(0,0,0,${.06+rnd()*.07})`;g.fillRect(x+(y%6?2:0),y,2,2)}noise(900,.12);
    g.strokeStyle='rgba(0,0,0,.22)';for(let i=0;i<6;i++){g.beginPath();const y=rnd()*T;g.moveTo(0,y);g.bezierCurveTo(40,y+8*(rnd()-.5),90,y+10*(rnd()-.5),T,y+6*(rnd()-.5));g.lineWidth=1+rnd()*2;g.stroke()}});
  cell(1,()=>{base(205);for(let i=-T;i<T*2;i+=3){g.strokeStyle=`rgba(0,0,0,${.05+rnd()*.06})`;g.beginPath();g.moveTo(i,0);g.lineTo(i+T*.5,T);g.stroke()}noise(700,.12);
    g.strokeStyle='rgba(0,0,0,.45)';g.lineWidth=1.5;for(const x of[T*.25,T*.75]){g.beginPath();g.moveTo(x,0);g.lineTo(x,T);g.stroke();g.setLineDash([2,3]);g.beginPath();g.moveTo(x+3,0);g.lineTo(x+3,T);g.stroke();g.setLineDash([])}
    g.strokeStyle='rgba(0,0,0,.18)';for(let i=0;i<5;i++){g.beginPath();const y=T*(.2+rnd()*.7);g.moveTo(T*.3,y);g.quadraticCurveTo(T*.5,y+6,T*.7,y);g.lineWidth=2;g.stroke()}});
  cell(2,()=>{base(226);noise(1600,.06,2);for(let i=0;i<40;i++){g.fillStyle=`rgba(150,60,50,${rnd()*.05})`;g.beginPath();g.arc(rnd()*T,rnd()*T,4+rnd()*10,0,7);g.fill()}});
  cell(3,()=>{base(190);noise(2500,.18);g.strokeStyle='rgba(0,0,0,.25)';for(let i=0;i<14;i++){g.beginPath();const y=rnd()*T;g.moveTo(0,y);g.lineTo(T,y+(rnd()-.5)*12);g.lineWidth=.6+rnd();g.stroke()}
    g.fillStyle='rgba(255,255,255,.08)';g.fillRect(0,T*.45,T,T*.1)});
  cell(4,()=>{base(170);for(let i=0;i<500;i++){const x=rnd()*T,y=rnd()*T;g.strokeStyle=rnd()<.5?`rgba(0,0,0,${.15+rnd()*.25})`:`rgba(255,255,255,${.06+rnd()*.12})`;g.lineWidth=.6+rnd();g.beginPath();g.moveTo(x,y);g.lineTo(x+(rnd()-.5)*4,y+10+rnd()*20);g.stroke()}});
  cell(5,()=>{base(200);g.strokeStyle='rgba(0,0,0,.12)';g.lineWidth=1;for(let i=0;i<T;i+=8){g.beginPath();g.moveTo(i,0);g.lineTo(i,T);g.stroke();g.beginPath();g.moveTo(0,i);g.lineTo(T,i);g.stroke()}noise(800,.1);
    g.strokeStyle='rgba(0,0,0,.25)';for(let i=0;i<7;i++){g.beginPath();const y=rnd()*T;g.moveTo(0,y);g.bezierCurveTo(40,y+12*(rnd()-.5),80,y+12*(rnd()-.5),T,y);g.lineWidth=1.5+rnd()*2;g.stroke()}});
  cell(6,()=>{base(225);noise(400,.05)});
  cell(7,()=>{base(185);for(let y=0;y<T;y+=2){g.fillStyle=`rgba(0,0,0,${y%4?.12:.03})`;g.fillRect(0,y,T,1)}g.fillStyle='rgba(0,0,0,.3)';g.fillRect(0,4,T,2);g.fillRect(0,T-6,T,2)});
  const t=new THREE.CanvasTexture(c);t.anisotropy=ANISO;return t})();
const RIGM=new THREE.MeshStandardMaterial({vertexColors:true,skinning:true,map:RIGATLAS,envMap:ENV,envMapIntensity:.5,roughness:.9,metalness:0});RIGM.color.setScalar(1.12);_lin.add(RIGM);
const SKINC=[0xd2a890,0xbe9580,0xa07a64,0x86604a,0x684a3a],HAIRC=[0x1e1712,0x3a2618,0x5a3c22,0x16120f,0x6a5a48],SHIRTC=[0x55604a,0x4a5462,0x6a5a44,0x45454a,0x6e6a5a,0x52463a,0x3a4848,0x5e4a48,0x66603e,0x7a7468,0x8a3a30],
  PANTSC=[0x3a4256,0x464638,0x5a5040,0x333336,0x4a5442,0x50463a,0x2e3a52],PACKC=[0x55553f,0x434843,0x6a5840,0x37393f],JACKC=[0x3a4436,0x2e3440,0x5a4a32,0x2a2a2e,0x4a3a2e,0x5c5a50,0x6a3020],BOOTC=[0x2a2018,0x3a2c1e,0x1c1c1e,0x4a3a28];
const BONES=[['hips',-1,0,.95,0],['spine',0,0,1.08,0],['chest',1,0,1.26,0],['neck',2,0,1.46,0],['head',3,0,1.53,0],
  ['uaL',2,.2,1.42,0],['faL',5,.2,1.13,0],['haL',6,.2,.87,0],['uaR',2,-.2,1.42,0],['faR',8,-.2,1.13,0],['haR',9,-.2,.87,0],
  ['thL',0,.1,.92,0],['shL',11,.1,.49,0],['ftL',12,.1,.08,0],['thR',0,-.1,.92,0],['shR',14,-.1,.49,0],['ftR',15,-.1,.08,0],
  ['vest1',2,0,1.26,0],['vest2',2,0,1.26,0],['vest3',2,0,1.26,0],['helm1',4,0,1.53,0],['helm2',4,0,1.53,0],['helm3',4,0,1.53,0],['pack',2,0,1.26,0]];
const BI={};BONES.forEach((b,i)=>BI[b[0]]=i);
function rigGeometry(seed){const r=mulberry(seed*977+13),pick=a=>a[(r()*a.length)|0];
  const skin=pick(SKINC),hair=pick(HAIRC),shirt=pick(SHIRTC),pants=pick(PANTSC),pack=pick(PACKC),jack=pick(JACKC),boot=pick(BOOTC);
  const top=(r()*3)|0,cargo=r()<.6,headw=(r()*4)|0,gloves=r()<.55,glove=0x2a2622;
  const parts=[];let RG=6;const P=(geo,bone,col,x,y,z,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1)=>{parts.push([geo,BI[bone],col,MX(x,y,z,ry,rx,rz,sx,sy,sz),RG])};
  const cyl=(a,b,h,s=12)=>new THREE.CylinderGeometry(a,b,h,s),sph=(rr,ws=14,hs=10,t0=0,tl=Math.PI)=>new THREE.SphereGeometry(rr,ws,hs,0,Math.PI*2,t0,tl);
  const lathe=(pts,s=14)=>new THREE.LatheGeometry(pts.map(([x,y])=>new THREE.Vector2(x,y)),s);
  const topC=top===1?jack:shirt,topR=top===1?5:0;
  // --- legs: tapered trousers with knee joint fillers, cargo pockets, boots with soles
  for(const s of[-1,1]){const L=s>0?'L':'R';RG=1;
    P(lathe([[0,0],[.064,0],[.07,.06],[.08,.2],[.088,.34],[.09,.44],[0,.44]]),'th'+L,pants,s*.1,.485,0,0,0,0,1,1,.92);
    P(sph(.067,12,8),'sh'+L,pants,s*.1,.49,.004);
    P(lathe([[0,0],[.047,0],[.05,.05],[.058,.18],[.064,.29],[.062,.36],[.058,.4],[0,.4]]),'sh'+L,pants,s*.1,.09,0,0,0,0,1,1,.95);
    if(cargo){P(BOX(.03,.11,.09),'th'+L,pants,s*.178,.66,.0);P(BOX(.034,.012,.094),'th'+L,pants,s*.18,.72,0)}
    P(sph(.088,12,8),'th'+L,pants,s*.1,.9,0);
    RG=3;P(lathe([[0,0],[.06,0],[.062,.06],[.058,.15],[0,.15]]),'ft'+L,boot,s*.1,.03,-.005);
    P(BOX(.1,.07,.17),'ft'+L,boot,s*.1,.065,.06);P(sph(.05,10,6,0,Math.PI*.5),'ft'+L,boot,s*.1,.035,.145,0,0,0,1,.9,1.1);
    RG=6;P(BOX(.106,.022,.27),'ft'+L,0x1a1816,s*.1,.011,.04);P(BOX(.104,.004,.12),'ft'+L,0x8a8070,s*.1,.1,.05,-.25)}
  // --- pelvis + belt
  RG=1;P(lathe([[0,0],[.15,0],[.168,.06],[.17,.16],[.16,.22],[0,.22]]),'hips',pants,0,.85,0,0,0,0,1,1,.66);
  RG=7;P(cyl(.172,.172,.042,16),'hips',0x2a2620,0,1.04,0,0,0,0,1,1,.68);RG=6;P(BOX(.05,.036,.01),'hips',0x8a8a84,0,1.04,.118);
  // --- torso (lathe gives chest/waist shape), shoulders, neck
  RG=topR;P(lathe([[0,0],[.158,0],[.162,.08],[.17,.17],[.19,.3],[.2,.38],[.185,.43],[.13,.47],[.07,.48],[0,.48]],16),'chest',topC,0,1.03,0,0,0,0,1,1,.62);
  for(const s of[-1,1])P(sph(.072,12,8),'chest',topC,s*.19,1.41,0,0,0,0,1,.9,1);
  if(top===1){RG=6;P(BOX(.012,.4,.008),'chest',0x1a1a1a,0,1.24,.124);RG=5;P(cyl(.075,.085,.07,14),'chest',topC,0,1.5,0);for(const s of[-1,1])P(BOX(.1,.09,.02),'chest',topC,s*.085,1.34,.118)}
  if(top===2){RG=0;P(lathe([[0,0],[.13,0],[.15,.06],[.12,.13],[0,.14]],14),'chest',topC,0,1.44,-.07,-.5,0,0,1,1,.8);P(BOX(.2,.1,.02),'chest',topC,0,1.13,.106);
    RG=6;for(const s of[-1,1])P(cyl(.004,.004,.14,5),'chest',0xd8d4c8,s*.04,1.38,.11)}
  if(top===0){RG=0;P(cyl(.064,.07,.03,14),'chest',topC,0,1.475,0)}
  RG=2;P(cyl(.05,.056,.1,10),'neck',skin,0,1.49,0);
  // --- head: skull, jaw, nose, brow, ears, eyes, mouth; then hair or headwear
  P(sph(.104,16,12),'head',skin,0,1.635,.0,0,0,0,.94,1.1,1.02);P(lathe([[0,0],[.05,0],[.075,.03],[.085,.07],[0,.075]],12),'head',skin,0,1.545,.02,0,0,0,1,1,1.05);
  P(BOX(.022,.04,.03),'head',skin,0,1.615,.1,-.25);P(BOX(.02,.012,.016),'head',skin,0,1.6,.112);P(BOX(.1,.016,.024),'head',skin,0,1.665,.09);
  for(const s of[-1,1]){P(sph(.026,8,6),'head',skin,s*.098,1.625,-.005,0,0,0,.5,1,.8);
    RG=6;P(sph(.011,8,6),'head',0xe8e4dc,s*.036,1.642,.088);P(sph(.0065,8,6),'head',0x2a1e16,s*.036,1.642,.097);RG=4;P(BOX(.036,.008,.012),'head',hair,s*.036,1.668,.1,0,0,s*-.12)}
  RG=6;P(BOX(.034,.006,.008),'head',0x8a5048,0,1.578,.1);
  RG=4;if(headw===0||headw===3){P(sph(.11,14,8,0,Math.PI*.52),'head',hair,0,1.648,-.008,0,0,0,.98,1.04,1.06);if(headw===3)P(BOX(.16,.08,.05),'head',hair,0,1.61,-.08)}
  if(headw===1){RG=0;const bc=pick([0x2a2a2a,0x4a3a2a,0x3a4436,0x5a2a24]);P(sph(.115,14,8,0,Math.PI*.55),'head',bc,0,1.648,-.006,0,0,0,.98,1.12,1.06);P(cyl(.108,.112,.035,14),'head',bc,0,1.63,-.006,0,0,0,.98,1,1.02)}
  if(headw===2){RG=5;const cc=pick([0x2a2e36,0x3a4436,0x5a4a32,0x6a6a62]);P(sph(.112,14,8,0,Math.PI*.5),'head',cc,0,1.655,-.006,0,0,0,.98,1,1.04);P(BOX(.15,.008,.1),'head',cc,0,1.668,.12,-.12);RG=4;P(BOX(.17,.05,.06),'head',hair,0,1.605,-.07)}
  // --- arms: sleeves with elbow joint, cuffs, gloves or bare hands
  for(const s of[-1,1]){const L=s>0?'L':'R';RG=topR;
    P(lathe([[0,0],[.046,0],[.05,.05],[.058,.2],[.062,.29],[0,.29]]),'ua'+L,topC,s*.2,1.13,0);P(sph(.05,10,8),'fa'+L,topC,s*.2,1.13,0);
    P(lathe([[0,0],[.04,0],[.042,.02],[.048,.17],[.05,.26],[0,.26]]),'fa'+L,topC,s*.2,.87,0);RG=top===1?7:0;P(cyl(.043,.043,.03,12),'fa'+L,topC,s*.2,.89,0);
    const hc=gloves?glove:skin;RG=gloves?3:2;P(BOX(.06,.085,.032),'ha'+L,hc,s*.2,.83,.005);P(BOX(.058,.05,.03),'ha'+L,hc,s*.2,.78,.016,.35);P(BOX(.022,.045,.022),'ha'+L,hc,s*.2-s*.03,.83,.03,.2,0,s*.4)}
  // worn gear uses exactly the same parts as the ground items
  RG=6;for(const lv of[1,2,3]){for(const[g,c,m]of gearParts('vest',lv))parts.push([g,BI['vest'+lv],c,m,6]);for(const[g,c,m]of gearParts('helm',lv))parts.push([g,BI['helm'+lv],c,m,6])}
  RG=5;P(BOX(.28,.36,.16),'pack',pack,0,1.27,-.2);P(cyl(.06,.06,.28,10),'pack',pack,0,1.48,-.2,0,0,Math.PI/2);P(BOX(.22,.14,.04),'pack',pack,0,1.18,-.29);
  RG=7;for(const s of[-1,1])P(BOX(.04,.3,.02),'pack',0x2a2a26,s*.1,1.3,-.11);
  // merge with colour, atlas uv + rigid skin weights
  let n=0;const gs=parts.map(([g,bi,col,mx,rg])=>{const q=g.index?g.toNonIndexed():g.clone();q.applyMatrix4(mx);n+=q.attributes.position.count;return[q,bi,col,rg]});
  const pos=new Float32Array(n*3),nor=new Float32Array(n*3),colA=new Float32Array(n*3),uvA=new Float32Array(n*2),si=new Uint16Array(n*4),sw=new Float32Array(n*4),C=new THREE.Color();let o=0;
  for(const[q,bi,col,rg]of gs){pos.set(q.attributes.position.array,o*3);nor.set(q.attributes.normal.array,o*3);C.setHex(col);const cnt=q.attributes.position.count,uv=q.attributes.uv,u0=(rg%4)/4,v0=1-((rg/4)|0)/2-.5;
    for(let i=0;i<cnt;i++){const sh=.94+Math.random()*.06;colA[(o+i)*3]=C.r*sh;colA[(o+i)*3+1]=C.g*sh;colA[(o+i)*3+2]=C.b*sh;si[(o+i)*4]=bi;sw[(o+i)*4]=1;
      const uu=uv?uv.getX(i):0,vv=uv?uv.getY(i):0;uvA[(o+i)*2]=u0+(.004+(uu-Math.floor(uu))*.992)/4;uvA[(o+i)*2+1]=v0+(.004+(vv-Math.floor(vv))*.992)/2}o+=cnt}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('normal',new THREE.BufferAttribute(nor,3));geo.setAttribute('color',new THREE.BufferAttribute(colA,3));geo.setAttribute('uv',new THREE.BufferAttribute(uvA,2));
  geo.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(si,4));geo.setAttribute('skinWeight',new THREE.BufferAttribute(sw,4));geo.computeBoundingSphere();geo.boundingSphere.radius=2.2;return{geo,hasPack:r()<.55}}
function buildRig(seed){const {geo,hasPack}=rigGeometry(seed),bones=BONES.map(b=>{const o=new THREE.Bone();o.name=b[0];return o});
  BONES.forEach((b,i)=>{if(b[1]<0)bones[i].position.set(b[2],b[3],b[4]);else{const p=BONES[b[1]];bones[i].position.set(b[2]-p[2],b[3]-p[3],b[4]-p[4]);bones[b[1]].add(bones[i])}});
  const mesh=new THREE.SkinnedMesh(geo,RIGM);mesh.add(bones[0]);mesh.bind(new THREE.Skeleton(bones));mesh.frustumCulled=false;
  const g=new THREE.Group();g.add(mesh);const B={};bones.forEach((b,i)=>B[BONES[i][0]]=b);
  const holder=new THREE.Group();holder.rotation.order='YXZ';B.chest.add(holder);const fl=new THREE.Sprite(AM.flash);fl.scale.set(.45,.45,1);fl.visible=false;holder.add(fl);
  for(const k of['vest1','vest2','vest3','helm1','helm2','helm3'])B[k].scale.setScalar(1e-4);B.pack.scale.setScalar(hasPack?1:1e-4);
  return{g,mesh,B,holder,fl,gunKey:null,gun:null,deadT:0,flinch:0,seed}}
// ---------- ready-made soldier body (Mixamo-rigged glTF) driven by the procedural rig ----------
// the invisible procedural rig still does all the posing/IK; legs+spine copy its rotations, arms are solved to its wrist positions
const SOL={ready:false,gl:null,mats:[]},SOLINVIS=new THREE.MeshBasicMaterial({visible:false});
try{const buf=Uint8Array.from(atob(SOLDIER_GLB),c=>c.charCodeAt(0)).buffer;new THREE.GLTFLoader().parse(buf,'',gl=>{SOL.gl=gl;
  const tints=[null,0x8fa070,0x8c96b4,0xb08c6c];gl.scene.traverse(o=>{if(o.isMesh&&o.name==='vanguard_Mesh')SOL.base=o.material});
  SOL.mats=tints.map(t=>{if(!t)return SOL.base;const m=SOL.base.clone();m.color.setHex(t);return m});SOL.ready=true},e=>console.warn('soldier load failed',e))}catch(e){console.warn(e)}
const SOLMAP={hips:'Hips',spine:'Spine',chest:'Spine2',neck:'Neck',head:'Head',thL:'LeftUpLeg',shL:'LeftLeg',ftL:'LeftFoot',thR:'RightUpLeg',shR:'RightLeg',ftR:'RightFoot'};
const _sq=new THREE.Quaternion(),_sq2=new THREE.Quaternion(),_sv=new THREE.Vector3(),_sv2=new THREE.Vector3(),_sv3=new THREE.Vector3(),_sv4=new THREE.Vector3();
function attachSoldier(rg,seed){const m=THREE.SkeletonUtils.clone(SOL.gl.scene),M={};m.rotation.y=Math.PI;m.scale.setScalar(.955);
  const mat=SOL.mats[seed%SOL.mats.length];m.traverse(o=>{if(o.isBone)M[o.name.replace('mixamorig','')]=o;if(o.isMesh){o.castShadow=true;o.frustumCulled=false;if(o.name==='vanguard_Mesh')o.material=mat}});
  rg.g.add(m);rg.mesh.material=SOLINVIS;
  // measure rest correction with the rig in its rest pose
  const B=rg.B;for(const k in B){B[k].quaternion.identity()}B.hips.position.set(0,.95,0);const gq=rg.g.quaternion.clone();rg.g.quaternion.identity();rg.g.updateMatrixWorld(true);
  // rest correction per mapped bone: soldierWorld = rigWorld * inv(rigRest) * soldierRest
  const corr={};for(const k in SOLMAP){const a=rg.B[k],b=M[SOLMAP[k]];corr[k]=a.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(b.getWorldQuaternion(new THREE.Quaternion()))}rg.g.quaternion.copy(gq);
  const mx=new THREE.AnimationMixer(m),act={};for(const c of SOL.gl.animations)act[c.name]=mx.clipAction(c);['Idle','Walk','Run'].forEach(n=>{act[n].play();act[n].setEffectiveWeight(n==='Idle'?1:0)});
  rg.sol={m,M,corr,mx,act,w:{Idle:1,Walk:0,Run:0},len:{ua:M.LeftArm.getWorldPosition(new THREE.Vector3()).distanceTo(M.LeftForeArm.getWorldPosition(new THREE.Vector3())),fa:M.LeftForeArm.getWorldPosition(new THREE.Vector3()).distanceTo(M.LeftHand.getWorldPosition(new THREE.Vector3()))}}}
function deadFade(rg,o){if(!o.dead){rg.dead0=null;return}if(rg.dead0==null)rg.dead0=S.t;rg.deadAge=S.t-rg.dead0;const k=Math.max(0,rg.deadAge-8);if(k>0)rg.g.position.y-=Math.min(1.2,k*.5);if(rg.deadAge>11)rg.g.visible=false}
function setWorldQ(bone,q){bone.parent.getWorldQuaternion(_sq2);bone.quaternion.copy(_sq2.invert().multiply(q));bone.updateMatrixWorld(true)}
function aimBone(bone,child,dir){bone.getWorldPosition(_sv);child.getWorldPosition(_sv2);_sv2.sub(_sv).normalize();_sq.setFromUnitVectors(_sv2,_sv3.copy(dir).normalize());
  bone.getWorldQuaternion(_sq2);_sq.multiply(_sq2);setWorldQ(bone,_sq)}
// two-bone IK on the soldier arm: shoulder S -> elbow -> wrist T, elbow bent toward the rig's own elbow
function solArm(S_,side,T,poleP){const M=S_.M,L=side>0?'Left':'Right',ua=M[L+'Arm'],fa=M[L+'ForeArm'],ha=M[L+'Hand'],a=S_.len.ua,b=S_.len.fa;
  const s0=ua.getWorldPosition(new THREE.Vector3()),d=_sv4.copy(T).sub(s0);let dl=Math.min(d.length(),(a+b)*.995);d.normalize();
  const x=(a*a-b*b+dl*dl)/(2*dl),h=Math.sqrt(Math.max(0,a*a-x*x)),pole=_sv3.copy(poleP).sub(s0);pole.addScaledVector(d,-pole.dot(d)).normalize();
  const E=s0.clone().addScaledVector(d,x).addScaledVector(pole,h),Tt=s0.clone().addScaledVector(d,dl);aimBone(ua,fa,E.clone().sub(s0));aimBone(fa,ha,Tt.sub(E))}
function driveSoldier(rg,o){const S_=rg.sol,B=rg.B,dt=Math.min(.1,o.dt||.016);
  const useClip=!o.dead&&o.stance==='stand';const tw=useClip?(o.moving?(o.run?{Idle:0,Walk:0,Run:1}:{Idle:0,Walk:1,Run:0}):{Idle:1,Walk:0,Run:0}):{Idle:1,Walk:0,Run:0};
  for(const n in tw){S_.w[n]+=(tw[n]-S_.w[n])*Math.min(1,dt*8);S_.act[n].setEffectiveWeight(S_.w[n])}S_.act.Walk.timeScale=1.5;S_.act.Run.timeScale=1.25;S_.mx.update(dt);
  rg.g.updateMatrixWorld(true);
  const copy=k=>{const a=B[k],b=S_.M[SOLMAP[k]];a.getWorldQuaternion(_sq);_sq.multiply(S_.corr[k]);setWorldQ(b,_sq)};
  if(useClip){// clip legs; turn the pelvis with the rig's hip yaw so strafing reads, keep the chest on the aim direction
    const hy=B.hips.rotation.y;if(hy){S_.M.Hips.parent.getWorldQuaternion(_sq2);rg.g.getWorldQuaternion(_sq);_sv.set(0,1,0).applyQuaternion(_sq).applyQuaternion(_sq2.invert());_sq.setFromAxisAngle(_sv,hy);S_.M.Hips.quaternion.premultiply(_sq);S_.M.Hips.updateMatrixWorld(true)}
    copy('chest');copy('neck');copy('head')}
  else{const hp=B.hips.getWorldPosition(_sv);S_.M.Hips.parent.worldToLocal(_sv.add(_sv2.set(0,.07,0)));S_.M.Hips.position.copy(_sv);
    for(const k of['hips','spine','chest','neck','head','thL','shL','ftL','thR','shR','ftR'])copy(k)}
  const armedOrHeal=o.armed||o.heal;if(!o.dead&&(armedOrHeal||!useClip)){
    for(const[side,L]of[[1,'L'],[-1,'R']]){const T=B['ha'+L].getWorldPosition(new THREE.Vector3()),P_=B['fa'+L].getWorldPosition(new THREE.Vector3());
      // push the pole slightly outward/down so elbows read naturally
      P_.add(_sv2.set(0,-.05,0));solArm(S_,side,T,P_)}
    if(o.armed&&rg.gun){const f=rg.holder.getWorldDirection(_sv).negate(),dn=_sv2.set(0,-1,0);
      aimBone(S_.M.RightHand,S_.M.RightHandMiddle1,_sv3.copy(f).multiplyScalar(.45).addScaledVector(dn,.55));aimBone(S_.M.LeftHand,S_.M.LeftHandMiddle1,_sv3.copy(f).multiplyScalar(.7).addScaledVector(dn,.3))}}}
// two-bone arm IK in chest space: shoulder→elbow→wrist, elbow pushed down and outward
const DOWN=new THREE.Vector3(0,-1,0),_S=new THREE.Vector3(),_T=new THREE.Vector3(),_E=new THREE.Vector3(),_D=new THREE.Vector3(),_P=new THREE.Vector3(),_Q=new THREE.Quaternion();
function armIK(ua,fa,ha,target,side){_S.copy(ua.position);_D.copy(target).sub(_S);let d=_D.length();const a=.29,b=.26;d=Math.min(d,(a+b)*.995);_D.normalize();
  const x=(a*a-b*b+d*d)/(2*d),h=Math.sqrt(Math.max(0,a*a-x*x));_P.set(side*.55,-1,-.25);_P.addScaledVector(_D,-_P.dot(_D)).normalize();
  _E.copy(_S).addScaledVector(_D,x).addScaledVector(_P,h);_T.copy(_S).addScaledVector(_D,d);
  ua.quaternion.setFromUnitVectors(DOWN,_P.copy(_E).sub(_S).normalize());_P.copy(_T).sub(_E).normalize().applyQuaternion(_Q.copy(ua.quaternion).invert());fa.quaternion.setFromUnitVectors(DOWN,_P);ha.quaternion.identity()}
const _g1=new THREE.Vector3(),_g2=new THREE.Vector3();
// o: x,y,z,face,dead,stance,aim,armed(id),rar,moving,walk,run,heal,armorLv,helmLv,mvx,mvz,dt
// animation follows real ground speed (a bot flagged as moving but pinned in place, or rummaging a locker, stands instead of running on the spot)
function poseRig(rg,o){const dt=Math.max(1e-3,o.dt||.016);if(rg.lx!==undefined&&!o.dead){const sp=Math.hypot(o.x-rg.lx,o.z-rg.lz)/dt;rg.spd=(rg.spd||0)+(Math.min(9,sp)-(rg.spd||0))*Math.min(1,dt*6)}rg.lx=o.x;rg.lz=o.z;
  if(o.moving&&(rg.spd||0)<.6)o=Object.assign({},o,{moving:false,run:false});else if(o.moving&&o.run&&rg.spd<3.2)o=Object.assign({},o,{run:false});
  poseRig0(rg,o);if(!rg.sol&&SOL.ready)attachSoldier(rg,rg.seed||0);if(rg.sol)driveSoldier(rg,o);deadFade(rg,o)}
function poseRig0(rg,o){const B=rg.B,g=rg.g;
  for(const k of['hips','spine','chest','neck','head','uaL','faL','haL','uaR','faR','haR','thL','shL','ftL','thR','shR','ftR'])B[k].quaternion.identity();
  B.hips.position.set(0,.95,0);g.position.set(o.x,o.y,o.z);g.rotation.set(0,o.face,0);
  for(let v=1;v<=3;v++){B['vest'+v].scale.setScalar(o.armorLv===v?1:1e-4);B['helm'+v].scale.setScalar(o.helmLv===v?1:1e-4)}
  const key=o.armed?o.armed+(o.rar||0):null;if(key!==rg.gunKey){if(rg.gun)rg.holder.remove(rg.gun);rg.gun=key?gunLOD(o.armed,o.rar):null;if(rg.gun)rg.holder.add(rg.gun);rg.gunKey=key;
    if(rg.gun){rg.fl.position.copy(rg.gun.userData.P.muzzle).add(_g1.set(0,0,-.05))}}
  if(o.dead){rg.deadT=Math.min(1,rg.deadT+(o.dt||.016)*1.7);const k=vmS(rg.deadT,0,1),sd=rg.deadSide||(rg.deadSide=Math.random()<.5?-1:1);
    g.rotation.set(-k*Math.PI/2*.97,o.face+sd*k*.4,sd*k*.15,'YXZ');g.position.y=o.y+k*.13;B.thL.rotation.x=-.4*k;B.shL.rotation.x=.7*k;B.thR.rotation.x=-.1*k;B.shR.rotation.x=.2*k;
    B.uaL.rotation.z=1.1*k;B.uaR.rotation.z=-.9*k;B.uaR.rotation.x=-.5*k;B.head.rotation.set(.2*k,sd*.5*k,0);rg.holder.visible=false;return}
  rg.deadT=0;rg.holder.visible=!!o.armed;
  const mvAng=o.moving?Math.atan2(o.mvx||0,o.mvz||1)-o.face:0,la=Math.atan2(Math.sin(mvAng),Math.cos(mvAng)),back=Math.cos(la)<-.3?-1:1;
  const hipYaw=o.moving&&o.stance!=='prone'?Math.max(-.7,Math.min(.7,(back>0?la:Math.atan2(Math.sin(la+Math.PI),Math.cos(la+Math.PI)))*.8)):0;
  const sw=o.moving?Math.sin(o.walk):0,A=(o.run?.72:.42)*back;
  if(o.stance==='prone'){g.rotation.set(Math.PI/2,o.face,0,'YXZ');g.position.set(o.x-Math.sin(o.face)*.9,o.y+.16,o.z-Math.cos(o.face)*.9);
    B.thL.rotation.x=sw*.2;B.thR.rotation.x=-sw*.2;B.head.rotation.x=-1.1;B.neck.rotation.x=-.2}
  else{B.hips.rotation.y=hipYaw;B.spine.rotation.y=-hipYaw*.6;B.chest.rotation.y=-hipYaw*.4;
    if(o.stance==='crouch'){B.hips.position.y=.6+(o.moving?Math.abs(Math.cos(o.walk))*.02:0);B.thL.rotation.x=-1.3+sw*.25;B.thR.rotation.x=-1.05-sw*.25;B.shL.rotation.x=1.75-sw*.2;B.shR.rotation.x=1.45+sw*.2;
      B.ftL.rotation.x=-.4;B.ftR.rotation.x=-.35;B.spine.rotation.x=.22;B.chest.rotation.x=.08}
    else{B.hips.position.y=.95-(o.moving?Math.abs(Math.cos(o.walk))*.035*(o.run?1.4:1):0);
      B.thL.rotation.x=-sw*A;B.thR.rotation.x=sw*A;B.shL.rotation.x=(o.moving?(o.run?1.3:.9)*Math.max(0,Math.sin(o.walk-1.4)):0)+.05;B.shR.rotation.x=(o.moving?(o.run?1.3:.9)*Math.max(0,Math.sin(o.walk+Math.PI-1.4)):0)+.05;
      B.ftL.rotation.x=-B.shL.rotation.x*.3;B.ftR.rotation.x=-B.shR.rotation.x*.3;if(o.run)B.spine.rotation.x=.18}}
  rg.flinch=Math.max(0,rg.flinch-(o.dt||.016)*4);B.chest.rotation.x-=rg.flinch*.45;B.head.rotation.x-=rg.flinch*.3;
  // arms: hold the actual weapon with both hands (IK), or swing when unarmed
  const H=rg.holder,pistol=o.armed==='pistol';
  if(o.armed){if(o.stance==='prone'){H.position.set(-.06,.5,.12);H.rotation.set(-Math.PI/2,0,0,'YXZ')}
    else if(o.aim){H.position.set(pistol?-.02:-.075,pistol?.17:.15,pistol?.42:.27);H.rotation.set(-(B.chest.rotation.x+B.spine.rotation.x),Math.PI,0,'YXZ')}
    else if(o.heal){H.position.set(-.12,-.15,.2);H.rotation.set(-1.0,Math.PI+.4,0,'YXZ')}
    else{H.position.set(pistol?-.08:-.06,pistol?-.12:-.02,pistol?.3:.26);H.rotation.set(o.run?-.9:-.55,Math.PI+(o.run?.5:.25),o.run?.4:.2,'YXZ')}
    H.updateMatrix();const P_=rg.gun.userData.P;_g1.copy(P_.grip).applyMatrix4(H.matrix);_g2.copy(pistol?_a.copy(P_.grip).add(_b.set(.02,-.01,0)):P_.support).applyMatrix4(H.matrix);
    if(o.heal&&!pistol){_g2.set(.02,.0,.28)}armIK(B.uaR,B.faR,B.haR,_g1,-1);armIK(B.uaL,B.faL,B.haL,_g2,1)}
  else if(o.heal){armIK(B.uaR,B.faR,B.haR,_g1.set(-.03,0,.26),-1);armIK(B.uaL,B.faL,B.haL,_g2.set(.03,0,.26),1)}
  else{B.uaL.rotation.x=sw*.5;B.uaR.rotation.x=-sw*.5;B.faL.rotation.x=-.25;B.faR.rotation.x=-.25;B.uaL.rotation.z=.08;B.uaR.rotation.z=-.08}}

// ---------- tracers ----------
const tracers=[];const trMat=new THREE.LineBasicMaterial({color:0x7ae0ff,transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false,fog:false});
for(let i=0;i<40;i++){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,0,0,0],3));const l=new THREE.Line(g,trMat.clone());l.visible=false;l.frustumCulled=false;scene.add(l);tracers.push({l,t:0})}
let trI=0;function tracer(a,b){const t=tracers[trI++%tracers.length],p=t.l.geometry.attributes.position;p.setXYZ(0,a.x,a.y,a.z);p.setXYZ(1,b.x,b.y,b.z);p.needsUpdate=true;t.l.visible=true;t.t=.07}
const impacts=[];const impMat=new THREE.SpriteMaterial({map:AM.flash.map,color:0xcfc8b0,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
function impact(p){const s=new THREE.Sprite(impMat);s.position.copy(p);s.scale.set(.25,.25,1);scene.add(s);impacts.push({s,t:.12})}

// ---------- zone ----------
const zoneMat=new THREE.MeshBasicMaterial({color:0x4a9cff,transparent:true,opacity:.22,side:THREE.DoubleSide,depthWrite:false,fog:false});
const zoneMesh=new THREE.Mesh(new THREE.CylinderGeometry(1,1,1,96,1,true),zoneMat);zoneMesh.renderOrder=5;scene.add(zoneMesh);
function zonePhases(){const sc=Math.min(1.6,Math.max(1,Math.hypot(W,H)/80))*(CFG.players>=16?1.1:1);return[[50,28,.4,1],[40,22,.23,2],[32,18,.12,4],[26,15,.05,6],[22,12,0,8]].map(p=>[p[0]*sc,p[1]*sc,p[2],p[3]])}
function initZone(){const r0=Math.hypot(W*T,H*T)/2+6,c={x:W*T/2,z:H*T/2};Z={cx:c.x,cz:c.z,r:r0,from:{x:c.x,z:c.z,r:r0},to:null,ph:-1,t:0,state:'wait',dps:0,phases:zonePhases(),r0};nextZone()}
function nextZone(){Z.ph++;const p=Z.phases[Z.ph];if(!p){Z.state='final';return}
  const nr=Z.r0*p[2];let nx,nz,tries=0;do{const a=Math.random()*6.28,d=Math.random()*Math.max(0,Z.r-nr);nx=Z.cx+Math.cos(a)*d;nz=Z.cz+Math.sin(a)*d;tries++}
  while(tries<40&&(nx<8||nz<8||nx>W*T-8||nz>H*T-8));Z.from={x:Z.cx,z:Z.cz,r:Z.r};Z.to={x:nx,z:nz,r:Math.max(1.5,nr)};Z.state='wait';Z.t=p[0];Z.dur=p[1];Z.pdps=p[3]}
function updateZone(dt){if(Z.state==='wait'&&ALL.filter(a=>a.alive).length<=4)Z.t-=dt*1.5;if(Z.state==='final'){Z.r=Math.max(0,Z.r-dt*.3);Z.ft=(Z.ft||0)+dt;Z.dps=Math.round(10+Z.ft*.5);return}Z.t-=dt;
  if(Z.state==='wait'){if(Z.t<=0){Z.state='shrink';Z.t=Z.dur;say('安全地帯が縮み始めた！',3)}}
  else{const k=1-Math.max(0,Z.t)/Z.dur;Z.cx=Z.from.x+(Z.to.x-Z.from.x)*k;Z.cz=Z.from.z+(Z.to.z-Z.from.z)*k;Z.r=Z.from.r+(Z.to.r-Z.from.r)*k;Z.dps=Z.pdps;if(Z.t<=0)nextZone()}
  if(Z.ph>0&&Z.state==='wait')Z.dps=Z.phases[Z.ph-1][3]}
const outZone=a=>Math.hypot(a.x-Z.cx,a.z-Z.cz)>Z.r;

// ---------- loot ----------
// a soft glow on the floor under each pickup, tinted by rarity
const glowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),gr=g.createRadialGradient(32,32,4,32,32,31);gr.addColorStop(0,'rgba(255,255,255,.9)');gr.addColorStop(.45,'rgba(255,255,255,.35)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c)})(),GLOWGEO=new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),GLOWM={};
const glowMat=rr=>GLOWM[rr]||(GLOWM[rr]=new THREE.MeshBasicMaterial({map:glowTex,transparent:true,depthWrite:false,opacity:rr>0?.5:.22,color:rr>=0?RAR[rr].h:0xffe8c0,blending:THREE.AdditiveBlending,polygonOffset:true,polygonOffsetFactor:-2}));
function rollLoot(force){const r=force?0:Math.random();
  if(r<.4){const q=Math.random();const id=force?(q<.1?'pistol':q<.4?'smg':q<.58?'shotgun':q<.9?'rifle':'sniper'):(q<.28?'pistol':q<.53?'smg':q<.72?'shotgun':q<.92?'rifle':'sniper');
    return[{kind:'weapon',id,r:rollR()},{kind:'ammo',id:WEAP[id].ammo,amt:id==='sniper'?10:WEAP[id].mag*2}]}
  if(r<.55){const t=['light','light','shell','medium','medium','heavy'][(Math.random()*6)|0];return[{kind:'ammo',id:t,amt:t==='shell'?10:t==='heavy'?15:t==='medium'?40:45}]}
  if(r<.83)return[Math.random()<.72?{kind:'bandage',amt:Math.random()<.65?1:2}:{kind:'medkit',amt:1}];
  const lv=rollLv();return Math.random()<.55?[{kind:'armor',lv,hp:VEST[lv].cap}]:[{kind:'helmet',lv,hp:HELM[lv].cap}]}
const itemRar=it=>it.kind==='optic'?OPTICS[it.id].rk:it.kind==='weapon'?(it.r||0):(it.kind==='armor'||it.kind==='helmet')?it.lv-1:-1;
function spawnItem(it,x,z,y){it.x=x;it.z=z;if(y!==undefined)it.y=y;const rr=itemRar(it),g=new THREE.Group();let m;
  if(it.kind==='weapon'){m=gunLOD(it.id,it.r,it.optic);m.rotation.set(0,0,Math.PI/2);m.position.y=.035;g.add(m)}else g.add(itemModel(it));
  const glow=new THREE.Mesh(GLOWGEO,glowMat(rr));const gs=it.kind==='weapon'?1.1:it.kind==='armor'?.8:.6;glow.scale.set(gs,1,gs);glow.position.y=.012;g.add(glow);
  g.position.set(x,y!==undefined?y:groundY(x,z),z);g.rotation.y=Math.random()*6;world.add(g);it.mesh=g;ITEMS.push(it);return it}
function removeItem(it){const i=ITEMS.indexOf(it);if(i>=0)ITEMS.splice(i,1);world.remove(it.mesh)}
function itemLabel(it){return it.kind==='optic'?OPTICS[it.id].n:it.kind==='weapon'?(it.r?RAR[it.r].n+'・':'')+WEAP[it.id].name+(it.optic?'＋'+OPTICS[it.optic].n:''):it.kind==='helmet'?`ヘルメット Lv${it.lv}（耐久${Math.round(it.hp)}/${HELM[it.lv].cap}）`:it.kind==='armor'?`防弾ベスト Lv${it.lv}（耐久${Math.round(it.hp)}/${VEST[it.lv].cap}）`:it.kind==='ammo'?`${AMMONAME[it.id]} ×${it.amt}`:it.kind==='bandage'?`包帯 ×${it.amt}`:it.kind==='medkit'?'救急キット':'防弾ベスト'}
function seedLoot(){ITEMS=[];
  for(const h of HOUSES){const n=h.shed?1:2+((Math.random()*2)|0);const opts=[];for(let y=h.y+1;y<h.y+h.h-1;y++)for(let x=h.x+1;x<h.x+h.w-1;x++)if(grid[y][x]==='f')opts.push({x,y});
    for(let k=0;k<n&&opts.length;k++){const o=opts.splice((Math.random()*opts.length)|0,1)[0],c=ctr(o);rollLoot(k===0&&!h.shed).forEach((it,j)=>spawnItem(it,c.x+(Math.random()-.5)*.8+j*.5,c.z+(Math.random()-.5)*.8))}
    // every building also has a spare box of ammo (a type that matches a gun already there when there is one)
    if(opts.length){const o=opts.splice((Math.random()*opts.length)|0,1)[0],c=ctr(o),gun=ITEMS.find(i=>i.kind==='weapon'&&TX(i.x)>=h.x&&TX(i.x)<h.x+h.w&&TX(i.z)>=h.y&&TX(i.z)<h.y+h.h);
      const t=gun&&Math.random()<.6?WEAP[gun.id].ammo:['light','light','medium','medium','shell','heavy'][(Math.random()*6)|0];spawnItem({kind:'ammo',id:t,amt:t==='shell'?10:t==='heavy'?10:t==='medium'?30:36},c.x+(Math.random()-.5)*.6,c.z+(Math.random()-.5)*.6)}
    if(!h.shed&&opts.length){const o=opts.splice((Math.random()*opts.length)|0,1)[0],c=ctr(o),lv=rollLv();spawnItem(Math.random()<.5?{kind:'armor',lv,hp:VEST[lv].cap}:{kind:'helmet',lv,hp:HELM[lv].cap},c.x+(Math.random()-.5)*.6,c.z+(Math.random()-.5)*.6)}
    if(opts.length){const o=opts.splice((Math.random()*opts.length)|0,1)[0],c=ctr(o);spawnItem(Math.random()<.75?{kind:'bandage',amt:Math.random()<.6?1:2}:{kind:'medkit',amt:1},c.x+(Math.random()-.5)*.8,c.z+(Math.random()-.5)*.8)}}
  for(const c of CARS){const cx=c.dir==='x'?(c.tx+1)*T:c.tx*T+T/2,cz=c.dir==='x'?c.ty*T+T/2:(c.ty+1)*T;const ox=c.dir==='x'?0:1.6,oz=c.dir==='x'?1.6:0;
    if(free(cx+ox,cz+oz,.3))rollLoot().forEach((it,j)=>spawnItem(it,cx+ox+j*.5,cz+oz))}
  for(const dr of drawers.values()){dr.loot=Math.random()<.85?rollLoot():[];dr.opened=false}}

// ---------- actors ----------
function newActor(i,isMe,x,z){const a={i,me:isMe,name:isMe?'あなた':'CPU'+i,x,z,r:.3,yaw:0,pitch:0,face:0,hp:100,armor:0,armorLv:0,helm:0,helmLv:0,alive:true,kills:0,dmgDone:0,
  slots:[null,null],cur:0,ammo:{light:0,shell:0,medium:0,heavy:0},dmgFrom:{},dmgTo:{},dmgOnAmt:0,dmgOnT:-99,band:0,med:0,cool:0,reloadT:0,healT:0,healKind:null,walk:0,moving:false,lastHitBy:null,place:0,sv:true};
  if(!isMe){a.skill=.3+Math.random()*.55;a.aggr=Math.random();a.react=.35+Math.random()*.4;a.path=[];a.target=null;a.mode='loot';a.lookT=Math.random()*.3;a.enemy=null;a.seen=0;a.idle=Math.random();
    a.strafe=Math.random()<.5?1:-1;a.strafeT=0;a.mesh=buildRig(i+1);world.add(a.mesh.g)}
  return a}
const wpn=a=>a?a.slots[a.cur]:null;
function giveWeapon(a,id,r,optic){const free=a.slots.findIndex(s=>!s);const w={id,r:r||0,optic:a.me?myOptic(id):(optic||null)};w.mag=wMag(w);let dropped=null;
  if(free>=0){a.slots[free]=w;if(!wpn(a))a.cur=free;if(a.me&&free!==a.cur){}if(a.me&&!a.slots[a.cur])a.cur=free}
  else{dropped=a.slots[a.cur];a.slots[a.cur]=w}
  if(a.me){if(!a.slots[a.cur])a.cur=free;a.reloadT=0;const cw=wpn(a);buildVm(cw&&cw.id,cw?cw.r||0:0)}return dropped}
function bestSlot(a){let b=-1,t=-1;a.slots.forEach((s,i)=>{if(s&&wScore(s)>t){t=wScore(s);b=i}});return b}

// ---------- damage ----------
const feed=[];function killFeed(t){feed.unshift({t,life:6});if(feed.length>5)feed.pop();renderFeed()}
function renderFeed(){$('feed').innerHTML=feed.map(f=>`<div>${f.t}</div>`).join('')}
function damage(v,dmg,by,wname,head,raw){if(!v.alive||(S.over&&!NET.on&&!SPEC.on)||NET.done)return null;if(!isFinite(dmg))return null;let abs=0,broke=false;
  if(!raw){if(head&&v.helmLv>0){const ab=Math.min(v.helm,dmg*HELM[v.helmLv].abs);v.helm-=ab;dmg-=ab;abs=ab;if(v.helm<=.5){v.helm=0;v.helmLv=0;broke=true}}
    else if(!head&&v.armorLv>0){const ab=Math.min(v.armor,dmg*VEST[v.armorLv].abs);v.armor-=ab;dmg-=ab;abs=ab;if(v.armor<=.5){v.armor=0;v.armorLv=0;broke=true}}}
  v.hp-=dmg;if(!isFinite(v.hp))v.hp=0;if(by)by.dmgDone+=dmg;if(v.me&&by)ME.dmgFrom[by.i]=(ME.dmgFrom[by.i]||0)+dmg;if(by&&by.me)ME.dmgTo[v.i]=(ME.dmgTo[v.i]||0)+dmg;
  if(by&&!by.me){if(by.dmgOn!==v||S.t-by.dmgOnT>6)by.dmgOnAmt=0;by.dmgOn=v;by.dmgOnAmt+=dmg+abs;by.dmgOnT=S.t}v.lastHitBy=by;if(by)v.hitAt=S.t;
  if(!v.me&&v.mesh)v.mesh.flinch=1;
  if(v.me){S.hurt=Math.min(1,S.hurt+.45);if(by){S.hurtDir=Math.atan2(by.x-ME.x,by.z-ME.z);S.hurtT=1.2}tone(180,'square',.08,.12,90);
}
  else if(!v.me&&by&&(!v.enemy||v.mode!=='fight')){if(v.enemy!==by){v.enemy=by;v.seen=v.react*.6}}
  const res={dmg,abs,broke,killed:v.hp<=0};if(v.hp<=0)kill(v,by,wname);return res}
function kill(v,by,wname){v.alive=false;v.hp=0;const alive=ALL.filter(a=>a.alive).length;v.place=alive+1;
  if(by&&by!==v){by.kills++;killFeed(`<b>${by.name}</b> ▸ ${v.name}<span>${wname||''}</span>`)}else killFeed(`${v.name}<span>${wname||'安全地帯の外で倒れた'}</span>`);
  if(by&&by.me){S.hitMark=.35;S.killMark=.6;sfx.kill();S.hitStop=.08;S.fovKick=5;say(`${v.name}を倒した（残り${alive}人）`);
    S.recap.push({t:S.t,txt:`<b>${v.name}</b>を倒した（${wname||'素手'}・${Math.round(Math.hypot(v.x-ME.x,v.z-ME.z))}m）`})}
  if(v.me&&by)S.recap.push({t:S.t,txt:`<b>${by.name}</b>に倒された（${wname||''}・${Math.round(Math.hypot(by.x-ME.x,by.z-ME.z))}m・受けたダメージ ${Math.round(ME.dmgFrom[by.i]||0)}／与えたダメージ ${Math.round(ME.dmgTo[by.i]||0)}）`});
  // drop everything
  const drops=[];v.slots.forEach(s=>{if(s)drops.push({kind:'weapon',id:s.id,r:s.r||0,optic:s.optic||null})});for(const k in v.ammo)if(v.ammo[k]>0)drops.push({kind:'ammo',id:k,amt:Math.min(90,v.ammo[k])});
  if(v.band)drops.push({kind:'bandage',amt:v.band});if(v.med)drops.push({kind:'medkit',amt:1});if(v.armorLv&&v.armor>8)drops.push({kind:'armor',lv:v.armorLv,hp:Math.round(v.armor)});if(v.helmLv&&v.helm>6)drops.push({kind:'helmet',lv:v.helmLv,hp:Math.round(v.helm)});
  drops.forEach((it,j)=>{const a=j*1.3;spawnItem(it,v.x+Math.cos(a)*.6,v.z+Math.sin(a)*.6,elevOf(v)>.4?(v.me?ME.y:AY(v)):undefined)});
  if(v.me){end(false)}else{v.mesh.holder.visible=false;if(alive===1&&ME.alive)end(true)}}

// ---------- hit feedback ----------
const DN=[],_dn=new THREE.Vector3();
function dmgNum(a,val,kind){const el=document.createElement('div');el.className='dn '+kind;el.textContent=typeof val==='number'?Math.max(1,Math.round(val)):val;$('dmgs').appendChild(el);
  DN.push({el,x:a.x+(Math.random()-.5)*.5,y:(a.me?ME.y:AY(a))+(kind==='brk'?1.6:2.05),z:a.z,t:kind==='brk'?1.2:.85,T:kind==='brk'?1.2:.85});if(DN.length>16){const o=DN.shift();o.el.remove()}}
// ---------- floating item names (near or looked at) and pickup toasts ----------
const tagCol=it=>it.kind==='optic'?RAR[OPTICS[it.id].rk].c:it.kind==='weapon'?RAR[it.r||0].c:(it.kind==='armor'||it.kind==='helmet')?LVCOL[it.lv]:it.kind==='medkit'?'#e07a6a':it.kind==='ammo'?'#d8c27a':'#e8e2d4';
const TAGP=[],_tg=new THREE.Vector3();let tagN=0;
function drawTags(){const box=$('tags');let used=0;cam.updateMatrixWorld();
  if(ME.alive&&!S.over){const w=cvEl.clientWidth,h=cvEl.clientHeight,cp=Math.cos(ME.pitch),fx=-Math.sin(ME.yaw)*cp,fy=Math.sin(ME.pitch),fz=-Math.cos(ME.yaw)*cp,ey=cam.position.y,cand=[];
    for(const it of ITEMS){const dx=it.x-ME.x,dz=it.z-ME.z;if(dx>14||dx<-14||dz>14||dz<-14)continue;const d=Math.hypot(dx,dz);if(d>14)continue;
      const dy=it.mesh.position.y+.12-ey;if(dy>2.2||dy<-3.2)continue;const dd=Math.hypot(d,dy),dot=(dx*fx+dy*fy+dz*fz)/Math.max(dd,.01);
      const looked=dot>Math.cos(Math.max(.045,.3/dd)),near=d<3.4&&dot>.35;if(!looked&&!near)continue;cand.push({it,sc:looked?dd-20:dd,d})}
    cand.sort((a,b)=>a.sc-b.sc);
    for(const c of cand){if(used>=6)break;const it=c.it;if(c.d>1.6&&!los(ME.x,ME.z,it.x,it.z))continue;
      _tg.set(it.x,it.mesh.position.y+(it.kind==='weapon'?.2:.24),it.z).project(cam);if(_tg.z>1||Math.abs(_tg.x)>1.05||Math.abs(_tg.y)>1.05)continue;
      let el=TAGP[used];if(!el){el=document.createElement('div');el.className='tag';box.appendChild(el);TAGP[used]=el}
      if(el._it!==it||el._amt!==it.amt){el._it=it;el._amt=it.amt;el.style.setProperty('--c',tagCol(it));el.innerHTML=itemIcon(it)+itemLabel(it)}
      el.style.display='';el.style.opacity=c.sc<0?1:Math.max(.55,1-c.d/5).toFixed(2);el.style.transform=`translate(${((_tg.x*.5+.5)*w).toFixed(1)}px,${((-_tg.y*.5+.5)*h).toFixed(1)}px) translate(-50%,-100%)`;used++}}
  for(let i=used;i<TAGP.length;i++)if(TAGP[i].style.display!=='none'){TAGP[i].style.display='none';TAGP[i]._it=null}}
function toast(it,verb){const box=$('toasts'),el=document.createElement('div');el.className='toast';el.style.setProperty('--c',tagCol(it));
  el.innerHTML=itemIcon(it)+`<span>${itemLabel(it)}<small>${verb}</small></span>`;box.appendChild(el);while(box.children.length>4)box.firstChild.remove();
  setTimeout(()=>{el.style.opacity=0;setTimeout(()=>el.remove(),450)},2400)}
function drawDmgNums(dt){if(!DN.length)return;const w=cvEl.clientWidth,h=cvEl.clientHeight;
  for(let i=DN.length-1;i>=0;i--){const d=DN[i];d.t-=dt;if(d.t<=0){d.el.remove();DN.splice(i,1);continue}const k=1-d.t/d.T;_dn.set(d.x,d.y+k*.7,d.z).project(cam);
    if(_dn.z>1){d.el.style.opacity=0;continue}d.el.style.opacity=Math.min(1,d.t/d.T*2.2).toFixed(2);d.el.style.transform=`translate(${((_dn.x*.5+.5)*w).toFixed(1)}px,${((-_dn.y*.5+.5)*h).toFixed(1)}px) translate(-50%,-50%) scale(${(1.25-k*.35).toFixed(2)})`}}
const sfx={body:()=>{tone(1150,'triangle',.07,.05,900)},head:()=>{tone(1800,'sine',.09,.09,2300);tone(1250,'triangle',.05,.06)},
  armor:()=>{tone(720,'square',.035,.05,520);burst(.06,.04,3500)},brk:()=>{burst(.22,.28,6500);tone(2600,'triangle',.07,.3,700)},
  kill:()=>{tone(392,'triangle',.13,.22);tone(587,'triangle',.11,.3);tone(70,'sine',.22,.25,45)}};

// ---------- shooting ----------
const _v=new THREE.Vector3();
// an open (swung) door leaf stops bullets too; a closed one is part of the wall slab already
function leafQ(d,x,z){const dx=x-d.cx,dz=z-d.cz,lx=d.ry?-dz:dx,lz=d.ry?dx:dz,px=lx+DOORW/2,pz=lz,a=-d.sgn*1.45*d.ang,ca=Math.cos(a),sa=Math.sin(a);return[px*ca-pz*sa,px*sa+pz*ca]}
const leafOn=d=>!d.broken&&d.ang>.08&&d.cx!==undefined;
function doorLeafAt(d,x,y,z){if(!leafOn(d)||y<d.pad||y>d.pad+DOORH)return false;const[qx,qz]=leafQ(d,x,z);return qx>-.02&&qx<DOORW+.02&&Math.abs(qz)<.08}
// a bullet step can jump over the thin leaf, so test the segment between two ray samples
function doorLeafSeg(d,x0,z0,x1,z1,y){if(!leafOn(d)||y<d.pad||y>d.pad+DOORH)return false;const[a0,b0]=leafQ(d,x0,z0),[a1,b1]=leafQ(d,x1,z1);
  if((b0>.08&&b1>.08)||(b0<-.08&&b1<-.08))return false;const t=Math.abs(b1-b0)<1e-6?0:Math.min(1,Math.max(0,b0/(b0-b1))),qx=a0+(a1-a0)*t;return qx>-.02&&qx<DOORW+.02}
// roof of a module: the flat deck, then the dome (or the barrel vault on small huts)
function roofHit(R,x,y,z){const ddx=x-R.cx,ddz=z-R.cz;if(y<R.ry-.05)return false;if(Math.abs(ddx)>R.rw/2||Math.abs(ddz)>R.rd/2)return false;if(y<R.ry+.25)return true;const dy=y-(R.ry+.2);
  if(R.ra)return(ddx/R.ra)**2+(dy/R.hd)**2+(ddz/R.rb)**2<1;
  if(R.vault){const V=R.vault,a=V.alongX?ddx:ddz,p=V.alongX?ddz:ddx;return Math.abs(a)<V.len/2&&(p/V.r)**2+(dy/V.hv)**2<1}return false}
function rayHit(ox,oy,oz,dx,dy,dz,range,shooter,pierceGlass=true){
  const step=.2;let hitActor=null,head=false,t=0;
  const near=ALL.filter(a=>a.alive&&a!==shooter&&Math.hypot(a.x-ox,a.z-oz)<range+2);
  for(t=step;t<range;t+=step){const x=ox+dx*t,y=oy+dy*t,z=oz+dz*t;
    const gy=heightAt(x,z);if(y<Math.min(gy,meshY(x,z))-.03)return{t,end:{x,y,z},solid:true};
    const tx=TX(x),tz=TX(z),c=tile(tx,tz);const h=HOUSES.find(h=>tx>=h.x&&tx<h.x+h.w&&tz>=h.y&&tz<h.y+h.h);const pad=h?h.pad:0;
    if(c==='#'&&y<pad+WALLH&&slab(x,z,tx,tz,0))return{t,end:{x,y,z},solid:true};
    // door tile: closed = solid wall; open = the wall beside the opening is still solid at every height, the opening itself only above the frame
    if(c==='d'&&y<pad+WALLH&&slab(x,z,tx,tz,0)){if(!doorOpen(tx,tz)||slab(x,z,tx,tz,DOORW/2)||y>pad+DOORH)return{t,end:{x,y,z},solid:true}}
    if(c==='w'&&slab(x,z,tx,tz,0)){const rel=y-pad,lat=wallAxisX(tx,tz)?Math.abs(x-(tx*T+T/2)):Math.abs(z-(tz*T+T/2));
      if(lat>WIN.ow/2&&rel<WALLH)return{t,end:{x,y,z},solid:true};// wall beside the window frame
      if(rel<WIN.y0||rel>WIN.y1&&rel<WALLH)return{t,end:{x,y,z},solid:true};
      if(rel>=WIN.y0&&rel<=WIN.y1){const w=wins.get(kk(tx,tz));if(w&&w.state==='closed'){if(pierceGlass){setWin(w,'broken');glass(vAt(x,z),panAt(x,z))}else return{t,end:{x,y,z},solid:true,glass:w}}}}
    {const dl=DOORP.get(kk(tx,tz));if(dl)for(const d of dl)if(doorLeafSeg(d,x-dx*step,z-dz*step,x,z,y))return{t,end:{x,y,z},solid:true}}
    if(h&&h.roof&&roofHit(h.roof,x,y,z))return{t,end:{x,y,z},solid:true};
    if(h&&y<h.pad+.1&&'fDL'.includes(c))return{t,end:{x,y,z},solid:true};
    if(y<gy+8){const l=cols.get(kk(tx,tz));if(l)for(const o of l){if(o.soft)continue;if(o.bot!==undefined&&y<o.bot)continue;const ins=o.r?Math.hypot(x-o.x,z-o.z)<o.r:(x>o.x0&&x<o.x1&&z>o.z0&&z<o.z1);if(!ins)continue;
      // boulders: bullets follow the rounded rock, not the square block you stand on
      if(o.dome){const q=Math.hypot(x-o.dome.x,z-o.dome.z)/o.dome.r;if(q>=1||y>o.dome.y0+(o.top-o.dome.y0)*Math.sqrt(1-q*q))continue}
      const top=o.top!==undefined?o.top:o.h!==undefined?o.h:o.r?gy+8:gy+1.6;if(y<top)return{t,end:{x,y,z},solid:true}}}
    for(const a of near){const ay=a.me&&ME.y!==undefined?ME.y:AY(a),dxa=x-a.x,dza=z-a.z,hd=Math.hypot(dxa,dza);
      const st=stanceOf(a);
      if(st==='prone'){const f=a.me?ME.yaw:a.face+Math.PI,fx=-Math.sin(f),fz=-Math.cos(f),al=dxa*fx+dza*fz,pe=Math.abs(dxa*fz-dza*fx);
        if(al>-.2&&al<1.7&&pe<.3&&y>ay&&y<ay+.45)return{t,end:{x,y,z},actor:a,head:al>1.35};continue}
      const hh=st==='crouch'?1.25:1.63,bt=st==='crouch'?1.12:1.5;
      if(hd<.16&&Math.abs(y-(ay+hh))<.15){return{t,end:{x,y,z},actor:a,head:true}}
      if(hd<.33&&y>ay&&y<ay+bt)return{t,end:{x,y,z},actor:a,head:false}}}
  return{t:range,end:{x:ox+dx*range,y:oy+dy*range,z:oz+dz*range}}}
function gunSound(a,w){const v=a.me?1:vAt(a.x,a.z)*1.0;if(v<=0&&!a.me)return;const pan=a.me?0:panAt(a.x,a.z);burst(.55*Math.max(.05,v)*(w?1:.4),w?w.snd[1]:.08,w?w.snd[0]:500,pan);
  if(w&&a.me)tone(90,'square',.12,.08,50)}
function fire(a){const w=wpn(a);if(S.t<15){if(a.me&&!S.graceMsg){S.graceMsg=1;say(`開始${Math.ceil(15-S.t)}秒後まで撃てない`)}return false}
  if(!w){// punch
    if(a.cool>0)return false;a.cool=.55;const fx=-Math.sin(a.yaw)*Math.cos(a.pitch),fz=-Math.cos(a.yaw)*Math.cos(a.pitch);
    for(const o of ALL){if(!o.alive||o===a)continue;const dx=o.x-a.x,dz=o.z-a.z,d=Math.hypot(dx,dz);if(d<1.6&&(dx*fx+dz*fz)/d>.5&&reach(a.x,a.z,o.x,o.z)){damage(o,15,a,'素手');if(a.me)S.hitMark=.25;break}}
    burst(.15,.06,800);if(a.me)S.recoil=.03;return true}
  const W_=WEAP[w.id];if(a.cool>0||a.reloadT>0)return false;
  if(w.mag<=0){if(a.ammo[W_.ammo]>0)startReload(a);else if(a.me&&!S.clickT){S.clickT=.3;tone(900,'square',.04,.04);say('弾がない')}return false}
  w.mag--;a.cool=W_.iv+Math.max(-.034,Math.min(0,a.cool)); // keep the frame remainder so the fire rate does not depend on fps
  gunSound(a,W_);
  if(a.me){S.flashT=.05;S.recoil=W_.id==='sniper'?.09:W_.id==='shotgun'?.07:.022;S.shotN=S.t-(S.lastShot||-9)<.26?(S.shotN||0)+1:0;{const ak=1-.3*(S.adsK||0),f=S.shotN===0?.6:1,pr=S.prone?.6:1;
      const kk_=wKick(w);S.kickV=(S.kickV||0)+kk_*ak*f*pr;S.kickH=(S.kickH||0)+kk_*ak*pr*(Math.sin(S.shotN*.75+W_.pat)*.4+(Math.random()-.5)*.25)}
    S.bloom=Math.min(W_.spread*(S.adsK>.5?.6:1.2),(S.bloom||0)+W_.bl*(S.adsK>.5?.5:1));S.lastShot=S.t;
    let sp=mySpread(W_);
    const pel=W_.pellets||1,agg=new Map();let hitAny=false,head=false,killed=false;
    cam.updateMatrixWorld();const o=new THREE.Vector3();cam.getWorldPosition(o);const muz=new THREE.Vector3();let byaw=a.yaw,bpit=a.pitch;
    VM.root.updateMatrixWorld(true);vmFlash.getWorldPosition(muz);muz.applyMatrix4(cam.matrixWorld);vmKick(W_);
    for(let k=0;k<pel;k++){const yaw=byaw+(Math.random()-.5)*2*sp,pit=bpit+(Math.random()-.5)*2*sp;
      const dx=-Math.sin(yaw)*Math.cos(pit),dy=Math.sin(pit),dz=-Math.cos(yaw)*Math.cos(pit);
      const r=rayHit(o.x,o.y,o.z,dx,dy,dz,W_.range,a);
      if(k<3)tracer(muz,r.end);
      if(r.actor){const fall=falloff(W_,r.t),res=damage(r.actor,W_.dmg*(r.head?HEADX[w.id]:1)*fall,a,W_.name,r.head);hitAny=true;head=head||r.head;
        if(res){const g=agg.get(r.actor)||{d:0,ab:0,h:false,b:false,k:false};g.d+=res.dmg;g.ab+=res.abs;g.h=g.h||r.head;g.b=g.b||res.broke;g.k=g.k||res.killed;agg.set(r.actor,g)}}
      else if(r.solid)impact(_v.set(r.end.x,r.end.y,r.end.z))}
    if(hitAny){S.hitMark=.2;S.hitHead=head;let arm=false,brk=false;
      for(const[t_,g]of agg){dmgNum(t_,g.d,g.h?'h':g.ab>g.d*.15?'a':'b');if(g.b){dmgNum(t_,g.h?'ヘルメット破損':'ベスト破損','brk');brk=true}arm=arm||g.ab>0}
      S.hitArmor=arm;if(brk){sfx.brk();S.brkT=.5}else if(head)sfx.head();else if(arm)sfx.armor();else sfx.body()}
    if(w.mag===0&&a.ammo[W_.ammo]>0)setTimeout(()=>{if(wpn(a)===w&&w.mag===0)startReload(a)},250)}
  else botShoot(a,W_);
  if(!a.me){a.mesh.fl.visible=true;a.flashT=.05}
  shotPing(a);return true}
function mySpread(W_){const k=S.adsK||0,mv=S.moveAmt,air=S.air?1:0,pr=S.prone?.55:(S.crouch&&!S.slide)?.8:1;if(W_.id==='shotgun')return W_.spread*(1-.25*k)*(1+air*.5)*pr;
  const hip=W_.scope?.045:W_.spread*W_.hip,ads=W_.spread*(W_.scope?.15:.55);return (hip+(ads-hip)*k)*(1+mv*W_.mv+air*1.5)*pr+(S.bloom||0)}
function shotPing(a){if(!a.me&&Math.hypot(a.x-ME.x,a.z-ME.z)<70)S.pings.push({x:a.x,z:a.z,t:2.5});
  for(const b of BOTS){if(!b.alive||b===a||b.enemy)continue;const d=Math.hypot(b.x-a.x,b.z-a.z);if(d<45&&b.mode!=='fight'){b.heard={x:a.x,z:a.z};b.heardT=4}}}
function startReload(a){const w=wpn(a);if(!w)return;const W_=WEAP[w.id];if(a.reloadT>0||w.mag>=wMag(w)||a.ammo[W_.ammo]<=0)return;if(W_.perShell){a.shellRun=true;a.reloadT=a.reloadTot=W_.open+wReload(w)}else{a.shellRun=false;a.reloadT=a.reloadTot=wReload(w)}if(a.me){tone(300,'square',.04,.05);S.ads=false}}
function finishReload(a){const w=wpn(a);if(!w)return;const W_=WEAP[w.id];if(W_.perShell){if(a.ammo[W_.ammo]>0&&w.mag<wMag(w)){w.mag++;a.ammo[W_.ammo]--;if(a.me)tone(420,'square',.035,.04)}
    if(w.mag<wMag(w)&&a.ammo[W_.ammo]>0){a.reloadT=a.reloadTot=wReload(w)}else{a.shellRun=false;if(a.me)tone(560,'square',.05,.05)}return}
  a.shellRun=false;const need=wMag(w)-w.mag,take=Math.min(need,a.ammo[W_.ammo]);w.mag+=take;a.ammo[W_.ammo]-=take;if(a.me)tone(500,'square',.05,.05)}
// eye-to-body sight test using the same geometry bullets use (cover pieces, upper floors); windows don't block sight
function canSee(b,o){const ay=AY(b)+1.5,st=stanceOf(o),oy=o.me&&ME.y!==undefined?ME.y:AY(o);
  for(const h of(st==='prone'?[.25]:st==='crouch'?[.85,.5]:[1.6,1.4,.9])){const dx=o.x-b.x,dy=oy+h-ay,dz=o.z-b.z,d=Math.hypot(dx,dy,dz)||1;const r=rayHit(b.x,ay,b.z,dx/d,dy/d,dz/d,d+.3,b,false);
    if(r.actor===o||r.glass||(!r.solid&&!r.actor))return true}return false}
function botClear(b,e){if(b.clrE===e&&Math.abs(S.t-b.clrAt)<.2)return b.clr;b.clrAt=S.t;b.clrE=e;
  const ay=AY(b)+1.45,ty=(e.me&&ME.y!==undefined?ME.y+(S.prone?.28:(S.crouch||S.slide)?.9:1.25):AY(e)+(e.crouch?.9:1.25)),dx=e.x-b.x,dy=ty-ay,dz=e.z-b.z,d=Math.hypot(dx,dy,dz)||1;
  const r=rayHit(b.x,ay,b.z,dx/d,dy/d,dz/d,d+.5,b,false);
  if(r.glass){setWin(r.glass,'broken');glass(vAt(r.end.x,r.end.z),panAt(r.end.x,r.end.z));b.clr=false;return false}
  b.clr=r.actor===e;return b.clr}
// actor feet height: bots normally walk the terrain, but can stand on structures (b.y) after climbing them
const AY=a=>!a.me&&a.y!==undefined?a.y:groundY(a.x,a.z);
const elevOf=a=>(a.me?(ME.y??groundY(a.x,a.z)):AY(a))-groundY(a.x,a.z);
const coverAt=(x,z)=>COVER.find(c=>c.route&&x>=c.x*T-.6&&x<=(c.x+c.w)*T+.6&&z>=c.y*T-.6&&z<=(c.y+c.h)*T+.6);
// a bot hunting someone on high ground walks to the structure's way up and climbs it
function tryClimb(b,e){if(!e||!e.alive||b.climb||b.deckC||elevOf(e)<1.4)return false;if(b.climbGo&&S.t-b.climbGo.t<20&&(b.path.length||b.target))return true;const c=coverAt(e.x,e.z);if(!c||Math.hypot(e.x-b.x,e.z-b.z)>50)return false;
  const[sx,sz]=c.route[0];if(!botGoto(b,sx,sz,()=>{b.climbGo=null;b.climb={c,pts:c.route.slice(1),i:0,up:true};b.path=[];b.target=null}))return false;b.climbGo={c,t:S.t};b.mode='hunt';b.huntT=Math.max(b.huntT||0,12);b.climbN=(b.climbN||0)+1;return true}
function botClimb(b,dt){const C=b.climb;if(b.busyT>0){b.busyT-=dt;b.moving=false;return}const[tx,tz]=C.pts[C.i],dx=tx-b.x,dz=tz-b.z,m=Math.hypot(dx,dz);
  if(m<.12){C.i++;if(C.i>=C.pts.length){b.climb=null;if(C.up){b.deckC=C.c;b.lookT=0;if(b.enemy){b.face=Math.atan2(b.enemy.x-b.x,b.enemy.z-b.z);b.huntT=Math.max(b.huntT||0,6)}}
      else{b.deckC=null;delete b.y;b.feet=undefined;if(C.then)C.then()}}return}
  const sp=Math.min(m,3.4*dt),cy=AY(b),nx=b.x+dx/m*sp,nz=b.z+dz/m*sp,sup=Math.max(groundY(nx,nz),platformTop(nx,nz,cy+1.8,.12));b.face=Math.atan2(dx,dz);
  b.x=nx;b.z=nz;if(sup>cy+STEP){b.busyT=.4;b.y=sup;step(.1*vAt(b.x,b.z),panAt(b.x,b.z))}else b.y=sup<cy?Math.max(sup,cy-dt*8):sup;b.feet=b.y;b.moving=true;b.walk+=sp*3.2}
// keep an elevated bot standing on whatever is under it (it can step or fall off an edge while fighting)
function settleY(b,dt){if(b.y===undefined)return;const g=groundY(b.x,b.z),sup=Math.max(g,platformTop(b.x,b.z,b.y+STEP,b.r*.85));b.y=sup<b.y?Math.max(sup,b.y-dt*9):sup;b.feet=b.y;
  if(b.y-g<.2){delete b.y;b.feet=undefined;b.deckC=null}}
// bots fire real rays: they aim at the target's body with a spread that tightens as they track it, so cover, stance and distance decide hits
const gauss=()=>Math.sqrt(-2*Math.log(Math.random()+1e-9))*Math.cos(6.2832*Math.random());
function botShoot(a,W_){const t=a.enemy;if(!t||!t.alive)return;const d=Math.hypot(t.x-a.x,t.z-a.z);
  const tmov=(t.moving?.72:1)*(t.me&&S.slide?.6:1),amov=a.moving?.8:1,rangeK=Math.max(.08,1.15-d/W_.range);const pel=W_.pellets||1;
  const ay=AY(a)+1.45,ox=a.x+Math.sin(a.face)*.6,oz=a.z+Math.cos(a.face)*.6;
  const st=stanceOf(t),gy=t.me&&ME.y!==undefined?ME.y:AY(t);let cx=t.x,cz=t.z,cy;
  if(st==='prone'){const f=t.me?ME.yaw:t.face+Math.PI;cx+=-Math.sin(f)*.75;cz+=-Math.cos(f)*.75;cy=gy+.22}else cy=gy+(st==='crouch'?.75:1.1)+.25*a.skill;
  const p=Math.min(.97,Math.max(.03,.8*(t.me||t.human?.75:.5)*(W_.botAcc||1)*a.skill*rangeK*tmov*amov*(a.crouch?1.1:1)*Math.min(1,.55+Math.max(0,a.seen-a.react)*.35)*(W_.id==='sniper'?1.15:1)));
  // sigma such that a 0.36m-radius torso would be hit with probability p (pellets add the gun's own cone on top)
  const sig=.36/Math.sqrt(-2*Math.log(1-p));
  const hx=cx-ox,hz=cz-oz,hl=Math.hypot(hx,hz)||1,px=-hz/hl,pz=hx/hl;let ang=0;
  if(pel>1){const sp=W_.spread*d*.9;ang=sp}
  const hits=new Map();let end=null,first=null;
  for(let k=0;k<pel;k++){const e=pel>1&&k?W_.spread*d*.8:0,u=gauss()*sig+gauss()*e,v=gauss()*sig*.8+gauss()*e;
    const txp=cx+px*u,typ=cy+v,tzp=cz+pz*u,dx=txp-ox,dy=typ-ay,dz=tzp-oz,L=Math.hypot(dx,dy,dz)||1;
    const r=rayHit(ox,ay,oz,dx/L,dy/L,dz/L,Math.min(W_.range*1.3,L+25),a,true);if(!end)end=r.end;
    if(r.actor){const o=hits.get(r.actor)||{dmg:0,head:false};o.dmg+=W_.dmg*(r.head?HEADX[W_.id]:1)*falloff(W_,Math.hypot(r.actor.x-a.x,r.actor.z-a.z));o.head=o.head||r.head;hits.set(r.actor,o)}
    else if(!first)first=r}
  if(Math.hypot(a.x-ME.x,a.z-ME.z)<60)tracer({x:ox,y:ay,z:oz},end);
  for(const[o,h]of hits)damage(o,h.dmg,a,W_.name,h.head);
  if(!hits.has(ME)&&ME.alive&&first){const ex=first.end.x-ox,ez=first.end.z-oz,el=Math.hypot(ex,ez)||1,mx=ME.x-ox,mz=ME.z-oz,al=(mx*ex+mz*ez)/el;
    if(al>2&&al<el+2&&Math.abs(mx*ez-mz*ex)/el<2.5){S.whiz=.2;burst(.08,.05,3000,panAt(a.x,a.z))}}}

// ---------- bot brain ----------
const botPass=(tx,ty)=>!'#TVABw'.includes(tile(tx,ty));
function botGoto(b,x,z,fn){if(!isFinite(x)||!isFinite(z))return false;x=Math.max(3*T,Math.min((W-3)*T,x));z=Math.max(3*T,Math.min((H-3)*T,z));const st=navTile(b.x,b.z),t=navTile(x,z),same=st.x===t.x&&st.y===t.y;let p=same?[]:bfs(st.x,st.y,t.x,t.y,botPass);if(!same&&!p.length)return false;b.path=p;b.target={x,z,fn};return true}
function seedCoverLoot(){
  for(const d of DIST){const n=Math.round((d.x1-d.x0)*(d.y1-d.y0)/(d.k==='yard'?28:40));let k=0;
    for(let t=0;t<n*30&&k<n;t++){const x=(d.x0+Math.random()*(d.x1-d.x0))*T,z=(d.y0+Math.random()*(d.y1-d.y0))*T;if(!free(x,z,.6)||ITEMS.some(it=>Math.hypot(it.x-x,it.z-z)<4))continue;
      rollLoot(Math.random()<.4).forEach((it,j)=>spawnItem(it,x+j*.5,z));k++}}
  for(const c of COVER){if(!c.deck)continue;
    // every item a roll produces is placed (a weapon comes with its ammo), spread a little so they don't stack
    const put=(its,x,z,y)=>its.forEach((it,j)=>{it.noBot=true;spawnItem(it,x+(j?Math.cos(j*2.1)*.45:0),z+(j?Math.sin(j*2.1)*.45:0),y)});
    for(const[x,z]of c.deck.spots){const r=Math.random();put(r<.55?rollLoot(true):r<.8?[(lv=>({kind:'armor',lv,hp:VEST[lv].cap}))(2+(Math.random()<.35?1:0))]:[{kind:'medkit',amt:1}],x,z,c.deck.base)}
    for(const[x,z]of c.deck.ground)put(rollLoot(Math.random()<.5),x,z,c.deck.gy)}}
function wantItem(b,it){if(it.y!==undefined||it.noBot)return false;if(it.kind==='weapon'){const worst=b.slots.reduce((m,s)=>Math.min(m,wScore(s)),99);return wScore(it)>worst&&!b.slots.some(s=>s&&s.id===it.id&&(s.r||0)>=(it.r||0))}
  if(it.kind==='armor')return it.lv>b.armorLv||(it.lv===b.armorLv&&b.armor<VEST[it.lv].cap*.5);if(it.kind==='helmet')return it.lv>b.helmLv||(it.lv===b.helmLv&&b.helm<HELM[it.lv].cap*.5);
  if(it.kind==='bandage')return b.band<4;if(it.kind==='medkit')return b.med<1;if(it.kind==='ammo')return b.slots.some(s=>s&&WEAP[s.id].ammo===it.id)&&b.ammo[it.id]<90;return false}
function botPick(b,it){if(!ITEMS.includes(it))return;if(it.kind==='weapon'){if(b.slots.every(s=>s))b.cur=b.slots.reduce((m,s,i)=>wScore(s)<wScore(b.slots[m])?i:m,0);const dr=giveWeapon(b,it.id,it.r,it.optic);if(dr)spawnItem({kind:'weapon',id:dr.id,r:dr.r||0},b.x,b.z);b.cur=bestSlot(b);b.ammo[WEAP[it.id].ammo]+=WEAP[it.id].mag}
  else if(it.kind==='ammo')b.ammo[it.id]+=it.amt;else if(it.kind==='bandage')b.band+=it.amt;else if(it.kind==='medkit')b.med++;else if(it.kind==='armor'){b.armorLv=it.lv;b.armor=it.hp}else if(it.kind==='helmet'){b.helmLv=it.lv;b.helm=it.hp}
  removeItem(it)}
function botPlanLoot(b){const zx=Z.to?Z.to.x:Z.cx,zz=Z.to?Z.to.z:Z.cz,zr=Z.to?Z.to.r:Z.r;
  const inNext=(x,z)=>Math.hypot(x-zx,z-zz)<zr*.95;
  if(!inNext(b.x,b.z)&&(Z.state==='shrink'||Z.t<40||outZone(b))){const a=Math.atan2(b.z-zz,b.x-zx),r=zr*.55*Math.random();
    for(let k=0;k<6;k++){const x=zx+Math.cos(a+(Math.random()-.5))*r,z=zz+Math.sin(a+(Math.random()-.5))*r;if(botGoto(b,x,z,()=>{b.idle=1}))return}if(botRotate(b))return}
  const late=zoneUrgent(b);
  let best=null,bd=1e9;
  const unarmed=!b.slots.some(s=>s);const others=BOTS.filter(o=>o!==b&&o.alive);
  // stay away from loot other bots are already heading to or standing next to: spreads the early game out
  const crowd=(x,z)=>{let n=0;for(const o of others){if(Math.hypot(o.x-x,o.z-z)<12)n++;else if(o.target&&Math.hypot(o.target.x-x,o.target.z-z)<6)n++}return n*(S.t<120?18:6)};
  for(const it of ITEMS){if(!wantItem(b,it)||(late&&!inNext(it.x,it.z)))continue;const raw=Math.hypot(it.x-b.x,it.z-b.z),d=crowd(it.x,it.z)+raw+(inNext(it.x,it.z)?0:25)-(it.kind==='weapon'?(unarmed?35:10):0);if(d<bd&&raw<(unarmed&&it.kind==='weapon'?90:60)){bd=d;best={x:it.x,z:it.z,fn:()=>botPick(b,it)}}}
  for(const dr of drawers.values()){if(dr.opened||dr.claimed&&dr.claimed!==b)continue;const x=dr.px+dr.nx*.85,z=dr.pz+dr.nz*.85,d=crowd(x,z)+Math.hypot(x-b.x,z-b.z)+(unarmed?-5:8)+(inNext(x,z)?0:25);
    if(d<bd&&d<70){bd=d;best={x,z,dr,fn:()=>{b.busyT=.7;b.after=()=>openDrawer(dr)}}}}
  if(best){if(best.dr)best.dr.claimed=b;if(botGoto(b,best.x,best.z,best.fn))return}
  const x=zx+(Math.random()-.5)*zr,z=zz+(Math.random()-.5)*zr;botGoto(b,x,z,()=>{b.idle=1+Math.random()*2})}
function nextZ(){return Z.to&&Z.state!=='final'?Z.to:{x:Z.cx,z:Z.cz,r:Z.r}}
function zoneUrgent(b){const n=nextZ(),inN=Math.hypot(b.x-n.x,b.z-n.z)<n.r*.9;return outZone(b)||(!inN&&(Z.state==='shrink'||Z.t<45))}
function botRotate(b){const n=nextZ();const a=Math.atan2(b.z-n.z,b.x-n.x);
  for(let k=0;k<6;k++){const r=n.r*(.25+Math.random()*.45),aa=a+(Math.random()-.5)*1.2;if(botGoto(b,n.x+Math.cos(aa)*r,n.z+Math.sin(aa)*r,()=>{b.rot=false;b.idle=.5+Math.random()})){b.rot=true;return true}}return false}
function botFlee(b){const e=b.enemy;if((outZone(b)||zoneUrgent(b))&&botRotate(b))return;let a=Math.atan2(b.z-e.z,b.x-e.x)+(Math.random()-.5);
  if(zoneUrgent(b)){const n=nextZ(),za=Math.atan2(n.z-b.z,n.x-b.x);a=Math.atan2(Math.sin(a)*.4+Math.sin(za),Math.cos(a)*.4+Math.cos(za))}
  const d=10+Math.random()*10;botGoto(b,b.x+Math.cos(a)*d,b.z+Math.sin(a)*d,()=>{})}
// is a crouched body at (x,z) hidden from e's eyes by a wall, car, tree or hill?
function hiddenFrom(e,x,z){const ey=(e.me?ME.y:AY(e))+1.5,ty=groundY(x,z)+.95,dx=x-e.x,dy=ty-ey,dz=z-e.z,d=Math.hypot(dx,dy,dz)||1;
  const r=rayHit(e.x,ey,e.z,dx/d,dy/d,dz/d,d-.25,e,false);return !!r.solid&&r.t<d-.45}
function findCover(b,e){let best=null,bs=1e9;const ea=Math.atan2(b.z-e.z,b.x-e.x);
  for(let k=0;k<14;k++){const a=ea+(Math.random()-.5)*3,r=1.5+Math.random()*7,x=b.x+Math.cos(a)*r,z=b.z+Math.sin(a)*r;
    if(!free(x,z,.4)||!hiddenFrom(e,x,z))continue;const sc=r+Math.max(0,10-Math.hypot(x-e.x,z-e.z))*1.5;if(sc<bs){bs=sc;best={x,z}}}
  return best}
function goCover(b,e){if((b.covCd||0)>S.t)return false;b.covCd=S.t+4;const c=findCover(b,e);if(!c)return false;
  if(!botGoto(b,c.x,c.z,()=>{b.inCov=S.t}))return false;b.mode='cover';b.inCov=0;b.crouch=false;b.coverN=(b.coverN||0)+1;return true}
function botUpdate(b,dt){if(!b.alive)return;
  if(b.remote||NET.client){b.flashT-=dt;if(b.flashT<=0&&b.mesh)b.mesh.fl.visible=false;return}
  b.cool-=dt;b.flashT-=dt;if(b.flashT<=0)b.mesh.fl.visible=false;
  if(b.reloadT>0){b.reloadT-=dt;if(b.reloadT<=0)finishReload(b)}
  if(outZone(b)){b.zoneT=(b.zoneT||0)+dt;if(b.zoneT>=1){b.zoneT=0;damage(b,Z.dps,null,'安全地帯の外で倒れた',false,true)}}
  if(!b.alive)return;
  if(b.healT>0){b.healT-=dt;if(b.healT<=0){if(b.healKind==='med'){b.med--;b.hp=100}else{b.band--;b.hp=Math.min(75,b.hp+25)}}return}
  // perception
  b.lookT-=dt;if(b.lookT<=0){b.lookT=.3;let best=null,bd=1e9;const meTaken=BOTS.reduce((n,x)=>n+(x.alive&&x!==b&&x.enemy===ME&&(x.mode==='fight'||x.mode==='hunt')?1:0),0);const bw=wpn(b),vr=bw&&bw.id==='sniper'?85:bw&&bw.id==='rifle'?65:50;
    for(const o of ALL){if(!o.alive||o===b)continue;const d=Math.hypot(o.x-b.x,o.z-b.z);if(d>vr||d>bd)continue;
      if(o.me&&S.prone&&o!==b.enemy&&d>(ME.moving?26:15))continue;
      if(o.me&&o!==b.enemy&&d>12&&meTaken>=2)continue;
      const fw=((o.x-b.x)*Math.sin(b.face)+(o.z-b.z)*Math.cos(b.face))/Math.max(d,.01);if(fw<.25&&d>6&&o!==b.enemy)continue;
      if(los(b.x,b.z,o.x,o.z,AY(b)+1.5,(o.me&&ME.y!==undefined?ME.y:AY(o))+1.5)&&canSee(b,o)){best=o;bd=d}}
    if(best){if(b.enemy!==best){b.enemy=best;b.seen=0}b.lastE={x:best.x,z:best.z};b.visE=true}else b.visE=false}
  const w=wpn(b),W_=w&&WEAP[w.id];
  if(b.enemy&&(!b.enemy.alive))b.enemy=null;
  if(b.climb){botClimb(b,dt);return}
  if(S.t-(b.hitAt||-99)>1)b.reactHit=false;
  if(b.enemy&&!b.visE&&S.t-(b.hitAt||-99)<.4&&b.lastHitBy===b.enemy&&b.mode!=='cover'&&!b.reactHit){b.reactHit=true;const e=b.enemy;b.face=Math.atan2(e.x-b.x,e.z-b.z);b.lookT=0;b.nReact=(b.nReact||0)+1;
    if(!(w&&b.hp>55&&Math.random()<.4+b.skill*.5)&&goCover(b,e)){}else if(w){b.mode='hunt';b.huntT=7;if(!tryClimb(b,e))botGoto(b,e.x+(Math.random()-.5)*8,e.z+(Math.random()-.5)*8,()=>{})}}
  if(b.mode==='cover'&&(zoneUrgent(b)&&outZone(b)||!b.enemy)){b.mode='loot';b.inCov=0;b.path=[];b.target=null}
  if(b.mode==='cover'&&b.inCov&&!b.visE){b.crouch=true;b.moving=false;
    if(b.reloadT>0)return;if(w&&w.mag<=0&&b.ammo[W_.ammo]>0){startReload(b);return}
    if(b.hp<70&&(b.band||b.med)&&S.t-(b.hitAt||-99)>1.5){b.healT=b.med&&b.hp<40?5:2.5;b.healKind=b.med&&b.hp<40?'med':'band';return}
    if(S.t-b.inCov>.7+(1-b.skill)*1.5){b.inCov=0;b.crouch=false;b.mode='hunt';b.huntT=5;b.peekN=(b.peekN||0)+1;if(b.lastE)botGoto(b,b.lastE.x,b.lastE.z,()=>{})}
    return}
  const engage=(e,d)=>{if(S.t-(b.hitAt||-99)<4&&b.lastHitBy===e)return true;if(!w)return false;
    let r=Math.min(W_.range*1.05,W_.id==='sniper'?55+b.skill*45:W_.id==='rifle'?28+b.skill*40:16+b.skill*34);if(S.t<15)return false;if(b.hp<40)r*=.6;return d<r};
  if(b.enemy&&b.visE&&b.mode!=='fight'&&!engage(b.enemy,Math.hypot(b.enemy.x-b.x,b.enemy.z-b.z))&&!(!w&&wpn(b.enemy)&&Math.hypot(b.enemy.x-b.x,b.enemy.z-b.z)<20)){/* not worth a fight: keep doing what it was doing */}
  else if(b.enemy&&b.visE&&!(b.mode==='cover'&&!b.inCov&&b.target&&Math.hypot(b.enemy.x-b.x,b.enemy.z-b.z)>5)){const e=b.enemy,d=Math.hypot(e.x-b.x,e.z-b.z);b.seen+=dt;
    // committed to climbing up to someone it can't shoot from below: keep walking to the way up
    if(b.climbGo&&S.t-b.climbGo.t<20&&(b.path.length||b.target)&&!botClear(b,e)){b.mode='hunt';b.huntT=Math.max(b.huntT,3);b.face=Math.atan2(e.x-b.x,e.z-b.z);botMove(b,dt);return}
    const threat=!!wpn(e)&&d<20;
    if(!w&&!threat){/* unarmed and not in danger: keep looting */}
    else if(!w||(b.hp<40&&d>8)){if(w&&goCover(b,e)){}else if(b.mode!=='flee'&&(b.fleeCd||0)<=0){b.mode='flee';b.fleeT=4;b.fleeCd=7;botFlee(b)}}
    else if(b.mode==='fight'&&!engage(e,d*.75)&&d>14){b.mode='loot';b.enemy=null;b.path=[];b.target=null}
    else{b.mode='fight';b.path=[];b.target=null;b.inCov=0;b.running=false;b.face=Math.atan2(e.x-b.x,e.z-b.z);
      if(b.hp<55&&S.t-(b.hitAt||-99)<.5&&d>8&&Math.random()<b.skill&&goCover(b,e))return;
      if(outZone(b)&&Z.dps>0&&d>6&&!b.deckC){b.crouch=false;if(!b.rot||(!b.path.length&&!b.target))botRotate(b);
        if(w.mag>0&&b.seen>b.react&&d<W_.range&&b.cool<=0&&botClear(b,e))fire(b);else if(w.mag<=0&&b.ammo[W_.ammo]>0&&b.reloadT<=0)startReload(b);botMove(b,dt);return}
      if(w.mag<=0){if(b.ammo[W_.ammo]>0){startReload(b);if(d>7&&Math.random()<.35+b.skill*.6&&goCover(b,e))return}else{const alt=b.slots.findIndex(s=>s&&s!==w&&(s.mag>0||b.ammo[WEAP[s.id].ammo]>0));if(alt>=0)b.cur=alt;else{b.mode='flee';botFlee(b)}}}
      else if(b.seen>b.react+(S.t<90?.35:0)&&d<W_.range*1.1&&!botClear(b,e)){b.noClr=(b.noClr||0)+dt;if(b.noClr>1.5&&tryClimb(b,e)){b.noClr=0;return}}
      else if(b.seen>b.react+(S.t<90?.35:0)&&d<W_.range*1.1){b.noClr=0;b.yaw=b.face;if(fire(b)&&!W_.auto)b.cool+=.08+Math.random()*.25}
      // movement while fighting: strafe and keep a good distance
      b.strafeT-=dt;if(b.strafeT<=0){b.strafeT=.6+Math.random()*1.2;b.strafe*=-1}
      const push=(b.dmgOn===e&&S.t-b.dmgOnT<6&&b.dmgOnAmt>55)||e.reloadT>0||(e.me&&ME.healT>0);b.pushing=push;
      b.crT=(b.crT||0)-dt;if(b.crT<=0){b.crT=1.2+Math.random()*2;b.crouch=!push&&d>12&&Math.random()<.25+b.skill*.5}
      const want=push?4:W_.id==='shotgun'?6:W_.id==='sniper'?35:W_.range*.45;const k=d>want+4?1:d<want-4?-1:0;
      const fx=Math.sin(b.face),fz=Math.cos(b.face),sx=fz*b.strafe,sz=-fx*b.strafe;const sp=(push?4.2:3.2)*(b.crouch?.45:1)*dt;
      let mx=fx*k*.8+sx*.7,mz=fz*k*.8+sz*.7;if(outZone(b)){const n=nextZ(),zd=Math.hypot(n.x-b.x,n.z-b.z)||1;mx=mx*.4+(n.x-b.x)/zd;mz=mz*.4+(n.z-b.z)/zd}
      if(b.deckC){const dc=b.deckC,ins=(x,z)=>x>dc.x*T+.5&&x<(dc.x+dc.w)*T-.5&&z>dc.y*T+.5&&z<(dc.y+dc.h)*T-.5;if(!ins(b.x+mx*sp*8,b.z+mz*sp*8)){mx=-mx;mz=-mz;b.strafe*=-1}}
      const ox=b.x,oz=b.z;move(b,mx*sp,mz*sp);settleY(b,dt);b.moving=Math.hypot(b.x-ox,b.z-oz)>.001;b.walk+=Math.hypot(b.x-ox,b.z-oz)*3.2;return}}
  if(!b.enemy&&ME.alive&&S.meRun&&Math.hypot(ME.x-b.x,ME.z-b.z)<12&&Math.random()<dt*2)b.face=Math.atan2(ME.x-b.x,ME.z-b.z);
  if(!b.visE&&b.enemy&&b.mode==='fight'){b.mode='hunt';b.huntT=6;if(!tryClimb(b,b.enemy)&&b.lastE)botGoto(b,b.lastE.x,b.lastE.z,()=>{b.enemy=null;b.mode='loot'})}
  if(b.mode==='hunt'){b.huntT-=dt;if(b.huntT<=0||zoneUrgent(b)){b.enemy=null;b.mode='loot';b.path=[];b.target=null}}
  b.fleeCd=(b.fleeCd||0)-dt;if(b.mode==='flee'&&!b.path.length&&!b.target&&(outZone(b)||zoneUrgent(b)))botRotate(b);if(b.mode==='flee'){b.fleeT-=dt;if(b.fleeT<=0||(!b.visE&&!b.path.length)){b.mode='loot';b.enemy=null;b.path=[];b.target=null}}
  if(b.heardT>0){b.heardT-=dt;if(b.mode==='loot'&&!b.enemy&&w&&Math.random()<dt*.6){b.face=Math.atan2(b.heard.x-b.x,b.heard.z-b.z);if(Math.random()<(S.t<50?.1:Math.min(1,(.35+b.skill*.3)*(b.hp>60?1:.3)*(ALL.filter(a=>a.alive).length<=4?2.5:1)))&&!zoneUrgent(b)){const hd=Math.hypot(b.heard.x-b.x,b.heard.z-b.z),k=Math.max(0,hd-15)/Math.max(hd,1);if(botGoto(b,b.x+(b.heard.x-b.x)*k,b.heard.z*0+b.z+(b.heard.z-b.z)*k,()=>{b.face=Math.atan2(b.heard.x-b.x,b.heard.z-b.z)}))b.thirdN=(b.thirdN||0)+1}}}
  if(!b.enemy&&b.hp<70&&(b.band||b.med)&&b.mode!=='flee'&&!outZone(b)){b.healT=b.med&&b.hp<40?5:2.5;b.healKind=b.med&&b.hp<40?'med':'band';return}
  if(b.busyT>0){b.busyT-=dt;if(b.busyT<=0&&b.after){const f=b.after;b.after=null;f()}return}
  b.rotCd=(b.rotCd||0)-dt;if(b.rot&&!b.target)b.rot=false;
  if(b.mode==='loot'&&!b.rot&&b.rotCd<=0&&zoneUrgent(b)){const n=nextZ(),tg=b.target;if(!tg||Math.hypot(tg.x-n.x,tg.z-n.z)>n.r*.9){b.rotCd=1;for(const dr of drawers.values())if(dr.claimed===b)dr.claimed=null;botRotate(b)}}
  if(b.mode==='loot'&&!b.path.length&&!b.target){b.idle-=dt;if(b.idle<=0){b.idle=.5;botPlanLoot(b)}}
  if(w&&b.cur!==bestSlot(b)&&b.reloadT<=0)b.cur=bestSlot(b);
  botMove(b,dt)}
function botMove(b,dt){let tx,tz;if(b.mode!=='cover'||!b.inCov)b.crouch=false;
  if(b.deckC&&(b.path.length||b.target)){const c=b.deckC,t=b.target;b.path=[];b.target=null;b.deckC=null;b.climb={c,pts:c.route.slice().reverse(),i:0,up:false,then:()=>{if(t)botGoto(b,t.x,t.z,t.fn)}};return}
  if(b.y!==undefined&&!b.deckC)settleY(b,dt);
  if(b.path.length){const n=b.path[0],c=ctr(n),t=tile(n.x,n.y),dn=Math.hypot(c.x-b.x,c.z-b.z);
    if(t==='d'&&!doorOpen(n.x,n.y)&&dn<1.7){const dd=doors.get(kk(n.x,n.y));dd.open=true;dd.barr=false;b.busyT=.25;return}
    tx=c.x;tz=c.z;if(dn<.22){b.path.shift();return}}
  else if(b.target){tx=b.target.x;tz=b.target.z;if(Math.hypot(tx-b.x,tz-b.z)<.5||(b.stuckT||0)>1.2){const f=b.target.fn;b.target=null;b.stuckT=0;f();return}}
  else{b.moving=false;return}
  const dx=tx-b.x,dz=tz-b.z,m=Math.hypot(dx,dz)||1,run=b.mode==='flee'||b.mode==='cover'||outZone(b)||Z.state==='shrink';b.running=run;
  const sp=(run?5:3.4)*slopeMul(b,dx,dz)*dt;const want=Math.atan2(dx,dz);b.face+=Math.atan2(Math.sin(want-b.face),Math.cos(want-b.face))*Math.min(1,dt*10);
  const ox=b.x,oz=b.z;move(b,dx/m*Math.min(sp,m),dz/m*Math.min(sp,m));const mv=Math.hypot(b.x-ox,b.z-oz);
  if(mv<sp*.25)b.stuckT=(b.stuckT||0)+dt;else b.stuckT=0;if(b.stuckT>.5){const a=b.face+Math.PI/2*(Math.random()<.5?1:-1);move(b,Math.sin(a)*.3,Math.cos(a)*.3)}
  if(b.stuckT>2.5){b.stuckT=0;b.path=[];b.target=null}
  b.walk+=mv*3.2;b.moving=mv>.001;
  b.stepD=(b.stepD||0)+mv;if(b.stepD>1.4){b.stepD=0;const d=Math.hypot(b.x-ME.x,b.z-ME.z);if(d<16)step(Math.min(.3,(1-d/16)*(run?.35:.15)),panAt(b.x,b.z))}}
function openDrawer(dr){if(dr.opened)return;dr.opened=true;dr.searched=true;const loot=dr.loot||[];dr.loot=[];burst(.12*vAt(dr.px,dr.pz),.2,900,panAt(dr.px,dr.pz));
  loot.forEach((it,j)=>spawnItem(it,dr.px+dr.nx*.75+(j-.5)*.45*(dr.alongX?1:0),dr.pz+dr.nz*.75+(j-.5)*.45*(dr.alongX?0:1)))}
function botVisuals(now,dt){for(const b of BOTS){const d=Math.hypot(b.x-ME.x,b.z-ME.z),vis=d<85;b.mesh.g.visible=vis;
  const mvx=b.x-(b._px??b.x),mvz=b.z-(b._pz??b.z);b._px=b.x;b._pz=b.z;if(!vis)continue;
  // far bots are re-posed less often
  if(b.alive&&d>40&&((b.i+(S.frameN||0))%3))continue;const w=wpn(b);
  poseRig(b.mesh,{x:b.x,y:AY(b),z:b.z,face:b.face,dead:!b.alive,stance:b.prone?'prone':b.crouch?'crouch':'stand',aim:b.mode==='fight'||(b.mode==='cover'&&b.peek),armed:w?w.id:null,rar:w?w.r:0,
    moving:b.moving,walk:b.walk,heal:b.healT>0,run:!!b.running,armorLv:b.armorLv,helmLv:b.helmLv,mvx,mvz,dt:d>40?dt*3:dt})}}
// stance of any actor: the player can stand, crouch (also while sliding) or lie prone; bots stand or crouch
const stanceOf=a=>a.me?(S.prone?'prone':(S.crouch||S.slide)?'crouch':'stand'):(a.prone?'prone':a.crouch?'crouch':'stand');

// ---------- player ----------
function myPickCandidate(){let best=null,bd=1e9;const fx=-Math.sin(ME.yaw),fz=-Math.cos(ME.yaw);
  for(const it of ITEMS){if(it.kind!=='weapon'&&!((it.kind==='armor'&&ME.armorLv>0&&ME.armor>0)||(it.kind==='helmet'&&ME.helmLv>0&&ME.helm>0)))continue;const dx=it.x-ME.x,dz=it.z-ME.z,d=Math.hypot(dx,dz);if(d>1.8||!reachY(it))continue;const sc=d-(dx*fx+dz*fz)/Math.max(d,.01)*.8;if(sc<bd){bd=sc;best={type:'item',it}}}
  for(const dr of drawers.values()){if(dr.opened)continue;const dx=dr.px-ME.x,dz=dr.pz-ME.z,d=Math.hypot(dx,dz);if(d>1.7)continue;const sc=d+.3-(dx*fx+dz*fz)/Math.max(d,.01)*.8;if(sc<bd){bd=sc;best={type:'drawer',dr}}}
  for(const dd of doors.values()){if(dd.broken)continue;const c=ctr(dd),dx=c.x-ME.x,dz=c.z-ME.z,d=Math.hypot(dx,dz);if(d>2.1)continue;const sc=d+.6-(dx*fx+dz*fz)/Math.max(d,.01)*.8;if(sc<bd){bd=sc;best={type:'door',dd}}}
  for(const w of wins.values()){const c=ctr(w),dx=c.x-ME.x,dz=c.z-ME.z,d=Math.hypot(dx,dz);if(d>2)continue;const sc=d+.6-(dx*fx+dz*fz)/Math.max(d,.01)*.8;if(sc<bd){bd=sc;best={type:'win',w}}}
  return best}
function myUse(c){if(!c)return;
  if(c.type==='item'){const it=c.it;
    if(it.kind==='weapon'){const dr=giveWeapon(ME,it.id,it.r,it.optic);if(dr)spawnItem({kind:'weapon',id:dr.id,r:dr.r||0,optic:dr.optic||null},ME.x,ME.z);toast(it,'を拾った')}
    else if(it.kind==='optic'){const t=opticTarget(it.id);if(!t){say('この照準器を付けられる武器を持っていない');return}
      if(t.optic)spawnItem({kind:'optic',id:t.optic},ME.x+.4,ME.z);t.optic=it.id;if(t===wpn(ME))buildVm(t.id,t.r||0);say(`${OPTICS[it.id].n}を${WEAP[t.id].name}に付けた`,1.5)}
    else if(it.kind==='armor'||it.kind==='helmet'){const isV=it.kind==='armor',lv=isV?ME.armorLv:ME.helmLv,hp=isV?ME.armor:ME.helm;
      if(lv>0&&hp>0)spawnItem({kind:it.kind,lv,hp:Math.round(hp)},ME.x+.6*Math.cos(ME.yaw),ME.z-.6*Math.sin(ME.yaw));if(isV){ME.armorLv=it.lv;ME.armor=it.hp}else{ME.helmLv=it.lv;ME.helm=it.hp}
      removeItem(it);toast(it,'に交換した');tone(500,'triangle',.06,.12,800);return}
    else{if(it.kind==='ammo')ME.ammo[it.id]+=it.amt;else if(it.kind==='bandage')ME.band+=it.amt;else if(it.kind==='medkit')ME.med++;toast(it,'を拾った')}
    removeItem(it);tone(700,'triangle',.05,.06)}
  else if(c.type==='drawer'){S.useT={t:.5,fn:()=>openDrawer(c.dr)}}
  else if(c.type==='door'){const dd=c.dd;if(dd.open){dd.open=false;if(!free(ME.x,ME.z,ME.r)||BOTS.some(b=>b.alive&&!free(b.x,b.z,b.r))){dd.open=true}else bang(.5)}else{dd.open=true;bang(.3)}}
  else if(c.type==='win'){const w=c.w;if(w.state==='closed'){setWin(w,'open');return}const cc=ctr(w),n={x:w.in.x-w.x,z:w.in.y-w.y},side=Math.sign((ME.x-cc.x)*n.x+(ME.z-cc.z)*n.z)||1;
    let tx=cc.x-side*n.x*1.1,tz=cc.z-side*n.z*1.1;if(!free(tx,tz,ME.r)){tx=cc.x-side*n.x*1.5;tz=cc.z-side*n.z*1.5;if(!free(tx,tz,ME.r))return}S.vault={fx:ME.x,fz:ME.z,tx,tz,t:0}}}
// the gun an optic goes on: the one in hand if it fits, else the other one
function opticTarget(o){const c=wpn(ME);if(fitsOptic(c,o))return c;return ME.slots.find(s=>fitsOptic(s,o))||null}
function useLabel(c){const K='E：';if(!c)return'';
  if(c.type==='item'){const it=c.it;if(it.kind==='weapon'&&ME.slots.every(s=>s))return K+WEAP[it.id].name+'と持ち替える';if(it.kind==='optic'){const t=opticTarget(it.id);return t?K+OPTICS[it.id].n+'を'+WEAP[t.id].name+'に付ける':OPTICS[it.id].n+'（付けられる武器がない）'}
    if(it.kind==='armor'||it.kind==='helmet'){const isV=it.kind==='armor',lv=isV?ME.armorLv:ME.helmLv,hp=isV?ME.armor:ME.helm,cap=(isV?VEST:HELM)[lv].cap;return K+itemLabel(it)+`と交換（今：Lv${lv} 耐久${Math.round(hp)}/${cap}）`}
    return K+itemLabel(it)+'を拾う'}
  if(c.type==='drawer')return K+'ロッカーを開ける';if(c.type==='door')return K+(c.dd.open?'扉を閉める':'扉を開ける');
  if(c.type==='win')return K+(c.w.state==='closed'?'窓を開ける':'窓を乗り越える');return''}
function myHeal(kind){if(ME.healT>0){ME.healT=0;say('回復をやめた');return}if(ME.hp>=100){say('体力は満タン');return}
  if(kind==='med'){if(!ME.med){say('救急キットを持っていない');return}ME.healT=5;ME.healKind='med';say('救急キットを使っている…（5秒・全回復）')}
  else{if(!ME.band){say('包帯を持っていない');return}if(ME.hp>=75){say('包帯では75までしか回復できない');return}ME.healT=2.5;ME.healKind='band';say('包帯を巻いている…（2.5秒・+25）')}}
// everything except weapons is picked up just by walking over it
const itY=it=>it.y!==undefined?it.y:groundY(it.x,it.z),reachY=it=>Math.abs(itY(it)-ME.y)<1.2;
function autoPickup(){for(const it of ITEMS.slice()){if(it.kind==='weapon'||it.kind==='optic')continue;if(Math.hypot(it.x-ME.x,it.z-ME.z)>1.1||!reachY(it))continue;
    if(it.kind==='armor'||it.kind==='helmet'){const isV=it.kind==='armor',lv=isV?ME.armorLv:ME.helmLv,hp=isV?ME.armor:ME.helm;
      if(lv>0&&hp>0)continue;removeItem(it);if(lv>0&&hp>6)spawnItem({kind:it.kind,lv,hp:Math.round(hp)},ME.x+.8,ME.z);
      if(isV){ME.armorLv=it.lv;ME.armor=it.hp}else{ME.helmLv=it.lv;ME.helm=it.hp}toast(it,'を装備した');tone(500,'triangle',.06,.12,800);continue}
    else if(it.kind==='ammo')ME.ammo[it.id]+=it.amt;
    else if(it.kind==='bandage')ME.band+=it.amt;
    else if(it.kind==='medkit')ME.med++;
    toast(it,'を拾った');
    removeItem(it);tone(700,'triangle',.05,.06)}}

// ---------- input ----------
const btn={fire:false,ads:false,run:false};const tap={use:false,reload:false,swap:false,heal:false,jump:false,s1:false,s2:false};
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;btn.fire=btn.ads=btn.run=false});
addEventListener('keydown',e=>{if(SPEC.on){if(e.code==='Escape')specStop();else if(e.code==='Space'||e.code==='ArrowRight'||e.code==='KeyD')specNext(1);else if(e.code==='ArrowLeft'||e.code==='KeyA')specNext(-1);return}keys[e.code]=true;if(!e.repeat){if(e.code==='KeyE')tap.use=true;if(e.code==='KeyR')tap.reload=true;if(e.code==='KeyQ')tap.swap=true;if(e.code==='KeyH'||e.code==='Digit4')tap.band=true;if(e.code==='KeyX'||e.code==='Digit5')tap.med=true;if(e.code==='KeyC')tap.crouch=true;
  if(e.code==='Space')tap.jump=true;if(e.code==='KeyZ')tap.prone=true;if(e.code==='Digit1')tap.s1=true;if(e.code==='Digit2')tap.s2=true}if(['Space','ArrowUp','ArrowDown'].includes(e.code))e.preventDefault()});
addEventListener('keyup',e=>{keys[e.code]=false});
addEventListener('wheel',e=>{if(!ME||!ME.alive||S.over||!$('overlay').hidden||paused)return;const now=performance.now();if(now-(S.wheelT||0)<180)return;S.wheelT=now;tap.swap=true},{passive:true});

let SENS=1;try{const v=parseFloat(localStorage.getItem('dr_sens'));if(v>=.2&&v<=2.5)SENS=v}catch(_){}
function setSens(v){SENS=v;try{localStorage.setItem('dr_sens',String(v))}catch(_){}$$('.sens').forEach(el=>{el.value=v});$$('.sensv').forEach(el=>{el.textContent=v.toFixed(2)})}
function bindSens(){$$('.sens').forEach(el=>{el.value=SENS;el.oninput=()=>setSens(parseFloat(el.value))});setSens(SENS)}
const ADSSENS=Math.tan(29*Math.PI/180)/Math.tan(37*Math.PI/180),adsSensW=w=>Math.tan(adsFovW(w)/2*Math.PI/180)/Math.tan(37*Math.PI/180);

function look(dx,dy,k){if(!ME||SPEC.on)return;k*=SENS;const w_=wpn(ME),ak=S.adsK||0,s=1+((w_?adsSensW(w_):ADSSENS)-1)*ak;ME.yaw-=dx*k*s;VM.swX=Math.max(-.06,Math.min(.06,VM.swX+dx*k*s*.35));VM.swY=Math.max(-.05,Math.min(.05,VM.swY+dy*k*s*.35));ME.pitch=Math.max(-1.3,Math.min(1.3,ME.pitch-dy*k*s))}
const cvEl=$('cv');
function lockPointer(){try{const p=cvEl.requestPointerLock();if(p&&p.catch)p.catch(()=>{})}catch(_){}}
document.addEventListener('mousedown',e=>{if(document.pointerLockElement!==cvEl)return;if(e.button===0){btn.fire=true;S.fireBuf=.18}if(e.button===2)btn.adsM=true});
cvEl.addEventListener('pointerdown',e=>{if(SPEC.on){specNext(1);return}if(document.pointerLockElement!==cvEl)lockPointer()});

cvEl.addEventListener('pointerup',e=>{if(e.button===0)btn.fire=false;if(e.button===2)btn.adsM=false});
addEventListener('mouseup',e=>{if(e.button===0)btn.fire=false;if(e.button===2)btn.adsM=false});
cvEl.addEventListener('contextmenu',e=>e.preventDefault());

document.addEventListener('mousemove',e=>{if(document.pointerLockElement===cvEl)look(e.movementX,e.movementY,.0012)});
document.addEventListener('pointerlockchange',()=>{if(document.pointerLockElement===cvEl)locked=true;else if(locked&&!S.over&&$('overlay').hidden){locked=false;paused=true;$('pause').hidden=false}});
$('resume').addEventListener('click',()=>{paused=false;$('pause').hidden=true;lockPointer()});

// ---------- audio ----------
let ac=null;
function panNode(pan){if(!ac||pan===undefined||!ac.createStereoPanner)return null;const p=ac.createStereoPanner();p.pan.value=Math.max(-1,Math.min(1,pan));return p}
function tone(f,type,vol,dur,f2){if(!ac||vol<=.001)return;const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(f,ac.currentTime);
  if(f2)o.frequency.exponentialRampToValueAtTime(f2,ac.currentTime+dur);g.gain.setValueAtTime(vol,ac.currentTime);g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+dur);o.connect(g).connect(ac.destination);o.start();o.stop(ac.currentTime+dur+.05)}
function burst(vol,dur,freq,pan){if(!ac||vol<=.002)return;const n=Math.floor(44100*dur),b=ac.createBufferSource(),buf=ac.createBuffer(1,n,44100),d=buf.getChannelData(0);
  for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n)**2;b.buffer=buf;const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=freq;const g=ac.createGain();g.gain.value=vol;
  const pn=panNode(pan);b.connect(f).connect(g);if(pn)g.connect(pn).connect(ac.destination);else g.connect(ac.destination);b.start()}
function panAt(x,z){const dx=x-ME.x,dz=z-ME.z,d=Math.hypot(dx,dz)||1;return(dx*Math.cos(ME.yaw)-dz*Math.sin(ME.yaw))/d}
const vAt=(x,z)=>Math.max(0,1-Math.hypot(x-ME.x,z-ME.z)/90);
const step=(v,pan)=>burst(v,.05,400,pan),glass=(v=1,pan)=>{if(v>0){burst(.4*v,.4,6000,pan);tone(1800,'triangle',.06*v,.3,900)}},bang=(v=1,pan)=>{if(v>0)burst(.5*v,.25,900,pan)};

// ---------- HUD ----------
let msgT=0;function say(s,t=2.2){$('msg').textContent=s;$('msg').style.opacity=1;msgT=t}
const fmt=s=>{s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
function hud(){const alive=ALL.filter(a=>a.alive).length;$('alive').textContent=alive;$('kills').textContent=ME.kills;
  $('hpbar').style.width=Math.max(0,ME.hp)+'%';const gk=[ME.armorLv,Math.ceil(ME.armor),ME.helmLv,Math.ceil(ME.helm)].join();if(gk!==hud.gk){hud.gk=gk;
    const tile=(kind,lv,hp,cap,nm)=>`<div class="gi${lv?'':' none'}" style="--c:${LVCOL[lv]}" title="${nm}">${ICONS[kind](lv||1)}<div><b>${lv?'Lv'+lv:'なし'}</b><i><s style="width:${lv?Math.max(3,hp/cap*100).toFixed(0):0}%"></s></i></div></div>`;
    $('gear').innerHTML=tile('armor',ME.armorLv,ME.armor,ME.armorLv?VEST[ME.armorLv].cap:1,'防弾ベスト')+tile('helmet',ME.helmLv,ME.helm,ME.helmLv?HELM[ME.helmLv].cap:1,'ヘルメット')}
  $('hpnum').textContent=Math.ceil(Math.max(0,ME.hp));
  const zt=Z.state==='wait'?`安全地帯が縮むまで <b>${fmt(Z.t)}</b>`:Z.state==='shrink'?`<b class="warn">縮小中</b> ${fmt(Z.t)}`:'<b class="warn">最終局面</b>';
  const nz=nextZ(),zdx=nz.x-ME.x,zdz=nz.z-ME.z,zd=Math.hypot(zdx,zdz)-nz.r;const zarr=zd>0&&ME.alive?`<br>次の安全地帯まで <span class="zarr" style="transform:rotate(${(ME.yaw-Math.atan2(-zdx,-zdz)).toFixed(2)}rad)">▲</span> <b>${Math.round(zd)}m</b>`:'';
  $('zone').innerHTML=zt+zarr+(outZone(ME)?`<br><b class="warn">安全地帯の外！ 毎秒${Z.dps}ダメージ</b>`:'');
  ME.slots.forEach((s,i)=>{const el=$('slot'+i);el.classList.toggle('on',i===ME.cur);el.style.borderLeft=s?`3px solid ${RAR[s.r||0].c}`:'';el.innerHTML=s?`<i>${i+1}</i>${WEAP[s.id].name}${s.optic?`<small class="opt">${OPTICS[s.optic].s}</small>`:''}<b>${s.mag}<small>/${ME.ammo[WEAP[s.id].ammo]}</small></b>`:`<i>${i+1}</i><span>空き</span>`});
  $('heals').textContent=`包帯 ${ME.band}［H］・救急キット ${ME.med}［X］`;

  const w=wpn(ME);$('ammo').innerHTML=ME.healT>0?(ME.healKind==='med'?'救急キット使用中…':'包帯を巻いている…'):w?`<em>${WEAP[w.id].name}</em>${w.mag}<small> / ${ME.ammo[WEAP[w.id].ammo]}</small>`:'素手'}
const mc=$('map').getContext('2d');let mapBase=null;
function drawMap(){const s=Math.min(240/W,176/H);
  if(!mapBase){mapBase=document.createElement('canvas');mapBase.width=240;mapBase.height=176;const b=mapBase.getContext('2d');b.fillStyle='#0b0d10';b.fillRect(0,0,240,176);
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){const c=grid[y][x];
      b.fillStyle=c==='#'?'#b8c4cc':c==='w'?'#4fb8d8':c==='d'?'#e08a3a':'=AV'.includes(c)?'#5a6676':c==='T'?'#4a2e6a':'fLD'.includes(c)?'#3a4450':(()=>{const hh=Math.max(0,Math.min(1,(heightAt(x*T+T/2,y*T+T/2)+2)/7));return`rgb(${78+hh*50|0},${48+hh*34|0},${40+hh*26|0})`})();b.fillRect(x*s,y*s,s+.5,s+.5)}}
  mc.clearRect(0,0,240,176);mc.drawImage(mapBase,0,0);
  mc.font='bold 9px sans-serif';mc.textAlign='center';mc.fillStyle='rgba(142,230,255,.9)';for(const d of DIST)mc.fillText(DNAME[d.k],(d.x0+d.x1)/2*s,(d.y0+d.y1)/2*s+3);mc.textAlign='start';
  mc.lineWidth=2;if(Z.to){mc.strokeStyle='rgba(255,255,255,.85)';mc.setLineDash([4,3]);mc.beginPath();mc.arc(Z.to.x/T*s,Z.to.z/T*s,Z.to.r/T*s,0,7);mc.stroke();mc.setLineDash([])}
  mc.strokeStyle='#4a9cff';mc.beginPath();mc.arc(Z.cx/T*s,Z.cz/T*s,Z.r/T*s,0,7);mc.stroke();
  for(const p of S.pings){mc.fillStyle=`rgba(214,64,47,${(p.t/2.5).toFixed(2)})`;mc.beginPath();mc.arc(p.x/T*s,p.z/T*s,3,0,7);mc.fill()}
  mc.fillStyle='#c8f4ff';mc.beginPath();mc.arc(ME.x/T*s,ME.z/T*s,3.5,0,7);mc.fill();
  mc.strokeStyle='#c8f4ff';mc.lineWidth=1.5;mc.beginPath();mc.moveTo(ME.x/T*s,ME.z/T*s);mc.lineTo(ME.x/T*s-Math.sin(ME.yaw)*10,ME.z/T*s-Math.cos(ME.yaw)*10);mc.stroke()}

// ---------- game flow ----------
S={};
function startGame(){
  try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();ac.resume()}catch(e){}
  if(NET.client)return;NET.live=false;const seed=(Math.random()*1e9)|0;setupWorld(seed);
  seedLoot();seedCoverLoot();initZone();if(NET.host)netSendInit(seed);
  showDrop()}
function setupWorld(seed){
  ME=null;genMap(SIZE,seed);grid=BASE.map(r=>r.split(''));doors=new Map();wins=new Map();drawers=new Map();closets=[];floors=[];cols=new Map();DOORP=new Map();
  S={recap:[],t:0,over:false,cans:[],pings:[],hurt:0,hitMark:0,killMark:0,recoil:0,ads:false,moveAmt:0,flashT:0,vy:0,jumpY:0,useT:null,vault:null};
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const c=grid[y][x];
    if(c==='d')doors.set(kk(x,y),{x,y,open:Math.random()<.35,barr:false,broken:false});
    else if(c==='w'){const ax='#wd'.includes(grid[y][x-1])&&'#wd'.includes(grid[y][x+1]);const a=ax?{x,y:y-1}:{x:x-1,y},b=ax?{x,y:y+1}:{x:x+1,y};const inA=grid[a.y][a.x]==='f';
      wins.set(kk(x,y),{x,y,state:Math.random()<.2?'open':'closed',in:inA?a:b,out:inA?b:a})}
    else if(c==='D')drawers.set(kk(x,y),{x,y,searched:false,loot:null,pad:houseAt(x,y).pad});

    else if(c==='B')phone={x,y};
    if(robberPass(x,y)&&!'dw'.includes(grid[y][x]))floors.push({x,y})}
  police={...META.police};
  buildWorld();police.mesh.visible=false;mapBase=null;feed.length=0;renderFeed()}
// ---------- choose where to land ----------
function validSpot(x,z){const tx=TX(x),ty=TX(z);if(tx<3||ty<3||tx>W-4||ty>H-4)return null;
  let best=null,bd=1e9;for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){const t={x:tx+dx,y:ty+dy};if(!'.=f'.includes(tile(t.x,t.y)))continue;const c=ctr(t);if(!free(c.x,c.z,.35))continue;
    const d=Math.hypot(c.x-x,c.z-z);if(d<bd){bd=d;best=c}}return best}
let DROP=null;
function drawDrop(){const cv=$('dropmap');if(!cv)return;const g=cv.getContext('2d'),s=cv.width/(W*T);g.drawImage(DROP.base,0,0);
  g.font='bold 12px sans-serif';g.textAlign='center';g.textBaseline='middle';
  for(const h of HOUSES){const n=ITEMS.filter(it=>it.kind==='weapon'&&insideHouse(it.x,it.z)===h).length+[...drawers.values()].filter(d=>houseAt(d.x,d.y)===h).length;
    const cx=(h.x+h.w/2)*T*s,cz=(h.y+h.h/2)*T*s;g.fillStyle='rgba(8,14,24,.75)';g.fillRect(cx-14,cz-9,28,18);g.fillStyle='#4fd2ff';g.fillText(n,cx,cz)}
  const SNAME={hq:'指令所',ship:'墜落船',gantry:'渡り廊下',bunker:'掩体壕',tower:'物見台'};
  const LBR=[];g.save();g.setLineDash([5,4]);g.lineWidth=1.5;g.strokeStyle='rgba(120,220,255,.75)';
  for(const d of DIST){g.strokeRect(d.x0*T*s,d.y0*T*s,(d.x1-d.x0)*T*s,(d.y1-d.y0)*T*s)}g.restore();
  for(const d of DIST){const cx=(d.x0+d.x1)/2*T*s,cy=d.y1*T*s-9;g.font='bold 13px sans-serif';const tw=g.measureText(DNAME[d.k]).width+10;g.fillStyle='rgba(10,40,60,.85)';g.fillRect(cx-tw/2,cy-9,tw,17);g.fillStyle='#8ee6ff';g.fillText(DNAME[d.k],cx,cy);LBR.push([cx,cy,tw])}
  for(const c of COVER){if(!SNAME[c.k])continue;const x0=c.x*T*s,z0=c.y*T*s,w=c.w*T*s,h=c.h*T*s,big=c.k==='hq'||c.k==='ship';
    g.strokeStyle=big?'#ffb347':'#cfe8ff';g.lineWidth=big?2:1.2;g.strokeRect(x0+.5,z0+.5,w-1,h-1);
    const hi=ITEMS.filter(it=>it.y!==undefined&&it.kind!=='ammo'&&it.x>=c.x*T-1&&it.x<=(c.x+c.w)*T+1&&it.z>=c.y*T-1&&it.z<=(c.y+c.h)*T+1).length;
    if(big||hi){const lb=big?SNAME[c.k]+(hi?' ▲'+hi:''):'▲'+hi;g.font=big?'bold 11px sans-serif':'bold 10px sans-serif';const tw=g.measureText(lb).width+8,W=g.canvas.width,H=g.canvas.height;
      let cx=Math.max(tw/2+2,Math.min(W-tw/2-2,x0+w/2)),cy=z0-7;if(cy<10)cy=z0+h+9;
      for(let k=0;k<6&&LBR.some(r=>Math.abs(r[0]-cx)<(r[2]+tw)/2&&Math.abs(r[1]-cy)<15);k++)cy+=cy<H/2?15:-15;LBR.push([cx,cy,tw]);
      g.fillStyle='rgba(8,14,24,.82)';g.fillRect(cx-tw/2,cy-8,tw,15);g.fillStyle=big?'#ffb347':'#cfe8ff';g.fillText(lb,cx,cy)}}
  g.font='bold 12px sans-serif';
  if(DROP.pick){const x=DROP.pick.x*s,z=DROP.pick.z*s;g.strokeStyle='#4fd2ff';g.lineWidth=3;g.beginPath();g.arc(x,z,9,0,7);g.stroke();g.beginPath();g.moveTo(x-14,z);g.lineTo(x+14,z);g.moveTo(x,z-14);g.lineTo(x,z+14);g.stroke()}}
function showDrop(){const base=document.createElement('canvas'),px=Math.min(440,innerWidth-32);base.width=px;base.height=Math.round(px*H/W);const b=base.getContext('2d'),s=px/W;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const c=grid[y][x];b.fillStyle=c==='#'?'#c8d2da':c==='w'?'#4fb8d8':c==='d'?'#e08a3a':c==='B'?'#7c8896':'=AV'.includes(c)?'#5a6676':c==='T'?'#4a2e6a':'fLD'.includes(c)?'#3a4450':
    (()=>{const hh=Math.max(0,Math.min(1,(heightAt(x*T+T/2,y*T+T/2)+2)/7));return`rgb(${78+hh*50|0},${48+hh*34|0},${40+hh*26|0})`})();b.fillRect(x*s,y*s,s+.5,s+.5)}
  DROP={base,pick:null,t:20};
  $('card').innerHTML=`<h1><small>CHOOSE YOUR DROP</small>降下地点を選ぶ</h1>
    <p>地図をタップして降りる場所を決める。数字はその建物の武器とロッカーの数。点線の区画は地区、枠は構造物（オレンジは大型）、▲は高所に置かれた良いアイテムの数。安全地帯の位置は降りてからミニマップで分かる。全員がハンドガンを持って降り、${NET.on?'仲間以外の':'ほかの'}${NET.on&&NET.noCpu?'':CFG.players-1-(NET.on?NET.lobby.length-1:0)}${NET.on&&NET.noCpu?'仲間だけが':'人は'}基地や地区のあちこちに散らばって降りる。</p>
    <canvas id="dropmap" width="${base.width}" height="${base.height}" style="width:100%;height:auto;max-height:58vh;object-fit:contain;border-radius:4px;cursor:crosshair;touch-action:none"></canvas>
    <p id="dropinfo" style="font-size:13px;color:var(--dim)">あと <b id="dropt">20</b> 秒で自動で降りる</p>
    <button class="btn" id="dropgo" disabled>ここに降りる</button><button class="btn ghost" id="droprand">おまかせで降りる</button>`;
  const cv=$('dropmap');cv.addEventListener('pointerdown',e=>{const r=cv.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*W*T,z=(e.clientY-r.top)/r.height*H*T;
    const sp=validSpot(x,z);if(!sp){$('dropinfo').textContent='そこには降りられない。道や地面、建物の中を選んで';return}DROP.pick=sp;$('dropgo').disabled=false;
    const h=insideHouse(sp.x,sp.z);$('dropinfo').innerHTML=(h?'建物の中に降りる。':'外に降りる。')+`あと <b id="dropt">${Math.ceil(DROP.t)}</b> 秒で自動で降りる`;drawDrop()});
  $('dropgo').onclick=()=>dropDone(DROP.pick);$('droprand').onclick=()=>dropDone(null);drawDrop();
  DROP.timer=setInterval(()=>{if(!DROP)return;DROP.t-=1;const el=$('dropt');if(el)el.textContent=Math.max(0,Math.ceil(DROP.t));if(DROP.t<=0)dropDone(DROP.pick,true)},1000)}
function launch(pick){if(!DROP)return;clearInterval(DROP.timer);DROP=null;
  ALL=[];BOTS=[];const n=NET.on&&NET.noCpu?NET.lobby.length:CFG.players,spots=[];
  const myspot=pick||(()=>{for(let t=0;t<500;t++){const h=HOUSES[(Math.random()*HOUSES.length)|0];const c=validSpot((h.x+h.w/2)*T,(h.y+h.h+1.5)*T);if(c)return c}return ctr(floors[0])})();
  spots.push(myspot);
  const humans=NET.host?NET.lobby.slice(1):[];for(const h of humans){let c=h.pick?validSpot(h.pick.x,h.pick.z):null;for(let t=0;t<500&&!c;t++){const hh=HOUSES[(Math.random()*HOUSES.length)|0];c=validSpot((hh.x+hh.w/2)*T,(hh.y+hh.h+1.5)*T)}spots.push(c||ctr(floors[0]))}
  // bots: spread over the houses first, then the open ground; keep a little distance from each other and from the player
  const hs=HOUSES.slice().sort(()=>Math.random()-.5);let hi=0;
  for(let t=0;t<8000&&spots.length<n;t++){let c;
    if(t<3000){const h=hs[hi++%hs.length];const ang=Math.random()*6.28,r=(Math.max(h.w,h.h)/2+1.5+Math.random()*2)*T;c=validSpot((h.x+h.w/2)*T+Math.cos(ang)*r,(h.y+h.h/2)*T+Math.sin(ang)*r)}
    else{const f=floors[(Math.random()*floors.length)|0];c='.='.includes(tile(f.x,f.y))?ctr(f):null}
    if(!c)continue;const md=t<2500?18:t<5500?13:7;if(spots.some((p,i)=>Math.hypot(p.x-c.x,p.z-c.z)<(i===0?Math.max(md,20):md)))continue;spots.push(c)}
  spots.forEach((c,i)=>{const a=newActor(i,i===0,c.x,c.z);a.face=a.yaw=Math.random()*6.28;giveWeapon(a,'pistol');a.ammo.light=24;ALL.push(a);if(i===0)ME=a;else BOTS.push(a);
    if(NET.host){if(i===0)a.name=NET.name;else if(i<=humans.length){const h=humans[i-1];a.name=h.name;a.remote=true;a.conn=h.conn;a.human=true;h.conn.actor=a}}});
  {let best=null,bd=1e9;for(const h of HOUSES){const hx=(h.x+h.w/2)*T,hz=(h.y+h.h/2)*T,d=Math.hypot(hx-ME.x,hz-ME.z);if(d<bd){bd=d;best=[hx,hz]}}if(best)ME.yaw=Math.atan2(-(best[0]-ME.x),-(best[1]-ME.z))}
  if(NET.host)netSendGo();
  ME.r=.3;buildVm('pistol');
  $('stage').classList.add('playing');$('overlay').hidden=true;resize();hud();say(`${n}人のバトルロイヤル開始。${NET.on?'仲間も敵。':''}建物を探して強い武器を拾え`,3.5);lockPointer()}
function end(win){if(S.over)return;S.over=true;$('msg').style.opacity=0;msgT=0;$('hint').textContent='';if(document.pointerLockElement)document.exitPointerLock();
  const place=win?1:ME.place||ALL.filter(a=>a.alive).length+1,n=ALL.length;
  setTimeout(()=>{$('card').innerHTML=`<h1><small>${win?'WINNER':'ELIMINATED'}</small>${win?'勝利！ 最後の1人':`${place}位`}</h1>
    <p>${win?'惑星の採掘基地で、最後まで生き残った。':`倒したのは <b>${ME.lastHitBy?ME.lastHitBy.name:'安全地帯'}</b>。`}</p>
    ${S.recap.length?`<ol class="recap">${S.recap.slice(-6).map(r=>`<li><span>${fmt(r.t)}</span>${r.txt}</li>`).join('')}</ol>`:''}
    <dl class="res"><div><dt>順位</dt><dd>${place} / ${n}</dd></div><div><dt>キル</dt><dd>${ME.kills}</dd></div><div><dt>与ダメージ</dt><dd>${Math.round(ME.dmgDone)}</dd></div><div><dt>生存時間</dt><dd>${fmt(S.t)}</dd></div></dl>
    ${!win&&ALL.some(a=>a.alive&&!a.me)?'<button class="btn ghost" id="spec">試合の続きを観戦する</button>':''}
    <button class="btn" id="start">同じ人数でもう一度</button><button class="btn ghost" id="menu">人数を選び直す</button>`;
    $('stage').classList.remove('playing');$('overlay').hidden=false;$('start').onclick=startGame;$('menu').onclick=()=>{$('card').innerHTML=START_HTML;bindStart()};
    if($('spec'))$('spec').onclick=()=>specStart(ME.lastHitBy)},win?400:1200)}
// ---------- spectating after you are out: follow a player from behind, click / Space to switch ----------
const SPEC={on:false,a:null,cx:0,cy:0,cz:0,done:false};
function specAlive(){return ALL.filter(a=>a.alive&&!a.me)}
function specStart(pref){const al=specAlive();if(!al.length)return;SPEC.on=true;SPEC.done=false;SPEC.a=pref&&pref.alive&&!pref.me?pref:al[0];SPEC.cx=undefined;
  $('overlay').hidden=true;$('stage').classList.add('playing');let el=$('specbar');if(!el){el=document.createElement('div');el.id='specbar';$('stage').appendChild(el)}el.hidden=false}
function specStop(){SPEC.on=false;const el=$('specbar');if(el)el.hidden=true;$('stage').classList.remove('playing');$('overlay').hidden=false;if(NET.on)netEndCard()}
function specNext(d){const al=specAlive();if(!al.length)return;const i=al.indexOf(SPEC.a);SPEC.a=al[((i<0?0:i+d)%al.length+al.length)%al.length];SPEC.cx=undefined}
function specFrame(dt){const al=specAlive();if(!SPEC.a||!SPEC.a.alive){const k=SPEC.a&&SPEC.a.lastHitBy;SPEC.a=k&&k.alive&&!k.me?k:al[0]||null;SPEC.cx=undefined}
  const el=$('specbar');
  if(!SPEC.a||ALL.filter(a=>a.alive).length<=1){if(!SPEC.done){SPEC.done=true;const w=ALL.find(a=>a.alive);if(el)el.innerHTML=`<b>${w?esc(w.name)+' の勝利':'試合終了'}</b>`;say(w?`${w.name}が最後の1人になった`:'試合終了',3);setTimeout(()=>{if(SPEC.on)specStop()},3500)}if(!SPEC.a)return}
  const a=SPEC.a,ay=AY(a);if(SPEC.cx===undefined||SPEC.f===undefined)SPEC.f=a.face;{let df=(a.face-SPEC.f)%(Math.PI*2);if(df>Math.PI)df-=Math.PI*2;if(df<-Math.PI)df+=Math.PI*2;SPEC.f+=df*Math.min(1,dt*4)}
  SPEC.hy=SPEC.hy===undefined||SPEC.cx===undefined?ay:SPEC.hy+(ay-SPEC.hy)*Math.min(1,dt*10);const f=SPEC.f,hx=a.x,hy=SPEC.hy+1.55,hz=a.z;let bx=-Math.sin(f),bz=-Math.cos(f),dist=3.4;
  const L=Math.hypot(bx*dist,.9,bz*dist),r=rayHit(hx,hy,hz,bx*dist/L,.9/L,bz*dist/L,L,a,false);const k=r.solid||r.actor?Math.max(.4,(r.t-.3)/L):1;
  const tx=hx+bx*dist*k,ty=hy+.9*k,tz=hz+bz*dist*k;if(SPEC.cx===undefined){SPEC.cx=tx;SPEC.cy=ty;SPEC.cz=tz}const m=Math.min(1,dt*10);SPEC.cx+=(tx-SPEC.cx)*m;SPEC.cy+=(ty-SPEC.cy)*m;SPEC.cz+=(tz-SPEC.cz)*m;
  cam.position.set(SPEC.cx,SPEC.cy,SPEC.cz);cam.lookAt(hx,hy-.1,hz);ME.x=a.x;ME.z=a.z;
  if(el&&!SPEC.done){const w=wpn(a);el.innerHTML=`観戦中：<b>${esc(a.name)}</b>　体力${Math.max(0,Math.round(a.hp))}${a.armorLv?'　ベストLv'+a.armorLv:''}${w?'　'+WEAP[w.id].name:''}　キル${a.kills||0}　残り${ALL.filter(x=>x.alive).length}人<span>クリック／Space：次の人　Esc：結果に戻る</span>`}}

const AQ={t:0,sum:0,n:0,lv:0},PXB=[1.3e6,1.3e6,.9e6,.6e6];
function resize(){const r=cvEl.getBoundingClientRect(),px=Math.max(1,r.width*r.height);R.setPixelRatio(Math.max(.5,Math.min(devicePixelRatio||1,1.5,Math.sqrt(PXB[AQ.lv]/px))));R.setSize(r.width,r.height,false);cam.aspect=r.width/Math.max(1,r.height);cam.updateProjectionMatrix()}
addEventListener('resize',resize);
let last=0,hudT=0;
function frame(now){if(DROP){requestAnimationFrame(frame);return}const dt=Math.min(.05,(now-last)/1000||0);last=now;
  if(ME&&!S.over&&!paused&&$('overlay').hidden){let d2=dt;if(S.hitStop>0){S.hitStop-=dt;d2=NET.on?dt:dt*.25}tick(d2)}
  else if(ME&&NET.host&&!NET.done)hostWorld(dt);
  else if(ME&&S.over&&!NET.on){if(SPEC.on&&!SPEC.done)hostWorld(dt);else for(const b of BOTS)if(b.alive)botUpdate(b,dt*.5)}
  if(ME&&NET.on)netFrame(dt);
  if(ME)render(now,dt);if(ME&&!S.over&&!paused)autoQuality(dt);requestAnimationFrame(frame)}
// adaptive quality: if the frame rate stays low, shorten the detailed-tree radius, thin the grass, then drop the pixel ratio
function autoQuality(dt){if(AQ.lv>=3||dt<=0)return;AQ.t+=dt;AQ.sum+=dt;AQ.n++;if(AQ.t<2.5)return;const fps=AQ.n/AQ.sum;AQ.t=AQ.sum=AQ.n=0;if(fps>=42)return;AQ.lv++;
  if(AQ.lv===1){VEG.hiR=18;VEG.grassN=550}else if(AQ.lv===2){VEG.hiR=12;VEG.grassN=200}else{VEG.hiR=0;VEG.grassN=0}resize();VEG.cx=1e9}
// climb onto / over low obstacles in front (car hoods and roofs, crates) with the jump key; open or broken windows are vaulted through
function tryMantle(){const fx=-Math.sin(ME.yaw),fz=-Math.cos(ME.yaw);
  for(const w of wins.values()){if(w.state==='closed')continue;const c=ctr(w);if(Math.hypot(c.x-ME.x,c.z-ME.z)<1.5&&((c.x-ME.x)*fx+(c.z-ME.z)*fz)>.3){myUse({type:'win',w});return true}}
  for(const d of[.5,.8,1.05]){const px=ME.x+fx*d,pz=ME.z+fz*d;FEET=ME.y;const bl=solidAt(px,pz);FEET=null;if(!bl)continue;
    const top=platformTop(px,pz,ME.y+1.7,.05);if(!(top>ME.y+.35))return false;
    for(const e of[.45,.75]){const tx=ME.x+fx*(d+e),tz=ME.z+fz*(d+e);FEET=top;const ok=free(tx,tz,ME.r*.9);FEET=null;
      if(ok&&platformTop(tx,tz,top+.05,0)>=top-.05){S.mantle={fx:ME.x,fz:ME.z,fy:ME.y,tx,tz,ty:top,t:0};S.crouch=false;S.slide=null;step(.12);return true}}
    return false}return false}
function tick(dt){S.t+=dt;if(!NET.client)updateZone(dt);
  S.dT=(S.dT||0)-dt;if(S.dT<=0&&ME.alive){S.dT=.5;const tx=ME.x/T,tz=ME.z/T,d=DIST.find(d=>tx>=d.x0&&tx<d.x1&&tz>=d.y0&&tz<d.y1)||null;if(d!==S.dist){S.dist=d;if(d&&!S.drop)say('― '+DNAME[d.k]+' ―',2.4)}}
  // movement
  let mx=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0),mf=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0);
  const m=Math.hypot(mx,mf);if(m>1){mx/=m;mf/=m}
  S.stanceT=Math.max(0,(S.stanceT||0)-dt);S.fireBuf=Math.max(0,(S.fireBuf||0)-dt);S.drawT=Math.max(0,(S.drawT||0)-dt);
  S.ads=!!(btn.adsM||btn.adsT)&&!!wpn(ME)&&ME.reloadT<=0&&S.stanceT<=0&&S.drawT<=0&&ME.healT<=0;
  {const aw=wpn(ME),at=aw?WEAP[aw.id].ads:.2;S.adsK=Math.max(0,Math.min(1,(S.adsK||0)+(S.ads?1:-1.6)*dt/at))}
  if(S.vault){S.vault.t+=dt/.55;const t=Math.min(1,S.vault.t);ME.x=S.vault.fx+(S.vault.tx-S.vault.fx)*t;ME.z=S.vault.fz+(S.vault.tz-S.vault.fz)*t;if(t>=1)S.vault=null}
  S.slideCd=Math.max(0,(S.slideCd||0)-dt);
  if(tap.crouch){tap.crouch=false;const sp_=Math.hypot(S.vx||0,S.vz||0);
    if(S.prone){S.prone=false;S.crouch=true;S.stanceT=.3}
    else if((S.meRun||S.t-(S.lastRunT||-9)<.3)&&sp_>3.4&&!S.air&&S.slideCd<=0){const k=Math.max(sp_,7.4)/sp_;S.vx*=k;S.vz*=k;S.slide={t:1.05};S.crouch=true;S.slideCd=.9;burst(.12,.35,1400)}
    else if(!S.air){S.crouch=!S.crouch;S.slide=null}}
  if(S.mantle){S.mantle.t+=dt/.42;const t=Math.min(1,S.mantle.t),e=t*t*(3-2*t);ME.x=S.mantle.fx+(S.mantle.tx-S.mantle.fx)*e;ME.z=S.mantle.fz+(S.mantle.tz-S.mantle.fz)*e;
    ME.y=S.mantle.fy+(S.mantle.ty-S.mantle.fy)*Math.min(1,t*1.6);S.vx=S.vz=0;if(t>=1){S.mantle=null;S.vy=0;S.air=false}}
  const moving=m>.15&&!S.vault&&!S.useT&&!S.mantle;const run=S.meRun=!S.prone&&!S.slide&&(keys.ShiftLeft||keys.ShiftRight||btn.run)&&moving&&!S.ads&&mf>.2&&ME.healT<=0&&!btn.fire&&S.fireBuf<=0;
  if(run&&S.crouch)S.crouch=false;
  if(run)S.lastRunT=S.t;
  if(S.wasRun&&!run&&wpn(ME)&&!S.slide)ME.cool=Math.max(ME.cool,.12);S.wasRun=run; // short sprint-out before the gun is up
  // velocity with acceleration: ~0.15 s to full speed, ~0.1 s to stop, little control in the air
  {let dvx=0,dvz=0;if(moving){const sy=Math.sin(ME.yaw),cy=Math.cos(ME.yaw),vx=-sy*mf+cy*mx,vz=-cy*mf-sy*mx,sm=slopeMul(ME,vx,vz);
      const spd=(run?5.6:3.7)*(mf<-.2&&!run?.85:1)*(S.prone?.32:S.crouch?.55:1)*(1-.45*(S.adsK||0))*(ME.healT>0?.45:1)*(S.stanceT>0?.5:1)*sm;dvx=vx*spd;dvz=vz*spd}
    if(S.vault||S.mantle){S.vx=S.vz=0}else{
      if(S.slide){S.slide.t-=dt;const sm2=slopeMul(ME,S.vx,S.vz),fr=Math.exp(-dt*(1.1+(sm2<1?(1-sm2)*4:-(sm2-1)*3)));S.vx*=fr;S.vz*=fr;
        if(moving){S.vx+=dvx*dt*.6;S.vz+=dvz*dt*.6}if(S.slide.t<=0||Math.hypot(S.vx,S.vz)<2.2)S.slide=null}
      else{const cur=Math.hypot(S.vx||0,S.vz||0),want=Math.hypot(dvx,dvz),rate=S.air?2.5:want>=cur?13:17,k=1-Math.exp(-dt*rate);
      S.vx=(S.vx||0)+(dvx-(S.vx||0))*k;S.vz=(S.vz||0)+(dvz-(S.vz||0))*k}
      const ox=ME.x,oz=ME.z;if(Math.abs(S.vx)+Math.abs(S.vz)>1e-3)move(ME,S.vx*dt,S.vz*dt);const mv=Math.hypot(ME.x-ox,ME.z-oz);
      if(!S.air&&dt>0){S.vx=(ME.x-ox)/dt;S.vz=(ME.z-oz)/dt} // walls and slopes eat velocity
      ME.walk+=mv*(run?2.8:3.2);S.moveAmt=Math.min(1,mv/Math.max(dt,1e-4)/5);S.stepT=(S.stepT||0)+mv;if(S.stepT>(run?1.7:1.4)){S.stepT=0;step(run?.1:.05)}}}
  ME.moving=S.moveAmt>.1;
  if(tap.prone){tap.prone=false;if(!S.air){S.prone=!S.prone;S.crouch=false;S.slide=null;S.stanceT=S.prone?.45:.35;S.adsK=Math.min(S.adsK||0,.3);say(S.prone?'伏せた':'立ち上がった',1)}}
  if(!S.mantle){const terr=groundY(ME.x,ME.z);if(ME.y===undefined)ME.y=terr;const plat=platformTop(ME.x,ME.z,ME.y+STEP,ME.r*.85),sup=Math.max(terr,plat);
   if(tap.jump){tap.jump=false;if(S.prone){S.prone=false;S.stanceT=.35;say('立ち上がった',1)}else if(S.crouch&&!S.slide){S.crouch=false}else if(!S.air&&tryMantle()){}else S.jumpBuf=.15}S.jumpBuf=Math.max(0,(S.jumpBuf||0)-dt);
   if(S.jumpBuf>0&&!S.air&&S.stanceT<=0){S.vy=5.1;S.jumpBuf=0;if(S.slide){S.slide=null;S.crouch=false}}
   S.vy=(S.vy||0)-12*dt;ME.y+=S.vy*dt;const wasAir=S.air,fallV=S.vy;
   if(ME.y<=sup||(S.vy<=0&&ME.y-sup<.22&&!S.air)){ME.y=sup;S.vy=0;S.air=false}else S.air=true;ME.feet=ME.y;
   if(wasAir&&!S.air&&fallV<-3){S.land=Math.min(.16,(-fallV-2.5)*.035);step(.12)}}else{ME.feet=ME.y;tap.jump=false}
  // weapons
  ME.cool-=dt;S.clickT=Math.max(0,(S.clickT||0)-dt);
  if(ME.reloadT>0){ME.reloadT-=dt;if(ME.reloadT<=0)finishReload(ME)}
  {const sw=wpn(ME);if(sw&&WEAP[sw.id].fixedMag&&sw.mag<=0&&ME.reloadT<=0&&ME.cool<=0&&ME.ammo[WEAP[sw.id].ammo]>0&&ME.healT<=0)startReload(ME)} // single-shot rifle chambers the next round by itself
  const swapTo=i=>{if(i===ME.cur||!ME.slots[i])return;ME.cur=i;ME.reloadT=0;const dw=WEAP[ME.slots[i].id].draw;ME.cool=Math.max(ME.cool,dw);S.drawT=dw;S.adsK=0;S.kickAcc=0;buildVm(ME.slots[i].id)};
  if(tap.s1)swapTo(0);if(tap.s2)swapTo(1);tap.s1=tap.s2=false;
  if(tap.swap){tap.swap=false;swapTo(1-ME.cur)}
  if(tap.reload){tap.reload=false;startReload(ME)}
  if(tap.band){tap.band=false;myHeal('band')}if(tap.med){tap.med=false;myHeal('med')}
  if(ME.alive)autoPickup();
  if(ME.healT>0){if(btn.fire&&wpn(ME)){ME.healT=0;say('回復を中断した')}else{ME.healT-=dt;if(ME.healT<=0){if(ME.healKind==='med'){ME.med--;ME.hp=100}else{ME.band--;ME.hp=Math.min(75,ME.hp+25)}say('回復した');tone(600,'sine',.08,.3,900)}}}
  const w=wpn(ME),trig=btn.fire||S.fireBuf>0;
  if(trig&&w&&ME.reloadT>0&&w.mag>0){ME.reloadT=0} // pulling the trigger with rounds left cancels the reload
  if(trig&&ME.healT<=0&&!S.vault&&S.stanceT<=0&&!S.meRun){const did=fire(ME);if(did){S.fireBuf=0;if(!w||!WEAP[w.id].auto)btn.fire=false}}
  // use
  const cand=S.useT?null:myPickCandidate();$('hint').textContent=S.useT?'開けている…':useLabel(cand);
  if(tap.use){tap.use=false;if(!S.useT)myUse(cand)}
  if(S.useT){S.useT.t-=dt;if(S.useT.t<=0){const f=S.useT.fn;S.useT=null;f()}}
  // zone damage
  if(outZone(ME)){S.zoneT=(S.zoneT||0)+dt;if(S.zoneT>=1){S.zoneT=0;damage(ME,Z.dps,null,'安全地帯の外で倒れた',false,true);tone(140,'sine',.08,.2)}}else S.zoneT=0;
  for(const b of BOTS)botUpdate(b,dt);
  for(const p of S.pings)p.t-=dt;S.pings=S.pings.filter(p=>p.t>0);
  for(const f of feed)f.life-=dt;if(feed.length&&feed[feed.length-1].life<=0){feed.pop();renderFeed()}
  if(msgT>0){msgT-=dt;if(msgT<=0)$('msg').style.opacity=0}
  hudT-=dt;if(hudT<=0){hudT=.12;hud()}}
function render(now,dt){
  for(const d of doors.values()){if(!d.pivot)continue;const tg=(d.open||d.broken)?1:0;d.ang+=(tg-d.ang)*.25;d.pivot.rotation.y=-d.sgn*1.45*d.ang;d.panel.visible=!d.broken;d.planks.visible=false}
  for(const dr of drawers.values())if(dr.pull){const tz=dr.opened?.32:0;dr.pull.position.z+=(tz-dr.pull.position.z)*.2}
  for(const it of ITEMS){const near=Math.abs(it.x-ME.x)<45&&Math.abs(it.z-ME.z)<45;it.mesh.visible=near;if(near)it.mesh.children[it.mesh.children.length-1].visible=ME.alive}
  S.frameN=(S.frameN||0)+1;botVisuals(now,dt);
  for(const t of tracers)if(t.l.visible){t.t-=dt;t.l.material.opacity=Math.max(0,t.t/.07)*.8;if(t.t<=0)t.l.visible=false}
  for(const im of impacts){im.t-=dt}for(let i=impacts.length-1;i>=0;i--)if(impacts[i].t<=0){scene.remove(impacts[i].s);impacts.splice(i,1)}
  zoneMesh.position.set(Z.cx,0,Z.cz);zoneMesh.scale.set(Math.max(.1,Z.r),90,Math.max(.1,Z.r));
  // camera
  S.recoil=Math.max(0,S.recoil-dt*.5);
  // camera kick: applied quickly, then most of it recovers once the trigger is released
  if(!S.over){const k=Math.min(1,dt*28),kv=(S.kickV||0)*k,kh=(S.kickH||0)*k;ME.pitch=Math.min(1.3,ME.pitch+kv);ME.yaw-=kh;S.kickV-=kv;S.kickH-=kh;S.kickAcc=(S.kickAcc||0)+kv;
    if(S.t-(S.lastShot||-9)>.14&&S.kickAcc>0){const r=S.kickAcc*Math.min(1,dt*7);ME.pitch-=r*.75;S.kickAcc-=r}}
  S.bloom=Math.max(0,(S.bloom||0)-dt*(S.t-(S.lastShot||-9)>.2?.12:.02));
  const gy=ME.y===undefined?groundY(ME.x,ME.z):ME.y;ME.gy=ME.gy===undefined?gy:(S.air?gy:ME.gy+(gy-ME.gy)*Math.min(1,dt*14));
  const eyeT=S.prone?.42:S.slide?.85:S.crouch?1.08:EYE;S.eyeH=S.eyeH===undefined?EYE:S.eyeH+(eyeT-S.eyeH)*Math.min(1,dt*10);
  $('stance').hidden=!(S.prone||S.crouch||S.slide);$('stance').textContent=S.prone?'伏せ':S.slide?'スライディング':'しゃがみ';
  S.land=Math.max(0,(S.land||0)-dt*.5);const adk=S.adsK||0,bob=ME.moving?Math.sin(ME.walk)*.045*(1-.75*adk):0,vy=S.vault?Math.sin(Math.min(1,S.vault.t)*Math.PI)*.35:0;
  const w=wpn(ME),isScope=scopedW(w),ek=adk*adk*(3-2*adk),scope=isScope&&adk>.85;
  cam.position.set(ME.x,ME.gy+S.eyeH+(S.prone?bob*.3:bob)+vy-S.land-(ME.alive?0:1.3),ME.z);cam.rotation.set(ME.pitch,ME.yaw,ME.alive?0:.6);
  S.fovKick=Math.max(0,(S.fovKick||0)-dt*30);const fov=74+(adsFovW(w)-74)*ek+S.fovKick*(1-ek);if(Math.abs(cam.fov-fov)>.01){cam.fov=fov;cam.updateProjectionMatrix()}
  if(SPEC.on)specFrame(dt);
  const vmOn=ME.alive&&!scope;if(vmOn)updateVm(dt,ek);S.flashT-=dt;
  $('scope').hidden=!scope;$('cross').hidden=!!scope||!ME.alive||(adk>.6&&!!w);
  const spread=w?mySpread(WEAP[w.id]):.02;$('cross').style.setProperty('--g',(8+spread*700)+'px');
  S.hitMark=Math.max(0,S.hitMark-dt);S.killMark=Math.max(0,S.killMark-dt);$('hit').style.opacity=S.hitMark>0?1:0;$('hit').classList.toggle('kill',S.killMark>0);$('hit').classList.toggle('head',!!S.hitHead);
  S.hurt=Math.max(0,S.hurt-dt*.8);$('hurt').style.opacity=S.hurt.toFixed(2);S.hurtT=Math.max(0,(S.hurtT||0)-dt);
  $('dir').style.opacity=S.hurtT>0?Math.min(1,S.hurtT):0;$('dir').style.transform=`rotate(${(-(S.hurtDir||0)+ME.yaw+Math.PI)}rad)`;
  $('storm').style.opacity=outZone(ME)&&ME.alive?.55:0;
  S.brkT=Math.max(0,(S.brkT||0)-dt);$('hit').classList.toggle('arm',!!S.hitArmor&&S.hitMark>0);$('hit').classList.toggle('brk',S.brkT>0);
  drawDmgNums(dt);drawTags();updateVeg(cam.position.x,cam.position.z);linearize(scene);linearize(vmScene);R.render(scene,cam);
  if(vmOn){vmCam.aspect=cam.aspect;vmCam.fov=cam.aspect<1?64:54;vmCam.updateProjectionMatrix();R.autoClear=false;R.clearDepth();R.render(vmScene,vmCam);R.autoClear=true}
  drawMap()}

const START_HTML=$('card').innerHTML;
function bindSights(){$$('.sgts').forEach(g=>{const id=g.dataset.w;g.querySelectorAll('button').forEach(b=>{const on=b.dataset.s===SIGHT[id];b.classList.toggle('on',on);b.setAttribute('aria-pressed',on);
  b.onclick=()=>{SIGHT[id]=b.dataset.s;try{localStorage.setItem('dr_sight2',JSON.stringify(SIGHT))}catch(_){}bindSights()}})})}
function bindStart(){$('start').onclick=startGame;bindSens();bindSights();$$('.size').forEach(b=>{b.classList.toggle('on',b.dataset.size===SIZE);b.setAttribute('aria-pressed',b.dataset.size===SIZE);
  b.onclick=()=>{SIZE=b.dataset.size;$$('.size').forEach(o=>{o.classList.toggle('on',o===b);o.setAttribute('aria-pressed',o===b)})}});bindNet()}
/*NET*/
bindStart();
// a living backdrop behind the start card
(function preview(){grid=BASE.map(r=>r.split(''));doors=new Map();wins=new Map();drawers=new Map();closets=[];floors=[];cols=new Map();DOORP=new Map();S={cans:[],pings:[]};
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const c=grid[y][x];if(c==='d')doors.set(kk(x,y),{x,y,open:false});else if(c==='w'){const ax='#wd'.includes(grid[y][x-1])&&'#wd'.includes(grid[y][x+1]);const a=ax?{x,y:y-1}:{x:x-1,y},b=ax?{x,y:y+1}:{x:x+1,y};const inA=grid[a.y][a.x]==='f';wins.set(kk(x,y),{x,y,state:'closed',in:inA?a:b,out:inA?b:a})}
    else if(c==='D')drawers.set(kk(x,y),{x,y,pad:houseAt(x,y).pad});else if(c==='B')phone={x,y}}
  police={...META.police};buildWorld();police.mesh.visible=false;zoneMesh.visible=false;
  resize();const h=HOUSES[0];cam.position.set((h.x+h.w/2)*T+10,h.pad+3.2,(h.y+h.h+6)*T);cam.lookAt((h.x+h.w/2)*T,h.pad+1.5,(h.y+h.h/2)*T);
  (function pv(){if(ME){zoneMesh.visible=true;return}R.render(scene,cam);requestAnimationFrame(pv)})()})();
requestAnimationFrame(frame);
})();
