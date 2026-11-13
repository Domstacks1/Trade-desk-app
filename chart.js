// hand-drawn canvas charts, devicePixelRatio aware
function setup(cv,h){const d=window.devicePixelRatio||1,w=cv.clientWidth;cv.width=w*d;cv.height=h*d;cv.style.height=h+'px';const c=cv.getContext('2d');c.scale(d,d);return[c,w,h]}
function lineChart(cv,data){const[c,w,h]=setup(cv,240);const pts=data.points||[];const start=data.start;
 const pad=40;if(pts.length<2){c.setLineDash([4,4]);c.strokeStyle='rgba(235,235,245,.3)';c.beginPath();c.moveTo(0,h/2);c.lineTo(w,h/2);c.stroke();c.setLineDash([]);
  c.fillStyle='rgba(235,235,245,.6)';c.font='15px -apple-system';c.textAlign='center';c.fillText('Waiting for the first trade',w/2,h/2-12);return}
 const xs=pts.map(p=>p.ts),ys=pts.map(p=>p.value).concat(start?[start]:[]);const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys)||1;
 const X=t=>(t-x0)/(x1-x0||1)*w,Y=v=>pad+(1-(v-y0)/((y1-y0)||1))*(h-pad-10);
 if(start){c.setLineDash([4,4]);c.strokeStyle='rgba(235,235,245,.3)';c.beginPath();c.moveTo(0,Y(start));c.lineTo(w,Y(start));c.stroke();c.setLineDash([])}
 c.beginPath();pts.forEach((p,i)=>i?c.lineTo(X(p.ts),Y(p.value)):c.moveTo(X(p.ts),Y(p.value)));c.strokeStyle='#00d35a';c.lineWidth=2;c.stroke();
 c.lineTo(w,h);c.lineTo(0,h);c.closePath();const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgba(0,211,90,.25)');g.addColorStop(1,'rgba(0,211,90,0)');c.fillStyle=g;c.fill();
 const rows=[];c.font='600 12px -apple-system';(data.marks||[]).forEach(m=>{const x=X(m.ts),tw=c.measureText(m.text).width+12;let r=0;while(rows[r]&&rows[r]>x-tw/2)r++;rows[r]=x+tw/2;
  const y=Math.max(4,Y(nearest(pts,m.ts))-28-r*22);c.fillStyle={buy:'#0a84ff',win:'#00d35a',loss:'#ff453a'}[m.kind];c.beginPath();c.roundRect(x-tw/2,y,tw,18,9);c.fill();c.fillStyle='#000';c.textAlign='center';c.fillText(m.text,x,y+13)})}
function nearest(p,t){let b=p[0];for(const q of p)if(Math.abs(q.ts-t)<Math.abs(b.ts-t))b=q;return b.value}
function candleChart(cv,cs,exitLine){const[c,w,h]=setup(cv,260);if(!cs.length){c.fillStyle='rgba(235,235,245,.6)';c.font='15px -apple-system';c.textAlign='center';c.fillText('No candles yet',w/2,h/2);return}
 const vh=50,ph=h-vh-10,lo=Math.min(...cs.map(k=>k.l),exitLine||Infinity),hi=Math.max(...cs.map(k=>k.h),exitLine||0),vm=Math.max(...cs.map(k=>k.v))||1;
 const bw=w/Math.max(cs.length,30),Y=v=>5+(1-(v-lo)/((hi-lo)||1))*(ph-10);
 cs.forEach((k,i)=>{const x=i*bw+bw/2,col=k.c>=k.o?'#00d35a':'#ff453a';c.strokeStyle=c.fillStyle=col;c.beginPath();c.moveTo(x,Y(k.h));c.lineTo(x,Y(k.l));c.stroke();
  c.fillRect(x-bw*.35,Math.min(Y(k.o),Y(k.c)),bw*.7,Math.max(1,Math.abs(Y(k.o)-Y(k.c))));c.globalAlpha=.4;c.fillRect(x-bw*.35,h-(k.v/vm)*vh,bw*.7,(k.v/vm)*vh);c.globalAlpha=1});
 if(exitLine){c.setLineDash([6,4]);c.strokeStyle='#ff9f0a';c.beginPath();c.moveTo(0,Y(exitLine));c.lineTo(w,Y(exitLine));c.stroke();c.setLineDash([]);c.fillStyle='#ff9f0a';c.font='12px -apple-system';c.fillText('Risk trailing stop',6,Y(exitLine)-5)}}
function ring(cv,score,min){const[c,w,h]=setup(cv,90);const r=36,x=45,y=45;c.lineWidth=8;c.strokeStyle='#2c2c2e';c.beginPath();c.arc(x,y,r,0,7);c.stroke();
 if(score!=null){c.strokeStyle=score>=min?'#00d35a':'#ffd60a';c.beginPath();c.arc(x,y,r,-Math.PI/2,-Math.PI/2+score/100*2*Math.PI);c.stroke()}
 c.fillStyle='#fff';c.font='600 22px -apple-system';c.textAlign='center';c.fillText(score==null?'–':score,x,y+8)}
function ring2(cv,p){const c=cv.getContext('2d'),d=window.devicePixelRatio||1;cv.width=64*d;cv.height=64*d;c.scale(d,d);c.lineWidth=7;c.strokeStyle='rgba(255,255,255,.1)';c.beginPath();c.arc(32,32,26,0,7);c.stroke();if(p!=null){c.strokeStyle='#00d35a';c.lineCap='round';c.beginPath();c.arc(32,32,26,-Math.PI/2,-Math.PI/2+2*Math.PI*p/100);c.stroke()}}
function profitChart(cv,pts){const[c,w,h]=setup(cv,220);c.font='600 11px ui-monospace,monospace';
 if(pts.length<2){c.setLineDash([4,4]);c.strokeStyle='rgba(235,235,245,.25)';c.beginPath();c.moveTo(0,h/2);c.lineTo(w,h/2);c.stroke();c.setLineDash([]);c.fillStyle='rgba(235,235,245,.55)';c.textAlign='center';c.fillText('$0.00 · no closed PAPER trade yet',w/2,h/2-10);return}
 const now=Date.now()/1000,all=pts.concat([{ts:now,v:pts[pts.length-1].v}]),x0=all[0].ts,x1=now,vs=all.map(p=>p.v),y0=Math.min(0,...vs),y1=Math.max(0,...vs);const sp=(y1-y0)||1;
 const X=t=>8+(t-x0)/(x1-x0||1)*(w-16),Y=v=>28+(1-(v-y0)/sp)*(h-44);
 c.setLineDash([3,4]);c.strokeStyle='rgba(235,235,245,.2)';c.beginPath();c.moveTo(0,Y(0));c.lineTo(w,Y(0));c.stroke();c.setLineDash([]);
 c.beginPath();all.forEach((p,i)=>i?c.lineTo(X(p.ts),Y(p.v)):c.moveTo(X(p.ts),Y(p.v)));c.strokeStyle='#00d35a';c.lineWidth=2;c.stroke();
 c.lineTo(X(now),h);c.lineTo(X(x0),h);c.closePath();const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgba(0,211,90,.22)');g.addColorStop(1,'rgba(0,211,90,0)');c.fillStyle=g;c.fill();
 pts.slice(1).forEach((p,i)=>{const x=X(p.ts),y=Y(p.v),win=p.pnl>0,col=win?'#00d35a':'#ff9f0a',t=(win?'+':'')+p.pnl.toFixed(2)+' '+p.sym,tw=c.measureText(t).width+12;
  c.fillStyle=col;c.beginPath();c.arc(x,y,3.5,0,7);c.fill();let bx=Math.min(Math.max(x-tw/2,2),w-tw-2),by=y-24-(i%2)*14;if(by<2)by=y+8;
  c.fillStyle=win?'rgba(0,211,90,.18)':'rgba(255,159,10,.18)';c.beginPath();c.roundRect(bx,by,tw,17,8.5);c.fill();c.fillStyle=col;c.textAlign='left';c.fillText(t,bx+6,by+12.5)})}
