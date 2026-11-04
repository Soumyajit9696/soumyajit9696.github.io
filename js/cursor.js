/* ============================================================
   Atom Orbiter — Soumyajit Das portfolio
   ------------------------------------------------------------
   The pointer is a live atom — the site's own mark, animated.
   One canvas, zero dependencies.

   The atom
   • Nucleus — the true pointer: a breathing ink dot. Over
     links it becomes a target ring; over text a caret beam.
   • Orbits — three elliptical shells (0°/60°/120°, the atom
     glyph) riding a damped spring a = k·Δx − c·v behind the
     pointer (semi-implicit Euler, ζ ≈ 0.58 — lively, tiny
     overshoot). The system precesses and squashes along its
     velocity vector — length contraction while it moves.
   • Electrons — one per orbit, opposite spins, each dragging
     a fading trail. Orbital frequency follows the pointer's
     kinetic energy: move fast, the atom spins up.
   • Comet wake — soft particles shed along the pointer path,
     decaying with viscous drag. Additive glow in dark mode.
   • Energy states — hover a link: the atom is *excited* —
     shells expand and tint accent, electrons jump to the
     spectrum colours (yellow/pink/mint) and race. Idle 1.6 s:
     the system cools — shells contract, precession slows.
   • Emission — every click radiates: two photon ring
     wavefronts plus a spectrum particle burst.
   • Gravity wells — interactive elements pull the atom in.

   Lab tools
   • R — reading guide (dashed full-width skimming line)
   • M — caliper: click two points, distance in px and cm
     (96 dpi CSS reference) + angle in degrees
   • Esc — clear tools

   Auto-themes with dark mode, never activates on touch
   devices or when prefers-reduced-motion is set (native
   cursor instead — the whole point is motion).
   ============================================================ */
(function(){
"use strict";
window.__ATOM_VER="20261102";   /* check in console: __ATOM_VER — undefined = stale cache */
if(!window.matchMedia||!matchMedia("(hover:hover) and (pointer:fine)").matches)return;
if(document.getElementById("cur-root"))return;
if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;   /* native cursor */

/* ---------- physics constants ---------- */
var SPRING_K=400,     /* orbit stiffness 1/s² — ζ ≈ 0.62, tight tracking */
    SPRING_C=25,      /* orbit damping 1/s²                          */
    TRAIL_GAP=6,      /* px of travel per comet particle            */
    TRAIL_MAX=150,    /* comet budget                                */
    SPAWN_CAP=6,      /* particles per frame max                     */
    ORBIT_A=21,       /* ellipse semi-major axis, px                 */
    ORBIT_B=7.6,      /* ellipse semi-minor axis, px                 */
    IDLE_MS=1600;

/* ---------- injected styles ---------- */
var st=document.createElement("style");
st.textContent=
'html.cur-x,html.cur-x body{cursor:none!important}'+
'html.cur-x *{cursor:none!important}'+                                  /* kill native hand on .btn/a/.soc too */
'html.cur-x input,html.cur-x textarea,html.cur-x select{cursor:text!important}'+
/* #cur-cv needs explicit css width/height:100% — a canvas is a replaced
   element, so inset:0 alone falls back to its intrinsic buffer size in css px,
   which at devicePixelRatio>1 (Windows 125-150% scaling) overflows the
   viewport and displaces the whole atom (the 1920x1080-laptop bug). */
'#cur-cv{position:fixed;inset:0;width:100%;height:100%;z-index:2147483000;pointer-events:none}'+
'#cur-read{position:fixed;left:0;right:0;top:-10px;border-top:2px dashed var(--ink);z-index:99997;pointer-events:none;display:none}'+
'#cur-read.on{display:block}'+
'#cur-read span{position:absolute;right:14px;top:-12px;padding:.25rem .55rem;font:700 .64rem/1.2 var(--font-display,monospace);letter-spacing:.08em;color:#101014;background:var(--yellow);border:2px solid #101014}'+
'#cur-msvg{position:fixed;inset:0;width:100%;height:100%;z-index:99997;pointer-events:none;display:none}'+
'#cur-msvg.on{display:block}'+
'#cur-msvg line{stroke:var(--ink);stroke-width:2;stroke-dasharray:7 5}'+
'#cur-msvg circle{fill:var(--yellow);stroke:var(--ink);stroke-width:2}'+
'.cur-mark{position:fixed;left:0;top:0;width:16px;height:16px;margin:-8px 0 0 -8px;z-index:99998;pointer-events:none;display:none}'+
'.cur-mark.on{display:block}'+
'.cur-mark::before,.cur-mark::after{content:"";position:absolute;background:var(--ink)}'+
'.cur-mark::before{left:7px;top:0;width:2px;height:16px}'+
'.cur-mark::after{left:0;top:7px;width:16px;height:2px}'+
'#cur-mchip{position:fixed;z-index:99998;pointer-events:none;display:none;padding:.3rem .55rem;font:700 .72rem/1.3 var(--font-display,monospace);color:var(--ink);background:var(--surface);border:2px solid var(--ink);box-shadow:2px 2px 0 var(--ink);white-space:nowrap;font-variant-numeric:tabular-nums;transform:translate(-50%,-135%)}'+
'#cur-mchip.on{display:block}'+
'#cur-hint{position:fixed;left:16px;bottom:16px;z-index:100002;display:none;padding:.6rem .85rem;font:600 .78rem/1.75 var(--font-body,system-ui);color:var(--ink);background:var(--surface);border:2px solid var(--ink);box-shadow:3px 3px 0 var(--ink);max-width:min(86vw,430px)}'+  /* bottom-left is clear: the Lab chip sits bottom-center */
'#cur-hint.on{display:block}'+
'#cur-hint kbd{font:700 .72rem/1 var(--font-display,monospace);padding:.18rem .38rem;border:2px solid #101014;background:var(--yellow);color:#101014;box-shadow:1.5px 1.5px 0 var(--ink);vertical-align:middle;white-space:nowrap}'+
'#cur-status{position:fixed;top:14px;left:50%;transform:translate(-50%,-8px);z-index:100003;display:flex;align-items:center;gap:.45rem;padding:.5rem .85rem;font:700 .74rem/1.3 var(--font-display,monospace);letter-spacing:.05em;color:var(--ink);background:var(--yellow);border:2px solid #101014;box-shadow:3px 3px 0 var(--ink);opacity:0;pointer-events:none;transition:opacity .18s ease,transform .18s ease;white-space:nowrap}'+
'#cur-status.on{opacity:1;transform:translate(-50%,0)}'+
'#cur-status em{font-style:normal;padding:.16rem .34rem;background:#101014;color:var(--yellow);font-size:.68rem}'+
'[data-theme="dark"] #cur-status{box-shadow:3px 3px 0 #000}';
document.head.appendChild(st);

/* ---------- DOM ---------- */
var root=document.createElement("div");
root.id="cur-root";
root.setAttribute("aria-hidden","true");
root.innerHTML=
'<canvas id="cur-cv"></canvas>'+
'<div id="cur-read"><span>READING GUIDE · SHIFT+R TO HIDE</span></div>'+
'<svg id="cur-msvg"><line id="cur-mline"/><circle id="cur-mc1" r="4"/><circle id="cur-mc2" r="4"/></svg>'+
'<div id="cur-ma" class="cur-mark"></div><div id="cur-mb" class="cur-mark"></div>'+
'<div id="cur-mchip"></div>'+
'<div id="cur-status" role="status" aria-live="polite"></div>';
document.body.appendChild(root);

var read=document.getElementById("cur-read"),msvg=document.getElementById("cur-msvg"),
    mline=document.getElementById("cur-mline"),mc1=document.getElementById("cur-mc1"),mc2=document.getElementById("cur-mc2"),
    ma=document.getElementById("cur-ma"),mb=document.getElementById("cur-mb"),
    mchip=document.getElementById("cur-mchip"),
    status=document.getElementById("cur-status");

/* ---------- canvas ---------- */
var cv=document.getElementById("cur-cv"),cx=cv.getContext("2d"),
    SIZEF=1;                          /* display-density scale for orbits */
function sizeCv(){
  /* devicePixelRatio re-read EVERY resize: it changes when the window moves
     between monitors with different Windows scaling (e.g. 1600x900 @100% <->
     1920x1080 @125%) or when the user zooms. Caching it at load left a stale
     buffer size on the new screen. */
  var dpr=devicePixelRatio||1;
  /* high-DPI screens render css px denser, so the atom reads smaller there —
     scale the orbits up gently with density (1.00 @1x … 1.15 @2x) */
  SIZEF=1+Math.min(Math.max(dpr-1,0),1)*.15;
  var d=Math.min(dpr,2);
  cv.width=Math.round(innerWidth*d);cv.height=Math.round(innerHeight*d);
  cx.setTransform(d,0,0,d,0,0);
}
sizeCv();
addEventListener("resize",sizeCv,{passive:true});
/* DPR can also change with NO viewport resize (dragging between monitors whose
   scaled CSS sizes coincide) — watch the resolution media query and re-fit. */
(function watchDPR(){
  var mq=matchMedia("(resolution:"+(devicePixelRatio||1)+"dppx)");
  function cb(){try{mq.removeEventListener("change",cb)}catch(_){}
  sizeCv();watchDPR()}
  try{mq.addEventListener("change",cb)}catch(_){try{mq.addListener(cb)}catch(_2){}}
})();

/* ---------- theme palette ---------- */
var CS=getComputedStyle(document.documentElement);
function tok(n){return CS.getPropertyValue(n).trim()}
var COL={},DARK=false;
function refreshCol(){
  COL.ink=tok("--ink")||"#101014";
  COL.accent=tok("--accent")||"#2D4BFF";
  COL.spec=[tok("--yellow")||"#FFC700",tok("--pink")||"#FF8AE2",tok("--mint")||"#8CF5C0"];
  DARK=document.documentElement.getAttribute("data-theme")==="dark";
}
refreshCol();
try{
  new MutationObserver(function(){CS=getComputedStyle(document.documentElement);refreshCol()})
    .observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
}catch(_){}

/* ---------- state ---------- */
var mx=innerWidth/2,my=innerHeight/2,   /* raw pointer (nucleus)        */
    ox=mx,oy=my,ovx=0,ovy=0,            /* orbit-system oscillator      */
    gx=mx,gy=my,                        /* spring target (well-aware)   */
    seen=false,active=false,P=0,        /* presence 0..1                */
    t=0,lastMove=0,
    energy=0,excite=0,exciteT=0,idleV=0,
    phi=0,                              /* orbit precession angle       */
    deform=0,defAng=0,
    ms=0,ax=0,ay=0,bx=0,by=0,readOn=false,
    mode="";                            /* "" | "link" | "text"         */

/* electrons — one per shell, alternating spin */
var EL=[
  {th:Math.random()*6.2832,om: 2.35,tr:[]},
  {th:Math.random()*6.2832,om:-2.90,tr:[]},
  {th:Math.random()*6.2832,om: 2.60,tr:[]}
];

/* comet wake / emission bursts / photon rings */
var PT=[],BUR=[],RIP=[],lastSX=-1,lastSY=-1;
function spawnTrail(x,y,vx,vy){
  var acc=Math.random()<.16?COL.spec[(Math.random()*3)|0]:null;
  PT.push({
    x:x+(Math.random()-.5)*4,y:y+(Math.random()-.5)*4,
    vx:vx*.05+(Math.random()-.5)*26,vy:vy*.05+(Math.random()-.5)*26,
    life:.4+Math.random()*.45,age:0,
    r:1.1+Math.random()*1.7,
    color:acc||COL.ink
  });
  if(PT.length>TRAIL_MAX)PT.splice(0,PT.length-TRAIL_MAX);
}
function clickFx(x,y){
  RIP.push({x:x,y:y,r0:5,v:150,life:.5,age:0,c:COL.accent});
  RIP.push({x:x,y:y,r0:2,v:92,life:.62,age:-.07,c:COL.ink});
  var n=12+((Math.random()*4)|0),i,a,s;
  for(i=0;i<n;i++){
    a=Math.random()*6.2832;s=110+Math.random()*180;
    BUR.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,
      life:.35+Math.random()*.4,age:0,r:1.3+Math.random()*1.6,
      color:Math.random()<.55?COL.spec[i%3]:COL.ink});
  }
  if(BUR.length>90)BUR.splice(0,BUR.length-90);
  exciteT=1;                          /* flash — shells puff out */
}

/* squash transform: local orbit coords → screen (velocity frame) */
function sq(x,y){
  if(deform<.004)return[x+ox,y+oy];
  var c=Math.cos(defAng),s=Math.sin(defAng),
      x1=x*c+y*s,y1=-x*s+y*c,
      x2=x1*(1+deform),y2=y1/(1+deform*.55);
  return[x2*c-y2*s+ox,x2*s+y2*c+oy];
}

/* ---------- hover modes (shadow-DOM aware) ---------- */
/* closest() that crosses shadow boundaries — SVG <use> icons clone their
   glyphs into a closed shadow tree, and a plain closest() from inside it
   stops at the shadow root, missing the enclosing <a>/<button>. */
function lightClosest(el,sel){
  var n=el;
  while(n){
    if(n.matches&&n.matches(sel))return n;
    n=n.host||n.parentElement;   /* ShadowRoot.host hops to the host element */
  }
  return null;
}
function setMode(m,el){
  mode=m;                             /* no gravity-well: the atom stays
                                         exactly under the pointer */
}
document.addEventListener("mouseover",function(e){
  var el=e.composedPath?e.composedPath()[0]:e.target;
  if(!el||!el.matches){setMode("",null);return}
  var inWidget=false;
  try{var rt=el.getRootNode();if(rt instanceof ShadowRoot&&rt.host&&rt.host.id==="brutal-tools")inWidget=true}catch(_){}
  if(inWidget){
    if(el.matches(".b,button,a"))return setMode("link",el);
    if(el.matches(".bar"))return setMode("link",el);
    if(el.matches("input,textarea,select"))return setMode("text",null);
    return setMode("",null);
  }
  if(el.matches('input:not([type=button]):not([type=submit]):not([type=checkbox]):not([type=radio]),textarea,select'))return setMode("text",null);
  var hit=lightClosest(el,"a,button,[role=button],summary,label");
  if(hit)return setMode("link",hit);
  setMode("",null);
},true);

/* ---------- pointer ---------- */
document.addEventListener("mousemove",function(e){
  mx=e.clientX;my=e.clientY;lastMove=Date.now();
  if(!seen){seen=true;document.documentElement.classList.add("cur-x");ox=mx;oy=my}
  active=true;
},true);
document.addEventListener("mouseout",function(e){
  if(!e.relatedTarget&&!(e.composedPath&&e.composedPath().length>1&&e.composedPath()[1]))active=false;
});
document.addEventListener("mouseover",function(){if(seen)active=true},true);

/* ---------- click = emission ---------- */
document.addEventListener("pointerdown",function(e){clickFx(e.clientX,e.clientY)},true);

/* ---------- integrator + render ---------- */
var last=performance.now(),pmx=mx,pmy=my,pvx=0,pvy=0;
function loop(now){
  var dt=Math.min(((now||last)-last)/1000,1/30);if(dt<=0)dt=.016;
  last=now||last;t+=dt;

  /* pointer velocity */
  pvx=(mx-pmx)/dt;pvy=(my-pmy)/dt;pmx=mx;pmy=my;
  var spd=Math.hypot(pvx,pvy);

  /* the orbit system always tracks the pointer exactly */
  gx=mx;gy=my;

  /* orbit spring — Hooke + viscous drag, semi-implicit Euler */
  ovx+=(SPRING_K*(gx-ox)-SPRING_C*ovx)*dt;
  ovy+=(SPRING_K*(gy-oy)-SPRING_C*ovy)*dt;
  ox+=ovx*dt;oy+=ovy*dt;

  /* energy bookkeeping */
  var eT=Math.min(spd/1500,1);
  energy+=(eT-energy)*Math.min(1,dt*(eT>energy?7:2.4));
  var xT=(mode==="link")?1:0;
  excite+=(xT-excite)*Math.min(1,dt*(xT>excite?9:3.5));
  var iT=(Date.now()-lastMove>IDLE_MS)?1:0;
  idleV+=(iT-idleV)*Math.min(1,dt*2.2);
  exciteT*=Math.exp(-5*dt);
  P+=((active?1:0)-P)*Math.min(1,dt*9);
  phi+=(0.45+energy*1.5+excite*1.1+exciteT*2)*(1-idleV*.72)*dt;
  var dT=Math.min(spd/2600,.3);
  deform+=(dT-deform)*Math.min(1,dt*10);
  if(spd>50)defAng=Math.atan2(pvy,pvx);

  /* comet wake */
  if(P>.3&&spd>40){
    if(lastSX<0){lastSX=mx;lastSY=my}
    var born=0;
    while(born<SPAWN_CAP&&Math.hypot(mx-lastSX,my-lastSY)>=TRAIL_GAP){
      var dx=mx-lastSX,dy=my-lastSY,d=Math.hypot(dx,dy)||1;
      lastSX+=dx/d*TRAIL_GAP;lastSY+=dy/d*TRAIL_GAP;
      spawnTrail(lastSX,lastSY,pvx,pvy);born++;
    }
  }else if(spd<=40){lastSX=mx;lastSY=my}

  /* electrons */
  var spin=(0.35+energy*1.15+excite*1.2+exciteT*1.6)*(1-idleV*.75),i,e;
  for(i=0;i<3;i++){
    e=EL[i];e.th+=e.om*spin*dt;
  }

  render(dt);

  if(readOn)read.style.top=oy+"px";
  if(ms===2)drawMeasure(mx,my);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

function render(dt){
  /* full-buffer clear, independent of the current transform — safe even if a
     resize/DPR change lands between frames */
  cx.save();cx.setTransform(1,0,0,1,0,0);cx.clearRect(0,0,cv.width,cv.height);cx.restore();
  var i,p,a,e,glow=DARK;

  /* ----- comet wake + emission bursts (additive in dark) ----- */
  if(PT.length||BUR.length){
    if(glow)cx.globalCompositeOperation="lighter";
    for(i=PT.length-1;i>=0;i--){
      p=PT[i];p.age+=dt;
      if(p.age>p.life){PT.splice(i,1);continue}
      var f=Math.exp(-2.6*dt);p.vx*=f;p.vy*=f;p.x+=p.vx*dt;p.y+=p.vy*dt;
      a=1-p.age/p.life;var al=a*a*a*P;
      cx.fillStyle=p.color;
      if(glow){
        cx.globalAlpha=al*.16;
        cx.beginPath();cx.arc(p.x,p.y,p.r*3,0,6.2832);cx.fill();
        cx.globalAlpha=al*.7;
      }else cx.globalAlpha=al*.55;
      cx.beginPath();cx.arc(p.x,p.y,p.r*(1-(p.age/p.life)*.3),0,6.2832);cx.fill();
    }
    for(i=BUR.length-1;i>=0;i--){
      p=BUR[i];p.age+=dt;
      if(p.age>p.life){BUR.splice(i,1);continue}
      var bf=Math.exp(-3*dt);p.vx*=bf;p.vy*=bf;p.x+=p.vx*dt;p.y+=p.vy*dt;
      a=1-p.age/p.life;var ba=Math.pow(a,1.8)*P;
      cx.fillStyle=p.color;
      if(glow){
        cx.globalAlpha=ba*.2;
        cx.beginPath();cx.arc(p.x,p.y,p.r*2.9,0,6.2832);cx.fill();
        cx.globalAlpha=ba;
      }else cx.globalAlpha=ba*.8;
      cx.beginPath();cx.arc(p.x,p.y,p.r,0,6.2832);cx.fill();
    }
    cx.globalCompositeOperation="source-over";
  }

  if(P>.02){
    var sc=Math.max(.5,1+excite*.36+exciteT*.22-idleV*.26)*SIZEF,
        A=ORBIT_A*sc,B=ORBIT_B*sc;

    /* ----- orbit shells (ink ⇄ accent crossfade) ----- */
    cx.save();
    cx.translate(ox,oy);
    if(deform>.004){cx.rotate(defAng);cx.scale(1+deform,1/(1+deform*.55));cx.rotate(-defAng)}
    for(i=0;i<3;i++){
      var rot=phi+i*Math.PI/3;
      if(excite<.98){
        cx.globalAlpha=(1-excite)*.32*P;cx.strokeStyle=COL.ink;cx.lineWidth=1.4;
        cx.beginPath();cx.ellipse(0,0,A,B,rot,0,6.2832);cx.stroke();
      }
      if(excite>.02){
        cx.globalAlpha=excite*.5*P;cx.strokeStyle=COL.accent;cx.lineWidth=1.5;
        cx.beginPath();cx.ellipse(0,0,A,B,rot,0,6.2832);cx.stroke();
      }
    }
    cx.restore();

    /* ----- electrons + trails ----- */
    for(i=0;i<3;i++){
      e=EL[i];
      var r2=phi+i*Math.PI/3,
          lx=A*Math.cos(e.th),ly=B*Math.sin(e.th),
          ca=Math.cos(r2),sa=Math.sin(r2),
          pt=sq(lx*ca-ly*sa,lx*sa+ly*ca);
      e.tr.push(pt);if(e.tr.length>7)e.tr.shift();
      var k,q;
      for(k=0;k<e.tr.length-1;k++){
        q=e.tr[k];var fr=(k+1)/e.tr.length;
        cx.globalAlpha=fr*.3*P*(1-idleV*.5);
        cx.fillStyle=excite>.5?COL.spec[i]:COL.ink;
        cx.beginPath();cx.arc(q[0],q[1],.9+fr*1.3,0,6.2832);cx.fill();
      }
      var er=(2.2+excite*.9)*(1+(SIZEF-1)*.5);
      if(excite<.98){
        cx.globalAlpha=(1-excite)*.9*P;cx.fillStyle=COL.ink;
        cx.beginPath();cx.arc(pt[0],pt[1],er,0,6.2832);cx.fill();
      }
      if(excite>.02){
        cx.globalAlpha=excite*P;cx.fillStyle=COL.spec[i];
        cx.beginPath();cx.arc(pt[0],pt[1],er,0,6.2832);cx.fill();
      }
    }

    /* ----- nucleus (the true pointer) ----- */
    if(glow){
      cx.globalCompositeOperation="lighter";
      cx.globalAlpha=.09*P;cx.fillStyle=COL.accent;
      cx.beginPath();cx.arc(mx,my,11,0,6.2832);cx.fill();
      cx.globalCompositeOperation="source-over";
    }
    if(ms>0){                                    /* caliper: atom nucleus + ticks */
      cx.globalAlpha=.95*P;cx.fillStyle=COL.ink;
      cx.beginPath();cx.arc(mx,my,2.6+.35*Math.sin(t*3.4),0,6.2832);cx.fill();
      cx.globalAlpha=.8*P;cx.strokeStyle=COL.ink;cx.lineWidth=1.6;
      cx.beginPath();
      cx.moveTo(mx-13,my);cx.lineTo(mx-8,my);cx.moveTo(mx+8,my);cx.lineTo(mx+13,my);
      cx.moveTo(mx,my-13);cx.lineTo(mx,my-8);cx.moveTo(mx,my+8);cx.lineTo(mx,my+13);
      cx.stroke();
    }else if(mode==="text"){                     /* caret beam */
      cx.globalAlpha=(.5+.42*Math.sin(t*5.2))*P;cx.fillStyle=COL.ink;
      cx.fillRect(mx-1.3,my-10,2.6,20);
    }else if(mode==="link"){                     /* target ring */
      cx.globalAlpha=.95*P;cx.strokeStyle=COL.accent;cx.lineWidth=2;
      cx.beginPath();cx.arc(mx,my,6.6*(1+(SIZEF-1)*.4),0,6.2832);cx.stroke();
      cx.fillStyle=COL.ink;
      cx.beginPath();cx.arc(mx,my,1.9,0,6.2832);cx.fill();
    }else{                                       /* breathing dot */
      cx.globalAlpha=.95*P;cx.fillStyle=COL.ink;
      cx.beginPath();cx.arc(mx,my,(3.05+.45*Math.sin(t*3.4))*(1+(SIZEF-1)*.6),0,6.2832);cx.fill();
    }
  }

  /* ----- photon rings ----- */
  for(i=RIP.length-1;i>=0;i--){
    p=RIP[i];p.age+=dt;
    if(p.age>p.life){RIP.splice(i,1);continue}
    if(p.age<0)continue;
    a=p.age/p.life;
    cx.globalAlpha=(1-a)*(1-a)*.7*P;cx.strokeStyle=p.c;cx.lineWidth=2;
    cx.beginPath();cx.arc(p.x,p.y,p.r0+p.v*p.age*(1-a*.45),0,6.2832);cx.stroke();
  }
  cx.globalAlpha=1;
}

/* ---------- reading guide (Shift+R) ---------- */
var mTimer=null;
function setStatus(html){status.innerHTML=html;status.classList.add("on")}
function clearStatus(){status.classList.remove("on")}
function toggleRead(){
  readOn=!readOn;read.classList.toggle("on",readOn);
  if(readOn){read.style.top=oy+"px";setStatus("READING GUIDE <em>SHIFT+R</em> TO HIDE")}
  else clearStatus();
}

/* ---------- caliper (Shift+M) ---------- */
function resetMeasure(){
  ms=0;msvg.classList.remove("on");ma.classList.remove("on");mb.classList.remove("on");
  mchip.classList.remove("on");
  if(mTimer){clearTimeout(mTimer);mTimer=null}
  if(!readOn)clearStatus();
}
function drawMeasure(x2,y2){
  mline.setAttribute("x1",ax);mline.setAttribute("y1",ay);
  mline.setAttribute("x2",x2);mline.setAttribute("y2",y2);
  mc1.setAttribute("cx",ax);mc1.setAttribute("cy",ay);
  mc2.setAttribute("cx",x2);mc2.setAttribute("cy",y2);
  ma.style.transform="translate("+ax+"px,"+ay+"px)";
  mb.style.transform="translate("+x2+"px,"+y2+"px)";
  var dx=x2-ax,dy=y2-ay,d=Math.hypot(dx,dy),ang=Math.atan2(-dy,dx)*180/Math.PI;
  mchip.textContent=Math.round(d)+" px · "+(d*0.026458333).toFixed(1)+" cm · "+ang.toFixed(1)+"°";
  mchip.style.left=Math.min(Math.max((ax+x2)/2,70),innerWidth-70)+"px";
  mchip.style.top=Math.min(Math.max((ay+y2)/2,34),innerHeight-10)+"px";
}
function addPoint(x,y){
  if(ms===1){ax=x;ay=y;ms=2;msvg.classList.add("on");ma.classList.add("on");mchip.classList.add("on");drawMeasure(x,y);
    setStatus("CALIPER · CLICK POINT <em>B</em>")}
  else if(ms===2){bx=x;by=y;ms=3;mb.classList.add("on");drawMeasure(bx,by);
    setStatus("CALIPER · <em>ESC</em> OR <em>SHIFT+M</em> TO CLEAR");
    /* self-healing: auto-dismiss 4.5 s after the second point */
    if(mTimer)clearTimeout(mTimer);
    mTimer=setTimeout(resetMeasure,4500)}
}
function toggleMeasure(){
  if(ms){resetMeasure();return}
  ms=1;ax=mx;ay=my;
  setStatus("CALIPER · CLICK POINT <em>A</em> · <em>ESC</em> TO CANCEL");
}
function clearAll(){if(readOn)toggleRead();resetMeasure()}

/* clicks while measuring */
document.addEventListener("click",function(e){
  if(!ms)return;
  var t=e.target;
  if(t&&t.id==="brutal-tools")return;
  if(t&&t.closest&&t.closest("input,textarea,select"))return;
  e.preventDefault();e.stopPropagation();
  addPoint(e.clientX,e.clientY);
},true);

/* ---------- keyboard (tools need SHIFT so they can never fire
     accidentally while reading; Esc always clears) ---------- */
document.addEventListener("keydown",function(e){
  if(e.ctrlKey||e.metaKey||e.altKey)return;
  var t=e.target;
  if(t&&t.id==="brutal-tools")return;
  if(t&&t.closest&&t.closest("input,textarea,select,[contenteditable]"))return;
  var k=(e.key||"").toLowerCase();
  if(k==="escape")clearAll();
  else if(!e.shiftKey)return;              /* Shift+R / Shift+M only */
  else if(k==="r")toggleRead();
  else if(k==="m")toggleMeasure();
});

/* ---------- one-time hint (deferred to the welcome card) ---------- */
try{
if(!localStorage.getItem("cur-hint5")){
  setTimeout(function(){
    if(document.getElementById("wl"))return;      /* welcome card owns the moment */
    if(localStorage.getItem("cur-hint5"))return;
    var hint=document.createElement("div");
    hint.id="cur-hint";hint.setAttribute("role","status");
    hint.innerHTML="<b>Atom cursor</b> — <kbd>Shift+R</kbd> reading guide · <kbd>Shift+M</kbd> caliper · <kbd>Esc</kbd> clear";
    document.body.appendChild(hint);
    requestAnimationFrame(function(){hint.classList.add("on")});
    localStorage.setItem("cur-hint5","1");
    var kill=function(){hint.classList.remove("on")};
    setTimeout(kill,7500);
    document.addEventListener("pointerdown",kill,{once:true});
    document.addEventListener("keydown",kill,{once:true});
  },1100);
}
}catch(_){}
})();
