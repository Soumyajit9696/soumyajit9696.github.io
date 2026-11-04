/* Brutal Tools - neobrutalist draggable widgets (clock, feedback, cite, links).
   Add to any page:  <script src="brutal-tools.js" defer></script>
   Optional config, put BEFORE the script tag:
   <script>window.BRUTAL_TOOLS={email:"you@example.com",formEndpoint:"https://formspree.io/f/xxxx",
     links:[{label:"Google Scholar",url:"..."},{label:"GitHub",url:"..."}],bibtex:"@article{...}"}</script>
   Feedback: formEndpoint (Formspree etc.) sends silently; without it, it opens the visitor's mail app to your email.
   Styles live in a Shadow DOM, so nothing leaks into or out of your site.
   Patched for soumyajit9696.github.io: syncs with the site dark theme (:host.dark),
   widgets are built lazily on first "Tools" click (keeps TBT at zero for Lighthouse),
   clock rAF runs only while the clock is open, native cursors removed so the site's
   custom reticle cursor stays consistent, and the host carries id="brutal-tools". */
(function(){
function init(){
var host=document.createElement("div");host.id="brutal-tools";var R=host.attachShadow({mode:"open"});
var ALL=`<style>:host{--ink:#111;--paper:#fff;--bartext:#fff;--onaccent:#101014;--pink:#ff6ba6;--blue:#5ac8ff;--lime:#b6f23a;--shadow:#111;font-family:"Space Grotesk","Arial Black",Impact,sans-serif;font-size:16px;line-height:1.2}
:host(.dark){--ink:#F4F3EC;--paper:#1D1F26;--bartext:#131419;--shadow:#F4F3EC}
#dt{background:var(--lime);border:3px solid var(--ink);box-shadow:5px 5px 0 var(--shadow);padding:8px 14px;font-weight:700;font-size:14px;color:var(--onaccent);white-space:nowrap}
#clock{position:fixed;left:50%;top:50%;width:280px;margin:-160px 0 0 -140px;
background:var(--pink);border:5px solid var(--ink);box-shadow:10px 10px 0 var(--shadow);padding:0}
#clock.drag{box-shadow:16px 16px 0 var(--shadow);transform:translate(-4px,-4px)}
.bar{display:flex;justify-content:space-between;align-items:center;background:var(--ink);color:var(--bartext);padding:6px 10px;font-weight:700;font-size:13px}
.bar i{display:inline-block;width:12px;height:12px;border:2px solid var(--bartext);background:var(--lime);margin-left:4px}
.wrap{padding:16px}
svg{display:block;width:100%;height:auto}
.date{display:flex;border-top:5px solid var(--ink);font-weight:800;color:var(--ink)}
.date div{flex:1;padding:8px 10px;text-align:center;font-size:15px;background:var(--blue);color:var(--onaccent)}
.date div+div{border-left:5px solid var(--ink);background:var(--lime);font-variant-numeric:tabular-nums}
.win{position:fixed;background:var(--paper);border:5px solid var(--ink);box-shadow:8px 8px 0 var(--shadow);color:var(--ink);font-weight:700}
.win.drag{box-shadow:14px 14px 0 var(--shadow)}
.body{padding:12px}
.b{font:inherit;font-weight:800;background:var(--paper);border:3px solid var(--ink);box-shadow:3px 3px 0 var(--ink);padding:7px 0;color:var(--ink)}
.b:active{transform:translate(3px,3px);box-shadow:none}
.b:focus-visible,textarea:focus-visible,input:focus-visible{outline:3px solid var(--pink);outline-offset:2px}
.row{display:flex;gap:8px;margin-top:10px}.row .b{flex:1}
textarea{width:100%;height:130px;box-sizing:border-box;resize:none;background:transparent;border:3px solid var(--ink);padding:8px;font:inherit;font-weight:600;color:var(--ink);user-select:text;-webkit-user-select:text}

#clock,.win{display:none;z-index:99990;user-select:none;-webkit-user-select:none}
#clock.on{display:block}.win.on{display:block}
.bar,#clock{touch-action:none}
.f{display:block;width:100%;box-sizing:border-box;margin-top:8px;font:inherit;font-weight:600;font-size:14px;border:3px solid var(--ink);background:var(--paper);padding:7px;color:var(--ink);user-select:text;-webkit-user-select:text}
textarea.f{height:90px}label{font-size:13px;display:block;margin-top:6px}
a.b{display:block;text-align:center;text-decoration:none;margin-bottom:8px;padding:9px 0}a.b:last-child{margin:0}
#dm{max-height:60vh;overflow:auto;padding:0 6px 6px 0}
#dock{position:fixed;right:16px;bottom:16px;z-index:100000;display:flex;flex-direction:column;align-items:flex-end;gap:8px}
#dm{display:none;flex-direction:column;gap:6px}#dm.open{display:flex}
#dock .b{padding:8px 14px;background:var(--paper)}#dock #dt{background:var(--lime)}#dock .b.on{background:var(--pink);color:var(--onaccent)}
#fg{color:var(--onaccent)}
#clock .ring{fill:var(--ink)}
#clock .face{fill:var(--paper);stroke:var(--ink)}
#ticks line{stroke:var(--ink)}
#nums text{fill:var(--ink)}
#hh,#sh line,#mh2{stroke:var(--ink)}
</style><div id="clock">
  <div class="bar"><span>CLOCK.EXE</span><span><i></i><i style="background:var(--pink)"></i></span></div>
  <div class="wrap">
    <svg viewBox="0 0 200 200" aria-label="Analog clock">
      <circle class="ring" cx="104" cy="104" r="94" fill="#111"/>
      <circle class="face" cx="100" cy="100" r="94" fill="#fff" stroke="#111" stroke-width="5"/>
      <g id="ticks"></g>
      <g id="nums" font-family="Arial Black,Impact,sans-serif" font-weight="900" font-size="18" text-anchor="middle" fill="#111"></g>
      <line id="hh" x1="100" y1="100" x2="100" y2="58" stroke="#111" stroke-width="9" stroke-linecap="square"/>
      <line id="mh" x1="100" y1="100" x2="100" y2="34" stroke="#5ac8ff" stroke-width="7" stroke-linecap="square" style="paint-order:stroke"/>
      <line id="mh2" x1="100" y1="100" x2="100" y2="34" stroke="#111" stroke-width="2" stroke-linecap="square" opacity="0"/>
      <g id="sh"><line x1="100" y1="116" x2="100" y2="22" stroke="#111" stroke-width="3"/><rect x="95" y="16" width="10" height="10" fill="#ff6ba6" stroke="#111" stroke-width="3"/></g>
      <rect x="92" y="92" width="16" height="16" fill="#b6f23a" stroke="#111" stroke-width="4"/>
    </svg>
  </div>
  <div class="date"><div id="day">MON</div><div id="digi">00:00:00</div></div>
</div>

<div class="win" id="fb" style="width:270px;background:var(--pink)"><div class="bar"><span>FEEDBACK.EXE</span><span id="fs">say hi</span></div><div class="body"><select class="f" id="ft" aria-label="Type"><option>Feedback</option><option>Question</option><option>Collaboration</option><option>Bug on this site</option></select><input class="f" id="fn" placeholder="Name (optional)"><input class="f" id="fe" type="email" placeholder="Your email (for a reply)"><textarea class="f" id="fm" placeholder="Your message..." aria-label="Message"></textarea><input id="fh" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px"><div class="row"><button class="b" id="fg" style="background:var(--lime)">Send</button></div></div></div>
<div class="win" id="lk" style="width:240px;background:var(--blue)"><div class="bar"><span>LINKS.LNK</span><span>find me</span></div><div class="body" id="lkb"></div></div>
<div class="win" id="ct" style="width:280px;background:var(--lime)"><div class="bar"><span>CITE.BIB</span><span id="cs">BibTeX</span></div><div class="body"><textarea class="f" id="cb" readonly aria-label="BibTeX" style="height:150px;font-size:12px"></textarea><div class="row"><button class="b" id="cc">Copy</button></div></div></div>
<div id="dock"><div id="dm"><button class="b" data-t="clock">Clock</button><button class="b" data-t="ct">Cite</button><button class="b" data-t="lk">Links</button><button class="b" data-t="fb">Feedback</button></div><button class="b" id="dt">Tools</button></div>`;
/* Lazy build: inject only the stylesheet + dock up front; the window widgets are
   constructed on the first "Tools" click, keeping page-load main-thread work near zero. */
var WI=ALL.indexOf('<div id="clock">'),DI=ALL.indexOf('<div id="dock">'),WINS=ALL.substring(WI,DI);
R.innerHTML=ALL.substring(0,WI)+'<div id="wins"></div>'+ALL.substring(DI);
document.body.appendChild(host);
try{if(document.documentElement.getAttribute("data-theme")=="dark")host.classList.add("dark");
new MutationObserver(function(){host.classList.toggle("dark",document.documentElement.getAttribute("data-theme")=="dark")}).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]})}catch(e){}
var BUILT=false;
function build(){
if(BUILT)return;BUILT=true;
R.getElementById("wins").innerHTML=WINS;

(function(){
var NS="http://www.w3.org/2000/svg",t=R.getElementById("ticks"),n=R.getElementById("nums");
for(var i=0;i<60;i++){var big=i%5===0,a=i*6*Math.PI/180,r1=big?80:85,r2=90;
var l=document.createElementNS(NS,"line");
l.setAttribute("x1",100+Math.sin(a)*r1);l.setAttribute("y1",100-Math.cos(a)*r1);
l.setAttribute("x2",100+Math.sin(a)*r2);l.setAttribute("y2",100-Math.cos(a)*r2);
l.setAttribute("stroke","#111");l.setAttribute("stroke-width",big?4:1.5);t.appendChild(l);}
for(var h=1;h<=12;h++){var b=h*30*Math.PI/180,x=document.createElementNS(NS,"text");
x.setAttribute("x",100+Math.sin(b)*66);x.setAttribute("y",100-Math.cos(b)*66+6.5);x.textContent=h;n.appendChild(x);}
var hh=R.getElementById("hh"),mh=R.getElementById("mh"),sh=R.getElementById("sh"),
digi=R.getElementById("digi"),day=R.getElementById("day"),D=["SUN","MON","TUE","WED","THU","FRI","SAT"];
function p(v){return v<10?"0"+v:v}
function tick(){var d=new Date(),ms=d.getMilliseconds(),s=d.getSeconds()+ms/1000,m=d.getMinutes()+s/60,h=d.getHours()%12+m/60;
hh.setAttribute("transform","rotate("+(h*30)+" 100 100)");
mh.setAttribute("transform","rotate("+(m*6)+" 100 100)");
sh.setAttribute("transform","rotate("+(Math.floor(s)*6)+" 100 100)");
digi.textContent=p(d.getHours())+":"+p(d.getMinutes())+":"+p(d.getSeconds());
day.textContent=D[d.getDay()]+" "+d.getDate();
raf=requestAnimationFrame(tick)}
var raf=null;
var c=R.getElementById("clock");
new MutationObserver(function(){if(c.classList.contains("on")){if(!raf)raf=requestAnimationFrame(tick)}else if(raf){cancelAnimationFrame(raf);raf=null}}).observe(c,{attributes:true,attributeFilter:["class"]});
var sx,sy,ox,oy,on=false;
function pos(){var r=c.getBoundingClientRect();return[r.left,r.top]}
c.addEventListener("pointerdown",function(e){var q=pos();c.style.margin=0;c.style.left=q[0]+"px";c.style.top=q[1]+"px";
sx=e.clientX;sy=e.clientY;ox=q[0];oy=q[1];on=true;c.classList.add("drag");c.setPointerCapture(e.pointerId)});
c.addEventListener("pointermove",function(e){if(!on)return;
var w=c.offsetWidth,h=c.offsetHeight,x=Math.min(Math.max(ox+e.clientX-sx,0),innerWidth-w),y=Math.min(Math.max(oy+e.clientY-sy,0),innerHeight-h);
c.style.left=x+"px";c.style.top=y+"px"});
function end(){on=false;c.classList.remove("drag")}
c.addEventListener("pointerup",end);c.addEventListener("pointercancel",end);
})();


(function(){
var z=99990,$=function(i){return R.getElementById(i)};
function raise(e){e.style.zIndex=++z}
function place(e,x,y){var w=e.offsetWidth,h=e.offsetHeight;e.style.left=Math.min(Math.max(x,8),Math.max(8,innerWidth-w-8))+"px";e.style.top=Math.min(Math.max(y,8),Math.max(8,innerHeight-h-8))+"px"}
$("clock").addEventListener("pointerdown",function(){raise(this)});
function drag(w){var bar=w.querySelector(".bar"),sx,sy,ox,oy,on=false;
bar.addEventListener("pointerdown",function(e){raise(w);sx=e.clientX;sy=e.clientY;ox=w.offsetLeft;oy=w.offsetTop;on=true;w.classList.add("drag");bar.setPointerCapture(e.pointerId)});
bar.addEventListener("pointermove",function(e){if(on)place(w,ox+e.clientX-sx,oy+e.clientY-sy)});
var end=function(){on=false;w.classList.remove("drag")};bar.addEventListener("pointerup",end);bar.addEventListener("pointercancel",end)}
var n=0;R.querySelectorAll("[data-t]").forEach(function(b){var e=$(b.dataset.t);if(e.id!="clock")drag(e);b.onclick=function(){var show=!e.classList.contains("on");e.classList.toggle("on",show);b.classList.toggle("on",show);if(show){raise(e);if(e.id!="clock"&&!e.dataset.p){e.dataset.p=1;n++;place(e,40+n*28,80+n*28)}}}});
var CFG=window.BRUTAL_TOOLS||{};
(CFG.links&&CFG.links.length?CFG.links:[{label:"Add your links in config",url:"#"}]).forEach(function(l){var a=document.createElement("a");a.className="b";a.href=l.url;a.target="_blank";a.rel="noopener";a.textContent=l.label;$("lkb").appendChild(a)});
$("cb").value=CFG.bibtex||"@article{yourkey2026,\n  author  = {Your Name},\n  title   = {Paper title},\n  journal = {Journal},\n  year    = {2026}\n}";
$("cc").onclick=function(){var t=$("cb"),s=$("cs"),ok=function(){s.textContent="Copied!";setTimeout(function(){s.textContent="BibTeX"},1500)};t.select();
if(navigator.clipboard)navigator.clipboard.writeText(t.value).then(ok,function(){document.execCommand("copy");ok()});else{document.execCommand("copy");ok()}};
$("fg").onclick=function(){var m=$("fm").value.trim(),st=$("fs");if($("fh").value)return;if(!m){st.textContent="Write a message";return}
var d={type:$("ft").value,name:$("fn").value,email:$("fe").value,message:m};
if(CFG.formEndpoint){st.textContent="Sending...";fetch(CFG.formEndpoint,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(d)}).then(function(r){if(!r.ok)throw 0;st.textContent="Sent, thanks!";$("fm").value=""}).catch(function(){st.textContent="Failed, try again"})}
else if(CFG.email){location.href="mailto:"+CFG.email+"?subject="+encodeURIComponent("["+d.type+"] from "+(d.name||"visitor"))+"&body="+encodeURIComponent(m+"\n\n"+d.name+" "+d.email);st.textContent="Opening mail..."}
else st.textContent="Set email in config"};
$("dt").onclick=function(){$("dm").classList.toggle("open")}; /* replaced by first-click builder below */
})();
}
R.getElementById("dt").onclick=function(){build();R.getElementById("dm").classList.toggle("open")};

}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
