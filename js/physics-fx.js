/* ============================================================
   Physics FX — Soumyajit Das portfolio (all pages)
   ------------------------------------------------------------
   THE EQUATION FIELD, everywhere it belongs.

   Every page carries a drifting chalkboard of equations drawn
   on a canvas behind its heading — each page a different set,
   matched to what that page is about:

     home      the classics   (E = mc2, de Broglie, Maxwell…)
     about     the DFT world  (Schrodinger, Hohenberg–Kohn, SCF)
     skills    the math kit   (Ax=b, gradient descent,
               the perceptron, Laplace)
     projects  the simulator  (DOS, Newton, Bragg, group velocity)
     gallery   the optics bench (grating, thin lens, Rayleigh)
     blog      information     (Shannon, Bayes, second law)
     resources student classics (photoelectric, Ohm, pendulum)
     404       the physics of being lost (uncertainty, empty set)

   Purely ambient: aria-hidden, pointer-events none, links and
   text always work. The only interaction is a gentle repulsion
   — the maths drifts aside as the pointer passes through.

   Discipline (unchanged from Round 7d):
   - explicit CSS width/height on the canvas, DPR re-read on
     every resize, (resolution:X dppx) listener
   - rAF pauses when the field is off-screen or tab-hidden
   - prefers-reduced-motion: a calm static scatter, no motion
   - zero layout impact: canvas is absolutely positioned
     inside the heading container (CLS 0)
   ============================================================ */
(function(){
"use strict";
window.__PFX_VER="20261103";
if(document.getElementById("eq-cv"))return;

/* ---------- tiny helpers ---------- */
var RM=window.matchMedia?matchMedia("(prefers-reduced-motion: reduce)"):null;
function reduced(){return !!(RM&&RM.matches)}
function clamp(v,a,b){return v<a?a:v>b?b:v}
function cssVar(n,f){try{var v=getComputedStyle(document.documentElement).getPropertyValue(n).trim();return v||f}catch(_){return f}}

/* ---------- per-page equation sets ---------- */
var SETS={

"index.html":[
 "E = mc\u00B2",
 "\u03BB = h / p",
 "\u0394x \u00B7 \u0394p \u2265 h / 4\u03C0",
 "\u2207 \u00B7 B = 0",
 "S = k \u00B7 ln W",
 "E = h\u03BD",
 "F = G M m / r\u00B2",
 "\u03C8(x, t)"
],

"about.html":[
 "(\u2212\u2207\u00B2/2m + V)\u03C8 = E\u03C8",
 "E[\u03C1]",
 "\u03C1 \u2192 V \u2192 \u03C8 \u2192 \u03C1",
 "E(k)",
 "F = E \u2212 T S"
],

"skills.html":[
 "f(t) \u2192 F(\u03C9)",
 "A x = b",
 "\u03C7\u00B2 = \u03A3 (O \u2212 E)\u00B2 / E",
 "\u03B8 \u2190 \u03B8 \u2212 \u03B7 \u2202L/\u2202\u03B8",
 "y = \u03C3 (w \u00B7 x + b)",
 "\u2207\u00B2\u03C6 = 0"
],

"projects.html":[
 "g(E)",
 "a = F / m",
 "2 d sin\u03B8 = n\u03BB",
 "v = \u2202E / \u2202k",
 "V(x) = V(x + a)"
],

"gallery.html":[
 "d sin\u03B8 = m\u03BB",
 "1/f = 1/u + 1/v",
 "n\u2081 sin\u03B8\u2081 = n\u2082 sin\u03B8\u2082",
 "\u03B8 = 1.22 \u03BB / D",
 "\u0394y = L \u03BB / d"
],

"blog.html":[
 "S = \u2212 k \u03A3 p ln p",
 "P(A|B) = P(B|A) P(A) / P(B)",
 "ln N! \u2248 N ln N \u2212 N",
 "f \u00B7 r \u2248 C",
 "dS \u2265 0"
],

"resources.html":[
 "h\u03BD = \u03C6 + KE",
 "V = I R",
 "T = 2\u03C0 \u221A(L / g)",
 "F = q (E + v \u00D7 B)",
 "KE = \u00BD m v\u00B2"
],

"404.html":[
 "\u0394x \u00B7 \u0394p \u2265 h / 4\u03C0",
 "|\u03C8|\u00B2 = 0",
 "\u2205"
]
};

var CONTAINERS={
  "index.html":".hero",
  "404.html":".nf",
  "default":".page-head"
};

/* ---------- resolve this page ---------- */
function pageKey(){
  var p=decodeURIComponent(location.pathname.split("/").pop())||"index.html";
  return p.replace(/[?#].*/,"");
}
var pk=pageKey();
var set=SETS[pk];
if(!set)return;                       /* e.g. file:// rootless cases */
var sel=CONTAINERS[pk]||CONTAINERS.default;
var box=document.querySelector(sel);
if(!box)return;

/* ---------- make the canvas a safe overlay (zero layout impact) ---------- */
var cv=document.createElement("canvas");
cv.id="eq-cv";cv.setAttribute("aria-hidden","true");
/* explicit CSS size — replaced elements without width/height fall
   back to the intrinsic buffer size (the Round 7d bug class) */
cv.style.cssText="position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none";
box.insertBefore(cv,box.firstChild);
if(getComputedStyle(box).position==="static"){
  box.style.position="relative";      /* keeps its box in flow: CLS 0 */
}
/* lift static siblings above the canvas (relative preserves their
   box in flow — zero layout shift); already-positioned elements keep
   their own stacking. Mirrors .hero-copy z1 over .hero on index. */
for(var ci=0;ci<box.children.length;ci++){
  var ch=box.children[ci];
  if(ch===cv)continue;
  var cs=getComputedStyle(ch);
  if(cs.position==="static"&&(ch.style.zIndex||"")===""){
    ch.style.position="relative";
    ch.style.zIndex="1";
  }
}
var ctx=cv.getContext("2d");
if(!ctx)return;

var W=0,H=0,DPR=1,INK="#101014",dark=false;
var ptr={x:0,y:0,on:false};
var sprites=[];

function measure(){
  W=box.clientWidth;H=box.clientHeight;
  DPR=window.devicePixelRatio||1;
  cv.width=Math.max(1,Math.round(W*DPR));
  cv.height=Math.max(1,Math.round(H*DPR));
  ctx.setTransform(DPR,0,0,DPR,0,0);
}
function ink(){
  INK=cssVar("--ink","#101014");
  dark=document.documentElement.getAttribute("data-theme")==="dark";
}

function scatter(){
  var small=W<560;
  sprites=[];
  /* on short page-heads keep the count proportional to height so
     the strip never gets crowded */
  var maxN=clamp(Math.round(H/34),3,set.length);
  if(small)maxN=Math.min(maxN,5);
  var n=Math.min(set.length,maxN);
  /* when trimming, keep a stable per-load random subset */
  var idx=set.map(function(_,i){return i});
  for(var i=idx.length-1;i>0;i--){var j=Math.random()*(i+1)|0;var t=idx[i];idx[i]=idx[j];idx[j]=t}
  idx=idx.slice(0,n);
  idx.forEach(function(si){
    sprites.push({
      t:set[si],
      x:Math.random()*W,
      y:Math.random()*H,
      rot:(Math.random()-.5)*0.20,
      size:small?13+Math.random()*6:15+Math.random()*10,
      vy:-(7+Math.random()*11),
      ph:Math.random()*6.283,
      a:0,
      max:(dark?0.15:0.11)+Math.random()*(dark?0.10:0.09),
      ox:0,oy:0
    });
  });
}

function fontFor(s){
  return "italic 600 "+s.size.toFixed(1)+'px Georgia,"Times New Roman","DejaVu Serif",serif';
}
function drawnPos(s,now){               /* where the sprite's anchor is drawn */
  return [s.x+Math.sin(now*0.0003+s.ph)*7+s.ox,
          s.y+s.oy];
}
/* the VISIBLE extent of the rendered string — repulsion uses this,
   so the whole length of a long equation drifts around the pointer */
function rectOf(s,now){
  var p=drawnPos(s,now);
  return {l:p[0]-8,t:p[1]-s.size*0.82,r:p[0]+(s.w||120)+8,b:p[1]+7};
}

function drawStatic(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=INK;
  var now=performance.now();
  for(var i=0;i<sprites.length;i++){
    var s=sprites[i],p=drawnPos(s,now);
    ctx.save();
    ctx.translate(p[0],p[1]);
    ctx.rotate(s.rot);
    ctx.globalAlpha=s.max;
    ctx.font=fontFor(s);
    ctx.fillText(s.t,0,0);
    ctx.restore();
  }
  ctx.globalAlpha=1;
}

/* pointer → container-local coordinates (for the repulsion only) */
function onMove(e){
  var r=cv.getBoundingClientRect();
  ptr.x=e.clientX-r.left;ptr.y=e.clientY-r.top;ptr.on=true;
}
function onLeave(){ptr.on=false}

/* ============================================================
   THE FIELD — animation loop (identical discipline as before)
   ============================================================ */
var running=false,raf=0,last=0;

function frame(now){
  if(!running)return;
  var dt=Math.min((now-last)/1000,0.05);last=now;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=INK;
  var R=120,R2=R*R;
  for(var i=0;i<sprites.length;i++){
    var s=sprites[i];
    s.y+=s.vy*dt;
    if(s.y<-60){s.y=H+40+Math.random()*40;s.x=Math.random()*W;s.a=0}
    s.a=Math.min(s.a+dt*1.3,s.max);
    /* pointer repulsion — the maths scatters around the cursor
       (distance to the visible text, so long equations behave) */
    if(ptr.on){
      var rc=rectOf(s,now);
      var nx=clamp(ptr.x,rc.l,rc.r),ny=clamp(ptr.y,rc.t,rc.b);
      var dx=nx-ptr.x,dy=ny-ptr.y,d2=dx*dx+dy*dy;
      if(d2<R2&&d2>0.01){
        var d=Math.sqrt(d2),f=(1-d/R)*260*dt;
        s.ox+=dx/d*f;s.oy+=dy/d*f;
      }
    }
    var k=Math.exp(-5*dt);s.ox*=k;s.oy*=k;
    s.ox=clamp(s.ox,-46,46);s.oy=clamp(s.oy,-46,46);
    var p=drawnPos(s,now);
    ctx.save();
    ctx.translate(p[0],p[1]);
    ctx.rotate(s.rot+Math.sin(now*0.0004+s.ph)*0.015);
    ctx.globalAlpha=s.a;
    ctx.font=fontFor(s);
    ctx.fillText(s.t,0,0);
    ctx.restore();
  }
  ctx.globalAlpha=1;
  raf=requestAnimationFrame(frame);
}
function start(){
  if(running)return;running=true;last=performance.now();
  raf=requestAnimationFrame(frame);
}
function stop(){running=false;if(raf)cancelAnimationFrame(raf)}

function measureWidths(){
  /* cache each rendered string's width — the repulsion rectangle */
  try{
    sprites.forEach(function(s){
      ctx.save();ctx.font=fontFor(s);
      s.w=ctx.measureText(s.t).width;
      ctx.restore();
    });
  }catch(_){}
}

measure();ink();scatter();measureWidths();

if(reduced()){
  /* one calm frame per layout — the chalkboard, no motion */
  drawStatic();
  addEventListener("resize",function(){measure();scatter();measureWidths();drawStatic()},{passive:true});
  try{new MutationObserver(function(){ink();drawStatic()}).observe(document.documentElement,
    {attributes:true,attributeFilter:["data-theme"]})}catch(_){}
  return;
}

/* run only while the heading is on screen and the tab is visible */
try{
  new IntersectionObserver(function(en){
    (en[0]&&en[0].isIntersecting&&document.visibilityState==="visible")?start():stop()
  },{rootMargin:"80px"}).observe(box);
}catch(_){start()}
document.addEventListener("visibilitychange",function(){
  document.hidden?stop():(box.getBoundingClientRect().bottom>0?start():stop())
});

var rzT=null;
function onResize(){
  if(rzT)return;
  rzT=setTimeout(function(){
    rzT=null;measure();scatter();measureWidths();
    if(!running)drawStatic();
  },150)
}
addEventListener("resize",onResize,{passive:true});
/* DPR change with no resize (drag to another monitor) */
try{
  var rmq=matchMedia("(resolution:"+(window.devicePixelRatio||1)+"dppx)");
  var onDpr=function(){onResize();
    try{rmq.removeEventListener("change",onDpr)}catch(_){}
  };
  rmq.addEventListener("change",onDpr);
}catch(_){}

box.addEventListener("pointermove",onMove,{passive:true});
box.addEventListener("pointerleave",onLeave,{passive:true});
try{new MutationObserver(function(){
  ink();
  sprites.forEach(function(s){s.max=(dark?0.15:0.11)+Math.random()*(dark?0.10:0.09)});
  if(!running)drawStatic()
}).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]})}catch(_){}

})();
