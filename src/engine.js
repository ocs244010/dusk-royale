const T=2,EYE=1.6,WALLH=2.7,SL=.18,DOORW=1.1,DOORH=2.15,POLICE_WAIT=60,MAXHP=3;
let W=60,H=44,DAWN=12*60,CFG,SIZE='medium';
const WIN={ow:1.2,y0:.9,y1:2.05};
const $=id=>document.getElementById(id);
const DIRS=[[1,0],[-1,0],[0,1],[0,-1]];
const LOOTNAME={fuse:'ヒューズ',key:'車のキー',map:'地図',heal:'救急スプレー',spray:'催涙スプレー',cracker:'爆竹'};
let grid,P,K,S,keys={};
let doors,wins,drawers,closets,van,phone,police,floors=[],cols=new Map(),DOORP=new Map();
const kk=(x,y)=>y*W+x;

// ================= map: generated per game, size depends on player count =================
function mulberry(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const SIZES={small:{W:66,H:48,houses:11,gas:1,fuse:1,dawn:10*60,hills:5,cars:5,players:6},medium:{W:90,H:64,houses:18,gas:2,fuse:2,dawn:12*60,hills:8,cars:8,players:10},large:{W:116,H:82,houses:27,gas:3,fuse:3,dawn:15*60,hills:12,cars:11,players:16}};
let DIST=[],TERR=[];const DNAME={yard:'コンテナ置き場',pad:'発着場',pit:'採掘場',post:'防衛陣地'};
let HOUSES=[],LAMPS=[],CARS=[],COVER=[],VANT,META,BASE,HG,HGW,HGH;const HOFF=40;
function genMap(size,seed0){CFG=SIZES[size];W=CFG.W;H=CFG.H;DAWN=CFG.dawn;
  const seed=seed0!==undefined?seed0:(Date.now()%100000)|0;for(let a=0;a<30;a++)if(tryGen(seed+a*7919,size))break;buildHeights(seed)}
function tryGen(seed,size){
  const g=Array.from({length:H},()=>Array(W).fill('.'));const rnd=mulberry(seed);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(x<2||y<2||x>=W-2||y>=H-2)g[y][x]='T';
  const ry=Math.floor(H*.38),cx=Math.floor(W*.48),lr=Math.floor(H*.74),vx=[Math.floor(W*.2),Math.floor(W*.78)],ty2=Math.floor(H*.12);
  for(let x=2;x<W-2;x++){g[ry][x]='=';g[ry+1][x]='='}
  for(let y=2;y<H-2;y++){g[y][cx]='=';g[y][cx+1]='='}
  for(let x=6;x<W-7;x++)g[lr][x]='=';
  for(const v of vx)for(let y=5;y<=lr;y++)g[y][v]='=';
  if(size!=='small'){for(let x=vx[0];x<=vx[1];x++)g[ty2][x]='=';for(let y=lr;y<H-4;y++)g[y][Math.floor(W*.62)]='='}
  // districts: whole blocks between roads given one character (container yard, landing pad, mining pit, defence post) - houses stay out of them
  DIST=[];{const nD={small:2,medium:3,large:4}[size],xs=[2,vx[0],cx+1,vx[1],W-2],ys=[2,ry+1,lr,H-2],blocks=[];
    for(let i=0;i+1<xs.length;i++)for(let j=0;j+1<ys.length;j++){const x0=xs[i]+3,x1=xs[i+1]-3,y0=ys[j]+3,y1=ys[j+1]-3;if(x1-x0<10||y1-y0<8)continue;
      blocks.push({x0,x1,y0,y1})}
    blocks.sort(()=>rnd()-.5);const kinds=['yard','pad',...(rnd()<.5?['pit','post']:['post','pit'])];
    for(const b of blocks){if(DIST.length>=nD)break;const w=Math.min(b.x1-b.x0,18),h=Math.min(b.y1-b.y0,13);let ok=null;
      for(let t=0;t<20&&!ok;t++){const x0=b.x0+(rnd()*(b.x1-b.x0-w+1)|0),y0=b.y0+(rnd()*(b.y1-b.y0-h+1)|0);let road=false;for(let y=y0-1;y<=y0+h&&!road;y++)for(let x=x0-1;x<=x0+w;x++)if(g[y][x]!=='.'){road=true;break}if(!road)ok=[x0,y0]}
      if(!ok)continue;const[x0,y0]=ok;DIST.push({k:kinds[DIST.length],x0,y0,x1:x0+w,y1:y0+h});for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++)g[y][x]='Z'}}
  const roadNear=(x0,y0,x1,y1,r)=>{for(let y=Math.max(0,y0-r);y<=Math.min(H-1,y1+r);y++)for(let x=Math.max(0,x0-r);x<=Math.min(W-1,x1+r);x++)if(g[y][x]==='=')return true;return false};
  HOUSES=[];const nSheds=Math.max(1,Math.round(CFG.houses/7));let tries=0;
  while(HOUSES.length<CFG.houses&&tries<20000){tries++;
    const shed=HOUSES.length>=CFG.houses-nSheds,w=shed?4:6+(rnd()*3|0),h=shed?4:5+(rnd()*2|0);
    const x=3+(rnd()*(W-7-w)|0),y=3+(rnd()*(H-7-h)|0);
    let ok=true;for(let yy=y-2;yy<y+h+2&&ok;yy++)for(let xx=x-2;xx<x+w+2;xx++){if(xx<2||yy<2||xx>=W-2||yy>=H-2||g[yy][xx]!=='.'){ok=false;break}}
    if(!ok||!roadNear(x,y,x+w-1,y+h-1,5))continue;
    const mx=x+Math.floor(w/2)-(w>=7?2:0),my=y+Math.floor(h/2);
    const ray=(sx,sy,dx,dy)=>{for(let k=1;k<=9;k++){const c=(g[sy+dy*k]||[])[sx+dx*k];if(c==='=')return k;if(c===undefined)break}return 99};
    const ds={n:ray(mx,y,0,-1),s:ray(mx,y+h-1,0,1),w:ray(x,my,-1,0),e:ray(x+w-1,my,1,0)};
    const order=Object.keys(ds).sort((a,b)=>ds[a]-ds[b]);let doorsS=order[0];
    if(!shed&&rnd()<.65)doorsS+=order[1+(rnd()*3|0)];
    for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)g[yy][xx]='H';
    HOUSES.push({x,y,w,h,doors:doorsS,lit:0,shed})}
  if(HOUSES.length<CFG.fuse+3)return false;
  HOUSES.forEach((h,i)=>{h.i=i;h.lit=(i%3===0&&!h.shed)?1:0});
  // roof terraces: a staircase along one door-less wall (a strip of tiles marked 'B') leads up to a flat roof with a low parapet
  for(const h of HOUSES){if(h.shed||rnd()>.45)continue;
    for(const sd of['s','n','e','w'].sort(()=>rnd()-.5)){if(h.doors.includes(sd))continue;const alongX=sd==='s'||sd==='n',len=alongX?h.w:h.h;if(len<4)continue;
      const r=sd==='s'?h.y+h.h:sd==='n'?h.y-1:sd==='e'?h.x+h.w:h.x-1,a0=alongX?h.x:h.y,flip=rnd()<.5;
      const at=k=>alongX?[a0+k,r]:[r,a0+k],start=flip?len:-1;let ok=true;
      for(let k=-1;k<=len&&ok;k++){const[x,y]=at(k);if(!g[y]||g[y][x]!=='.')ok=false}
      if(!ok)continue;for(let k=0;k<len;k++){const[x,y]=at(k);g[y][x]='B'}h.terr={sd,alongX,r,a0,len,flip};break}}

  for(const h of HOUSES){
    for(let y=h.y;y<h.y+h.h;y++)for(let x=h.x;x<h.x+h.w;x++){const edge=x===h.x||y===h.y||x===h.x+h.w-1||y===h.y+h.h-1;g[y][x]=edge?'#':'f'}
    h.my=h.y+Math.floor(h.h/2);
    if(h.w>=7){h.ix=h.x+Math.floor(h.w/2);for(let y=h.y+1;y<h.y+h.h-1;y++)g[y][h.ix]='#';g[h.my][h.ix]='f'}
    const mx=h.x+Math.floor(h.w/2)-(h.w>=7?2:0);
    for(const d of h.doors){if(d==='n')g[h.y][mx]='d';if(d==='s')g[h.y+h.h-1][mx]='d';if(d==='w')g[h.my][h.x]='d';if(d==='e')g[h.my][h.x+h.w-1]='d'}
    if(!h.shed)g[h.y+1][h.x+h.w-2]='L';
  }
  for(const h of HOUSES){let k=0;
    for(let y=h.y;y<h.y+h.h;y++)for(let x=h.x;x<h.x+h.w;x++){if(g[y][x]!=='#')continue;
      const corner=(x===h.x||x===h.x+h.w-1)&&(y===h.y||y===h.y+h.h-1);if(corner)continue;
      const horiz=(y===h.y||y===h.y+h.h-1);const a=horiz?[x,y-1]:[x-1,y],b=horiz?[x,y+1]:[x+1,y];
      const ca=(g[a[1]]||[])[a[0]],cb=(g[b[1]]||[])[b[0]];
      if(((ca==='f'&&'.='.includes(cb))||(cb==='f'&&'.='.includes(ca)))&&(k++)%3===1)g[y][x]='w'}}
  for(const h of HOUSES){const cand=[];
    for(let y=h.y+1;y<h.y+h.h-1;y++)for(let x=h.x+1;x<h.x+h.w-1;x++){if(g[y][x]!=='f')continue;
      let bad=false;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const c=g[y+dy][x+dx];if(c==='d'||c==='L'||c==='D')bad=true}
      if(DIRS.some(([a,b])=>g[y+b][x+a]==='w'))bad=true;
      if(h.ix&&Math.abs(x-h.ix)===1&&y===h.my)bad=true;
      if(!bad&&DIRS.some(([a,b])=>g[y+b][x+a]==='#'))cand.push([x,y])}
    cand.sort(()=>rnd()-.5);let n=h.shed?1:(h.w>=7?3:2);
    for(const[x,y]of cand){if(!n)break;let adj=false;for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++)if(g[y+b][x+a]==='D')adj=true;if(adj)continue;g[y][x]='D';n--}}
  // parked cars on the roads
  CARS=[];const pal=[0x5a4038,0x3a4652,0x4b5040,0x6e6658,0x4a2a2a,0x2e3a46];
  for(let t=0;t<300&&CARS.length<CFG.cars;t++){const k=rnd();let c;
    if(k<.4){const x=8+(rnd()*(W-20)|0);c={tx:x,ty:ry+1,dir:'x'}}else if(k<.7){const y=4+(rnd()*(H-9)|0);c={tx:cx,ty:y,dir:'z'}}else{const x=8+(rnd()*(W-18)|0);c={tx:x,ty:lr,dir:'x'}}
    const t2=c.dir==='x'?[c.tx+1,c.ty]:[c.tx,c.ty+1];
    if(g[c.ty][c.tx]!=='='||g[t2[1]][t2[0]]!=='=')continue;
    if(c.dir==='x'&&(Math.abs(c.tx-cx)<4||vx.some(v=>Math.abs(c.tx-v)<3)||c.tx>W-12||c.tx<7))continue;
    if(c.dir==='z'&&(Math.abs(c.ty-ry)<4||Math.abs(c.ty-lr)<3))continue;
    if(CARS.some(o=>Math.abs(o.tx-c.tx)+Math.abs(o.ty-c.ty)<6))continue;
    c.col=pal[CARS.length%pal.length];g[c.ty][c.tx]='A';g[t2[1]][t2[0]]='A';CARS.push(c)}
  // street lamps
  LAMPS=[];const lampAt=(x,y)=>{if(g[y]&&g[y][x]==='.'&&DIRS.some(([a,b])=>g[y+b][x+a]==='='))LAMPS.push([x,y])};
  for(let x=8;x<W-8;x+=14)lampAt(x,ry-1);
  for(let y=5;y<H-5;y+=12)if(Math.abs(y-ry)>2)lampAt(cx-1,y);
  for(let x=12;x<W-10;x+=16)lampAt(x,lr+1);
  for(const v of vx)for(let y=8;y<lr;y+=14)if(Math.abs(y-ry)>2)lampAt(v-1,y);
  const nearBuilt=(x,y)=>{for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const c=(g[y+dy]||[])[x+dx];if(c&&'#fdLwD=A'.includes(c))return true}return false};
  const groves=[];for(let i=0;i<2+(CFG.houses/3|0);i++)groves.push({x:3+rnd()*(W-6),y:3+rnd()*(H-6),r:3+rnd()*4});
  for(let y=2;y<H-2;y++)for(let x=2;x<W-2;x++){if(g[y][x]!=='.'||nearBuilt(x,y))continue;
    const grove=groves.some(o=>Math.hypot(x-o.x,y-o.y)<o.r);if(rnd()<(grove?.34:.05))g[y][x]='T'}
  for(const[x,y]of LAMPS)g[y][x]='.';
  VANT={tx:W-6,ty:ry};g[ry][W-6]='V';g[ry][W-5]='V';
  const ph=[[cx+3,ry-2],[cx-2,ry-2],[cx+3,ry+3],[cx-2,ry+3]].find(([x,y])=>g[y][x]==='.'||g[y][x]==='T');if(!ph)return false;
  g[ph[1]][ph[0]]='B';for(const[a,b]of DIRS)if(g[ph[1]+b][ph[0]+a]==='T')g[ph[1]+b][ph[0]+a]='.';
  g[ry+1][3]='P';
  // robber starts far from the survivor
  let best=null,bd=-1;for(let t=0;t<400;t++){const x=3+(rnd()*(W-6)|0),y=3+(rnd()*(H-6)|0);if(g[y][x]!=='.')continue;const d=Math.hypot(x-3,y-ry);if(d>bd){bd=d;best=[x,y]}}
  if(!best)return false;g[best[1]][best[0]]='K';
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(g[y][x]==='Z')g[y][x]='.';
  // cover & high ground: stepped container towers, waist-high barricades, cargo crates, rock outcrops
  COVER=[];{const want={small:[1,1,2,1,2,10,6,2],medium:[2,1,3,2,3,16,10,4],large:[3,1,4,3,5,24,16,6]}[size],kinds=['hq','ship','bunker','gantry','tower','wall','crate','rock'],fp={hq:[4,3],ship:[6,3],bunker:[3,2],gantry:[7,1],tower:[3,1],wall:[1,1],crate:[1,1],rock:[2,2],cont:[3,1]};
   const okAt=(x0,y0,w,h)=>{for(let y=y0-2;y<y0+h+2;y++)for(let x=x0-2;x<x0+w+2;x++){const c=(g[y]||[])[x];if(c===undefined)return false;const inside=x>=x0&&x<x0+w&&y>=y0&&y<y0+h,ring1=x>=x0-1&&x<x0+w+1&&y>=y0-1&&y<y0+h+1;
       if(inside&&c!=='.')return false;if(ring1&&!'.T'.includes(c))return false;if('#dwDLf'.includes(c))return false}return true};
   // each district first gets its own set, packed tight
   const DK={yard:[['tower',2],['cont',7],['crate',8],['wall',2]],pad:[['ship',1],['hq',1],['crate',3],['wall',3]],pit:[['gantry',1],['rock',5],['crate',3]],post:[['bunker',2],['tower',1],['crate',3]]},placed={};
   // the defence post gets a barricade line across its middle with a gap every few metres
   for(const d of DIST)if(d.k==='post'){const my=(d.y0+d.y1)>>1;for(let x=d.x0+1;x<d.x1-1;x++){if((x-d.x0)%4===3||g[my][x]!=='.'||g[my-1][x]!=='.'||g[my+1][x]!=='.')continue;g[my][x]='B';COVER.push({k:'wall',x,y:my,w:1,h:1,rot:false,flip:false,v:rnd(),dist:'post'})}}
   for(const d of DIST)for(const[k,cnt]of DK[d.k])for(let i=0;i<cnt;i++)for(let t=0;t<250;t++){const rot=rnd()<.5,w=rot?fp[k][1]:fp[k][0],h=rot?fp[k][0]:fp[k][1];if(d.x1-d.x0<w||d.y1-d.y0<h)break;
       const x=d.x0+(rnd()*(d.x1-d.x0-w+1)|0),y=d.y0+(rnd()*(d.y1-d.y0-h+1)|0);if(!okAt(x,y,w,h))continue;
       for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)g[yy][xx]='B';COVER.push({k,x,y,w,h,rot,flip:rnd()<.5,v:rnd(),dist:d.k});placed[k]=(placed[k]||0)+1;break}
   kinds.forEach((k,ki)=>{let n=Math.floor((placed[k]||0)*.6);for(let t=0;t<600&&n<want[ki];t++){const rot=rnd()<.5,w=rot?fp[k][1]:fp[k][0],h=rot?fp[k][0]:fp[k][1],x=4+(rnd()*(W-8-w)|0),y=4+(rnd()*(H-8-h)|0);
       if(!okAt(x,y,w,h))continue;for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)g[yy][xx]='B';if(w*h>3)for(let yy=y-1;yy<=y+h;yy++)for(let xx=x-1;xx<=x+w;xx++)if(g[yy][xx]==='T')g[yy][xx]='.';COVER.push({k,x,y,w,h,rot,flip:rnd()<.5,v:rnd()});n++}})}
  const seen=new Set([3+','+(ry+1)]),q=[[3,ry+1]];
  while(q.length){const[x,y]=q.shift();for(const[a,b]of DIRS){const nx=x+a,ny=y+b,c=(g[ny]||[])[nx];
    if(c&&!'#TVABw'.includes(c)&&!seen.has(nx+','+ny)){seen.add(nx+','+ny);q.push([nx,ny])}}}
  if(!seen.has(best[0]+','+best[1]))return false;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(g[y][x]==='.'&&!seen.has(x+','+y))g[y][x]='T';
  META={ry,cx,lr,vx,police:{x:6,y:ry+1}};
  BASE=g.map(r=>r.join(''));return true;
}
function buildHeights(seed){const r=mulberry(seed+3);const a=r()*6,b=r()*6,c=r()*6,d=r()*6;
  HGW=W*T+2*HOFF+1;HGH=H*T+2*HOFF+1;HG=new Float32Array(HGW*HGH);
  const base=(x,z)=>2.0*Math.sin(x*.035+a)*Math.cos(z*.04+b)+1.2*Math.sin((x+z)*.05+c)+.7*Math.cos((x-z)*.08+d);
  const hills=[];
  for(let t=0;t<600&&hills.length<CFG.hills;t++){const tx=3+(r()*(W-6)|0),ty=3+(r()*(H-6)|0);let ok=true;
    for(let y=ty-4;y<=ty+4&&ok;y++)for(let x=tx-4;x<=tx+4;x++){const ch=(BASE[y]||'')[x];if(ch&&!'.T'.includes(ch)){ok=false;break}}
    if(ok&&hills.every(h=>Math.hypot(h.x-tx*T,h.z-ty*T)>14))hills.push({x:tx*T+T/2,z:ty*T+T/2,amp:3+r()*3.5,sig:5.5+r()*4.5})}
  for(const d of DIST)if(d.k==='pit'){const w=(d.x1-d.x0)*T,h=(d.y1-d.y0)*T;hills.push({x:(d.x0+d.x1)/2*T,z:(d.y0+d.y1)/2*T,amp:-3.4,sig:Math.min(w,h)*.3})}
  for(let j=0;j<HGH;j++)for(let i=0;i<HGW;i++){const x=i-HOFF,z=j-HOFF;let v=base(x,z);
    for(const h of hills){const dd=(x-h.x)**2+(z-h.z)**2;v+=h.amp*Math.exp(-dd/(2*h.sig*h.sig))}
    v+=Math.max(0,4-x,x-(W*T-4),4-z,z-(H*T-4))*.35;HG[j*HGW+i]=v}
  for(const h of HOUSES){const x0=(h.x+.5)*T-SL-.8,x1=(h.x+h.w-.5)*T+SL+.8,z0=(h.y+.5)*T-SL-.8,z1=(h.y+h.h-.5)*T+SL+.8;h.pad=base((x0+x1)/2,(z0+z1)/2);
    for(let j=Math.max(0,Math.floor(z0-11+HOFF));j<=Math.min(HGH-1,Math.ceil(z1+11+HOFF));j++)for(let i=Math.max(0,Math.floor(x0-11+HOFF));i<=Math.min(HGW-1,Math.ceil(x1+11+HOFF));i++){
      const x=i-HOFF,z=j-HOFF,dd=Math.hypot(Math.max(x0-x,0,x-x1),Math.max(z0-z,0,z-z1));const w=Math.min(1,Math.max(0,(dd-1)/9)),sm=w*w*(3-2*w);
      HG[j*HGW+i]=h.pad*(1-sm)+HG[j*HGW+i]*sm}}
  for(const d of DIST){if(d.k==='pit')continue;const x0=d.x0*T,x1=d.x1*T,z0=d.y0*T,z1=d.y1*T;d.pad=HG[Math.round((z0+z1)/2+HOFF)*HGW+Math.round((x0+x1)/2+HOFF)];
    for(let j=Math.max(0,Math.floor(z0-8+HOFF));j<=Math.min(HGH-1,Math.ceil(z1+8+HOFF));j++)for(let i=Math.max(0,Math.floor(x0-8+HOFF));i<=Math.min(HGW-1,Math.ceil(x1+8+HOFF));i++){
      const x=i-HOFF,z=j-HOFF,dd=Math.hypot(Math.max(x0-x,0,x-x1),Math.max(z0-z,0,z-z1));const w=Math.min(1,dd/8),sm=w*w*(3-2*w);HG[j*HGW+i]=d.pad*(1-sm)+HG[j*HGW+i]*sm}}
  // level the ground under the larger cover structures so floors, doors and steps sit flush
  for(const c of COVER){if(c.k==='wall'||c.k==='crate'||c.k==='rock')continue;const x0=c.x*T-.6,x1=(c.x+c.w)*T+.6,z0=c.y*T-.6,z1=(c.y+c.h)*T+.6;const ci=Math.round((x0+x1)/2+HOFF),cj=Math.round((z0+z1)/2+HOFF),pad=HG[cj*HGW+ci];
    for(let j=Math.max(0,Math.floor(z0-7+HOFF));j<=Math.min(HGH-1,Math.ceil(z1+7+HOFF));j++)for(let i=Math.max(0,Math.floor(x0-7+HOFF));i<=Math.min(HGW-1,Math.ceil(x1+7+HOFF));i++){
      const x=i-HOFF,z=j-HOFF,dd=Math.hypot(Math.max(x0-x,0,x-x1),Math.max(z0-z,0,z-z1));const w=Math.min(1,dd/6),sm=w*w*(3-2*w);HG[j*HGW+i]=pad*(1-sm)+HG[j*HGW+i]*sm}c.pad=pad}
  // final pass: later levelling (other houses, districts, structures) used to bend the ground under earlier houses,
  // so floors ended up buried or floating. Re-level every footprint exactly, houses last, then structures inside their own footprint.
  const level=(x0,x1,z0,z1,pad,flat,blend)=>{for(let j=Math.max(0,Math.floor(z0-flat-blend+HOFF));j<=Math.min(HGH-1,Math.ceil(z1+flat+blend+HOFF));j++)for(let i=Math.max(0,Math.floor(x0-flat-blend+HOFF));i<=Math.min(HGW-1,Math.ceil(x1+flat+blend+HOFF));i++){
      const x=i-HOFF,z=j-HOFF,dd=Math.hypot(Math.max(x0-x,0,x-x1),Math.max(z0-z,0,z-z1));if(dd<=flat){HG[j*HGW+i]=pad;continue}if(!blend)continue;const w=Math.min(1,(dd-flat)/blend),sm=w*w*(3-2*w);HG[j*HGW+i]=pad*(1-sm)+HG[j*HGW+i]*sm}};
  const avg=(x0,x1,z0,z1)=>{let s=0,n=0;for(let z=Math.ceil(z0);z<=z1;z++)for(let x=Math.ceil(x0);x<=x1;x++){s+=HG[Math.round(z+HOFF)*HGW+Math.round(x+HOFF)];n++}return n?s/n:0};
  for(const d of DIST)if(d.k!=='pit'){level(d.x0*T,d.x1*T,d.y0*T,d.y1*T,d.pad,.6,0)}
  for(const h of HOUSES){const x0=h.x*T,x1=(h.x+h.w)*T,z0=h.y*T,z1=(h.y+h.h)*T;h.pad=avg(x0,x1,z0,z1);level(x0,x1,z0,z1,h.pad,1.6,3.5)}
  for(const c of COVER){if(c.pad===undefined)continue;level(c.x*T,(c.x+c.w)*T,c.y*T,(c.y+c.h)*T,c.pad,.6,0)}}
function heightAt(x,z){const fx=Math.max(0,Math.min(HGW-1.001,x+HOFF)),fz=Math.max(0,Math.min(HGH-1.001,z+HOFF)),i=fx|0,j=fz|0,u=fx-i,v=fz-j;
  return HG[j*HGW+i]*(1-u)*(1-v)+HG[j*HGW+i+1]*u*(1-v)+HG[(j+1)*HGW+i]*(1-u)*v+HG[(j+1)*HGW+i+1]*u*v}
// height of the rendered terrain mesh (2 m grid, triangulated like PlaneGeometry) - used for bullets so grazing shots match what is drawn
function meshY(x,z){const gx=(x+HOFF)/2,gz=(z+HOFF)/2,i=Math.floor(gx),j=Math.floor(gz),u=gx-i,v=gz-j,X=i*2-HOFF,Z=j*2-HOFF;
  const h00=heightAt(X,Z),h10=heightAt(X+2,Z),h01=heightAt(X,Z+2),h11=heightAt(X+2,Z+2);return u+v<=1?h00+(h10-h00)*u+(h01-h00)*v:h11+(h01-h11)*(1-u)+(h10-h11)*(1-v)}
function groundY(x,z){return heightAt(x,z)+(insideHouse(x,z)?.1:0)}
genMap('medium');

// ================= collision: thin walls along tile center lines + object colliders =================
function tile(tx,ty){if(tx<0||ty<0||tx>=W||ty>=H)return'#';return grid[ty][tx]}
const TX=v=>Math.floor(v/T);
const wl=(tx,ty)=>'#wd'.includes(tile(tx,ty));
function doorOpen(tx,ty){const d=doors.get(kk(tx,ty));return!!d&&(d.open||d.broken)}
function slab(x,z,tx,ty,gap){const dx=x-(tx*T+T/2),dz=z-(ty*T+T/2),ax=Math.abs(dx),az=Math.abs(dz);
  const E=wl(tx+1,ty),Wt=wl(tx-1,ty),So=wl(tx,ty+1),N=wl(tx,ty-1);
  if(gap){if(E||Wt)return az<SL&&ax>gap;return ax<SL&&az>gap}
  if(ax<SL&&az<SL)return true;
  if(az<SL&&((dx>0&&E)||(dx<0&&Wt)))return true;
  if(ax<SL&&((dz>0&&So)||(dz<0&&N)))return true;
  return false}
let ROB=false,SOLIDSOFT=true;
let FEET=null;const STEP=.55;
function colHit(x,z,tx,ty){const l=cols.get(kk(tx,ty));if(!l)return false;
  for(const o of l){if(o.top!==undefined&&FEET!==null&&FEET>=o.top-STEP)continue;if(o.h!==undefined&&FEET!==null&&FEET>=o.h-.05)continue;if(o.soft&&ROB&&!SOLIDSOFT)continue;if(o.bot!==undefined&&(FEET!==null?FEET:heightAt(x,z))+1.75<=o.bot)continue;if(o.r){if(Math.hypot(x-o.x,z-o.z)<o.r)return true}else if(x>o.x0&&x<o.x1&&z>o.z0&&z<o.z1)return true}return false}
function solidAt(x,z){const tx=TX(x),ty=TX(z);if(tx<2||ty<2||tx>=W-2||ty>=H-2)return true;const c=grid[ty][tx];
  // standing on a roof terrace you walk over the wall tops
  if((c==='#'||c==='w'||c==='d')&&FEET!=null){const hh=HOUSES.find(h=>tx>=h.x&&tx<h.x+h.w&&ty>=h.y&&ty<h.y+h.h);if(hh&&FEET>=hh.pad+WALLH-.05)return colHit(x,z,tx,ty)}
  if(c==='#'||c==='w')return slab(x,z,tx,ty,0);
  if(c==='d')return slab(x,z,tx,ty,doorOpen(tx,ty)?DOORW/2:0)||leafHit(x,z,tx,ty);
  return colHit(x,z,tx,ty)||leafHit(x,z,tx,ty)}
// you can't walk through a swung-open door leaf either
function leafHit(x,z,tx,ty){const dl=DOORP.get(kk(tx,ty));if(!dl)return false;for(const d of dl){if(FEET!=null&&FEET>d.pad+DOORH-.3)continue;if(doorLeafAt(d,x,d.pad+1,z))return true}return false}
function sightAt(x,z){const tx=TX(x),ty=TX(z),c=tile(tx,ty);if(c==='#')return slab(x,z,tx,ty,0);if(c==='d')return slab(x,z,tx,ty,doorOpen(tx,ty)?DOORW/2:0);
  if(c==='w'&&slab(x,z,tx,ty,0)){const lat=wallAxisX(tx,ty)?Math.abs(x-(tx*T+T/2)):Math.abs(z-(ty*T+T/2));return lat>WIN.ow/2}return false}
function free(x,z,r){for(const a of[-r,0,r])for(const b of[-r,0,r])if(solidAt(x+a,z+b))return false;return true}
function move(o,dx,dz){ROB=o===K||!!o.sv;FEET=o.feet===undefined?null:o.feet;const stuck=!free(o.x,o.z,o.r);
  const ox=o.x,oz=o.z;if(stuck||free(o.x+dx,o.z,o.r))o.x+=dx;if(stuck||free(o.x,o.z+dz,o.r))o.z+=dz;
  // corner assist: blocked by a door frame / wall corner -> drift sideways toward the nearby opening
  const L=Math.hypot(dx,dz);if(!stuck&&L>1e-4&&Math.hypot(o.x-ox,o.z-oz)<L*.5){const fx=dx/L,fz=dz/L,px=-fz,pz=fx,ah=o.r+.15;
    outer:for(const off of[.1,.2,.3,.42,.55])for(const sg of[1,-1]){const lx=ox+px*off*sg,lz=oz+pz*off*sg;
      if(free(lx,lz,o.r)&&free(lx+fx*ah,lz+fz*ah,o.r)){const st=Math.min(off,L*1.2);const nx=ox+px*sg*st+fx*L*.25,nz=oz+pz*sg*st+fz*L*.25;
        if(free(nx,nz,o.r)){o.x=nx;o.z=nz}else if(free(ox+px*sg*st,oz+pz*sg*st,o.r)){o.x=ox+px*sg*st;o.z=oz+pz*sg*st}break outer}}}
  ROB=false;FEET=null}
// highest climbable surface (car roof, hood...) under a point that is not above maxY
function platformTop(x,z,maxY,r=.25){let t=-1e9;const seen=new Set();for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const l=cols.get(kk(TX(x)+dx,TX(z)+dy));if(!l)continue;
  for(const o of l){if(o.top===undefined||o.r||seen.has(o))continue;seen.add(o);if(x>o.x0-r&&x<o.x1+r&&z>o.z0-r&&z<o.z1+r&&o.top<=maxY&&o.top>t)t=o.top}}return t}
function reach(ax,az,bx,bz){const d=Math.hypot(bx-ax,bz-az),n=Math.ceil(d/.1);ROB=true;for(let i=1;i<n;i++){const t=i/n,x=ax+(bx-ax)*t,z=az+(bz-az)*t,c=tile(TX(x),TX(z));if(c==='w'&&slab(x,z,TX(x),TX(z),0)){ROB=false;return false}if(solidAt(x,z)&&!colHit(x,z,TX(x),TX(z))){ROB=false;return false}}ROB=false;return true}
function slopeMul(o,dx,dz){const d=Math.hypot(dx,dz);if(d<1e-5)return 1;const g=(heightAt(o.x+dx/d*.5,o.z+dz/d*.5)-heightAt(o.x,o.z))/.5;return g>0?1-Math.min(1,g)*.35:1+Math.min(.1,-g*.2)}
function los(ax,az,bx,bz,ay=heightAt(ax,az)+1.5,by=heightAt(bx,bz)+1.5){const d=Math.hypot(bx-ax,bz-az),n=Math.ceil(d/.2);
  for(let i=1;i<n;i++){const t=i/n,x=ax+(bx-ax)*t,z=az+(bz-az)*t;if(sightAt(x,z))return false;if(i%3===0&&heightAt(x,z)>ay+(by-ay)*t-.2)return false}return true}
function ctr(t){return{x:t.x*T+T/2,z:t.y*T+T/2}}
function robberPass(tx,ty){return!'#TVABw'.includes(tile(tx,ty))}
function robberCalm(tx,ty){return tile(tx,ty)!=='w'&&robberPass(tx,ty)}
function bfs(sx,sy,gx,gy,pass){if(!(sx>=0&&sy>=0&&gx>=0&&gy>=0&&sx<W&&sy<H&&gx<W&&gy<H))return[];
  const prev=new Int32Array(W*H).fill(-1),q=[sy*W+sx];prev[sy*W+sx]=sy*W+sx;let h=0;
  while(h<q.length){const c=q[h++];if(c===gy*W+gx)break;const x=c%W,y=(c/W)|0;
    for(const[dx,dy]of DIRS){const nx=x+dx,ny=y+dy,n=ny*W+nx;if(nx<0||ny<0||nx>=W||ny>=H)continue;if(prev[n]===-1&&pass(nx,ny)){prev[n]=c;q.push(n)}}}
  if(prev[gy*W+gx]===-1)return[];const path=[];let c=gy*W+gx;let guard=W*H;while(c!==sy*W+sx&&guard-->0){path.unshift({x:c%W,y:(c/W)|0});c=prev[c]}return guard>0?path:[];
}
// the tile the robber should aim for to reach a point (players can stand in wall strips)
function navTile(x,z){const t={x:TX(x),y:TX(z)};if(robberPass(t.x,t.y)&&!'dw'.includes(tile(t.x,t.y)))return t;
  let best=t,bd=1e9;for(const[a,b]of DIRS){const n={x:t.x+a,y:t.y+b};if(!robberPass(n.x,n.y)||'dw'.includes(tile(n.x,n.y)))continue;const c=ctr(n),d=Math.hypot(c.x-x,c.z-z);if(d<bd){bd=d;best=n}}return best}
function houseAt(tx,ty){return HOUSES.find(h=>tx>h.x&&tx<h.x+h.w-1&&ty>h.y&&ty<h.y+h.h-1)}
function insideHouse(x,z){return HOUSES.find(h=>x>(h.x+.5)*T&&x<(h.x+h.w-.5)*T&&z>(h.y+.5)*T&&z<(h.y+h.h-.5)*T)}
function addCol(o){const x0=o.r?o.x-o.r:o.x0,x1=o.r?o.x+o.r:o.x1,z0=o.r?o.z-o.r:o.z0,z1=o.r?o.z+o.r:o.z1;
  for(let ty=TX(z0);ty<=TX(z1);ty++)for(let tx=TX(x0);tx<=TX(x1);tx++){const k=kk(tx,ty);if(!cols.has(k))cols.set(k,[]);cols.get(k).push(o)}}
const boxCol=(cx,cz,hx,hz,h)=>addCol({x0:cx-hx,x1:cx+hx,z0:cz-hz,z1:cz+hz,h});

// ================= renderer, textures, materials =================
const cv=$('cv');
// gamma-2 approximation of the sRGB curve: same look, far cheaper per texture sample on phones
{const ch=THREE.ShaderChunk,f=ch.encodings_pars_fragment,a=f.indexOf('vec4 sRGBToLinear('),b=f.indexOf('}',a),c=f.indexOf('vec4 LinearTosRGB('),d=f.indexOf('}',c);
  if(a>=0&&c>=0)ch.encodings_pars_fragment=f.slice(0,a)+'vec4 sRGBToLinear( in vec4 value ) { return vec4( value.rgb * value.rgb, value.a ); }'+f.slice(b+1,c)+'vec4 LinearTosRGB( in vec4 value ) { return vec4( sqrt( max( value.rgb, 0.0 ) ), value.a ); }'+f.slice(d+1)}
const R=new THREE.WebGLRenderer({canvas:cv,antialias:true});
function spotShadow(l){l.castShadow=true;l.shadow.mapSize.set(512,512);l.shadow.camera.near=.2;l.shadow.camera.far=24;l.shadow.bias=-.0015;if('normalBias'in l.shadow)l.shadow.normalBias=.03}
R.setPixelRatio(Math.min(devicePixelRatio||1,1.5));R.outputEncoding=THREE.sRGBEncoding;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.1;
const ANISO=Math.min(4,R.capabilities.getMaxAnisotropy());
const scene=new THREE.Scene();scene.background=new THREE.Color(0x141a2c);scene.fog=new THREE.FogExp2(0x1e2638,.0115);
const cam=new THREE.PerspectiveCamera(72,1,.05,90);cam.rotation.order='YXZ';scene.add(cam);
scene.add(new THREE.HemisphereLight(0x8fb4d8,0x3a2a36,1.2));
const sun=new THREE.DirectionalLight(0xd8e6ff,1.5);sun.position.set(-60,34,-30);scene.add(sun);
// space sky: equirectangular canvas (stars, nebula, horizon haze, ringed gas giant, small moon) on a dome that follows the camera
const sky=(()=>{const Wd=2048,Hd=1024,c=document.createElement('canvas');c.width=Wd;c.height=Hd;const g=c.getContext('2d'),r=mulberry(4242);
  const gr=g.createLinearGradient(0,0,0,Hd);gr.addColorStop(0,'#03040a');gr.addColorStop(.35,'#070b1a');gr.addColorStop(.47,'#16243a');gr.addColorStop(.5,'#2a4a5a');gr.addColorStop(.53,'#1a2230');gr.addColorStop(1,'#0a0c12');g.fillStyle=gr;g.fillRect(0,0,Wd,Hd);
  // nebula: soft additive blobs along a band
  g.globalCompositeOperation='lighter';for(let i=0;i<70;i++){const x=r()*Wd,y=Hd*(.12+.25*Math.sin(x/Wd*Math.PI*2+1)*.5+.18*r()),rr=60+r()*180,col=r()<.5?'90,60,160':r()<.5?'40,120,170':'170,60,120';
    const rg=g.createRadialGradient(x,y,0,x,y,rr);rg.addColorStop(0,`rgba(${col},${.05+r()*.06})`);rg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=rg;g.fillRect(x-rr,y-rr,rr*2,rr*2)}
  // stars (denser in the nebula band), a few bright ones with glow
  for(let i=0;i<5200;i++){const x=r()*Wd,y=r()*Hd*.5,b=r(),a=.25+b*.75;g.fillStyle=`rgba(${200+r()*55|0},${210+r()*45|0},255,${a})`;g.fillRect(x,y,b>.97?2:1,b>.97?2:1)}
  for(let i=0;i<40;i++){const x=r()*Wd,y=r()*Hd*.45,rg=g.createRadialGradient(x,y,0,x,y,8);rg.addColorStop(0,'rgba(220,235,255,.9)');rg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=rg;g.fillRect(x-8,y-8,16,16)}
  g.globalCompositeOperation='source-over';
  // ringed gas giant
  {const px=Wd*.62,py=Hd*.24,pr=150;g.save();g.translate(px,py);g.rotate(-.35);g.strokeStyle='rgba(200,180,150,.25)';for(let k=0;k<26;k++){g.lineWidth=2+r()*3;g.beginPath();g.ellipse(0,0,pr*1.9+k*4,pr*.42+k*.9,0,Math.PI,Math.PI*2);g.stroke()}
    const pg=g.createLinearGradient(-pr,-pr,pr,pr);pg.addColorStop(0,'#e8c89a');pg.addColorStop(.5,'#b4785a');pg.addColorStop(1,'#3a2230');g.fillStyle=pg;g.beginPath();g.arc(0,0,pr,0,7);g.fill();
    g.save();g.beginPath();g.arc(0,0,pr,0,7);g.clip();for(let k=0;k<14;k++){g.fillStyle=`rgba(${120+r()*90|0},${70+r()*50|0},${50+r()*40|0},.35)`;g.fillRect(-pr,-pr+k*pr/7+r()*8,pr*2,6+r()*14)}
      const sh=g.createRadialGradient(-pr*.45,-pr*.4,pr*.2,0,0,pr*1.05);sh.addColorStop(0,'rgba(0,0,0,0)');sh.addColorStop(.75,'rgba(0,0,0,.35)');sh.addColorStop(1,'rgba(0,0,10,.85)');g.fillStyle=sh;g.fillRect(-pr,-pr,pr*2,pr*2);g.restore();
    g.strokeStyle='rgba(220,200,170,.4)';for(let k=0;k<26;k++){g.lineWidth=2+r()*3;g.beginPath();g.ellipse(0,0,pr*1.9+k*4,pr*.42+k*.9,0,0,Math.PI);g.stroke()}g.restore()}
  // small moon
  {const mx=Wd*.18,my=Hd*.3,mr=34;const mg=g.createRadialGradient(mx-10,my-10,4,mx,my,mr);mg.addColorStop(0,'#cfd6e0');mg.addColorStop(1,'#4a5260');g.fillStyle=mg;g.beginPath();g.arc(mx,my,mr,0,7);g.fill()}
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;
  const m=new THREE.Mesh(new THREE.SphereGeometry(85,48,24),new THREE.MeshBasicMaterial({map:t,side:THREE.BackSide,fog:false,depthWrite:false}));m.renderOrder=-1;m.frustumCulled=false;scene.add(m);
  m.onBeforeRender=(rr,sc,camera)=>{m.position.copy(camera.position);m.scale.setScalar(Math.min(1,camera.far*.88/85))};return m})();
sky.material.toneMapped=false;
const sunDisc=new THREE.Mesh(new THREE.CircleGeometry(1.6,24),new THREE.MeshBasicMaterial({color:0xeef4ff,fog:false}));sunDisc.material.toneMapped=false;sunDisc.visible=false;scene.add(sunDisc);


const RND=Math.random;
function canvasTex(draw,size=256,rx=1,ry=rx){const c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d');draw(g,size);
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);t.anisotropy=ANISO;return t}
function speck(g,s,n,col,a){for(let i=0;i<n;i++){g.fillStyle=`rgba(${col},${RND()*a})`;g.fillRect(RND()*s,RND()*s,1+RND()*2,1+RND()*2)}}
const TX_={
  floor:canvasTex((g,s)=>{const n=8,ph=s/n;for(let i=0;i<n;i++){let x=-RND()*s;while(x<s){const len=s*(.4+RND()*.5),v=RND()*30|0;g.fillStyle=`rgb(${92+v},${64+v*.7|0},${40+v*.5|0})`;g.fillRect(x,i*ph,len,ph);
      g.strokeStyle='rgba(40,25,12,.35)';for(let k=0;k<5;k++){g.beginPath();const yy=i*ph+RND()*ph;g.moveTo(x,yy);g.bezierCurveTo(x+len*.3,yy+(RND()-.5)*6,x+len*.6,yy+(RND()-.5)*6,x+len,yy);g.stroke()}
      g.fillStyle='rgba(20,12,6,.7)';g.fillRect(x,i*ph,2,ph);x+=len}g.fillStyle='rgba(20,12,6,.6)';g.fillRect(0,i*ph,s,2)}speck(g,s,2000,'0,0,0',.2)}),
  siding:canvasTex((g,s)=>{// prefab metal wall panels: vertical sheets with seams, rivets, grime streaks
    g.fillStyle='#d8dcdc';g.fillRect(0,0,s,s);const n=4,pw=s/n;for(let i=0;i<n;i++){const v=(RND()*18|0)-9;g.fillStyle=`rgb(${208+v},${212+v},${212+v})`;g.fillRect(i*pw+2,0,pw-4,s);
      g.fillStyle='rgba(0,0,0,.35)';g.fillRect(i*pw,0,2,s);g.fillStyle='rgba(255,255,255,.35)';g.fillRect(i*pw+2,0,1,s);
      for(let y=8;y<s;y+=s/6){g.fillStyle='rgba(0,0,0,.4)';g.beginPath();g.arc(i*pw+6,y,1.6,0,7);g.arc(i*pw+pw-6,y,1.6,0,7);g.fill()}
      g.fillStyle='rgba(0,0,0,.06)';g.fillRect(i*pw+pw*.3,0,pw*.08,s)}
    g.fillStyle='rgba(0,0,0,.28)';g.fillRect(0,s/2-1,s,2);for(let i=0;i<30;i++){g.fillStyle=`rgba(60,50,40,${RND()*.12})`;g.fillRect(RND()*s,RND()*s*.3+s*.55,1+RND()*2,s*.2+RND()*s*.3)}speck(g,s,1500,'0,0,0',.08)}),
  shingle:canvasTex((g,s)=>{// corrugated metal roof sheets
    for(let x=0;x<s;x++){const v=Math.sin(x/s*Math.PI*2*16);const c=150+v*45|0;g.fillStyle=`rgb(${c},${c},${c})`;g.fillRect(x,0,1,s)}
    g.fillStyle='rgba(0,0,0,.35)';for(let y=0;y<s;y+=s/3)g.fillRect(0,y,s,2);for(let i=0;i<40;i++){g.fillStyle=`rgba(90,60,30,${RND()*.15})`;g.fillRect(RND()*s,RND()*s,RND()*20,2+RND()*30)}speck(g,s,1200,'0,0,0',.1)}),
  bark:canvasTex((g,s)=>{g.fillStyle='#3a2a1e';g.fillRect(0,0,s,s);for(let i=0;i<220;i++){g.strokeStyle=`rgba(${RND()<.5?'15,10,6':'90,70,50'},${.3+RND()*.4})`;g.lineWidth=1+RND()*3;const x=RND()*s;g.beginPath();g.moveTo(x,0);g.bezierCurveTo(x+(RND()-.5)*10,s*.3,x+(RND()-.5)*10,s*.7,x+(RND()-.5)*8,s);g.stroke()}},128),
  door:canvasTex((g,s)=>{g.fillStyle='#e6e0d4';g.fillRect(0,0,s,s);speck(g,s,2500,'90,80,60',.15);
    const pan=(x,y,w,h)=>{g.fillStyle='rgba(0,0,0,.18)';g.fillRect(x,y,w,h);g.fillStyle='rgba(255,255,255,.25)';g.fillRect(x+4,y+4,w-8,h-8);g.fillStyle='rgba(0,0,0,.12)';g.fillRect(x+8,y+8,w-16,h-16)};
    pan(s*.12,s*.06,s*.32,s*.38);pan(s*.56,s*.06,s*.32,s*.38);pan(s*.12,s*.52,s*.32,s*.42);pan(s*.56,s*.52,s*.32,s*.42)}),
  wood:canvasTex((g,s)=>{g.fillStyle='#7b5638';g.fillRect(0,0,s,s);for(let i=0;i<120;i++){g.strokeStyle=`rgba(${RND()<.5?'40,24,12':'150,110,75'},${.15+RND()*.25})`;g.lineWidth=1+RND()*2;const y=RND()*s;g.beginPath();g.moveTo(0,y);g.bezierCurveTo(s*.3,y+(RND()-.5)*14,s*.6,y+(RND()-.5)*14,s,y+(RND()-.5)*6);g.stroke()}},128),
  concrete:canvasTex((g,s)=>{g.fillStyle='#8a8a86';g.fillRect(0,0,s,s);speck(g,s,5000,'0,0,0',.25);speck(g,s,2000,'255,255,255',.12)},128),
  jerry:canvasTex((g,s)=>{g.fillStyle='#b8261b';g.fillRect(0,0,s,s);g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=10;g.beginPath();g.moveTo(s*.15,s*.15);g.lineTo(s*.85,s*.85);g.moveTo(s*.85,s*.15);g.lineTo(s*.15,s*.85);g.stroke();
    g.strokeStyle='rgba(255,255,255,.18)';g.lineWidth=3;g.beginPath();g.moveTo(s*.15,s*.12);g.lineTo(s*.85,s*.82);g.moveTo(s*.85,s*.12);g.lineTo(s*.15,s*.82);g.stroke();speck(g,s,1500,'0,0,0',.25)},128),
};
const signTex=(()=>{const c=document.createElement('canvas');c.width=256;c.height=64;const g=c.getContext('2d');g.fillStyle='#f2f2ea';g.fillRect(0,0,256,64);g.fillStyle='#1d6b3a';g.font='bold 40px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('公衆電話',128,34);return new THREE.CanvasTexture(c)})();

// ================= outdoor realism: environment map, ground, roads, vegetation =================
// runtime dusk environment map (reflections for paint, glass, metal)
const ENV=(()=>{try{const pm=new THREE.PMREMGenerator(R),sc=new THREE.Scene(),c=document.createElement('canvas');c.width=16;c.height=128;const x=c.getContext('2d'),gr=x.createLinearGradient(0,0,0,128);
  gr.addColorStop(0,'#0a1020');gr.addColorStop(.38,'#2a3a58');gr.addColorStop(.48,'#9ac0d8');gr.addColorStop(.53,'#3a4a5a');gr.addColorStop(.62,'#2a2630');gr.addColorStop(1,'#100e12');x.fillStyle=gr;x.fillRect(0,0,16,128);
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;sc.add(new THREE.Mesh(new THREE.SphereGeometry(10,24,12),new THREE.MeshBasicMaterial({map:t,side:THREE.BackSide})));const rt=pm.fromScene(sc,.03);pm.dispose();return rt.texture}catch(e){return null}})();
const STD=(o)=>new THREE.MeshStandardMaterial(Object.assign({envMap:ENV,envMapIntensity:.6,metalness:0,roughness:.85},o));
// value noise for textures and placement
function vnoise(seed){const r=mulberry(seed),P=new Float32Array(256*256);for(let i=0;i<P.length;i++)P[i]=r();
  const at=(x,y)=>P[((y&255)<<8)|(x&255)];return(x,y)=>{const i=Math.floor(x),j=Math.floor(y),u=x-i,v=y-j,su=u*u*(3-2*u),sv=v*v*(3-2*v);
    return(at(i,j)*(1-su)+at(i+1,j)*su)*(1-sv)+(at(i,j+1)*(1-su)+at(i+1,j+1)*su)*sv}}
const NZ=vnoise(77),fbm=(x,y)=>NZ(x,y)*.55+NZ(x*2.1+5,y*2.1+3)*.28+NZ(x*4.3+9,y*4.3+1)*.17;
function texN(size,fn,rep=1){const c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d');fn(g,size);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep,rep);t.anisotropy=ANISO;return t}
// tileable noise fill: per-pixel colour from a palette driven by fbm (period = size)
function noiseFill(g,s,f,c0,c1,amp=1){const id=g.getImageData(0,0,s,s),d=id.data,k=8/s;for(let y=0;y<s;y++)for(let x=0;x<s;x++){
  const n=(fbm(x*k,y*k)*(1-x/s)*(1-y/s)+fbm((x-s)*k,y*k)*(x/s)*(1-y/s)+fbm(x*k,(y-s)*k)*(1-x/s)*(y/s)+fbm((x-s)*k,(y-s)*k)*(x/s)*(y/s));
  const t=Math.max(0,Math.min(1,(n-.5)*amp*2.2+.5)),j=(Math.random()-.5)*f,o=(y*s+x)*4;for(let q=0;q<3;q++)d[o+q]=c0[q]+(c1[q]-c0[q])*t+j;d[o+3]=255}g.putImageData(id,0,0)}
const TXE={
  grass:texN(256,(g,s)=>{// alien regolith: rust/ochre dust with fine grains and dark pebbles
    noiseFill(g,s,18,[92,58,44],[142,96,66]);for(let i=0;i<5200;i++){const v=Math.random();g.fillStyle=v<.5?`rgba(40,24,22,${Math.random()*.35})`:`rgba(220,170,120,${Math.random()*.25})`;g.fillRect(Math.random()*s,Math.random()*s,1+Math.random()*1.5,1+Math.random()*1.5)}
    for(let i=0;i<260;i++){const x=Math.random()*s,y=Math.random()*s,r=.8+Math.random()*2.4;g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(x+.7,y+.8,r,r*.7,0,0,7);g.fill();g.fillStyle=`rgb(${60+Math.random()*30|0},${42+Math.random()*20|0},${40+Math.random()*20|0})`;g.beginPath();g.ellipse(x,y,r,r*.7,Math.random()*3,0,7);g.fill()}
    g.strokeStyle='rgba(50,30,26,.25)';for(let i=0;i<40;i++){g.beginPath();const y=Math.random()*s;g.moveTo(0,y);g.bezierCurveTo(s*.3,y+(Math.random()-.5)*10,s*.6,y+(Math.random()-.5)*10,s,y);g.lineWidth=1+Math.random()*2;g.stroke()}}),
  dirt:texN(256,(g,s)=>{// dark basalt crust with cracks and violet mineral flecks
    noiseFill(g,s,22,[34,30,38],[66,58,68]);const crack=(x,y,a,n)=>{g.strokeStyle='rgba(8,6,10,.7)';g.lineWidth=1.2;g.beginPath();g.moveTo(x,y);for(let i=0;i<n;i++){x+=Math.cos(a)*(6+Math.random()*8);y+=Math.sin(a)*(6+Math.random()*8);a+=(Math.random()-.5)*1.2;g.lineTo(x,y)}g.stroke()};
    for(let i=0;i<22;i++)crack(Math.random()*s,Math.random()*s,Math.random()*6.3,8+Math.random()*10|0);for(let i=0;i<300;i++){g.fillStyle=`rgba(${150+Math.random()*80|0},${90+Math.random()*60|0},${200+Math.random()*55|0},${Math.random()*.4})`;g.fillRect(Math.random()*s,Math.random()*s,1,1)}}),
  gravel:texN(256,(g,s)=>{noiseFill(g,s,20,[60,62,68],[92,94,100]);for(let i=0;i<2200;i++){const x=Math.random()*s,y=Math.random()*s,r=1+Math.random()*2.4,v=70+Math.random()*60|0;
      g.fillStyle=`rgba(0,0,0,.35)`;g.beginPath();g.ellipse(x+.8,y+.9,r,r*.75,0,0,7);g.fill();g.fillStyle=`rgb(${v*.95|0},${v*.97|0},${v})`;g.beginPath();g.ellipse(x,y,r,r*.75,Math.random()*3,0,7);g.fill()}}),
  asphalt:texN(512,(g,s)=>{// metal deck plating: square plates, seams, bolts, tread pattern, grime
    noiseFill(g,s,26,[66,70,76],[92,96,102],.6);const n=4,pw=s/n;
    for(let j=0;j<n;j++)for(let i=0;i<n;i++){const x=i*pw,y=j*pw,v=(Math.random()*16|0)-8;g.fillStyle=`rgba(${80+v},${84+v},${90+v},.55)`;g.fillRect(x+3,y+3,pw-6,pw-6);
      g.fillStyle='rgba(10,12,14,.75)';g.fillRect(x,y,pw,2);g.fillRect(x,y,2,pw);g.fillStyle='rgba(200,210,220,.18)';g.fillRect(x+2,y+2,pw-4,1);g.fillRect(x+2,y+2,1,pw-4);
      for(const[bx,by]of[[8,8],[pw-8,8],[8,pw-8],[pw-8,pw-8]]){g.fillStyle='rgba(20,22,24,.8)';g.beginPath();g.arc(x+bx,y+by,3,0,7);g.fill();g.fillStyle='rgba(180,190,200,.35)';g.beginPath();g.arc(x+bx-.6,y+by-.6,1.5,0,7);g.fill()}
      if((i+j)%3===0){g.strokeStyle='rgba(20,22,26,.35)';g.lineWidth=2;for(let k=14;k<pw-14;k+=10){g.beginPath();g.moveTo(x+k,y+14);g.lineTo(x+k+5,y+pw-14);g.stroke()}}}
    for(let i=0;i<12000;i++){const v=Math.random()<.5?20:150;g.fillStyle=`rgba(${v},${v},${v+10},${Math.random()*.18})`;g.fillRect(Math.random()*s,Math.random()*s,1,1)}
    for(let i=0;i<6;i++){const x=Math.random()*s,y=Math.random()*s,r=18+Math.random()*40,gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(60,34,24,.35)');gr.addColorStop(1,'rgba(60,34,24,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,2*r,2*r)}}),
  paint:texN(64,(g,s)=>{g.fillStyle='#d8d4c6';g.fillRect(0,0,s,s);for(let i=0;i<700;i++){g.fillStyle=`rgba(60,60,62,${Math.random()*.6})`;g.fillRect(Math.random()*s,Math.random()*s,1+Math.random()*3,1+Math.random()*2)}}),
  rock:texN(128,(g,s)=>{noiseFill(g,s,30,[44,40,50],[96,86,98],1.2);for(let i=0;i<60;i++){g.strokeStyle='rgba(16,12,20,.45)';g.beginPath();let x=Math.random()*s,y=Math.random()*s;g.moveTo(x,y);g.lineTo(x+(Math.random()-.5)*30,y+(Math.random()-.5)*12);g.stroke()}
    for(let i=0;i<50;i++){g.fillStyle=`rgba(${120+Math.random()*60|0},${160+Math.random()*60|0},${220},.25)`;g.beginPath();g.arc(Math.random()*s,Math.random()*s,1+Math.random()*2.5,0,7);g.fill()}}),
  pole:texN(128,(g,s)=>{noiseFill(g,s,14,[64,52,40],[92,76,58]);for(let i=0;i<70;i++){g.strokeStyle=`rgba(${Math.random()<.5?'30,22,14':'120,100,80'},.35)`;g.lineWidth=1+Math.random()*2;const x=Math.random()*s;g.beginPath();g.moveTo(x,0);g.lineTo(x+(Math.random()-.5)*6,s);g.stroke()}})};
// vegetation atlas: A conifer branch card, B leaf cluster card, C bark, D needle mass, E leaf mass, F grass tuft
const VATL=(()=>{const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d'),R_=Math.random;
  const ndl=(x,y,a,l)=>{g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);g.stroke()};
  const green=(k=1)=>`rgb(${(26+R_()*30)*k|0},${(46+R_()*40)*k|0},${(24+R_()*20)*k|0})`;
  // A: spruce/fir branch along +x
  g.save();g.beginPath();g.rect(2,2,252,252);g.clip();g.lineCap='round';
  const twig=(x0,y0,a,len,w,depth)=>{let x=x0,y=y0;const n=Math.max(4,len/7|0);for(let i=0;i<n;i++){const t=i/n,nx=x+Math.cos(a)*len/n,ny=y+Math.sin(a)*len/n;g.strokeStyle='#3a2a1c';g.lineWidth=w*(1-t*.7);ndl(x,y,a,len/n);
      g.lineWidth=1.3;for(let k=0;k<5;k++){const px=x+(nx-x)*k/5,py=y+(ny-y)*k/5,nl=(8-t*3)*(depth?0.75:1);g.strokeStyle=green(.85+t*.4);ndl(px,py,a-1.0-R_()*.4,nl);g.strokeStyle=green(.85+t*.4);ndl(px,py,a+1.0+R_()*.4,nl);g.strokeStyle=green(1.1);ndl(px,py,a-.4,nl*.7)}
      if(!depth&&i%3===1&&t<.82){const sl=len*(.36*Math.sin(Math.PI*(t*.9+.08)));twig(nx,ny,a-.75,sl,w*.5,1);twig(nx,ny,a+.75,sl,w*.5,1)}x=nx;y=ny}};
  twig(4,128,0,240,4,0);g.restore();
  // B: broadleaf cluster centred at (384,128)
  g.save();g.beginPath();g.rect(258,2,252,252);g.clip();g.strokeStyle='#3a2c1e';g.lineWidth=2;for(let i=0;i<9;i++){const a=R_()*6.3;ndl(384,128,a,60+R_()*50)}
  for(let i=0;i<420;i++){const a=R_()*6.3,r=Math.pow(R_(),.6)*112,x=384+Math.cos(a)*r,y=128+Math.sin(a)*r*.92,k=.8+(1-(y-16)/224)*.5;
    g.fillStyle=`rgb(${(40+R_()*34)*k|0},${(60+R_()*44)*k|0},${(26+R_()*22)*k|0})`;g.beginPath();g.ellipse(x,y,7+R_()*5,3.6+R_()*2.4,R_()*6.3,0,7);g.fill();
    g.strokeStyle='rgba(15,20,10,.35)';g.lineWidth=.8;g.stroke()}g.restore();
  // C: bark (vertical ridges)
  g.fillStyle='#45372b';g.fillRect(0,256,128,256);for(let i=0;i<260;i++){const x=R_()*128;g.strokeStyle=R_()<.55?`rgba(20,14,10,${.4+R_()*.4})`:`rgba(120,104,88,${.25+R_()*.3})`;g.lineWidth=1+R_()*2.5;g.beginPath();g.moveTo(x,256);
    let yy=256,xx=x;while(yy<512){yy+=8+R_()*20;xx+=(R_()-.5)*4;g.lineTo(xx,yy)}g.stroke()}
  for(let i=0;i<120;i++){g.fillStyle=`rgba(${80+R_()*40|0},${90+R_()*30|0},${60},.25)`;g.fillRect(R_()*128,256+R_()*256,2+R_()*5,2+R_()*8)}
  // D: dense needles
  g.fillStyle='#1c2a1a';g.fillRect(128,256,128,256);g.lineWidth=1.3;for(let i=0;i<5200;i++){const x=128+R_()*128,y=256+R_()*256;g.strokeStyle=green(.7+R_()*.6);ndl(x,y,R_()*6.3,5+R_()*6)}
  // E: dense leaves
  g.fillStyle='#24321c';g.fillRect(256,256,128,256);for(let i=0;i<1500;i++){const x=256+R_()*128,y=256+R_()*256;g.fillStyle=`rgb(${38+R_()*36|0},${56+R_()*46|0},${24+R_()*24|0})`;g.beginPath();g.ellipse(x,y,5+R_()*4,2.6+R_()*2,R_()*6.3,0,7);g.fill()}
  // F: grass tuft (blades from bottom centre)
  g.save();g.beginPath();g.rect(386,258,124,252);g.clip();for(let i=0;i<70;i++){const bx=448+(R_()-.5)*50,a=-Math.PI/2+(R_()-.5)*1.1,l=110+R_()*130,cx=bx+Math.cos(a)*l*.5+(R_()-.5)*20,ex=bx+Math.cos(a)*l,ey=510+Math.sin(a)*l,dry=R_()<.25;
    g.fillStyle=dry?`rgb(${118+R_()*40|0},${108+R_()*30|0},${62+R_()*20|0})`:`rgb(${48+R_()*40|0},${70+R_()*50|0},${30+R_()*22|0})`;g.beginPath();g.moveTo(bx-2.4,510);g.quadraticCurveTo(cx,510-l*.5,ex,Math.max(262,ey));g.quadraticCurveTo(cx+2,510-l*.5,bx+2.4,510);g.fill()}g.restore();
  // transparent texels take their region's average colour so mipmaps don't fringe black; rows flipped to match canvas textures
  const id=g.getImageData(0,0,512,512),d=id.data,out=new Uint8Array(512*512*4);
  for(const[x0,y0,x1,y1]of[[0,0,256,256],[256,0,512,256],[384,256,512,512]]){let r=0,gg=0,b=0,n=0;for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const o=(y*512+x)*4;if(d[o+3]>128){r+=d[o];gg+=d[o+1];b+=d[o+2];n++}}
    n=Math.max(1,n);for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const o=(y*512+x)*4;if(d[o+3]<128){const a=d[o+3]/255;d[o]=d[o]*a+r/n*(1-a);d[o+1]=d[o+1]*a+gg/n*(1-a);d[o+2]=d[o+2]*a+b/n*(1-a)}}}
  for(let y=0;y<512;y++)out.set(d.subarray((511-y)*2048,(512-y)*2048),y*2048);
  const t=new THREE.DataTexture(out,512,512,THREE.RGBAFormat);t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.anisotropy=ANISO;t.needsUpdate=true;return t})();
// foliage material: alpha-tested cards whose normals point out of the crown (lit the same from both sides)
const FOL=new THREE.MeshLambertMaterial({map:VATL,alphaTest:.5,side:THREE.DoubleSide});
FOL.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.split('gl_FrontFacing').join('true')};
// far trees: the same atlas regions are opaque, so no alpha test (keeps early depth rejection)
const FOLO=new THREE.MeshLambertMaterial({map:VATL});
// geometry accumulator: non-indexed triangles with custom normals and atlas uvs
function GA(){const P=[],N=[],U=[];return{P,N,U,
  tri(a,b,c,na,nb,nc,ua,ub,uc){P.push(...a,...b,...c);N.push(...na,...nb,...nc);U.push(...ua,...ub,...uc)},
  quad(a,b,c,d,n,ua,ub,uc,ud){this.tri(a,b,c,n(a),n(b),n(c),ua,ub,uc);this.tri(a,c,d,n(a),n(c),n(d),ua,uc,ud)},
  geo(g,rect,mx,nrm){const q=(g.index?g.toNonIndexed():g).clone();if(mx)q.applyMatrix4(mx);const p=q.attributes.position,nn=q.attributes.normal,uv=q.attributes.uv;
    for(let i=0;i<p.count;i++){P.push(p.getX(i),p.getY(i),p.getZ(i));const v=nrm?nrm([p.getX(i),p.getY(i),p.getZ(i)]):[nn.getX(i),nn.getY(i),nn.getZ(i)];N.push(...v);
      U.push(rect[0]+(rect[2]-rect[0])*(uv?uv.getX(i):0),rect[1]+(rect[3]-rect[1])*(uv?uv.getY(i):0))}},
  build(){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));g.computeBoundingSphere();return g}}}
const UVA=[.004,.504,.496,.996],UVB=[.504,.504,.996,.996],UVC=[.004,.004,.246,.496],UVD=[.254,.004,.496,.496],UVE=[.504,.004,.746,.496],UVF=[.754,.004,.996,.496];
const nrmz=v=>{const l=Math.hypot(...v)||1;return[v[0]/l,v[1]/l,v[2]/l]};
function coniferGeo(hi,seed=3){const a=GA(),r=mulberry(seed);
  a.geo(new THREE.CylinderGeometry(hi?.05:.12,.21,hi?6.2:1.2,hi?7:4,1,true),UVC,MX(0,hi?3.1:.6,0));
  if(!hi){for(let i=0;i<7;i++){const t=i/6,R=Math.pow(1-t,.8)*1.75+.32,h=1.35+R*.3,y=1.15+t*4.75;a.geo(new THREE.ConeGeometry(R,h,9,1,true),UVD,MX(0,y+h/2,0))}a.geo(new THREE.ConeGeometry(.3,1.1,7,1,true),UVD,MX(0,7.05,0));return a.build()}
  const nf=p=>nrmz([p[0],.45*Math.max(.35,Math.hypot(p[0],p[2])),p[2]]);
  // layered, drooping whorls: each tier is a ragged skirt of needles with spray cards lying on its surface
  const NT=7;for(let i=0;i<NT;i++){const t=i/(NT-1),y0=1.25+t*4.75,R=Math.pow(1-t,.8)*1.75+.32,hT=.95+R*.35,yTop=y0+hT,seg=11;
    // skirt: ring from a narrow collar down to a jagged, slightly drooping rim
    for(let k=0;k<seg;k++){const a0=k/seg*Math.PI*2+i*.5,a1=(k+1)/seg*Math.PI*2+i*.5;const j0=.82+r()*.3,j1=.82+r()*.3;
      const top0=[Math.cos(a0)*R*.16,yTop,Math.sin(a0)*R*.16],top1=[Math.cos(a1)*R*.16,yTop,Math.sin(a1)*R*.16];
      const b0=[Math.cos(a0)*R*j0,y0-.1*j0,Math.sin(a0)*R*j0],b1=[Math.cos(a1)*R*j1,y0-.1*j1,Math.sin(a1)*R*j1];
      a.quad(b1,b0,top0,top1,nf,[UVD[2],UVD[1]],[UVD[0],UVD[1]],[UVD[0],UVD[3]],[UVD[2],UVD[3]])}
    // spray cards hugging the skirt, tips hanging past the rim so the outline is feathery but not spiky
    const n=7+(i<3?2:0);for(let k=0;k<n;k++){const ang=k/n*Math.PI*2+i*.9+r()*.35,ca=Math.cos(ang),sa=Math.sin(ang),tx=-sa,tz=ca,L=R*(1.02+r()*.12),w=.42*R+.22;
      const B=[ca*R*.22,yTop-.05,sa*R*.22],Tp=[ca*L,y0-.22-r()*.12,sa*L],o=.05;
      a.quad([B[0]-tx*w*.25+ca*o,B[1],B[2]-tz*w*.25+sa*o],[Tp[0]-tx*w*.5+ca*o,Tp[1],Tp[2]-tz*w*.5+sa*o],[Tp[0]+tx*w*.5+ca*o,Tp[1],Tp[2]+tz*w*.5+sa*o],[B[0]+tx*w*.25+ca*o,B[1],B[2]+tz*w*.25+sa*o],nf,
        [UVA[0],UVA[1]+.17],[UVA[2],UVA[1]],[UVA[2],UVA[3]],[UVA[0],UVA[3]-.17])}}
  // leader at the very top
  a.geo(new THREE.ConeGeometry(.3,1.1,7,1,true),UVD,MX(0,7.05,0));
  return a.build()}
function broadGeo(hi,seed=4){const a=GA(),r=mulberry(seed),C=[0,4.6,0];
  // trunk splitting into limbs that reach each foliage cluster
  a.geo(new THREE.CylinderGeometry(.13,.27,3.3,hi?8:5,1,true),UVC,MX(0,1.65,0));
  const nCl=7,cl=[];for(let i=0;i<nCl;i++){const th=i/nCl*Math.PI*2+r()*.6,up=i===0;const rr=up?0:1.0+r()*.55,cy=up?5.5+r()*.3:4.0+r()*1.1;
    cl.push({x:Math.cos(th)*rr,y:cy,z:Math.sin(th)*rr,R:up?1.15:.95+r()*.35})}
  const blob=(c,R,det)=>{const g=new THREE.IcosahedronGeometry(1,det),q=g.attributes.position;for(let i=0;i<q.count;i++){const x=q.getX(i),y=q.getY(i),z=q.getZ(i),k=.82+.3*Math.abs(Math.sin(x*3.1+seed)*Math.cos(z*2.7+y*1.9));q.setXYZ(i,c.x+x*R*k,c.y+y*R*k*.82,c.z+z*R*k)}return g};
  const nf=p=>nrmz([(p[0]-C[0])/2.2,(p[1]-C[1])/1.7+.25,(p[2]-C[2])/2.2]);
  if(hi)for(const c of cl){const L=Math.hypot(c.x,c.y-3.2,c.z),ry=Math.atan2(c.x,c.z),tilt=Math.atan2(Math.hypot(c.x,c.z),c.y-3.2);
    const m=new THREE.Matrix4().makeTranslation(0,3.2,0).multiply(new THREE.Matrix4().makeRotationY(ry)).multiply(new THREE.Matrix4().makeRotationX(tilt)).multiply(new THREE.Matrix4().makeTranslation(0,L*.42,0));
    a.geo(new THREE.CylinderGeometry(.045,.1,L*.85,5,1,true),UVC,m)}
  if(!hi)a.geo(blob({x:0,y:4.7,z:0},1.2,1),UVE,null,nf);
  for(const c of cl){a.geo(blob(c,c.R*(hi?.78:1.02),1),UVE,null,nf);
    if(!hi)continue;
    // leaf cards lying on the cluster surface, facing outward
    const nC=11;for(let k=0;k<nC;k++){const zz=1-2*(k+.5)/nC,ph=k*2.39996+r()*.5,rq=Math.sqrt(1-zz*zz);const n=new THREE.Vector3(rq*Math.cos(ph),zz*.85+.15,rq*Math.sin(ph)).normalize();
      if(n.y<-.55)continue;const t1=new THREE.Vector3().crossVectors(n,Math.abs(n.y)>.9?new THREE.Vector3(1,0,0):new THREE.Vector3(0,1,0)).normalize(),t2=new THREE.Vector3().crossVectors(n,t1);
      const sp=r()*6.28,u=t1.clone().multiplyScalar(Math.cos(sp)).addScaledVector(t2,Math.sin(sp)),v=new THREE.Vector3().crossVectors(n,u);
      const S=c.R*(.62+r()*.25),o=new THREE.Vector3(c.x,c.y,c.z).addScaledVector(n,c.R*.74);
      const P=(sx,sy)=>[o.x+u.x*S*sx+v.x*S*sy+n.x*.12*(sx*sx+sy*sy),o.y+u.y*S*sx+v.y*S*sy+n.y*.12*(sx*sx+sy*sy)*-1,o.z+u.z*S*sx+v.z*S*sy+n.z*.12*(sx*sx+sy*sy)];
      a.quad(P(-1,-1),P(1,-1),P(1,1),P(-1,1),nf,[UVB[0],UVB[1]],[UVB[2],UVB[1]],[UVB[2],UVB[3]],[UVB[0],UVB[3]])}}
  return a.build()}
function bushGeo(){const a=GA(),r=mulberry(9),nf=p=>nrmz([p[0],(p[1]-.35)+.3,p[2]]);a.geo(new THREE.IcosahedronGeometry(1,0),UVE,MX(0,.4,0,0,0,0,.85,.55,.85),nf);
  for(let i=0;i<6;i++){const th=i/6*6.28+r(),cx=Math.cos(th)*.5,cz=Math.sin(th)*.5,cy=.45+r()*.25,S=.9+r()*.3;
    for(let k=0;k<2;k++){const e=new THREE.Euler(r()*3,th+k*1.5,r()*.6),ux=new THREE.Vector3(S/2,0,0).applyEuler(e),uy=new THREE.Vector3(0,S/2,0).applyEuler(e),p=(sx,sy)=>[cx+ux.x*sx+uy.x*sy,cy+ux.y*sx+uy.y*sy,cz+ux.z*sx+uy.z*sy];
      a.quad(p(-1,-1),p(1,-1),p(1,1),p(-1,1),nf,[UVB[0],UVB[1]],[UVB[2],UVB[1]],[UVB[2],UVB[3]],[UVB[0],UVB[3]])}}return a.build()}
function tuftGeo(){const a=GA();for(let k=0;k<3;k++){const an=k*Math.PI/3,cx=Math.cos(an)*.25,cz=Math.sin(an)*.25;
  a.quad([-cx,0,-cz],[cx,0,cz],[cx,.38,cz],[-cx,.38,-cz],()=>[0,1,0],[UVF[0],UVF[1]],[UVF[2],UVF[1]],[UVF[2],UVF[3]],[UVF[0],UVF[3]])}return a.build()}
function rockGeo(){const g=new THREE.IcosahedronGeometry(1,1),p=g.attributes.position,n=vnoise(31);for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=.75+.5*n(x*1.7+3,z*1.7+y*1.3+3);p.setXYZ(i,x*k,Math.max(-.3,y*k*.62),z*k)}
  const q=g.toNonIndexed();q.computeVertexNormals();return q}
// ---------- alien flora: crystal spires, giant fungi, glowing bulb plants, crystal sprouts ----------
// plain concat of non-indexed geometries (keeps vertex colours when present)
function mergeC(gs){let n=0;gs=gs.map(g=>g.index?g.toNonIndexed():g);for(const g of gs)n+=g.attributes.position.count;const pos=new Float32Array(n*3),col=gs[0].attributes.color?new Float32Array(n*3):null;let o=0;
  for(const g of gs){pos.set(g.attributes.position.array,o*3);if(col)col.set(g.attributes.color.array,o*3);o+=g.attributes.position.count}const out=new THREE.BufferGeometry();out.setAttribute('position',new THREE.BufferAttribute(pos,3));if(col)out.setAttribute('color',new THREE.BufferAttribute(col,3));return out}
const CRY=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0x0c3346,roughness:.18,metalness:.2,envMap:ENV,envMapIntensity:1.4,flatShading:true});
const FUN=new THREE.MeshStandardMaterial({vertexColors:true,emissive:0x080a14,roughness:.7,metalness:0,envMap:ENV,envMapIntensity:.5});
const BULB=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0x1a5a50,roughness:.35,metalness:0,envMap:ENV,envMapIntensity:.6});
function crystalGeo(hi,seed=11){const r=mulberry(seed),gs=[],n=hi?7:3;for(let i=0;i<n;i++){const h=(i===0?5.2:1.6+r()*3.2),w=(i===0?.55:.18+r()*.3),sides=hi?6:5;
    const c=new THREE.CylinderGeometry(w*.85,w,h*.78,sides,1);c.translate(0,h*.39,0);const tip=new THREE.ConeGeometry(w*.85,h*.22,sides);tip.translate(0,h*.78+h*.11,0);
    for(const g of[c,tip]){const q=g.toNonIndexed();const a=i===0?0:r()*6.28,t=i===0?(r()-.5)*.1:.25+r()*.45,m=new THREE.Matrix4().makeRotationY(a).multiply(new THREE.Matrix4().makeRotationZ(t));
      m.setPosition(i===0?0:Math.cos(a)*(.3+r()*.5),0,i===0?0:Math.sin(a)*(.3+r()*.5));q.applyMatrix4(m);gs.push(q)}}
  const out=mergeC(gs);out.computeVertexNormals();return out}
function fungusGeo(hi,seed=12){const r=mulberry(seed),parts=[],col=(g,c)=>{const q=g.toNonIndexed(),n=q.attributes.position.count,a=new Float32Array(n*3),C=new THREE.Color(c);for(let i=0;i<n;i++)C.toArray(a,i*3);q.setAttribute('color',new THREE.BufferAttribute(a,3));return q};
  const seg=hi?14:8,H=4.4;const st=new THREE.CylinderGeometry(.16,.3,H,hi?10:6,4);const sp=st.attributes.position;for(let i=0;i<sp.count;i++){const y=sp.getY(i)/H+.5;sp.setX(i,sp.getX(i)+Math.sin(y*2.4)*.35)}st.translate(0,H/2,0);parts.push(col(st,0xc8c0b0));
  const cap=new THREE.LatheGeometry([[0,.9],[1.1,.85],[2.0,.45],[2.3,0],[2.1,-.05],[0,0]].map(([x,y])=>new THREE.Vector2(x,y)),seg);cap.translate(Math.sin(2.4)*.35,H-.05,0);parts.push(col(cap,0xffffff));
  const gill=new THREE.RingGeometry(.3,2.05,seg,1);gill.rotateX(Math.PI/2);gill.translate(Math.sin(2.4)*.35,H-.04,0);parts.push(col(gill,0x9ff0ff));
  if(hi)for(let i=0;i<9;i++){const a=r()*6.28,d=.4+r()*1.4,sp2=new THREE.SphereGeometry(.07+r()*.06,6,4);sp2.translate(Math.sin(2.4)*.35+Math.cos(a)*d,H+.5+(1-d/2)*.35,Math.sin(a)*d);parts.push(col(sp2,0xe0f8ff))}
  const out=mergeC(parts);out.computeVertexNormals();return out}
function bulbGeo(){const r=mulberry(13),gs=[];for(let i=0;i<6;i++){const a=r()*6.28,d=r()*.35,h=.25+r()*.55;const s=new THREE.CylinderGeometry(.025,.04,h,5);s.translate(Math.cos(a)*d,h/2,Math.sin(a)*d);gs.push(s.toNonIndexed());
    const b=new THREE.SphereGeometry(.09+r()*.08,8,6);b.scale(1,1.25,1);b.translate(Math.cos(a)*d,h+.08,Math.sin(a)*d);gs.push(b.toNonIndexed())}
  const out=mergeC(gs);out.computeVertexNormals();return out}
function sproutGeo(){const gs=[];for(let k=0;k<4;k++){const c=new THREE.ConeGeometry(.035,.22+k*.06,4);c.translate(0,.11+k*.03,0);c.rotateZ((k-1.5)*.35);c.rotateY(k*1.7);gs.push(c.toNonIndexed())}const out=mergeC(gs);out.computeVertexNormals();return out}
// ---------- vegetation with distance LOD: instance lists rebuilt when the viewer has moved a few metres ----------
const VEG={sp:[],grass:null,cx:1e9,cz:1e9,hiR:24,grassN:900};
function vegSpecies(list,hiGeo,loGeo,mat,far=94,loMat=FOLO){const n=Math.max(1,list.length),hi=new THREE.InstancedMesh(hiGeo,mat,n),lo=loGeo?new THREE.InstancedMesh(loGeo,loMat,n):hi;
  for(const im of new Set([hi,lo])){im.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(n*3),3);im.frustumCulled=false;im.count=0;world.add(im)}const m=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler();
  const M16=new Float32Array(list.length*16),C3=new Float32Array(list.length*3);list.forEach((p,i)=>{q.setFromEuler(e.set(p.tx||0,p.ry,p.tz||0));m.compose(new THREE.Vector3(p.x,p.y,p.z),q,new THREE.Vector3(p.s*(p.sx||1),p.s*(p.sy||1),p.s*(p.sx||1)));m.toArray(M16,i*16);p.c.toArray(C3,i*3)});_toL(C3);
  const sp={list,hi,lo,M16,C3,far,hiR2:loGeo?26*26:far*far};VEG.sp.push(sp);return sp}
function updateVeg(px,pz,force){if(!force&&Math.hypot(px-VEG.cx,pz-VEG.cz)<5)return;VEG.cx=px;VEG.cz=pz;
  for(const sp of VEG.sp){let h=0,l=0;const hm=sp.hi.instanceMatrix.array,lm=sp.lo.instanceMatrix.array,hc=sp.hi.instanceColor.array,lc=sp.lo.instanceColor.array,hr=sp.lo===sp.hi?sp.hiR2:VEG.hiR*VEG.hiR,fr=sp.far*sp.far;
    for(let i=0;i<sp.list.length;i++){const p=sp.list[i],d2=(p.x-px)**2+(p.z-pz)**2;if(d2>fr)continue;
      if(d2<hr){hm.set(sp.M16.subarray(i*16,i*16+16),h*16);hc.set(sp.C3.subarray(i*3,i*3+3),h*3);h++}else if(sp.lo!==sp.hi){lm.set(sp.M16.subarray(i*16,i*16+16),l*16);lc.set(sp.C3.subarray(i*3,i*3+3),l*3);l++}}
    sp.lo.count=l;sp.hi.count=h;sp.hi.instanceMatrix.needsUpdate=sp.hi.instanceColor.needsUpdate=true;if(sp.lo!==sp.hi){sp.lo.instanceMatrix.needsUpdate=sp.lo.instanceColor.needsUpdate=true}}
  // grass tufts scattered on open ground around the viewer
  const gm=VEG.grass;if(gm){const m=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),v=new THREE.Vector3(),s=new THREE.Vector3(),c=new THREE.Color();let k=0;const R2=19;
    const g0x=Math.floor((px-R2)/1.3),g0z=Math.floor((pz-R2)/1.3),g1x=Math.ceil((px+R2)/1.3),g1z=Math.ceil((pz+R2)/1.3);
    for(let gz=g0z;gz<=g1z&&k<VEG.grassN;gz++)for(let gx=g0x;gx<=g1x&&k<VEG.grassN;gx++){const h=Math.sin(gx*127.1+gz*311.7)*43758.5453,f=h-Math.floor(h),h2=Math.sin(gx*269.5+gz*183.3)*12543.17,f2=h2-Math.floor(h2);
      const x=(gx+f)*1.3,z=(gz+f2)*1.3;if((x-px)**2+(z-pz)**2>R2*R2)continue;if(f*f2>.5)continue;const tx=Math.floor(x/T),ty=Math.floor(z/T),ch=tile(tx,ty);
      if(!(ch==='.'||ch==='T'||(tx<0||ty<0||tx>=W||ty>=H)))continue;if(groundKind(x,z)>.5)continue;
      const sc=.5+f2*.6;m.compose(v.set(x,heightAt(x,z)-.02,z),q.setFromEuler(e.set(0,f*6.28,0)),s.set(sc,sc*(.8+f*.5),sc));gm.setMatrixAt(k,m);c.setHSL(f<.5?.5+f*.1:.75+f*.08,.55+f2*.3,.55+f*.25);_cL(c);gm.setColorAt(k,c);k++}
    gm.count=k;gm.instanceMatrix.needsUpdate=true;if(gm.instanceColor)gm.instanceColor.needsUpdate=true}}
// how much a ground point is road shoulder / bare (0 grass .. 1 gravel/road): used for grass placement and ground blending
let GK=null;
function groundKind(x,z){if(!GK)return 0;const i=Math.round((x+HOFF)/2),j=Math.round((z+HOFF)/2);return GK[j*GK.w+i]||0}

// colours are authored in sRGB; the renderer works in linear space with ACES tone mapping, so every material,
// texture, light and vertex colour is converted once (new objects are picked up on the next frame)
const _lin=new WeakSet(),_toL=a=>{for(let i=0;i<a.length;i++)a[i]*=a[i]},_cL=c=>{if(c){c.r*=c.r;c.g*=c.g;c.b*=c.b}};
function linMat(m){if(!m||_lin.has(m))return;_lin.add(m);for(const k of['map','emissiveMap'])if(m[k]&&m[k].encoding!==THREE.sRGBEncoding){m[k].encoding=THREE.sRGBEncoding;m[k].needsUpdate=true}
  _cL(m.color);_cL(m.emissive);_cL(m.specular);m.needsUpdate=true}
function linearize(root){root.traverse(o=>{const m=o.material;if(m){if(Array.isArray(m))m.forEach(linMat);else linMat(m)}
  const g=o.geometry;if(g&&!_lin.has(g)){_lin.add(g);const c=g.attributes.color;if(c){_toL(c.array);c.needsUpdate=true}}
  if(o.isLight&&!_lin.has(o)){_lin.add(o);_cL(o.color);_cL(o.groundColor)}})}
const L_=(o)=>new THREE.MeshLambertMaterial(o),Ph=(o)=>new THREE.MeshPhongMaterial(o);
const HEXT=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle='#d8dde2';g.fillRect(0,0,256,256);g.strokeStyle='rgba(30,36,44,.55)';g.lineWidth=2.2;
  const R0=18,h=R0*Math.sqrt(3);for(let row=-1;row<256/h+1;row++)for(let col=-1;col<256/(R0*3)+1;col++){const x=col*R0*3+(row%2?R0*1.5:0),y=row*h/2;g.beginPath();for(let k=0;k<6;k++){const a=k*Math.PI/3;g.lineTo(x+R0*Math.cos(a),y+R0*Math.sin(a))}g.closePath();g.stroke();
    if(Math.random()<.12){g.fillStyle='rgba(60,90,120,.18)';g.fill()}}for(let i=0;i<900;i++){g.fillStyle=`rgba(0,0,0,${Math.random()*.06})`;g.fillRect(Math.random()*256,Math.random()*256,2,2)}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(6,3);t.anisotropy=4;return t})();
const DOME=new THREE.MeshStandardMaterial({map:HEXT,color:0xe4e8ec,metalness:.35,roughness:.4,envMap:ENV,envMapIntensity:1});
const SOLAR=new THREE.MeshStandardMaterial({color:0x1a2a4a,metalness:.6,roughness:.15,envMapIntensity:1.6});
const GLOW=new THREE.MeshBasicMaterial({color:0x5ad8ff}),GLOWR=new THREE.MeshBasicMaterial({color:0xff4a3a}),GLOWW=new THREE.MeshBasicMaterial({color:0xe8f4ff}),HULL=STD({color:0x9aa2aa,metalness:.6,roughness:.35,envMapIntensity:1.1}),HULLD=STD({color:0x2a2e34,metalness:.5,roughness:.5,envMapIntensity:.8});
const M={
  floor:L_({map:TXE.asphalt,color:0xb8c0c8}),ceil:L_({color:0x4a5058}),phoneGlass:Ph({color:0x1b2a3a,specular:0x223344,shininess:10,transparent:true,opacity:.35,side:THREE.DoubleSide,depthWrite:false}),trim:L_({color:0x3a4048}),sash:L_({color:0x4a525a}),
  glass:STD({color:0x1b2a3a,metalness:.1,roughness:.05,envMapIntensity:1.8,transparent:true,opacity:.45,side:THREE.DoubleSide,depthWrite:false}),
  glassLit:Ph({color:0x1a4a5a,emissive:0x124a5a,specular:0xc0f0ff,shininess:80,transparent:true,opacity:.55,side:THREE.DoubleSide,depthWrite:false}),
  shard:Ph({color:0x9fbad6,specular:0xffffff,shininess:100,transparent:true,opacity:.6,side:THREE.DoubleSide,depthWrite:false}),
  carGlass:STD({color:0x0a0f15,metalness:.2,roughness:.06,envMapIntensity:1.6}),
  plank:L_({color:0x5a646e}),wood:L_({color:0x6a7480}),woodDark:L_({color:0x2e343a}),
  brass:STD({color:0xb08a3a,metalness:.9,roughness:.35,envMapIntensity:1}),metal:STD({color:0x6a6e74,metalness:.65,roughness:.45,envMapIntensity:.9}),
  chrome:STD({color:0xb4b8be,metalness:1,roughness:.18,envMapIntensity:1.2}),rubber:STD({color:0x161616,roughness:.92,envMapIntensity:.3}),
  concrete:L_({map:TX_.concrete}),line:L_({color:0xbdb8a6}),green:Ph({color:0x1f4a2e,specular:0x335544,shininess:30}),
  sign:new THREE.MeshBasicMaterial({map:signTex,color:0xbbbbbb}),
  head:new THREE.MeshBasicMaterial({color:0xffe2a8}),tailOff:STD({color:0x5a1010,metalness:.1,roughness:.2,envMapIntensity:1.2}),
  tailOn:new THREE.MeshBasicMaterial({color:0xff3020}),headOff:STD({color:0xd8d8cc,metalness:.3,roughness:.1,envMapIntensity:1.4}),
  bark:L_({map:TX_.bark}),leaf:L_({color:0xffffff}),bush:L_({color:0xffffff}),
  jerry:Ph({map:TX_.jerry,specular:0x553333,shininess:30,emissive:0x2a0402}),lamp:new THREE.MeshBasicMaterial({color:0xd8f0ff}),
  rug:L_({color:0x1e3a44}),asphaltMat:STD({map:TXE.asphalt,metalness:.55,roughness:.55,envMapIntensity:.9}),pole:STD({color:0x4a4f55,metalness:.6,roughness:.5}),
  paint:new THREE.MeshBasicMaterial({color:0x48d8ff,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2}),gravel:L_({map:TXE.gravel,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1}),rock:L_({map:TXE.rock}),
  poleWood:L_({map:TXE.pole}),insul:STD({color:0x6a7a6a,roughness:.2,envMapIntensity:1})};
const SIDING=[0xc8ccce,0x8f9aa0,0x9aa38c,0xa0a8b0,0x7c8690,0xd0d0c8,0x98a4a8,0x8a9488,0xb0b8c0].map(c=>L_({map:TX_.siding,color:c}));
const ROOF=[0x6a7076,0x50585e,0x5e6458,0x7a7a74,0x4a5054,0x606a70,0x585e60,0x6e665a,0x52585a].map(c=>L_({map:TX_.shingle,color:c}));
const DOORC=[0x3a4652,0xb0682a,0x5a6470,0x2e3a46,0xc8a030,0x4a525a,0x3a5a6a,0xa04a2a,0x606a72].map(c=>STD({map:TX_.door,color:c,roughness:.55,envMapIntensity:.5}));

// ================= static batching (one draw call per material) =================
const _o=new THREE.Object3D();
function MX(x,y,z,ry=0,rx=0,rz=0,sx=1,sy=1,sz=1){_o.position.set(x,y,z);_o.rotation.set(rx,ry,rz,'YXZ');_o.scale.set(sx,sy,sz);_o.updateMatrix();return _o.matrix.clone()}
function mergeGeos(items){let n=0;const arr=items.map(([g,m])=>{const q=g.index?g.toNonIndexed():g.clone();q.applyMatrix4(m);if(!q.attributes.normal)q.computeVertexNormals();
    if(!q.attributes.uv)q.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(q.attributes.position.count*2),2));n+=q.attributes.position.count;return q});
  const pos=new Float32Array(n*3),nor=new Float32Array(n*3),uv=new Float32Array(n*2);let o=0;
  for(const q of arr){pos.set(q.attributes.position.array,o*3);nor.set(q.attributes.normal.array,o*3);uv.set(q.attributes.uv.array,o*2);o+=q.attributes.position.count;q.dispose()}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));return g}
function Batch(){const m=new Map();return{add(g,mat,mtx){let a=m.get(mat);if(!a)m.set(mat,a=[]);a.push([g,mtx])},
  build(par){for(const[mat,a]of m)par.add(new THREE.Mesh(mergeGeos(a),mat));m.clear()}}}
const BOX=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
function uvScale(g,su,sv){const a=g.attributes.uv;for(let i=0;i<a.count;i++)a.setXY(i,a.getX(i)*su,a.getY(i)*sv);return g}
const rel=(G,x,y,z,ry=0,rx=0,rz=0)=>G.clone().multiply(MX(x,y,z,ry,rx,rz));

// ---------- windows ----------
const HH=(WIN.y1-WIN.y0)/2;
const sashFrameGeo=mergeGeos([[BOX(.05,HH,.05),MX(-(WIN.ow/2-.025),HH/2,0)],[BOX(.05,HH,.05),MX(WIN.ow/2-.025,HH/2,0)],[BOX(WIN.ow,.05,.05),MX(0,0,0)],[BOX(WIN.ow,.05,.05),MX(0,HH,0)],
  [BOX(.03,HH,.03),MX(0,HH/2,0)],[BOX(WIN.ow,.03,.03),MX(0,HH/2,0)]]);
const paneGeo=new THREE.PlaneGeometry(WIN.ow-.06,HH-.05);
function shardGeo(seed,sgnOut){const r=mulberry(seed),items=[],hw=(WIN.ow-.06)/2;
  const tooth=(base,zz)=>{for(let i=0;i<6;i++){const s=new THREE.Shape(),L=.1+r()*.22,b=(r()-.5)*1.8*hw,e=i%4;
    if(e===0){s.moveTo(b-.1,0);s.lineTo(b+.1,0);s.lineTo(b+(r()-.5)*.1,L)}else if(e===1){s.moveTo(b-.1,HH);s.lineTo(b+.1,HH);s.lineTo(b+(r()-.5)*.1,HH-L)}
    else{const sx=e===2?-hw:hw,y=.05+r()*(HH-.1);s.moveTo(sx,y-.09);s.lineTo(sx,y+.09);s.lineTo(sx-Math.sign(sx)*L,y+(r()-.5)*.08)}
    items.push([new THREE.ShapeGeometry(s),MX(0,base,zz)])}};
  tooth(WIN.y0,.035);tooth(WIN.y0+HH,-.035);
  for(let i=0;i<12;i++){const s=new THREE.Shape();s.moveTo(0,0);s.lineTo(.05+r()*.09,.01);s.lineTo(.02,.04+r()*.07);
    items.push([new THREE.ShapeGeometry(s),MX((r()-.5)*1.3,.03,(i%2?1:-1)*(SL+.15+r()*.6),r()*6,-Math.PI/2)])}
  return mergeGeos(items)}
function buildWindow(w,B,sid,pad){const c=ctr(w),ax=wallAxisX(w.x,w.y),ry=ax?0:Math.PI/2;w.ax=ax;const h=houseAt(w.in.x,w.in.y),lit=h&&h.lit;
  const sgn=ax?(w.in.y-w.y):(w.in.x-w.x);const G=MX(c.x,pad,c.z,ry),side=(T-WIN.ow)/2,TH=2*SL;
  B.add(BOX(T,WIN.y0,TH),sid,rel(G,0,WIN.y0/2,0));B.add(BOX(T,WALLH-WIN.y1,TH),sid,rel(G,0,(WALLH+WIN.y1)/2,0));
  for(const sx of[-1,1])B.add(BOX(side,WIN.y1-WIN.y0,TH),sid,rel(G,sx*(T/2-side/2),(WIN.y0+WIN.y1)/2,0));
  for(const sx of[-1,1])B.add(new THREE.PlaneGeometry(TH,WIN.y1-WIN.y0),M.trim,rel(G,sx*(WIN.ow/2-.001),(WIN.y0+WIN.y1)/2,0,-sx*Math.PI/2));
  B.add(new THREE.PlaneGeometry(WIN.ow,TH),M.trim,rel(G,0,WIN.y1-.001,0,0,Math.PI/2));
  for(const fz of[-1,1]){const z=fz*(SL+.015);
    for(const sx of[-1,1])B.add(BOX(.08,WIN.y1-WIN.y0+.16,.04),M.trim,rel(G,sx*(WIN.ow/2+.04),(WIN.y0+WIN.y1)/2,z));
    B.add(BOX(WIN.ow+.24,.08,.04),M.trim,rel(G,0,WIN.y1+.04,z))}
  B.add(BOX(WIN.ow+.32,.06,TH+.22),M.trim,rel(G,0,WIN.y0-.03,-sgn*.09));
  B.add(sashFrameGeo,M.sash,rel(G,0,WIN.y0+HH,-.035));
  const dyn=new THREE.Group();dyn.position.set(c.x,pad,c.z);dyn.rotation.y=ry;world.add(dyn);
  const gm=lit?M.glassLit:M.glass;
  const up=new THREE.Mesh(paneGeo,gm);up.position.set(0,WIN.y0+HH*1.5,-.035);dyn.add(up);
  const lower=new THREE.Group();lower.position.set(0,WIN.y0,.035);dyn.add(lower);
  lower.add(new THREE.Mesh(sashFrameGeo,M.sash));const lp=new THREE.Mesh(paneGeo,gm);lp.position.y=HH/2;lower.add(lp);
  const sh=new THREE.Mesh(shardGeo(w.x*31+w.y*7),M.shard);dyn.add(sh);
  w.lower=lower;w.upPane=up;w.lowPane=lp;w.shards=sh;setWin(w,w.state)}
function setWin(w,state){w.state=state;if(!w.lower)return;w.lower.position.y=WIN.y0+(state==='open'?HH*.85:0);
  w.upPane.visible=w.lowPane.visible=state!=='broken';w.shards.visible=state==='broken'}
function wallAxisX(x,y){return'#wd'.includes(tile(x-1,y))&&'#wd'.includes(tile(x+1,y))}

// ---------- doors ----------
const isIn=(tx,ty)=>'fLD'.includes(tile(tx,ty));
function buildDoor(d,B,sid,dmat,pad){const c=ctr(d),ax=wallAxisX(d.x,d.y),ry=ax?0:Math.PI/2;d.ax=ax;
  const sgn=ax?(isIn(d.x,d.y+1)?1:-1):(isIn(d.x+1,d.y)?1:-1);d.sgn=sgn;const G=MX(c.x,pad,c.z,ry),side=(T-DOORW)/2,TH=2*SL;d.cx=c.x;d.cz=c.z;d.ry=ry;d.pad=pad;
  // the airlock pillars and hood outside are solid; the door leaf itself is checked by rayHit (it swings)
  {const L2W=(lx,lz)=>ry?[c.x+lz,c.z-lx]:[c.x+lx,c.z+lz],bx=(lx,lz,hx,hz,top,bot)=>{const[wx,wz]=L2W(lx,lz),ex=ry?hz:hx,ez=ry?hx:hz,o={x0:wx-ex,x1:wx+ex,z0:wz-ez,z1:wz+ez,h:pad+top};if(bot!==undefined)o.bot=pad+bot;addCol(o)};
   for(const sx of[-1,1])bx(sx*(DOORW/2+.13),-sgn*(SL+.17),.11,.17,DOORH+.35);bx(0,-sgn*(SL+.26),DOORW/2+.36,.28,DOORH+.42,DOORH+.18);
   for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const k=kk(d.x+a,d.y+b);if(!DOORP.has(k))DOORP.set(k,[]);DOORP.get(k).push(d)}}
  for(const sx of[-1,1])B.add(BOX(side,WALLH,TH),sid,rel(G,sx*(T/2-side/2),WALLH/2,0));
  B.add(BOX(DOORW,WALLH-DOORH,TH),sid,rel(G,0,(WALLH+DOORH)/2,0));
  // airlock surround: side pillars, hood with a light strip, warning stripes on the threshold
  {const oz=-sgn;for(const sx of[-1,1]){B.add(BOX(.22,DOORH+.35,.34),HULLD,rel(G,sx*(DOORW/2+.13),(DOORH+.35)/2,oz*(SL+.17)));B.add(BOX(.03,DOORH-.2,.02),GLOW,rel(G,sx*(DOORW/2+.13),DOORH/2,oz*(SL+.35)))}
   B.add(BOX(DOORW+.72,.24,.56),HULL,rel(G,0,DOORH+.3,oz*(SL+.26)));B.add(BOX(DOORW,.02,.03),GLOW,rel(G,0,DOORH+.17,oz*(SL+.5)));B.add(BOX(.5,.08,.04),GLOWR,rel(G,0,DOORH+.3,oz*(SL+.55)))}
  for(const sx of[-1,1])B.add(new THREE.PlaneGeometry(TH,DOORH),M.trim,rel(G,sx*(DOORW/2-.001),DOORH/2,0,-sx*Math.PI/2));
  B.add(new THREE.PlaneGeometry(DOORW,TH),M.trim,rel(G,0,DOORH-.001,0,0,Math.PI/2));
  for(const fz of[-1,1]){const z=fz*(SL+.015);for(const sx of[-1,1])B.add(BOX(.09,DOORH+.09,.04),M.trim,rel(G,sx*(DOORW/2+.045),(DOORH+.09)/2,z));
    B.add(BOX(DOORW+.27,.09,.04),M.trim,rel(G,0,DOORH+.045,z))}
  B.add(BOX(DOORW,.03,TH),M.woodDark,rel(G,0,.015,0));
  B.add(BOX(DOORW+.7,.16,.9),M.concrete,rel(G,0,.08,-sgn*(SL+.45)));B.add(BOX(DOORW+.7,.08,.45),M.concrete,rel(G,0,.04,-sgn*(SL+1.12)));
  // mailbox beside the stoop
  const mbx=rel(G,DOORW/2+1.0,0,-sgn*(SL+1.5)),mp=new THREE.Vector3().setFromMatrixPosition(mbx);
  B.add(new THREE.CylinderGeometry(.05,.09,1.0,6),HULLD,rel(G,DOORW/2+1.0,.5,-sgn*(SL+1.5)));B.add(new THREE.CylinderGeometry(.12,.12,.18,8),HULL,rel(G,DOORW/2+1.0,1.08,-sgn*(SL+1.5)));
  B.add(new THREE.CylinderGeometry(.124,.124,.03,8),GLOW,rel(G,DOORW/2+1.0,1.1,-sgn*(SL+1.5)));addCol({x:mp.x,z:mp.z,r:.14,soft:true});
  const grp=new THREE.Group();grp.position.set(c.x,pad,c.z);grp.rotation.y=ry;world.add(grp);
  const pivot=new THREE.Group();pivot.position.set(-DOORW/2,0,0);grp.add(pivot);
  const panel=new THREE.Mesh(BOX(DOORW-.03,DOORH-.02,.05),dmat);panel.position.set(DOORW/2,DOORH/2,0);pivot.add(panel);
  for(const z of[-.045,.045]){const kn=new THREE.Mesh(new THREE.SphereGeometry(.035,10,8),M.brass);kn.position.set(DOORW-.12,1.0,z);pivot.add(kn)}
  const planks=new THREE.Group();for(const s of[-1,0,1]){const p=new THREE.Mesh(BOX(DOORW+.34,.17,.05),M.plank);p.position.set(0,1.1+s*.5,sgn*(SL+.05));p.rotation.z=s*.18;planks.add(p)}grp.add(planks);
  d.pivot=pivot;d.panel=panel;d.planks=planks;d.ang=d.open?1:0}

// ---------- furniture ----------
function placeAgainstWall(o,depth){const wd=DIRS.find(([a,b])=>tile(o.x+a,o.y+b)==='#')||[0,-1];const c=ctr(o),off=T-SL-depth/2;
  o.px=c.x+wd[0]*off;o.pz=c.z+wd[1]*off;o.nx=-wd[0];o.nz=-wd[1];o.ry=Math.atan2(o.nx,o.nz);o.alongX=wd[0]===0;}
function buildDresser(dr,B){placeAgainstWall(dr,.52);const G=MX(dr.px,dr.pad+.1,dr.pz,dr.ry);
  B.add(BOX(1.4,.8,.5),M.wood,rel(G,0,.52,0));B.add(BOX(1.46,.05,.54),M.woodDark,rel(G,0,.945,0));
  for(const sx of[-1,1])for(const sz of[-1,1])B.add(BOX(.06,.12,.06),M.woodDark,rel(G,sx*.64,.06,sz*.2));
  for(const y of[.26,.52]){B.add(BOX(1.3,.22,.03),M.wood,rel(G,0,y,.26));B.add(BOX(.2,.025,.03),M.brass,rel(G,0,y,.285))}
  const top=new THREE.Group();const g2=MX(dr.px,dr.pad+.1,dr.pz,dr.ry);top.matrixAutoUpdate=false;top.matrix.copy(g2);
  const inner=new THREE.Group();top.add(inner);
  const f=new THREE.Mesh(BOX(1.3,.2,.03),M.wood);f.position.set(0,.78,.26);inner.add(f);
  const hd=new THREE.Mesh(BOX(.2,.025,.03),M.brass);hd.position.set(0,.78,.285);inner.add(hd);
  const bx=new THREE.Mesh(BOX(1.24,.16,.44),M.woodDark);bx.position.set(0,.78,.03);inner.add(bx);world.add(top);
  dr.pull=inner;inner.position.z=dr.searched?.32:0;
  dr.alongX?boxCol(dr.px,dr.pz,.73,.28,dr.pad+1.07):boxCol(dr.px,dr.pz,.28,.73,dr.pad+1.07)}
function buildWardrobe(cl,B){placeAgainstWall(cl,.66);const G=MX(cl.px,cl.pad+.1,cl.pz,cl.ry);
  B.add(BOX(1.3,2.0,.62),M.woodDark,rel(G,0,1.05,0));B.add(BOX(1.4,.07,.68),M.woodDark,rel(G,0,2.085,0));
  const items=[];for(const sx of[-1,1]){items.push([BOX(.62,1.84,.03),MX(sx*.32,1.05,.32)],[BOX(.5,.6,.012),MX(sx*.32,1.5,.34)],[BOX(.5,.6,.012),MX(sx*.32,.68,.34)]);B.add(BOX(.025,.22,.03),M.brass,rel(G,sx*.06,1.1,.345))}
  const dm=new THREE.Mesh(mergeGeos(items),M.wood);dm.matrixAutoUpdate=false;dm.matrix.copy(G);world.add(dm);cl.doorsMesh=dm;
  for(const sx of[-1,1])B.add(BOX(.08,.05,.6),M.woodDark,rel(G,sx*.58,.025,0));
  cl.alongX?boxCol(cl.px,cl.pz,.66,.34,cl.pad+2.22):boxCol(cl.px,cl.pz,.34,.66,cl.pad+2.22)}

// ---------- vehicles ----------
function profile(pts){const s=new THREE.Shape();s.moveTo(pts[0][0],pts[0][1]);for(const p of pts.slice(1))s.lineTo(p[0],p[1]);return s}
function extr(pts,depth,bevel=.04){const g=new THREE.ExtrudeGeometry(profile(pts),{depth,bevelEnabled:bevel>0,bevelThickness:bevel,bevelSize:bevel,bevelSegments:2,curveSegments:1});g.translate(0,0,-depth/2);return g}
function wheels(B,G,xs,wd,r=.34){for(const x of xs)for(const s of[-1,1]){const t=new THREE.CylinderGeometry(r,r,.22,16);t.rotateX(Math.PI/2);B.add(t,M.rubber,rel(G,x,r,s*(wd/2-.06)));
  const hb=new THREE.CylinderGeometry(r*.55,r*.55,.235,12);hb.rotateX(Math.PI/2);B.add(hb,M.chrome,rel(G,x,r,s*(wd/2-.06)))}}
const PAINT={};
const ROVERC=[0xd8dcdf,0xc8702e,0x8a9aa6,0xd8b440,0x6a8a9a,0xe8e8e0];
function sedan(B,G,paint,opt={}){const L=4.2,Wd=1.72;paint=ROVERC[Math.abs(paint|0)%ROVERC.length];const mat=PAINT[paint]||(PAINT[paint]=STD({color:paint,metalness:.45,roughness:.35,envMapIntensity:1.2}));
  // surface rover: wedge hull on four hover pods, dark canopy, light strips
  B.add(extr([[-L/2,.42],[L/2-.1,.42],[L/2,.6],[L/2-.15,.8],[1.3,.98],[-1.6,1.0],[-L/2,.86]],Wd-.1),mat,G);
  B.add(extr([[1.2,.97],[.7,1.3],[.2,1.43],[-.7,1.43],[-1.3,1.0]],Wd-.5,.06),M.carGlass,G);for(const s of[-1,1])B.add(BOX(1.9,.12,.06),HULLD,rel(G,-.05,1.02,s*(Wd/2-.12)));
  B.add(BOX(L-.3,.08,Wd+.04),HULLD,rel(G,0,.44,0));
  for(const x of[1.35,-1.35])for(const sz of[-1,1]){B.add(new THREE.CylinderGeometry(.3,.36,.26,12),HULLD,rel(G,x,.27,sz*(Wd/2-.05)));B.add(new THREE.CylinderGeometry(.24,.24,.02,12),GLOW,rel(G,x,.13,sz*(Wd/2-.05)))}
  for(const s of[-1,1]){B.add(BOX(2.8,.03,.02),GLOW,rel(G,-.1,.72,s*(Wd/2-.02)));B.add(BOX(.03,.08,.5),opt.lights?GLOWW:GLOW,rel(G,L/2-.02,.66,s*.5));B.add(BOX(.03,.08,.4),GLOWR,rel(G,-L/2-.01,.78,s*.55))}
  B.add(BOX(.5,.05,.06),HULLD,rel(G,-1.0,1.06,0));B.add(new THREE.CylinderGeometry(.015,.015,.7,6),HULLD,rel(G,-1.6,1.35,.55));B.add(new THREE.SphereGeometry(.04,8,6),GLOWR,rel(G,-1.6,1.72,.55));
  return mat}
function boxVan(B,G){const L=4.8,Wd=1.95;
  // supply pod: tall armoured cargo module on landing struts
  B.add(extr([[-L/2,.4],[L/2,.4],[L/2,1.0],[L/2-.4,1.3],[L/2-.4,2.1],[L/2-.7,2.28],[-L/2+.2,2.28],[-L/2,2.1]],Wd-.1),HULL,G);
  for(const s of[-1,1]){B.add(BOX(L-.6,.06,.02),GLOW,rel(G,-.2,1.7,s*(Wd/2+.01)));B.add(BOX(1.2,1.2,.02),HULLD,rel(G,-.6,1.25,s*(Wd/2+.005)));B.add(BOX(.25,.04,.02),GLOWR,rel(G,-.6,1.95,s*(Wd/2+.015)))}
  for(const x of[1.8,-1.8])for(const sz of[-1,1]){B.add(BOX(.12,.5,.12),HULLD,rel(G,x,.25,sz*.8));B.add(BOX(.4,.06,.4),HULLD,rel(G,x,.03,sz*.8))}
  B.add(BOX(.04,.5,1.2),GLOW,rel(G,L/2+.005,.75,0))}

// ---------- the world ----------
let world=new THREE.Group();scene.add(world);
const lamps=[],lampSrc=[];
const canGeo=mergeGeos([[BOX(.36,.46,.16),MX(0,.23,0)],[BOX(.04,.08,.06),MX(-.1,.5,0)],[BOX(.04,.08,.06),MX(.1,.5,0)],[BOX(.26,.035,.06),MX(0,.54,0)]]),spoutGeo=new THREE.CylinderGeometry(.03,.035,.12,8);
function placeCan(cn){const g=new THREE.Group();g.add(new THREE.Mesh(canGeo,M.jerry));const sp=new THREE.Mesh(spoutGeo,M.metal);sp.position.set(.14,.5,0);sp.rotation.z=-.5;g.add(sp);
  g.position.set(cn.x,groundY(cn.x,cn.z),cn.z);g.rotation.y=cn.x*7%6;world.add(g);cn.mesh=g}
function inst(geo,mat,list,fn,colorFn){const im=new THREE.InstancedMesh(geo,mat,Math.max(1,list.length));const m=new THREE.Matrix4(),col=new THREE.Color();
  list.forEach((p,i)=>{fn(m,p,i);im.setMatrixAt(i,m);if(colorFn){colorFn(col,p,i);im.setColorAt(i,col)}});im.count=list.length;world.add(im);return im}
function buildWorld(){TERR=[];
  scene.remove(world);world=new THREE.Group();scene.add(world);lamps.length=0;lampSrc.length=0;
  const B=Batch();
  // ground: grass blended with dirt (forest floor, worn patches) and gravel (road shoulders); macro variation hides tiling
  const inMap=(tx,ty)=>tx>=0&&ty>=0&&tx<W&&ty<H,isRoad=(tx,ty)=>inMap(tx,ty)&&'=AVP'.includes(grid[ty][tx]);
  {const gw=W*T+2*HOFF,gh=H*T+2*HOFF,nx=Math.round(gw/2),nz=Math.round(gh/2),geo=new THREE.PlaneGeometry(gw,gh,nx,nz);geo.rotateX(-Math.PI/2);geo.translate(W*T/2,0,H*T/2);
   const pa=geo.attributes.position,sp=new Float32Array(pa.count*3);GK=new Float32Array(pa.count);GK.w=nx+1;
   for(let i=0;i<pa.count;i++){const x=pa.getX(i),z=pa.getZ(i);pa.setY(i,heightAt(x,z));const tx=Math.floor(x/T),ty=Math.floor(z/T);
     let dr=9;for(let b=-2;b<=1;b++)for(let a=-2;a<=1;a++){if(!isRoad(tx+a,ty+b))continue;const x0=(tx+a)*T,z0=(ty+b)*T;dr=Math.min(dr,Math.hypot(Math.max(x0-x,0,x-x0-T),Math.max(z0-z,0,z-z0-T)))}
     let tr=0;for(let b=-1;b<=0;b++)for(let a=-1;a<=0;a++)if(!inMap(tx+a,ty+b)||grid[ty+b][tx+a]==='T')tr+=.25;
     const n=fbm(x*.045+11,z*.045+7),m=fbm(x*.09+3,z*.09+19);sp[i*3]=Math.min(1,Math.max(tr*.9,(n-.6)*3.2))+(m-.5)*.5;sp[i*3+1]=(dr<=0?1:Math.max(0,.8-dr/1.4))+(m-.5)*.3;sp[i*3+2]=.78+.44*fbm(x*.13+50,z*.13+5);GK[i]=dr<=0?1:Math.max(0,.8-dr/1.4)}
   geo.computeVertexNormals();geo.setAttribute('splat',new THREE.BufferAttribute(sp,3));
   const gm=new THREE.MeshLambertMaterial({map:TXE.grass});
   gm.onBeforeCompile=sh=>{Object.assign(sh.uniforms,{tD:{value:TXE.dirt},tG:{value:TXE.gravel}});
     sh.vertexShader='attribute vec3 splat;varying vec3 vSp;varying vec2 vW;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvSp=splat;vW=position.xz;');
     sh.fragmentShader='uniform sampler2D tD;uniform sampler2D tG;varying vec3 vSp;varying vec2 vW;\n'+sh.fragmentShader.replace('#include <map_fragment>',
       `vec4 texelColor=mapTexelToLinear(texture2D(map,vW*.21));
        if(vSp.x>.3){float dw=smoothstep(.3,.75,vSp.x);texelColor=mix(texelColor,mapTexelToLinear(texture2D(tD,vW*.27)),dw);}
        if(vSp.y>.25){float gw=smoothstep(.25,.7,vSp.y);texelColor=mix(texelColor,mapTexelToLinear(texture2D(tG,vW*.36)),gw);}
        texelColor.rgb*=vSp.z;diffuseColor*=texelColor;`)};
   world.add(new THREE.Mesh(geo,gm))}
  // asphalt with world-space texture (cracks, patches), worn edge lines, gravel shoulders, dashed centre line
  {const pos=[],uv=[],LP=[],LU=[],SP=[],SU=[];
   const quad=(P,U,a,b,c,d,ya,yb,yc,yd,us)=>{for(const[[X,Z],Y]of[[a,ya],[b,yb],[c,yc],[a,ya],[c,yc],[d,yd]]){P.push(X,heightAt(X,Z)+Y,Z);U.push(X/us,Z/us)}};
   for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(!isRoad(x,y))continue;const x0=x*T,z0=y*T,x1=x0+T,z1=z0+T;quad(pos,uv,[x0,z0],[x0,z1],[x1,z1],[x1,z0],.05,.05,.05,.05,7);
     for(const[dx,dy]of DIRS){if(isRoad(x+dx,y+dy))continue;const nx=dx,nz=dy;
       // edge segment endpoints along the tile side
       const ex=dx===0,ax=ex?x0:(dx>0?x1:x0),az=ex?(dy>0?z1:z0):z0,bx=ex?x1:ax,bz=ex?az:z1,o=(p,k)=>[p[0]+nx*k,p[1]+nz*k],A=[ax,az],Bp=[bx,bz];
       quad(LP,LU,o(A,-.3),o(Bp,-.3),o(Bp,-.2),o(A,-.2),.056,.056,.056,.056,1);
       quad(SP,SU,o(A,0),o(Bp,0),o(Bp,.6),o(A,.6),.045,.045,.008,.008,3)}}
   const mk=(P,U,mat)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));g.computeVertexNormals();world.add(new THREE.Mesh(g,mat))};
   mk(pos,uv,M.asphaltMat);mk(LP,LU,M.paint);mk(SP,SU,M.gravel)}
  {const zr=(META.ry+1)*T,xr=(META.cx+1)*T;
   for(let x=4*T;x<(W-3)*T;x+=4.5){if(Math.abs(x-xr)<3)continue;B.add(new THREE.PlaneGeometry(2.2,.11),M.paint,MX(x,heightAt(x,zr)+.058,zr,0,-Math.PI/2))}
   for(let z=3*T;z<(H-3)*T;z+=4.5){if(Math.abs(z-zr)<3)continue;B.add(new THREE.PlaneGeometry(.11,2.2),M.paint,MX(xr,heightAt(xr,z)+.058,z,0,-Math.PI/2))}}
  // utility poles with sagging wires along the main road
  {const zp=META.ry*T-1.7,WP=[],ins=[];let prev=null;
   for(let x=3*T;x<(W-3)*T;x+=22){const tx=Math.floor(x/T),ty=Math.floor(zp/T);if(!'.T'.includes(tile(tx,ty))||LAMPS.some(([lx,ly])=>Math.abs(lx-tx)<2&&Math.abs(ly-ty)<2)){continue}
     const gy=heightAt(x,zp);B.add(new THREE.CylinderGeometry(.5,.6,.4,6),HULLD,MX(x,gy+.2,zp));B.add(new THREE.CylinderGeometry(.06,.12,8,6),HULL,MX(x,gy+4,zp));for(let k=1;k<4;k++)B.add(new THREE.CylinderGeometry(.16,.16,.08,6),HULLD,MX(x,gy+k*2,zp));
     B.add(new THREE.SphereGeometry(.7,14,8,0,Math.PI*2,0,Math.PI*.35),HULL,MX(x+.3,gy+6.8,zp,0,0,-1.1));B.add(new THREE.SphereGeometry(.09,8,6),GLOWR,MX(x,gy+8.08,zp));
     const tops=null;
     if(prev&&tops)for(let k=0;k<3;k++){const a=prev[k],b=tops[k];for(let s=0;s<8;s++){const t0=s/8,t1=(s+1)/8,sag=t=>-1.6*.5*4*t*(1-t)*.5;
       WP.push(a[0]+(b[0]-a[0])*t0,a[1]+(b[1]-a[1])*t0+sag(t0),a[2]+(b[2]-a[2])*t0,a[0]+(b[0]-a[0])*t1,a[1]+(b[1]-a[1])*t1+sag(t1),a[2]+(b[2]-a[2])*t1)}}
     prev=tops;addCol({x,z:zp,r:.16,soft:true})}
   if(WP.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(WP,3));world.add(new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0x101012})))}}
  // houses: floor, ceiling, roof, walls
  for(const h of HOUSES){const x0=(h.x+.5)*T,x1=(h.x+h.w-.5)*T,z0=(h.y+.5)*T,z1=(h.y+h.h-.5)*T,cx=(x0+x1)/2,cz=(z0+z1)/2,sw=x1-x0,sd=z1-z0;
    const sid=SIDING[h.i%SIDING.length],pd=h.pad;
    B.add(uvScale(new THREE.PlaneGeometry(sw,sd),sw/2.4,sd/2.4),M.floor,MX(cx,pd+.1,cz,0,-Math.PI/2));
    B.add(new THREE.PlaneGeometry(sw,sd),M.ceil,MX(cx,pd+WALLH-.01,cz,0,Math.PI/2));
    B.add(BOX(sw+2*SL+.06,1.4,sd+2*SL+.06),M.concrete,MX(cx,pd-.62,cz));
    // roof: thin deck, then a hex-panelled dome (main modules) or a barrel vault (small huts); glow ring at the base
    {const rw=sw+2*SL+.3,rd=sd+2*SL+.3,ry=pd+WALLH;B.add(BOX(rw,.22,rd),HULLD,MX(cx,ry+.11,cz));h.roof={cx,cz,ry,rw,rd};
     for(const s of[-1,1]){B.add(BOX(rw+.02,.035,.02),GLOW,MX(cx,ry+.15,cz+s*(rd/2+.01)));B.add(BOX(.02,.035,rd+.02),GLOW,MX(cx+s*(rw/2+.01),ry+.15,cz))}
     if(h.terr){const tp=ry+.22,tr=h.terr,PT=.9;addCol({x0:cx-rw/2,x1:cx+rw/2,z0:cz-rd/2,z1:cz+rd/2,top:tp,bot:ry});
       // stairs: 11 steps along the strip, then a landing that bridges onto the roof
       const nS=11,rise=(tp-pd)/nS,run=.5,stripLo=tr.a0*T,stripHi=(tr.a0+tr.len)*T,dir=tr.flip?-1:1,aStart=tr.flip?stripHi-.25:stripLo+.25;
       const c0=tr.r*T,c1=c0+T,cMid=c0+T/2,inward=(tr.sd==='s'||tr.sd==='e')?-1:1,wallC=(tr.sd==='s'?(h.y+h.h-.5):tr.sd==='n'?(h.y+.5):tr.sd==='e'?(h.x+h.w-.5):(h.x+.5))*T;
       const put=(a1,a2,p1,p2,y0,y1,mat,col)=>{const ax0=Math.min(a1,a2),ax1=Math.max(a1,a2),px0=Math.min(p1,p2),px1=Math.max(p1,p2);const[X0,X1,Z0,Z1]=tr.alongX?[ax0,ax1,px0,px1]:[px0,px1,ax0,ax1];
         B.add(BOX(X1-X0,y1-y0,Z1-Z0),mat,MX((X0+X1)/2,(y0+y1)/2,(Z0+Z1)/2));if(col)addCol(col==='slab'?{x0:X0,x1:X1,z0:Z0,z1:Z1,top:y1,bot:y0}:{x0:X0,x1:X1,z0:Z0,z1:Z1,top:y1})};
       for(let k=0;k<nS;k++){const a1=aStart+dir*k*run,a2=a1+dir*run,y1=pd+rise*(k+1);put(a1,a2,c0+.12,c1-.12,pd-.3,y1,k%2?HULLD:HULL,true);const eo=inward>0?c0+.14:c1-.14;B.add(BOX(tr.alongX?run:.04,.025,tr.alongX?.04:run),GLOW,MX(tr.alongX?(a1+a2)/2:eo,y1+.01,tr.alongX?eo:(a1+a2)/2))}
       const l1=aStart+dir*nS*run,l2=l1+dir*1.8;put(l1,l2,wallC,inward>0?c0+.12:c1-.12,tp-.22,tp,HULLD,'slab');
       // parapet round the roof, open where the landing meets it
       const R0={x0:cx-rw/2,x1:cx+rw/2,z0:cz-rd/2,z1:cz+rd/2},gapLo=Math.min(l1,l2)-.15,gapHi=Math.max(l1,l2)+.15;
       const wallP=(X0,X1,Z0,Z1)=>{if(X1-X0<.05||Z1-Z0<.05)return;B.add(BOX(X1-X0,PT,Z1-Z0),HULL,MX((X0+X1)/2,tp+PT/2,(Z0+Z1)/2));B.add(BOX(X1-X0+.02,.04,Z1-Z0+.02),GLOW,MX((X0+X1)/2,tp+PT+.02,(Z0+Z1)/2));addCol({x0:X0,x1:X1,z0:Z0,z1:Z1,top:tp+PT,bot:tp-.05})};
       for(const side of['s','n','e','w']){const t=.14;let seg=side==='s'?[R0.x0,R0.x1,R0.z1-t,R0.z1]:side==='n'?[R0.x0,R0.x1,R0.z0,R0.z0+t]:side==='e'?[R0.x1-t,R0.x1,R0.z0,R0.z1]:[R0.x0,R0.x0+t,R0.z0,R0.z1];
         if(side===tr.sd){if(tr.alongX){wallP(seg[0],gapLo,seg[2],seg[3]);wallP(gapHi,seg[1],seg[2],seg[3])}else{wallP(seg[0],seg[1],seg[2],gapLo);wallP(seg[0],seg[1],gapHi,seg[3])}}else wallP(...seg)}
       const P=(a,p)=>tr.alongX?[a,p]:[p,a],aOut=aStart-dir*1.3;
       TERR.push({k:'terr',x:Math.min(h.x,tr.alongX?h.x:tr.r),y:Math.min(h.y,tr.alongX?tr.r:h.y),w:tr.alongX?h.w:h.w+1,h:tr.alongX?h.h+1:h.h,house:h,
         route:[P(aOut,cMid+.2),P(aStart+dir*.3,cMid+.2),P(aStart+dir*(nS*run-.3),cMid+.2),P((l1+l2)/2,cMid+.2),P((l1+l2)/2,wallC+inward*1.2),[cx,cz]],deck:{base:tp,spots:[[cx,cz]],ground:[],gy:pd}})}
     else if(!h.shed){const ra=rw/2-.15,rb=rd/2-.15,hd=Math.min(3.2,Math.max(1.8,Math.min(ra,rb)*.75));Object.assign(h.roof,{ra,rb,hd});
       B.add(new THREE.SphereGeometry(1,40,14,0,Math.PI*2,0,Math.PI/2),DOME,MX(cx,ry+.2,cz,0,0,0,ra,hd,rb));
       const ring=new THREE.TorusGeometry(1,.02,4,48);ring.rotateX(Math.PI/2);B.add(ring,GLOW,MX(cx,ry+.27,cz,0,0,0,ra+.04,1,rb+.04));B.add(ring,HULLD,MX(cx,ry+.23,cz,0,0,0,ra+.03,3,rb+.03));
       B.add(new THREE.CylinderGeometry(.5,.6,.25,12),HULLD,MX(cx,ry+.2+hd,cz));B.add(new THREE.CylinderGeometry(.03,.03,1.2,6),HULLD,MX(cx+.25,ry+.8+hd,cz));B.add(new THREE.SphereGeometry(.06,8,6),GLOWR,MX(cx+.25,ry+1.42+hd,cz));
       for(let k=0;k<3;k++){const a=k*2.1+.4;B.add(BOX(.9,.04,.6),SOLAR,MX(cx+Math.cos(a)*ra*.92,ry+.3,cz+Math.sin(a)*rb*.92,-a,-.2))}}
     else{const alongX=rw>=rd,len=(alongX?rw:rd)-.1,r=(alongX?rd:rw)/2-.05,v=new THREE.CylinderGeometry(r,r,len,24,1,true,0,Math.PI);Object.assign(h.roof,{vault:{alongX,len,r,hv:r*.7}});v.rotateZ(Math.PI/2);if(!alongX)v.rotateY(Math.PI/2);
       B.add(v,DOME,MX(cx,ry+.2,cz,0,0,0,1,.7,1));const cap=new THREE.CircleGeometry(r,24,0,Math.PI);
       for(const s of[-1,1]){B.add(cap,HULL,MX(cx+(alongX?s*len/2:0),ry+.2,cz+(alongX?0:s*len/2),alongX?Math.PI/2:0,0,0,1,.7,1));}
       for(let k=0;k<4;k++){const t=(k+.5)/4-.5,rib=new THREE.TorusGeometry(r+.02,.035,4,24,Math.PI);if(alongX)rib.rotateY(Math.PI/2);B.add(rib,HULLD,MX(cx+(alongX?t*len:0),ry+.2,cz+(alongX?0:t*len),0,0,0,1,.7,1))}}}
    // hex corner towers (solid), wall skirt and a service pipe along the long walls
    {const ex=sw/2+SL,ez=sd/2+SL;for(const sx of[-1,1])for(const sz of[-1,1]){const px=cx+sx*(ex+.05),pz=cz+sz*(ez+.05);B.add(new THREE.CylinderGeometry(.5,.56,WALLH+.9,6),HULL,MX(px,pd+(WALLH+.9)/2-.1,pz));
        B.add(new THREE.CylinderGeometry(.56,.56,.06,6),GLOW,MX(px,pd+WALLH+.55,pz));B.add(new THREE.CylinderGeometry(.42,.5,.25,6),HULLD,MX(px,pd+WALLH+.9,pz));addCol({x:px,z:pz,r:.52,h:pd+WALLH+1.03})}
     for(const s of[-1,1]){B.add(BOX(sw+2*SL+.06,.3,.04),HULLD,MX(cx,pd+.15,cz+s*(ez+.015)));B.add(BOX(.04,.3,sd+2*SL+.06),HULLD,MX(cx+s*(ex+.015),pd+.15,cz))}
     const alongX=sw>=sd;for(const s of[-1,1]){const L=(alongX?sw:sd)-1.4,p=new THREE.CylinderGeometry(.06,.06,L,8);p.rotateZ(Math.PI/2);if(!alongX)p.rotateY(Math.PI/2);
       B.add(p,HULLD,MX(cx+(alongX?0:s*(ex+.12)),pd+2.3,cz+(alongX?s*(ez+.12):0)));for(let k=0;k<4;k++){const t=(k+.5)/4-.5;B.add(BOX(.08,.14,.14),HULL,MX(cx+(alongX?t*L:s*(ex+.07)),pd+2.3,cz+(alongX?s*(ez+.07):t*L)))}}}
    if(h.lit){lampSrc.push({x:cx,y:pd+WALLH-.6,z:cz,col:0xcfe6ff,i:.8,d:9});lamps.push({x:cx,z:cz,r:Math.max(sw,sd)/2,house:h});
      B.add(new THREE.CylinderGeometry(.03,.03,.4,6),M.metal,MX(cx,pd+WALLH-.2,cz));B.add(new THREE.ConeGeometry(.3,.22,16,1,true),M.woodDark,MX(cx,pd+WALLH-.45,cz));B.add(new THREE.SphereGeometry(.09,10,8),M.lamp,MX(cx,pd+WALLH-.55,cz))}
    else if(!h.shed&&h.i%2===0)B.add(new THREE.PlaneGeometry(1.8,1.2),M.rug,MX(cx,pd+.105,cz,0,-Math.PI/2))}
  // wall segments
  const seg=BOX(T/2+SL,WALLH,2*SL);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(grid[y][x]!=='#')continue;const h=HOUSES.find(h=>x>=h.x&&x<h.x+h.w&&y>=h.y&&y<h.y+h.h)||HOUSES[0];const sid=SIDING[h.i%SIDING.length],yy=h.pad+WALLH/2;
    const c=ctr({x,y}),o=(T/2+SL)/2-SL;
    if(wl(x+1,y))B.add(seg,sid,MX(c.x+o,yy,c.z));if(wl(x-1,y))B.add(seg,sid,MX(c.x-o,yy,c.z));
    if(wl(x,y+1))B.add(seg,sid,MX(c.x,yy,c.z+o,Math.PI/2));if(wl(x,y-1))B.add(seg,sid,MX(c.x,yy,c.z-o,Math.PI/2))}
  for(const d of doors.values()){const h=HOUSES.find(h=>d.x>=h.x&&d.x<h.x+h.w&&d.y>=h.y&&d.y<h.y+h.h);buildDoor(d,B,SIDING[h.i%SIDING.length],DOORC[h.i%DOORC.length],h.pad)}
  for(const w of wins.values()){const h=HOUSES.find(h=>w.x>=h.x&&w.x<h.x+h.w&&w.y>=h.y&&w.y<h.y+h.h);buildWindow(w,B,SIDING[h.i%SIDING.length],h.pad)}
  for(const dr of drawers.values())buildDresser(dr,B);
  for(const cl of closets)buildWardrobe(cl,B);
  // cover structures (see tryGen): every tile gets a box collider with its own top, so steps can be climbed
  {const CONT=[0xb8642a,0x2a6a72,0x7a848c,0xc8a030,0x4a5a6a].map(c=>L_({map:TX_.siding,color:c}));
   const tileBox=(tx,ty,top)=>addCol({x0:tx*T+.02,x1:tx*T+T-.02,z0:ty*T+.02,z1:ty*T+T-.02,top});
   for(const c of COVER){const x0=c.x*T,z0=c.y*T,w=c.w*T,d=c.h*T,cx=x0+w/2,cz=z0+d/2,gy=Math.min(heightAt(x0,z0),heightAt(x0+w,z0),heightAt(x0,z0+d),heightAt(x0+w,z0+d),heightAt(cx,cz));
     const box=(bx,by,bz,sx,sy,sz,mat)=>B.add(BOX(sx,sy,sz),mat,MX(bx,by,bz));
     // shared helpers for the bigger structures: local u runs along the long side, v across; boxes become mesh + collider
     const Lu=Math.max(c.w,c.h)*T,Lv=Math.min(c.w,c.h)*T,corn=[[x0,z0],[x0+w,z0],[x0,z0+d],[x0+w,z0+d],[cx,cz]].map(([a,b])=>heightAt(a,b)),base=Math.max(...corn)+.05,low=Math.min(...corn);
     const W2=(u,v)=>{if(c.flip)u=Lu-u;return c.rot?[x0+v,z0+u]:[x0+u,z0+v]};
     const K=(u0,u1,v0,v1,y0,y1,mat,col)=>{const[a0,b0]=W2(u0,v0),[a1,b1]=W2(u1,v1),xa=Math.min(a0,a1),xb=Math.max(a0,a1),za=Math.min(b0,b1),zb=Math.max(b0,b1);
       if(mat)B.add(BOX(xb-xa,y1-y0,zb-za),mat,MX((xa+xb)/2,(y0+y1)/2,(za+zb)/2));if(col){const o={x0:xa,x1:xb,z0:za,z1:zb,top:y1};if(col==='bot')o.bot=y0;addCol(o)}};
     const foundation=()=>K(0,Lu,0,Lv,low-.4,base,HULLD,'top');
     if(c.k==='hq'){// two-storey command post: ground room with doors/windows, inner stair, open firing deck with parapet, half canopy
       const F=base,t=.3,H1=2.8,SLB=3.0,P=1.1;foundation();
       const wall=(u0,u1,v0,v1,gaps)=>{// gaps: [a,b,y0,y1] openings along the wall's long direction
         const alongU=(u1-u0)>(v1-v0),len=alongU?u1-u0:v1-v0,st=alongU?u0:v0;let cur=0;const segs=[];const gs=(gaps||[]).slice().sort((p,q)=>p[0]-q[0]);
         for(const g of gs){if(g[0]>cur)segs.push([cur,g[0],0,H1]);if(g[2]>0)segs.push([g[0],g[1],0,g[2]]);if(g[3]<H1)segs.push([g[0],g[1],g[3],H1]);cur=g[1]}if(cur<len)segs.push([cur,len,0,H1]);
         for(const[a,b,y0,y1]of segs){const A=st+a,Bq=st+b;if(alongU)K(A,Bq,v0,v1,F+y0,F+y1,HULL,y0>0?'bot':'top');else K(u0,u1,A,Bq,F+y0,F+y1,HULL,y0>0?'bot':'top')}};
       wall(0,Lu,0,t,[[3.3,4.7,0,2.2],[1.0,2.3,1.0,2.0],[5.7,7.0,1.0,2.0]]);wall(0,Lu,Lv-t,Lv,[[1.7,2.9,0,2.2],[4.6,6.2,1.0,2.0]]);
       wall(0,t,0,Lv,[]);wall(Lu-t,Lu,0,Lv,[[2.3,3.7,1.0,2.0]]);
       // stair: 9 steps of 0.3 m along the u=0 wall, climbing toward the front
       const s0=Lv-t-1.0;for(let k=1;k<=9;k++){K(t,1.5,s0-.35*k,s0-.35*(k-1),F,F+.3*k,HULLD,'top');K(t,1.5,s0-.35*(k-1)-.02,s0-.35*(k-1),F+.3*k-.03,F+.3*k,GLOW)}const sv=s0-.35*9;
       // upper floor slab with the stairwell left open, plus a rail along the stairwell
       K(1.5,Lu,0,Lv,F+H1,F+SLB,HULLD,'bot');K(0,1.5,0,sv,F+H1,F+SLB,HULLD,'bot');K(1.5,1.56,sv,Lv-t,F+SLB,F+SLB+1.0,HULLD,'bot');
       // parapet with gaps, cover panels at the corners, glow line
       const par=(u0,u1,v0,v1)=>K(u0,u1,v0,v1,F+SLB,F+SLB+P,HULL,'bot');par(0,3.2,0,t);par(4.8,Lu,0,t);par(0,Lu,Lv-t,Lv);par(0,t,0,Lv);par(Lu-t,Lu,0,2.2);par(Lu-t,Lu,3.8,Lv);
       for(const[u,v]of[[0,0],[Lu-.9,0],[0,Lv-.9],[Lu-.9,Lv-.9]])K(u-(u?0:.03),u+.9+(u?.03:0),v-(v?0:.03),v+.9+(v?.03:0),F+SLB,F+SLB+2.0,HULLD,'bot');
       K(0,Lu,-.02,0,F+SLB+P-.06,F+SLB+P-.02,GLOW);K(0,Lu,Lv,Lv+.02,F+SLB+P-.06,F+SLB+P-.02,GLOW);
       // canopy over the stair half on four posts
       for(const[u,v]of[[.95,.35],[3.7,.35],[.95,Lv-.55],[3.7,Lv-.55]])K(u,u+.2,v,v+.2,F+SLB,F+5.6,HULLD,'bot');K(-.1,4.1,-.1,Lv+.1,F+5.6,F+5.8,HULL,'bot');K(-.1,4.1,Lv*.5-.02,Lv*.5+.02,F+5.82,F+5.86,GLOW);
       // inside: floor plate, light, door/window light strips
       K(t,Lu-t,t,Lv-t,F-.02,F+.01,M.floor);const[lx,lz]=W2(Lu*.6,Lv*.5);lampSrc.push({x:lx,y:F+2.5,z:lz,col:0xcfe6ff,i:.9,d:9});B.add(BOX(1.2,.05,.3),GLOWW,MX(lx,F+2.77,lz));
       K(3.2,4.8,-.03,0,F+2.25,F+2.3,GLOW);K(1.6,3.0,Lv,Lv+.03,F+2.25,F+2.3,GLOW);
       c.deck={base:F+SLB,spots:[W2(Lu*.65,Lv*.3),W2(Lu*.8,Lv*.7),W2(Lu*.45,Lv*.55)],ground:[W2(Lu*.6,Lv*.5),W2(Lu*.85,Lv*.3)],gy:F};
       c.route=[W2(4,-1.3),W2(4,.8),W2(2.3,Lv-.8),W2(.9,Lv-.8),W2(1.1,sv-.45),W2(2.6,sv-.45),W2(Lu*.65,Lv*.35)]}
     else if(c.k==='gantry'){// two stepped towers joined by a railed bridge 3.6 m up
       const F=base;foundation();const hs=[1.2,2.4,3.6,null,3.6,2.4,1.2],cm=CONT[(c.v*5)|0];
       hs.forEach((h,i)=>{const u0=i*T+.02,u1=(i+1)*T-.02;if(h===null){K(u0+.01,u1-.01,.1,Lv-.1,F+3.4,F+3.6,HULLD,'bot');K(u0,u1,.05,.12,F+3.6,F+4.6,HULL,'bot');K(u0,u1,Lv-.12,Lv-.05,F+3.6,F+4.6,HULL,'bot');
           K(u0,u1,.03,.05,F+4.5,F+4.55,GLOW);K(u0,u1,Lv-.05,Lv-.03,F+4.5,F+4.55,GLOW);return}
         K(u0,u1,.02,Lv-.02,F,F+h,h<2?HULLD:cm,'top');K(u0-.01,u1+.01,-.01,Lv+.01,F+h-.03,F+h+.015,HULL)});
       for(const i of[2,4]){const u=i*T+T/2;K(u-.03,u+.03,Lv/2-.03,Lv/2+.03,F+3.6,F+5.0,HULLD);const[a,b2]=W2(u,Lv/2);B.add(new THREE.SphereGeometry(.07,8,6),GLOWR,MX(a,F+5.05,b2))}
       c.deck={base:F+3.6,spots:[W2(3*T+T/2,Lv/2)],ground:[],gy:F};c.route=[W2(-1.3,Lv/2),W2(T/2,Lv/2),W2(T*1.5,Lv/2),W2(T*2.5,Lv/2),W2(T*3.5,Lv/2)]}
     else if(c.k==='bunker'){// three-walled bunker with a roof, climbable from a crate at the back
       const F=base;foundation();K(0,Lu,Lv-.4,Lv,F,F+1.5,HULLD,'top');K(0,.4,0,Lv-.4,F,F+1.49,HULLD,'top');K(Lu-.4,Lu,0,Lv-.4,F,F+1.49,HULLD,'top');K(.4,Lu-.4,0,.35,F,F+.9,HULL,'top');
       for(const[u,v]of[[.5,.45],[Lu-.7,.45]])K(u,u+.2,v,v+.2,F,F+2.2,HULLD,'top');K(-.1,Lu+.1,-.1,Lv+.1,F+2.2,F+2.4,HULL,'bot');K(-.1,Lu+.1,-.12,-.1,F+2.25,F+2.3,GLOW);
       K(Lu*.5-.7,Lu*.5+.7,Lv,Lv+1.3,F,F+1.2,CONT[(c.v*5)|0],'top');
       c.deck={base:F+2.4,spots:[],ground:[W2(Lu*.5,Lv*.45)],gy:F};c.route=[W2(Lu/2,Lv+2.4),W2(Lu/2,Lv+.65),W2(Lu/2,Lv-.2),W2(Lu/2,Lv-1.3)]}
     else if(c.k==='ship'){// crashed dropship: hull too tall to jump, wings as steps onto its back, tail fins, nose, engines
       const F=low;const SH=CONT[2];K(2,10,1.6,Lv-1.6,F,F+2.8,HULL,'top');K(2.2,9.8,1.5,Lv-1.5,F+2.3,F+2.6,HULLD);
       K(10,11.6,2.1,Lv-2.1,F,F+2.0,HULL,'top');K(11.6,12,2.5,Lv-2.5,F,F+1.4,HULLD,'top');K(10.2,11.2,2.0,Lv-2.0,F+1.5,F+1.9,M.carGlass);
       K(4,8,0,1.6,F,F+1.2,HULLD,'top');K(4,8,Lv-1.6,Lv,F,F+1.2,HULLD,'top');K(4,8,-.02,0,F+1.0,F+1.05,GLOW);K(4,8,Lv,Lv+.02,F+1.0,F+1.05,GLOW);
       K(0,2,2.5,Lv-2.5,F,F+3.4,HULLD,'top');K(.2,1.6,1.0,1.4,F+1.0,F+2.6,HULL,'top');K(.2,1.6,Lv-1.4,Lv-1.0,F+1.0,F+2.6,HULL,'top');
       for(const v of[2.1,Lv-2.1]){const[a,b2]=W2(1.7,v);const e=new THREE.CylinderGeometry(.5,.62,.9,12);e.rotateZ(Math.PI/2);if(c.rot)e.rotateY(Math.PI/2);B.add(e,HULLD,MX(a,F+1.2,b2));B.add(new THREE.CircleGeometry(.42,12),GLOWR,MX(a+(c.rot?0:(c.flip?.46:-.46)),F+1.2,b2+(c.rot?(c.flip?.46:-.46):0),c.rot?(c.flip?0:Math.PI):(c.flip?Math.PI/2:-Math.PI/2)))}
       for(let k=0;k<5;k++){const[a,b2]=W2(3+k*1.5,Lv/2);B.add(BOX(.5,.04,.25),GLOW,MX(a,F+2.82,b2))}
       for(const[u,v,h]of[[13,1,.6],[-1,4.5,.8],[6,-1.2,.5]]){const[a,b2]=W2(Math.min(Lu-.2,Math.max(.2,u)),Math.min(Lv-.2,Math.max(.2,v)));B.add(BOX(.8,h,.6),HULLD,MX(a,F+h/2,b2,c.v*3))}
       c.deck={base:F+2.8,spots:[W2(6,Lv/2)],ground:[],gy:F};c.route=[W2(6,-1.3),W2(6,.8),W2(6,2.3),W2(6,Lv/2)]}
     else if(c.k==='tower'){// three tiles along the long axis: crate 1.2 m, container 2.4 m, stacked container 3.6 m
       const tiles=[];for(let i=0;i<3;i++){const i2=c.flip?2-i:i;tiles.push(c.rot?[c.x,c.y+i2]:[c.x+i2,c.y])}const hs=[1.2,2.4,3.6],cm=CONT[(c.v*5)|0];
       const ctr2=([tx,ty])=>[tx*T+T/2,ty*T+T/2];
       {const[a,b]=ctr2(tiles[0]);box(a,gy+.4,b,1.9,1.6,1.9,HULLD);box(a,gy+1.21,b,1.94,.04,1.94,HULL);B.add(BOX(1.96,.03,.03),GLOW,MX(a,gy+1.0,b+.97));tileBox(...tiles[0],gy+1.2)}
       {const[a1,b1]=ctr2(tiles[1]),[a2,b2]=ctr2(tiles[2]),mx=(a1+a2)/2,mz=(b1+b2)/2,L=c.rot?[1.96,3.96]:[3.96,1.96];box(mx,gy+1.0,mz,L[0],2.8,L[1],cm);box(mx,gy+2.42,mz,L[0]+.04,.05,L[1]+.04,HULLD);tileBox(...tiles[1],gy+2.4)}
       {const[a,b]=ctr2(tiles[2]);box(a,gy+3.0,b,1.96,1.2,1.96,CONT[(((c.v*5)|0)+2)%5]);box(a,gy+3.62,b,2.0,.05,2.0,HULLD);for(const s of[-1,1]){B.add(BOX(2.0,.5,.05),HULLD,MX(a,gy+3.9,b+s*.98));}B.add(BOX(2.02,.03,.03),GLOW,MX(a,gy+4.15,b+.99));tileBox(...tiles[2],gy+3.6)}
       {const q=tiles.map(ctr2);c.route=[[q[0][0]+(q[0][0]-q[1][0])*.75,q[0][1]+(q[0][1]-q[1][1])*.75],...q]}
       const[ta,tb]=ctr2(tiles[2]);B.add(new THREE.CylinderGeometry(.03,.03,1.4,6),HULLD,MX(ta+.8,gy+4.3,tb-.8));B.add(new THREE.SphereGeometry(.07,8,6),GLOWR,MX(ta+.8,gy+5.02,tb-.8))}
     else if(c.k==='wall'){// waist-high barricade along a random axis (sits on the ground at its centre; base sinks into slopes)
       const along=c.rot,L=1.96,gy=heightAt(cx,cz);B.add(BOX(along?.5:L,2.0,along?L:.5),HULLD,MX(cx,gy+.15,cz));B.add(BOX(along?.56:L+.04,.08,along?L+.04:.56),HULL,MX(cx,gy+1.16,cz));
       for(const s of[-1,1])B.add(BOX(along?.02:L,.04,along?L:.02),GLOW,MX(cx+(along?s*.26:0),gy+.9,cz+(along?0:s*.26)));
       addCol(along?{x0:cx-.28,x1:cx+.28,z0:cz-.98,z1:cz+.98,top:gy+1.15}:{x0:cx-.98,x1:cx+.98,z0:cz-.28,z1:cz+.28,top:gy+1.15})}
     else if(c.k==='cont'){// shipping container with a step crate at one end: crate 1.25 m -> container roof 2.55 m; stacked ones keep half the lower roof as a ledge
       const ax=!c.rot,ts=[0,1,2].map(i=>[c.x+(ax?i:0),c.y+(ax?0:i)]),si=c.flip?0:2,ct=ts.filter((_,i)=>i!==si),sd=si===2?1:-1;
       const ccx=(ct[0][0]+ct[1][0]+1)*T/2,ccz=(ct[0][1]+ct[1][1]+1)*T/2,L=ax?[3.9,1.96]:[1.96,3.9],cm=CONT[(c.v*5)|0];
       const gy2=Math.min(heightAt(ccx-(ax?1.7:.7),ccz-(ax?.7:1.7)),heightAt(ccx+(ax?1.7:.7),ccz+(ax?.7:1.7)),heightAt(ccx,ccz));
       box(ccx,gy2+1.1,ccz,L[0],2.8,L[1],cm);box(ccx,gy2+2.52,ccz,L[0]+.04,.05,L[1]+.04,HULLD);for(const s2 of[-1,1])B.add(BOX(ax?.04:1.98,2.2,ax?1.98:.04),HULLD,MX(ccx+(ax?s2*1.95:0),gy2+1.2,ccz+(ax?0:s2*1.95)));
       for(let k=-3;k<=3;k++)B.add(BOX(ax?.05:1.98,2.3,ax?1.98:.05),HULLD,MX(ccx+(ax?k*.5:0),gy2+1.25,ccz+(ax?0:k*.5)));
       const st=c.v>.65;if(st){const ux=ccx+(ax?-sd*.98:0),uz=ccz+(ax?0:-sd*.98);box(ux,gy2+3.85,uz,ax?1.92:1.86,2.6,ax?1.86:1.92,CONT[(((c.v*5)|0)+3)%5]);B.add(BOX(ax?1.9:.03,.03,ax?.03:1.9),GLOW,MX(ux+(ax?0:.94),gy2+4.4,uz+(ax?.94:0)))}
       const[sx,sy]=ts[si],scx=(sx+.5)*T,scz=(sy+.5)*T,sg=heightAt(scx,scz);box(scx,sg+.55,scz,1.5,1.3,1.5,HULL);B.add(BOX(1.52,.03,.03),GLOW,MX(scx,sg+1.1,scz+.76));
       tileBox(sx,sy,sg+1.25);const near=ts[1],far=ts[si===2?0:2];tileBox(near[0],near[1],gy2+2.55);tileBox(far[0],far[1],gy2+(st?5.1:2.55));
       const W3=(t,o)=>[(t[0]+.5)*T+(ax?o:0),(t[1]+.5)*T+(ax?0:o)];c.route=[W3(ts[si],sd*1.6),W3(ts[si],0),W3(near,0)];c.deck={base:gy2+2.55,spots:[],ground:[],gy:gy2}}
     else if(c.k==='crate'){// cargo crate with a smaller box on top
       const gy=heightAt(cx,cz);box(cx,gy+.3,cz,1.5,2.0,1.5,CONT[(((c.v*5)|0)+1)%5]);box(cx,gy+1.31,cz,1.56,.05,1.56,HULLD);for(const s of[-1,1]){box(cx+s*.765,gy+.64,cz,.06,1.28,1.58,HULLD);box(cx,gy+.635,cz+s*.765,1.57,1.27,.06,HULLD)}
       if(c.v>.5){box(cx-.2,gy+1.6,cz+.15,.7,.55,.7,HULL);B.add(BOX(.72,.03,.03),GLOW,MX(cx-.2,gy+1.75,cz+.51));addCol({x0:cx-.56,x1:cx+.16,z0:cz-.21,z1:cz+.51,top:gy+1.88,bot:gy+1.3})}addCol({x0:cx-.78,x1:cx+.78,z0:cz-.78,z1:cz+.78,top:gy+1.3})}
     else{// rock outcrop: four boulders stepping up 1.2 -> 1.9 -> 2.6 m, so it can be climbed from the low corner
       const g2=rockGeo(),ts=[[c.x,c.y],[c.x+1,c.y],[c.x+1,c.y+1],[c.x,c.y+1]],k0=(c.v*4)|0,HS=[1.2,1.9,2.6,1.9];
       ts.forEach(([xx,yy],k)=>{const h=HS[(k-k0+4)%4],tx=xx*T+T/2,tz=yy*T+T/2,gh=Math.min(heightAt(tx-.6,tz-.6),heightAt(tx+.6,tz+.6),heightAt(tx,tz));
         const bx=tx+(cx-tx)*.12,bz=tz+(cz-tz)*.12;B.add(g2,M.rock,MX(bx,gh-.12,bz,c.v*6+k*1.7,0,0,1.18,(h+.12)/.78,1.18));
         addCol({x0:xx*T+.02,x1:xx*T+T-.02,z0:yy*T+.02,z1:yy*T+T-.02,top:gh+h,dome:{x:bx,z:bz,r:1.3,y0:gh-.12}})})}}}
  // district ground: concrete slab with lane stripes in the yard, a dark pad with light strips at the landing pad, beacons round the post and the pit rim
  {const PL=STD({color:0x6a7078,roughness:.85,metalness:.1,map:TX_.concrete}),PD=STD({color:0x30343c,roughness:.6,metalness:.4}),YEL=new THREE.MeshBasicMaterial({color:0xd8a830});
   const beacon=(x,z)=>{const y=heightAt(x,z);B.add(new THREE.CylinderGeometry(.06,.09,1.1,6),HULLD,MX(x,y+.55,z));B.add(new THREE.SphereGeometry(.09,8,6),GLOWR,MX(x,y+1.15,z));lampSrc.push({x,y:y+1.2,z,col:0xff6a4a,i:.35,d:5})};
   for(const d of DIST){const X0=d.x0*T,X1=d.x1*T,Z0=d.y0*T,Z1=d.y1*T,cx=(X0+X1)/2,cz=(Z0+Z1)/2,w=X1-X0,h=Z1-Z0;
     if(d.k==='yard'){B.add(BOX(w,.04,h),PL,MX(cx,d.pad,cz));for(let x=X0+4;x<X1-1;x+=8)B.add(BOX(.18,.012,h-1),YEL,MX(x,d.pad+.026,cz));B.add(BOX(w-1,.012,.18),YEL,MX(cx,d.pad+.026,Z0+.6));B.add(BOX(w-1,.012,.18),YEL,MX(cx,d.pad+.026,Z1-.6))}
     else if(d.k==='pad'){B.add(BOX(w,.04,h),PD,MX(cx,d.pad,cz));for(const[a,b,sx,sz]of[[cx,Z0+.3,w-.6,.12],[cx,Z1-.3,w-.6,.12],[X0+.3,cz,.12,h-.6],[X1-.3,cz,.12,h-.6]])B.add(BOX(sx,.012,sz),GLOW,MX(a,d.pad+.026,b));
       for(let k=0;k<6;k++){const a=k*Math.PI/3,a2=a+Math.PI/3,r=Math.min(w,h)*.32,x1=cx+Math.cos(a)*r,z1=cz+Math.sin(a)*r,x2=cx+Math.cos(a2)*r,z2=cz+Math.sin(a2)*r;B.add(BOX(Math.hypot(x2-x1,z2-z1),.012,.25),YEL,MX((x1+x2)/2,d.pad+.026,(z1+z2)/2,-Math.atan2(z2-z1,x2-x1)))}}
     else for(let k=0;k<10;k++){const a=k/10*6.283,x=cx+Math.cos(a)*w*.52,z=cz+Math.sin(a)*h*.52;if(tile(TX(x),TX(z))==='.')beacon(x,z)}}}
  // trees (conifers and broadleaf), forest beyond the map edge, bushes, rocks, grass tufts
  VEG.sp.length=0;VEG.cx=1e9;
  {const r=mulberry(5),con=[],brd=[],bushes=[],rocks=[],C=()=>new THREE.Color();
   const tint=(p,k)=>{p.c=k?C().setHSL(.72+r()*.2,.35+r()*.3,.55+r()*.25):C().setHSL(r()<.6?.5+r()*.06:.74+r()*.08,.6+r()*.3,.5+r()*.25);return p};
   const add=(x,z,inside,broadP)=>{const b=r()<broadP,p=tint({x,z,y:heightAt(x,z)-.08,s:(b?.85:.8)+r()*(b?.45:.65),ry:r()*6.28,tx:(r()-.5)*.06,tz:(r()-.5)*.06},b);(b?brd:con).push(p);
     if(inside&&x>2*T&&z>2*T&&x<(W-2)*T&&z<(H-2)*T)addCol({x:x+(b?Math.sin(2.4)*.15*p.s:0),z,r:b?.3*p.s:.5*p.s})};
   for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(grid[y][x]!=='T')continue;const border=x<2||y<2||x>=W-2||y>=H-2;add(x*T+T/2+(r()-.5)*.9,y*T+T/2+(r()-.5)*.9,true,border?.18:.4)}
   for(let z=-HOFF+2;z<H*T+HOFF-2;z+=3.4)for(let x=-HOFF+2;x<W*T+HOFF-2;x+=3.4){if(x>-1&&z>-1&&x<W*T+1&&z<H*T+1)continue;const jx=x+(r()-.5)*2.6,jz=z+(r()-.5)*2.6,ed=Math.max(-jx,-jz,jx-W*T,jz-H*T);if(fbm(jx*.05,jz*.05)<.32+ed*.006)continue;add(jx,jz,false,.2)}
   for(let y=3;y<H-3;y++)for(let x=3;x<W-3;x++){if(grid[y][x]!=='.')continue;
     const nearWall=DIRS.some(([a,b])=>'#w'.includes(tile(x+a,y+b))),nearDoor=[[0,0],...DIRS].some(([a,b])=>DIRS.some(([c,d])=>tile(x+a+c,y+b+d)==='d')),nearTree=DIRS.some(([a,b])=>tile(x+a,y+b)==='T');
     if(nearDoor)continue;if((nearWall&&r()<.45)||(nearTree&&r()<.3)||r()<.03){const bx=x*T+T/2+(r()-.5)*1.2,bz=y*T+T/2+(r()-.5)*1.2;bushes.push(tint({x:bx,z:bz,y:heightAt(bx,bz)-.05,s:.55+r()*.5,sy:.8+r()*.4,ry:r()*6.28},1))}
     if((nearTree&&r()<.12)||r()<.02){const rx=x*T+r()*T,rz=y*T+r()*T,s=.14+r()*.32;rocks.push({x:rx,z:rz,y:heightAt(rx,rz)-.04,s,sy:.7+r()*.5,ry:r()*6.28,c:C().setHSL(.08,.05+r()*.06,.62+r()*.3)})}}
   for(let i=0;i<W*H/14;i++){const x=-HOFF/2+r()*(W*T+HOFF),z=-HOFF/2+r()*(H*T+HOFF),tx=Math.floor(x/T),ty=Math.floor(z/T);if(inMap(tx,ty)&&grid[ty][tx]!=='T')continue;const s=.2+r()*.5;rocks.push({x,z,y:heightAt(x,z)-.06,s,sy:.6+r()*.5,ry:r()*6.28,c:C().setHSL(.08,.05+r()*.06,.55+r()*.3)})}
   vegSpecies(con,crystalGeo(true),crystalGeo(false),CRY,94,CRY);vegSpecies(brd,fungusGeo(true),fungusGeo(false),FUN,94,FUN);for(const b of bushes)b.c=C().setHSL(.45+r()*.4,.6,.6+r()*.2);vegSpecies(bushes,bulbGeo(),null,BULB,75);vegSpecies(rocks,rockGeo(),null,M.rock,85);
   const gt=new THREE.InstancedMesh(sproutGeo(),CRY,1500);gt.userData.max=1000;gt.frustumCulled=false;gt.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(1500*3),3);gt.count=0;world.add(gt);VEG.grass=gt;
   VEG.counts={con:con.length,brd:brd.length,bush:bushes.length,rock:rocks.length}}
  // street lamps
  for(const[x,y]of LAMPS){const c=ctr({x,y});const dir=DIRS.find(([a,b])=>tile(x+a,y+b)==='=')||[0,1];const ry=Math.atan2(dir[0],dir[1]);
    const G=MX(c.x,heightAt(c.x,c.z),c.z,ry);B.add(new THREE.CylinderGeometry(.1,.14,4.8,6),HULLD,rel(G,0,2.4,0));B.add(BOX(.03,3.6,.03),GLOW,rel(G,0,2.6,.12));B.add(BOX(.1,.1,1.1),HULL,rel(G,0,4.75,.5));
    B.add(BOX(.36,.1,.6),HULL,rel(G,0,4.7,1.05));B.add(new THREE.PlaneGeometry(.3,.5),GLOWW,rel(G,0,4.645,1.05,0,Math.PI/2));
    B.add(new THREE.CylinderGeometry(.3,.36,.3,6),HULLD,rel(G,0,.15,0));addCol({x:c.x,z:c.z,r:.14,soft:true});
    const hp=new THREE.Vector3().setFromMatrixPosition(rel(G,0,4.5,1.05));lampSrc.push({x:hp.x,y:hp.y,z:hp.z,col:0x9ad8ff,i:1.1,d:14});lamps.push({x:hp.x,z:hp.z,r:9})}
  // parked cars, escape van, police car
  for(const c of CARS){const cx=c.dir==='x'?(c.tx+1)*T:c.tx*T+T/2,cz=c.dir==='x'?c.ty*T+T/2:(c.ty+1)*T,ry=c.dir==='x'?0:-Math.PI/2;
    sedan(B,MX(cx,heightAt(cx,cz)+.03,cz,ry,0,(c.tx%3===0)?.03:0),c.col);{const h=heightAt(cx,cz)+.03,X=c.dir==='x';
    addCol(X?{x0:cx-2.15,x1:cx+2.15,z0:cz-.9,z1:cz+.9,top:h+1.0}:{x0:cx-.9,x1:cx+.9,z0:cz-2.15,z1:cz+2.15,top:h+1.0});
    addCol(X?{x0:cx-1.25,x1:cx+1.15,z0:cz-.75,z1:cz+.75,top:h+1.45}:{x0:cx-.75,x1:cx+.75,z0:cz-1.25,z1:cz+1.15,top:h+1.45})}}
  {const cx=(VANT.tx+1)*T,cz=VANT.ty*T+T/2;van={x:VANT.tx,y:VANT.ty,cx,cz};boxVan(B,MX(cx,heightAt(cx,cz)+.03,cz,0));{const h=heightAt(cx,cz)+.03;addCol({x0:cx-2.45,x1:cx+1.1,z0:cz-1,z1:cz+1,top:h+2.3});addCol({x0:cx+1.1,x1:cx+2.45,z0:cz-1,z1:cz+1,top:h+1.15})}
    lampSrc.push({x:cx-3.2,y:1,z:cz,col:0xff4030,i:.55,d:7});lamps.push({x:cx,z:cz,r:5})}
  // phone box
  {const c=ctr(phone),G=MX(c.x,heightAt(c.x,c.z),c.z,Math.PI/2);B.add(new THREE.CylinderGeometry(.6,.66,.12,6),HULLD,rel(G,0,.06,0));
    B.add(BOX(.7,2.3,.5),HULL,rel(G,0,1.2,0));B.add(BOX(.74,.12,.54),HULLD,rel(G,0,2.38,0));B.add(BOX(.56,.8,.02),GLOW,rel(G,0,1.45,-.26));B.add(BOX(.6,.04,.02),GLOWW,rel(G,0,2.2,-.26));
    B.add(BOX(.4,.12,.18),HULLD,rel(G,0,.95,-.3,0,.4));
    const lampM=new THREE.Mesh(BOX(.12,.06,.03),new THREE.MeshBasicMaterial({color:0x333333}));lampM.matrixAutoUpdate=false;lampM.matrix.copy(rel(G,.08,1.5,-.3));world.add(lampM);phone.lamp=lampM;
    boxCol(c.x,c.z,.58,.58,heightAt(c.x,c.z)+2.55)}
  // gas can
  for(const cn of S.cans)placeCan(cn);
  B.build(world);
  world.traverse(o=>{if(o.isMesh){const tr=o.material&&(o.material.transparent||o.material.isMeshBasicMaterial);o.castShadow=!tr;o.receiveShadow=true}});
  // police car (own batch so it can stay hidden until it arrives)
  police.mesh=new THREE.Group();const PB=Batch();const pc=ctr(police);
  sedan(PB,MX(0,0,0),0xeeeeee,{lights:true});for(const s of[-1,1])PB.add(BOX(1.6,.32,.02),M.rubber,MX(-.1,.62,s*.87));
  PB.build(police.mesh);police.mesh.position.set(pc.x+T/2,heightAt(pc.x+T/2,pc.z)+.03,pc.z);
  police.bars=[0xd62020,0x2050e0].map((col,i)=>{const b=new THREE.Mesh(BOX(.25,.12,.5),new THREE.MeshBasicMaterial({color:col}));b.position.set(-.1,1.52,i?.3:-.3);police.mesh.add(b);return b});
  police.mesh.visible=false;world.add(police.mesh);
  police.light=new THREE.PointLight(0xd62020,0,14,1.5);police.light.position.set(pc.x,heightAt(pc.x,pc.z)+2.2,pc.z);world.add(police.light);
}

