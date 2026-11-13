(()=>{const h=location.hash.match(/t=([^&]+)/);if(h){localStorage.setItem('t',decodeURIComponent(h[1]));history.replaceState(null,'',location.pathname)}})();
const S=(location.hash.match(/d=([A-Za-z0-9]{32,})/)||[])[1]||sessionStorage.getItem('d')||'';if(S)sessionStorage.setItem('d',S);
const T=S?'':(localStorage.getItem('t')||''),V=document.getElementById('view'),E=document.getElementById('err');
let last=null,lastOk=0,retry=5,unread=0,range='LIVE',tab='home',cache={};
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const $=n=>'$'+Number(n||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
async function api(p,o={}){if(S){if(o.method&&o.method!='GET'){alert('Read-only view · change settings, pause or mode via Telegram');throw new Error('read-only')}const f=p.split('?')[0].replace(/^\//,'')||'state';const r=await fetch('d/'+S+'/'+f+'.json?'+Date.now(),{cache:'no-store'});if(!r.ok)throw Object.assign(new Error('not exported'),{status:r.status});lastOk=Date.now();E.hidden=true;return r.json()}const r=await fetch('/api'+p,{...o,headers:{'Authorization':'Bearer '+T,'Content-Type':'application/json'}});if(!r.ok){const j=await r.json().catch(()=>({}));throw Object.assign(new Error(j.error||r.status),{status:r.status})}lastOk=Date.now();E.hidden=true;return r.json()}
function offline(){let n=retry;E.hidden=false;const tick=()=>{E.textContent=`Desk offline · retrying in ${n}s · last update ${lastOk?new Date(lastOk).toLocaleTimeString():'never'}`;if(n--<=0){render()}else setTimeout(tick,1000)};tick()}
function odo(el,val){const s=$(val);if(RM||!el.dataset.v){el.textContent=s;el.dataset.v=s;return}const o=el.dataset.v;el.dataset.v=s;el.innerHTML='';[...s].forEach((ch,i)=>{const sp=document.createElement('span');sp.className='odo';const inner=document.createElement('span');inner.textContent=ch;sp.appendChild(inner);el.appendChild(sp);if(o[i]!==ch){inner.style.transform='translateY(100%)';inner.style.transitionDelay=((s.length-i)*30)+'ms';requestAnimationFrame(()=>requestAnimationFrame(()=>inner.style.transform='translateY(0)'))}})}
function skel(){V.innerHTML='<div class="skel" style="height:52px;margin:8px 0"></div><div class="skel" style="height:80px"></div><div class="skel" style="height:240px;margin:12px 0"></div><div class="skel" style="height:300px"></div>'}
const COL={scanner:'#64d2ff',auditor:'#64d2ff',analyst:'#ffd60a',executor:'#00d35a',risk:'#ff6b9a'};
function card(a){const t=a.name[0].toUpperCase()+a.name.slice(1);let b='';
 if(a.name=='scanner')b=`<div class="n">${a.count} pools</div>`+(a.feed.length?a.feed.map(f=>`<div class="row" style="min-height:30px"><span class="${f.verdict=='kill'?'kill':''}">${esc(f.name||f.mint.slice(0,6))}${f.verdict=='pass'?` · liq $${Math.round(f.liquidity_usd/1000)}K · → auditor`:''}</span><span class="s r">${esc(f.verdict=='kill'?f.reason:'')}</span></div>`).join(''):'<div class="t2">Listening for graduations</div>');
 if(a.name=='auditor')b=`<div class="n">${a.count} taken apart</div><div class="strips">${[...Array(8)].map((_,i)=>{const s=a.strips[i];return`<i class="${s?(s.pass?'p':'f'):''}"></i>`}).join('')}</div><div class="t2">${a.strips.length==8&&a.strips.every(s=>s.pass)?'8/8 → Executor':(a.strips.length?'rejected':'No coin taken apart yet')}</div><div class="t2">${a.rejected} rejected</div>`;
 if(a.name=='analyst')b=`<div class="t2">Scoring ${a.mode=='rules'?'(rules)':''}</div><canvas class="ring" data-s="${a.score??''}" data-m="${a.min}" style="width:90px"></canvas><div class="t2">${a.count} scored</div>`;
 if(a.name=='executor')b=`<div class="n">${a.count} trades</div>`+(a.last?`<div>${$(a.last.size_usd)} · ${a.stack_pct}% of stack</div><div class="bar"><i style="width:100%"></i></div><div class="g">✓ Filled</div>`:'<div class="t2">No signal yet</div>');
 if(a.name=='risk')b=`<div class="n">${a.open?'Guarding':(a.last_exit=='trail'?'Trailed out':a.last_exit=='stop'?'Stopped':'Idle')}</div><div><span class="pill mono" style="background:rgba(255,69,58,.2);color:#ff453a">stop -${a.stop_pct}%</span> <span class="pill mono" style="background:rgba(0,211,90,.2);color:#00d35a">trail ${a.trail_pct}%</span></div>`;
 return`<div class="card"><h3 style="color:${COL[a.name]}">${t} <span class="t3" style="font-size:13px">● ${a.status}</span></h3>${b}</div>`}
function actRow(r){return`<div class="row" onclick="${r.kind=='rejected'?`go('audit','${r.mint}')`:`go('coin','${r.mint}')`}"><div><div>${esc(r.title)}</div><div class="s">${esc(r.subtitle)}</div></div><div class="${r.kind=='stopped'?'r':r.kind=='sold'?'g':''}">${esc(r.value)}</div></div>`}
const SHAPE={scanner:'tri',auditor:'sq',analyst:'dia',executor:'circ',risk:'hex'};
const clk=s=>{const d=Math.max(0,Math.floor(Date.now()/1000-s));return[d/3600|0,(d/60|0)%60,d%60].map(n=>String(n).padStart(2,'0')).join(':')};
let D=null;setInterval(()=>{const e=document.getElementById('clk');if(e&&D)e.textContent=clk(D.session_start)},1000);
async function home(){const d=await api('/dashboard');D=d;const sg=v=>(v>=0?'+':'')+$(v).replace('$-','-$');
 const wr=d.win_rate,paper=d.mode=='PAPER';
 V.innerHTML=`<div class="dh"><div><div class="ttl">TRADE DESK</div><div class="sub">MEMECOIN DEFI – NIGHT SESSION</div></div><span class="sp"></span>
  <button class="ib" onclick="srch()" aria-label="Search">⌕</button></div>
 <div class="meta mono"><span>⏱ <b id="clk">${clk(d.session_start)}</b></span><span>TASKS <b>${d.tasks}</b></span><span class="live ${paper?'pp':''}">● ${paper?'PAPER':'LIVE'}</span></div>
 <div class="mc">
  <div class="m"><div class="k">PROFIT USD${paper?' · PAPER':''}</div><div class="v ${d.profit>=0?'g':'o'}">${sg(d.profit)}</div><div class="bar"><i style="width:${d.target_pct}%"></i></div><div class="t3">${d.target_pct}% of ${$(d.target)} target</div></div>
  <div class="m"><div class="k">BALANCE${paper?' · PAPER':''}</div><div class="v" id="bal"></div><div class="t3">start ${$(d.start_balance)} · ${d.open} open</div></div>
  <div class="m"><div class="k">WIN RATE</div><div class="wr"><canvas id="wg" width="64" height="64" style="width:64px;height:64px"></canvas><div><div class="v sm">${wr==null?'—':wr+'%'}</div><div class="t3"><span class="g">${d.wins}W</span> / <span class="o">${d.losses}L</span></div></div></div></div>
  <div class="m"><div class="k">BIGGEST WIN</div>${d.biggest?`<div class="v sm g">${sg(d.biggest.pnl)}</div><div class="t3"><a href="${esc(d.biggest.coin_url)}" target="_blank" rel="noopener">$${esc(d.biggest.sym)}</a> · ${esc(d.biggest.reason)}</div>`:'<div class="v sm t3">—</div><div class="t3">no closed win yet</div>'}</div>
 </div>
 <div class="main"><div class="pane"><div class="k">PROFIT HISTORY${paper?' · PAPER':''}</div><canvas id="ph"></canvas></div>
  <div class="pane"><div class="k">ACTIVITY LOG</div><div class="term mono" id="term">${d.log.map(l=>`<div><span class="t3">${new Date(l.ts*1000).toLocaleTimeString('de-AT',{hour12:false})}</span> <span class="tag ${l.tag}">[${l.tag}]</span> ${l.coin_url?`<a href="${esc(l.coin_url)}" target="_blank" rel="noopener">${esc(l.coin)}</a>`:esc(l.coin)} <span class="t2">${esc(l.text)}</span></div>`).join('')||'<div class="t3">$ waiting for the first graduation…<span class="cur">▋</span></div>'}</div></div></div>
 <div class="pane"><div class="k">NIGHT TARGET <span class="t3">${sg(d.profit)} / ${$(d.target)}</span></div><div class="bar big"><i style="width:${d.target_pct}%"></i></div>
  <div class="ags">${d.agents.map(a=>`<div class="ag ${a.status}"><i class="shp ${SHAPE[a.name]}" style="--c:${COL[a.name]}"></i><div>${a.name[0].toUpperCase()+a.name.slice(1)}</div><div class="t3">${a.status}</div></div>`).join('')}</div></div>
 ${last&&last.layer8=='blocked'?'<div class="r" style="font-size:13px">Auditor layer 8 blocked: needs an RPC that allows getProgramAccounts</div>':''}`;
 odo(document.getElementById('bal'),d.balance);ring2(document.getElementById('wg'),wr);profitChart(document.getElementById('ph'),d.points)}
async function agents(){const s=await api('/state');const ds=await Promise.all(s.agents.map(a=>api(`/agents/${a.name}/decisions`)));
 V.innerHTML='<h1>Agents</h1>'+s.agents.map((a,i)=>`<div class="full"><div class="row"><b style="color:${COL[a.name]}">${a.name[0].toUpperCase()+a.name.slice(1)}</b><span class="t2">● ${a.status} · ${a.count??a.open??0} today</span>
 <button class="ib sw" ${a.name=='risk'&&a.open?'disabled title="locked while a position is open"':''} onclick="tog('${a.name}','${a.status}')">${a.status=='paused'?'Resume':'Pause'}</button></div>
 ${ds[i].rows.map(d=>`<div class="row" style="min-height:40px"><span class="s">${new Date(d.ts*1000).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span><span>${d.mint?`<a style="color:#fff" href="${esc(d.coin_url)}">${esc(d.coin||d.mint.slice(0,6))}</a>`:''}</span><span class="s">${esc(d.verdict)} · ${esc(d.reason||'')}</span></div>`).join('')||'<div class="t2" style="padding:10px 0">No decisions yet</div>'}
 <a class="t2" href="#" onclick="go('account');return false">Settings</a></div>`).join('')}
async function tog(n,st){try{await api(`/agents/${n}/${st=='paused'?'resume':'pause'}`,{method:'POST'})}catch(e){alert(e.message)}render()}
async function activity(){const a=await api('/activity');V.innerHTML='<h1>Activity</h1><div class="sec">'+(a.rows.map(actRow).join('')||'<div class="row t2">Nothing yet tonight</div>')+'</div>'}
async function audit(m){const a=await api('/audit/'+m);const L=[...Array(8)].map((_,i)=>a.layers.find(l=>l.layer==i+1));const fail=L.find(l=>l&&!l.pass);
 V.innerHTML=`<div class="nav"><button class="ib" onclick="history.back()">‹</button><b>${esc(a.name||m.slice(0,6))}</b></div>
 ${!a.layers.length?'<div class="t2">No coin taken apart yet</div>':''}<div id="discs" style="padding-top:12px">${L.map((l,i)=>`<div class="disc" id="d${i}">${i+1}</div>`).join('')}</div>
 <div class="sec" style="margin-top:16px">${L.map((l,i)=>`<div class="row"><span>${i+1} ${esc(l?l.name:'')}</span><span class="${l?(l.pass?'g':'r'):'t3'}">${esc(l?l.value:'not checked')}</span></div>`).join('')}</div>
 ${a.layers.length?(fail?`<h2 class="r">Rejected · ${esc(fail.value)}</h2><div class="t2">Grok Bot won't buy ${esc(a.name)}</div>`:(L.every(l=>l&&l.pass)?`<h2 class="g">Cleared · 8/8 parts</h2><div class="t2">Sent to Executor · ${$(a.size)}</div>`:'')):''}
 <div class="row"><span>Take apart before buying</span><input type="checkbox" ${a.enabled?'checked':''} onchange="audTog(this)"></div>
 <a class="btn" href="${esc(a.coin_url)}">Open on FOMO</a>`;
 let i=0;const step=()=>{if(i>=8||!L[i])return;const d=document.getElementById('d'+i);d.classList.add('beam');setTimeout(()=>{d.classList.remove('beam');d.classList.add(L[i].pass?'p':'f');d.textContent=L[i].pass?'✓':'✗';i++;if(L[i-1].pass)step()},RM?0:350)};step()}
async function audTog(cb){if(!cb.checked&&!(confirm('Turn off the Auditor?')&&confirm('Really? Coins will skip all 8 safety layers.'))){cb.checked=true;return}await api('/settings',{method:'POST',body:JSON.stringify({'auditor.enabled':cb.checked})})}
async function coin(m){const c=await api('/coin/'+m);const age=c.migrated_at?Math.round((Date.now()/1000-c.migrated_at)/3600):null;const p=c.position;
 V.innerHTML=`<div class="nav"><button class="ib" onclick="history.back()">‹</button><b>${esc(c.name||m.slice(0,6))}</b>${last&&last.mode=='PAPER'?'<span class="pill paper">PAPER</span>':''}<span class="sp"></span><span class="pill" style="background:#2c2c2e">🛡 ${c.shield}</span></div>
 <div class="t2">${esc(c.symbol||'')} · Solana${age!=null?` · ${age}h old`:''}</div><div class="big" style="font-size:44px">${c.price!=null?'$'+Number(c.price).toPrecision(4):'–'}</div>
 ${p?`<div class="${c.price>=p.entry_price?'g':'r'}">${c.price>=p.entry_price?'▲':'▼'} ${(100*(c.price/p.entry_price-1)).toFixed(1)}% since entry</div>`:''}
 <canvas id="cc" style="margin:12px 0"></canvas>
 <div class="sec"><div class="row"><span class="t2">Market cap</span><span>${c.marketCap?$(c.marketCap):'–'}</span></div><div class="row"><span class="t2">Liquidity</span><span>${c.liquidity?$(c.liquidity):'–'}</span></div><div class="row"><span class="t2">24h volume</span><span>${c.volume24h?$(c.volume24h):'–'}</span></div><div class="row"><span class="t2">Holders</span><span>${c.holders??'n/a'}</span></div></div>
 ${p?`<div class="full"><b>Your position · ${$(p.size_usd)} in · Executor</b><div class="row"><span class="t2">Stop</span><span class="r">$${Number(c.exit.stop).toPrecision(4)} (-${c.exit.stop_pct}%)</span></div><div class="row"><span class="t2">Trail</span><span>${c.exit.trail_active?'$'+Number(c.exit.exit_line).toPrecision(4):'starts later'} · ${c.exit.trail_pct}%</span></div><div class="row"><span class="t2">Timeout in</span><span>${Math.max(0,Math.round((c.exit.timeout_at-Date.now()/1000)/60))} min</span></div></div>`:''}
 <a class="btn" href="${esc(c.coin_url)}">${p?'Sell on FOMO':'Buy on FOMO'}</a>`;candleChart(document.getElementById('cc'),c.candles,c.exit&&c.exit.exit_line)}
async function account(){const[a,s]=await Promise.all([api('/account'),api('/settings')]);const groups={};Object.entries(s.settings).forEach(([k,v])=>{const g=k.split('.')[0]+(k.includes('.rules.')?' (rules)':'');(groups[g]=groups[g]||[]).push([k,v])});
 const standalone=navigator.standalone||matchMedia('(display-mode: standalone)').matches;
 V.innerHTML=`<h1>Account</h1><div class="sec"><div class="row"><span>Mode</span><span><button class="ib" onclick="setMode('PAPER')">${a.mode=='PAPER'?'● ':''}PAPER</button><button class="ib" onclick="setMode('LIVE')">${a.mode=='LIVE'?'● ':''}LIVE</button></span></div>
 <div class="row"><span>Stack</span><span>${$(a.stack)}</span></div>
 <a class="row" style="color:#fff;text-decoration:none" href="${esc(a.profile_url)}"><span>Your FOMO profile</span><span class="t2">@${esc(a.handle)} ›</span></a>
 <div class="row" onclick="invite('${esc(a.signup_url)}')"><span>Invite a friend</span><span class="t2">›</span></div>
 <div class="row"><span>Telegram</span><span class="${a.telegram?'g':'r'}">${a.telegram?'connected':'not connected'}</span></div>
 <div class="row" onclick="testPush()"><span>Send test push</span><span class="t2">›</span></div>
 ${standalone?`<div class="row" onclick="enablePush('${a.vapid_public}')"><span>Enable notifications</span><span class="t2">›</span></div>`:''}</div>
 ${Object.entries(groups).map(([g,ks])=>`<h2>${g[0].toUpperCase()+g.slice(1)}</h2><div class="sec">${ks.map(([k,v])=>setRow(k,v)).join('')}</div>`).join('')}`}
function setRow(k,v){const n=k.split('.').pop();if(v.enum)return`<div class="row"><span>${n}</span><select onchange="saveSet('${k}',this.value)">${v.enum.map(e=>`<option ${e==v.value?'selected':''}>${e}</option>`).join('')}</select></div>`;
 if(typeof v.value=='boolean')return`<div class="row"><span>${n}</span><input type="checkbox" ${v.value?'checked':''} onchange="saveSet('${k}',this.checked)"></div>`;
 if(v.min!=null)return`<div class="row" style="flex-wrap:wrap"><span>${n}</span><input class="num mono" value="${v.value}" onchange="saveSet('${k}',this.value)"><input type="range" min="${v.min}" max="${v.max}" step="any" value="${v.value}" onchange="saveSet('${k}',this.value)"></div>`;
 return`<div class="row"><span>${n}</span><input class="num" style="width:180px" value="${esc(v.value)}" onchange="saveSet('${k}',this.value)"></div>`}
async function saveSet(k,v){try{await api('/settings',{method:'POST',body:JSON.stringify({[k]:v})})}catch(e){alert(e.message)}account()}
async function setMode(m){let b={mode:m};if(m=='LIVE'){b.confirm=prompt('Type LIVE to confirm');}try{await api('/mode',{method:'POST',body:JSON.stringify(b)})}catch(e){alert(e.message)}account()}
async function invite(u){if(navigator.share){try{await navigator.share({url:u})}catch(e){}}else{await navigator.clipboard.writeText(u);alert('Link copied')}}
async function testPush(){const r=await api('/testpush',{method:'POST'});alert(r.telegram?'Sent':'Telegram not connected')}
async function enablePush(k){const reg=await navigator.serviceWorker.register('sw.js');if(await Notification.requestPermission()!='granted')return;const key=Uint8Array.from(atob(k.replace(/-/g,'+').replace(/_/g,'/')+'=='.slice(0,(4-k.length%4)%4)),c=>c.charCodeAt(0));
 const sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:key});await api('/push',{method:'POST',body:JSON.stringify(sub.toJSON())});alert('Notifications on')}
async function srch(){const q=prompt('Name, symbol or mint');if(!q)return;const r=await api('/search?q='+encodeURIComponent(q));if(r.rows.length==1)go('coin',r.rows[0].mint);else V.innerHTML='<h1>Search</h1><div class="sec">'+(r.rows.map(x=>`<div class="row" onclick="go('coin','${x.mint}')">${esc(x.name)} <span class="t2">${esc(x.symbol)}</span></div>`).join('')||'<div class="row t2">No match</div>')+'</div>'}
const VIEWS={home,agents,activity,account,audit,coin};let arg=null;
function go(t,a=null){tab=t;arg=a;history.pushState({t,a},'');document.querySelectorAll('.tabs button').forEach(b=>b.classList.toggle('on',b.dataset.t==t));render()}
onpopstate=e=>{if(e.state){tab=e.state.t;arg=e.state.a;render()}};
async function render(){if(!V.innerHTML)skel();try{await VIEWS[tab](arg)}catch(e){if(e.status==401){V.innerHTML='<p class="t2">Open the app once with its private link (…#t=…).</p>';return}offline()}}
document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>go(b.dataset.t));
if(T){const es=new EventSource('/api/stream?t='+encodeURIComponent(T));es.addEventListener('push',()=>unread++);['scan','verdict','fill','exit','balance','audit'].forEach(k=>es.addEventListener(k,()=>{if(tab=='home'||tab=='agents')render()}));es.onerror=()=>{}}
setInterval(()=>{if(tab=='home')render()},15000);
go('home');
