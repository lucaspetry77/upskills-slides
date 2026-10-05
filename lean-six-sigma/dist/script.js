'use strict';
const form = document.querySelector('#lp_flss');
const statusMessage = document.querySelector('#form-status');
const officialLink = document.querySelector('#official-link');
const submitButton = form.querySelector('.form-submit');
const submitLabel = document.createElement('span');
submitLabel.className='submit-label';
submitLabel.textContent=submitButton.firstChild.textContent.trim();
submitButton.firstChild.replaceWith(submitLabel);
function setSubmitState(state,label){
  submitButton.dataset.state=state;
  submitLabel.textContent=label;
  submitButton.disabled=state==='loading';
  form.setAttribute('aria-busy',String(state==='loading'));
}
const query = new URLSearchParams(location.search);
for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
  const input = document.createElement('input');
  input.type = 'hidden'; input.name = `form_fields[${key}]`; input.value = query.get(key) || '';
  form.append(input);
}
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (submitButton.disabled || !form.reportValidity()) return;
  statusMessage.hidden = false;
  // Elementor requires its live WordPress context and a fresh nonce.
  // Never send preview leads or show a fabricated success state.
  const config = window.elementorProFrontendConfig;
  if (location.origin !== 'https://upskillseducacao.com.br' || !config?.nonce) {
    setSubmitState('unavailable','Conclua no site oficial');
    statusMessage.textContent = 'Para receber seu cupom, conclua o cadastro no site oficial da UpSkills. Os dados preenchidos aqui não foram enviados.';
    officialLink.hidden = false;
    officialLink.focus();
    return;
  }
  const button = form.querySelector('button[type="submit"]');
  setSubmitState('loading','Enviando cadastro…'); statusMessage.textContent = 'Enviando seu cadastro…';
  const payload = new FormData(form); payload.set('referrer', location.href);
  payload.set('_nonce', config.nonce);
  try {
    const response = await fetch(form.action, {method:'POST', body:payload, credentials:'same-origin'});
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error('Submission failed');
    statusMessage.textContent = result.data?.message || 'Cadastro recebido! Nossa equipe entrará em contato.';
    setSubmitState('success','Cadastro recebido');
    form.reset();
    if (result.data?.redirect_url) {
      const destination = new URL(result.data.redirect_url, location.origin);
      if (destination.protocol === 'https:') location.assign(destination.href);
    }
  } catch {
    setSubmitState('error','Tentar novamente');
    statusMessage.textContent = 'Não foi possível enviar seu cadastro. Tente novamente ou conclua no site oficial.';
    officialLink.hidden = false;
  } finally {button.disabled = false;form.setAttribute('aria-busy','false');}
});

// Pause decorative motion offscreen and when the tab is hidden.
const hero = document.querySelector('.hero');
let heroVisible = false;
const syncAmbientMotion = () => { hero.dataset.motion = heroVisible && !document.hidden ? 'active' : 'paused'; };
const heroObserver = new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; syncAmbientMotion(); });
heroObserver.observe(hero);
document.addEventListener('visibilitychange', syncAmbientMotion);

// Scroll expansion is bounded (90–100% of a maximum 900px player), with no sticky scroll trap.
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const videoStage = document.querySelector('.video-scroll-stage');
const videoFrame = videoStage.querySelector('.program-video');
let videoTick = false;
function updateVideoScale() {
  videoTick = false;
  if (motionPreference.matches) { videoFrame.style.transform = 'none'; return; }
  const top = videoStage.getBoundingClientRect().top;
  const progress = Math.max(0, Math.min(1, (innerHeight - top) / (innerHeight * .65)));
  videoFrame.style.transform = `translateY(${(28 * (1-progress)).toFixed(2)}px) rotateX(${(32 * (1-progress)).toFixed(2)}deg) scale(${(.9 + .1 * progress).toFixed(4)})`;
}
function queueVideoScale() { if (!videoTick) { videoTick = true; requestAnimationFrame(updateVideoScale); } }
addEventListener('scroll', queueVideoScale, {passive:true});
addEventListener('resize', queueVideoScale, {passive:true});
motionPreference.addEventListener('change', queueVideoScale);
queueVideoScale();

const marquee = document.querySelector('.logo-marquee');
let marqueeVisible = false;
function syncMarquee() { marquee.dataset.running = String(marqueeVisible && !document.hidden && !motionPreference.matches); }
new IntersectionObserver(([entry]) => { marqueeVisible = entry.isIntersecting; syncMarquee(); }).observe(marquee);
document.addEventListener('visibilitychange', syncMarquee);
motionPreference.addEventListener('change', syncMarquee);

// Reveal once scrolling reaches the video end, leaving room for the banner below it.
const floatingOffer = document.querySelector('.floating-offer');
const offerForm = document.querySelector('#forms');
const offerVideo = document.querySelector('.video-embed');
const offerFooter = document.querySelector('footer');
let offerTick = false,offerShown=false,offerAnimation;
function setOfferVisible(show){
  if(show===offerShown)return;
  offerShown=show;
  const current=getComputedStyle(floatingOffer);
  const from=offerAnimation?{opacity:current.opacity,transform:current.transform}:{opacity:show?0:1,transform:`translate(-50%,${show?12:0}px)`};
  offerAnimation?.cancel();
  floatingOffer.inert=!show;
  floatingOffer.setAttribute('aria-hidden',String(!show));
  if(motionPreference.matches){floatingOffer.hidden=!show;return;}
  floatingOffer.hidden=false;
  offerAnimation=floatingOffer.animate([from,{opacity:show?1:0,transform:`translate(-50%,${show?0:12}px)`}],{duration:show?220:150,easing:'cubic-bezier(.23,1,.32,1)'});
  offerAnimation.onfinish=()=>{floatingOffer.hidden=!offerShown;offerAnimation=null;};
}
function updateFloatingOffer() {
  offerTick = false;
  const videoPassed = offerVideo.getBoundingClientRect().bottom <= innerHeight - 88;
  const footerVisible = offerFooter.getBoundingClientRect().top < innerHeight;
  const formRect = offerForm.getBoundingClientRect();
  const formVisible = formRect.top < innerHeight && formRect.bottom > 0;
  setOfferVisible(videoPassed && !formVisible && !footerVisible);
}
function queueFloatingOffer() { if (!offerTick) { offerTick = true; requestAnimationFrame(updateFloatingOffer); } }
addEventListener('scroll', queueFloatingOffer, {passive:true});
addEventListener('resize', queueFloatingOffer);
addEventListener('load', queueFloatingOffer);
new ResizeObserver(queueFloatingOffer).observe(document.body);
updateFloatingOffer();

// Reference choreography: one-time entrances and truthful, final-value counters.
const revealTargets = document.querySelectorAll('.craft-card,.proof-stats>div,.testimonials-heading,.mentor-profile-photo,.mentor-profile-story>h3,.mentor-profile-story>p,.mentor-profile-roles,.mentor-profile-stats,.mentor-profile-companies');
const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (!entry.isIntersecting) return;
  const el = entry.target;
  el.classList.remove('reveal-pending'); el.classList.add('is-revealed');
  el.querySelectorAll('[data-count]').forEach(counter => {
    const end = Number(counter.dataset.count);
    if (motionPreference.matches) return;
    const start = performance.now();
    const animate = now => {
      const p = Math.min(1,(now-start)/1600);
      counter.textContent = Math.round(end*(1-Math.pow(1-p,4))).toLocaleString('pt-BR');
      if (p<1 && !motionPreference.matches) requestAnimationFrame(animate);
      else counter.textContent=end.toLocaleString('pt-BR');
    };
    requestAnimationFrame(animate);
  });
  revealObserver.unobserve(el);
}),{threshold:.16});
revealTargets.forEach((el,i)=>{el.dataset.reveal=''; if(!motionPreference.matches) el.classList.add('reveal-pending'); el.style.transitionDelay=`${i%3*60}ms`;revealObserver.observe(el);});
const ambientTargets = document.querySelectorAll('.craft-card,.connection-scene,.sigma-dome');
const ambientVisible = new Set();
const syncCraftMotion = () => ambientTargets.forEach(el=>el.classList.toggle('is-running',ambientVisible.has(el)&&!document.hidden&&!motionPreference.matches));
const craftObserver=new IntersectionObserver(entries=>{entries.forEach(e=>e.isIntersecting?ambientVisible.add(e.target):ambientVisible.delete(e.target));syncCraftMotion();});
ambientTargets.forEach(el=>craftObserver.observe(el));
document.addEventListener('visibilitychange',syncCraftMotion);motionPreference.addEventListener('change',syncCraftMotion);
// Spotlights follow the pointer with direct compositor transforms, never moving copy.
const finePointer=matchMedia('(hover:hover) and (pointer:fine)');
document.querySelectorAll('.craft-card,.connection-scene').forEach(el=>{
  const light=document.createElement('span');light.className='craft-light';light.setAttribute('aria-hidden','true');el.append(light);
  let tick=false,x=0,y=0;
  el.addEventListener('pointermove',e=>{if(!finePointer.matches||motionPreference.matches)return;const r=el.getBoundingClientRect();x=e.clientX-r.left-160;y=e.clientY-r.top-160;if(!tick){tick=true;requestAnimationFrame(()=>{light.style.transform=`translate3d(${x}px,${y}px,0)`;tick=false;});}},{passive:true});
});
// Reference testimonial accordion: same proportions, delays and seven-second cycle.
(()=>{
 const voices=[...document.querySelectorAll('.voice')], deck=document.querySelector('.voices');
 let vi=1,vt,visible=false,hovering=false;
 const held=()=>hovering||deck.contains(document.activeElement);
 function schedule(){clearTimeout(vt);deck.dataset.paused=String(!visible||document.hidden||motionPreference.matches||held());if(visible&&!document.hidden&&!motionPreference.matches&&!held())vt=setTimeout(()=>{deck.classList.remove('manual','keyboard');setVoice((vi+1)%voices.length);},7000);}
 function setVoice(i){vi=i;voices.forEach((v,k)=>{v.classList.toggle('on',k===i);v.setAttribute('aria-expanded',String(k===i));v.querySelector('blockquote').setAttribute('aria-hidden',String(k!==i));});schedule();}
 voices.forEach((v,i)=>{v.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&finePointer.matches){hovering=true;deck.classList.add('manual');deck.classList.remove('keyboard');setVoice(i);}});v.addEventListener('click',e=>{deck.classList.add('manual');deck.classList.toggle('keyboard',e.detail===0);setVoice(i);});});
 deck.addEventListener('pointerleave',()=>{hovering=false;schedule();});
 deck.addEventListener('focusin',schedule);
 deck.addEventListener('focusout',()=>requestAnimationFrame(schedule));
 new IntersectionObserver(([e])=>{visible=e.isIntersecting;schedule();},{threshold:.4}).observe(deck);
 document.addEventListener('visibilitychange',schedule);motionPreference.addEventListener('change',schedule);setVoice(1);
})();
// Particle and tile geometry ported from referencia.html.
(()=>{
  const cv = document.querySelector('.particle-halo'), ctx = cv.getContext('2d');
  let W, H, dpr, R;
  const sprite = document.createElement('canvas'); sprite.width = sprite.height = 32;
  { const s = sprite.getContext('2d'); const g = s.createRadialGradient(16,16,0,16,16,16);
    g.addColorStop(0,'rgba(220,235,255,1)'); g.addColorStop(.25,'rgba(120,175,255,.8)'); g.addColorStop(1,'rgba(47,107,255,0)');
    s.fillStyle = g; s.fillRect(0,0,32,32); }
  const gauss = () => (Math.random()+Math.random()+Math.random()-1.5)/1.5;
  const N = innerWidth < 700 ? 700 : 1500;
  const P = Array.from({length:N}, () => ({
    a: Math.random()*Math.PI*2,
    r: 1 + gauss()*0.07,
    z: gauss()*0.06,
    s: 0.05 + Math.random()*0.08,
    k: 0.4 + Math.random()*1.4,
    tw: Math.random()*Math.PI*2
  }));
  const size = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W*dpr; cv.height = H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
    R = Math.min(W*0.46, 640);
  };
  size(); addEventListener('resize', size);
  let mx = 0, my = 0, tmx = 0, tmy = 0, heroVisible = true;
  addEventListener('pointermove', e => { if(!finePointer.matches || motionPreference.matches) return; tmx = e.clientX/innerWidth - .5; tmy = e.clientY/innerHeight - .5; }, {passive:true});
  new IntersectionObserver(([e]) => heroVisible = e.isIntersecting).observe(hero);
  let t0 = performance.now();
  const tiles = [...document.querySelectorAll('.tile')];
  function frame(now){
    requestAnimationFrame(frame);
    if(!heroVisible || document.hidden) return;
    const reduce = motionPreference.matches;
    const t = reduce ? 2.2 : (now - t0)/1000;
    mx += (tmx-mx)*.05; my += (tmy-my)*.05;
    ctx.clearRect(0,0,W,H);
    ctx.globalCompositeOperation = 'lighter';
    const cx = W/2 + mx*40, cy = H*0.64 + my*20;
    const tilt = 0.2 + my*0.08;
    const intro = Math.min(1, t/2.2), ease = 1 - Math.pow(1-intro, 3);
    for (const p of P){
      const ang = p.a + (reduce ? 0 : t*p.s) ;
      const rr = R*p.r*(0.6 + 0.4*ease);
      const depth = Math.sin(ang);
      const x = cx + Math.cos(ang)*rr;
      const y = cy + depth*rr*tilt + p.z*R + mx*depth*30;
      const front = (depth+1)/2;
      const a = (0.12 + 0.88*front) * (0.6 + 0.4*Math.sin(t*2+p.tw)) * ease;
      const s = p.k*(1.6 + front*3.2);
      ctx.globalAlpha = a;
      ctx.drawImage(sprite, x-s, y-s, s*2, s*2);
    }
    ctx.globalAlpha = 1;
    tiles.forEach(el => { const d = +el.dataset.depth; el.style.transform = `translate3d(${mx*d*-2}px, ${my*d*-2}px, 0)`; });
  }
  requestAnimationFrame(frame);


})();
const voiceReveal=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.remove('pending');voiceReveal.unobserve(e.target);}}),{threshold:.2,rootMargin:'0px 0px -8% 0px'});
document.querySelectorAll('.reference-testimonials .rv').forEach(el=>{if(!motionPreference.matches)el.classList.add('pending');voiceReveal.observe(el);});

// One PDCA story, one focal sphere. Manual selection restarts the cycle timer.
(()=>{
 const orb=document.querySelector('.cycle-orb'), stops=[...orb.querySelectorAll('.orb-stop')];
 const title=orb.querySelector('.orb-title'), description=orb.querySelector('.orb-description'), letter=orb.querySelector('.orb-letter'), count=orb.querySelector('.orb-step-count');
 const traveler=orb.querySelector('.orb-traveler');
 let active=0, turn=0, timer, visible=false;
 function sync(){clearTimeout(timer);orb.classList.toggle('running',visible&&!document.hidden&&!motionPreference.matches);if(visible&&!document.hidden&&!motionPreference.matches)timer=setTimeout(()=>show((active+1)%4),2800);}
 function show(index){let distance=(index-active+4)%4;turn+=distance*90;active=index;orb.dataset.step=String(index);stops.forEach((el,i)=>el.setAttribute('aria-pressed',String(i===index)));title.textContent=stops[index].dataset.title;description.textContent=stops[index].dataset.description;letter.textContent=stops[index].dataset.letter;count.textContent=`0${index+1} / 04`;traveler.style.transform=`rotate(${turn}deg)`;if(!motionPreference.matches)orb.querySelector('.orb-content').animate([{opacity:.25,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:350,easing:'cubic-bezier(.22,1,.36,1)'});sync();}
 stops.forEach((el,i)=>el.addEventListener('click',()=>show(i)));
 new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();},{threshold:.4}).observe(orb);document.addEventListener('visibilitychange',sync);motionPreference.addEventListener('change',sync);sync();
})();

// Belt visuals stay decorative: the explanation is always available to read.
(()=>{
 const section=document.querySelector('.belt-journey');
 let visible=false;
 const sync=()=>section.classList.toggle('is-playing',visible&&!document.hidden&&!motionPreference.matches);
 new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();},{threshold:.1}).observe(section);
 document.addEventListener('visibilitychange',sync);motionPreference.addEventListener('change',sync);
 const reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.remove('belt-pending');reveal.unobserve(entry.target);}}),{threshold:.15});
 section.querySelectorAll('.belt-chapter').forEach(el=>{if(!motionPreference.matches)el.classList.add('belt-pending');reveal.observe(el);});
})();

// One invitation per tab session; never interrupt someone entering their details.
(()=>{
 const modal=document.querySelector('#enrollment-modal');
 const sessionKey='upskills:enrollment-invitation:v1';
 let seen=false,started=false,timer;
 try{seen=sessionStorage.getItem(sessionKey)==='seen';}catch{}
 const hasDetails=()=>[...form.querySelectorAll('input:not([type="hidden"]),select')].some(field=>field.value.trim());
 function showInvitation(){
   if(seen||started||hasDetails()||document.hidden||form.contains(document.activeElement))return;
   seen=true;clearTimeout(timer);
   try{sessionStorage.setItem(sessionKey,'seen');}catch{}
   modal.showModal();
 }
 function schedule(){clearTimeout(timer);if(!seen&&!started&&!document.hidden)timer=setTimeout(showInvitation,Math.max(0,40000-performance.now()));}
 function beginForm(){started=true;clearTimeout(timer);}
 document.querySelector('.faq-question').addEventListener('input',beginForm);
 form.addEventListener('input',beginForm);form.addEventListener('change',beginForm);form.addEventListener('submit',beginForm);
 form.addEventListener('focusin',()=>clearTimeout(timer));form.addEventListener('focusout',schedule);
 let closeTimer;
 function closeInvitation(after){
   if(!modal.open||modal.classList.contains('is-closing'))return;
   const finish=()=>{modal.close();modal.classList.remove('is-closing');after?.();};
   if(motionPreference.matches){finish();return;}
   modal.classList.add('is-closing');closeTimer=setTimeout(finish,150);
 }
 modal.addEventListener('close',()=>{clearTimeout(closeTimer);modal.classList.remove('is-closing');});
 modal.addEventListener('cancel',event=>{event.preventDefault();closeInvitation();});
 modal.querySelector('.enrollment-close').addEventListener('click',()=>closeInvitation());
 modal.querySelector('.enrollment-dismiss').addEventListener('click',()=>closeInvitation());
 modal.addEventListener('click',event=>{if(event.target!==modal)return;const rect=modal.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeInvitation();});
 modal.querySelector('.enrollment-action').addEventListener('click',event=>{
   event.preventDefault();closeInvitation(()=>{
   form.scrollIntoView({behavior:motionPreference.matches?'instant':'smooth',block:'center'});
   form.querySelector('#nome').focus({preventScroll:true});
   });
 });
 document.addEventListener('mouseout',event=>{if(event.relatedTarget===null&&event.clientY<=0&&finePointer.matches)showInvitation();});
 document.addEventListener('visibilitychange',schedule);
 schedule();
})();

// Scroll-driven vocabulary drum. WORDS is the single source for the sequence.
(()=>{
 const WORDS=['Gestão','DMAIC','Mapeamento','Desperdícios','Causa-raiz','Estatística','Medição','Capabilidade','Experimentos','Controle'];
 const SYMBOLS=['person.3.sequence','arrow.triangle.2.circlepath','point.3.connected.trianglepath.dotted','trash','magnifyingglass','chart.bar.xaxis','ruler','gauge.with.dots.needle.67percent','flask','slider.horizontal.3'];
 const N=WORDS.length, DWELL=.55, SCROLL_PER_WORD=.7, RESPONSE=.5;
 const section=document.querySelector('.mastery-scroll'),container=section.querySelector('.mastery-words');
 const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
 const smooth=t=>t*t*(3-2*t);
 function dwellEase(p){const seg=Math.floor(p);const f=clamp((p-seg-DWELL/2)/(1-DWELL),0,1);return seg+smooth(f);}
 const words=WORDS.map((word,index)=>{const el=document.createElement('span');el.className='mastery-word';const bright=document.createElement('span');bright.className='mastery-layer grad';const icon=document.createElement('span');icon.className='mastery-symbol';icon.style.maskImage=`url(assets/sf-symbols/${SYMBOLS[index]}.png)`;icon.style.webkitMaskImage=icon.style.maskImage;const label=document.createElement('span');label.className='grad';label.textContent=word;bright.className='mastery-layer';bright.append(icon,label);const muted=document.createElement('span');muted.className='mastery-layer mastery-muted';muted.append(icon.cloneNode(true),document.createTextNode(word));el.append(bright,muted);container.append(el);return {el,muted};});
 section.querySelector('.mastery-accessible').textContent=WORDS.join(', ')+'.';
 let step=1,y=0,vy=0,target=0,last=0,raf=0,visible=false;
 const omega=2*Math.PI/RESPONSE;
 function setTarget(){const rect=section.getBoundingClientRect();const sectionTop=rect.top+scrollY;const p=clamp((scrollY-sectionTop)/Math.max(1,section.offsetHeight-section.querySelector('.mastery-stage').offsetHeight),0,1);target=dwellEase(p*(N-1))*step;}
 function render(){words.forEach(({el,muted},i)=>{const rel=i*step-y;const d=Math.min(Math.abs(rel/step),2.6);el.style.transform=`translate(-50%, -50%) translateY(${rel.toFixed(2)}px) scale(${(1-d*.04).toFixed(4)})`;el.style.filter=`blur(${(d*2.6).toFixed(2)}px)`;el.style.opacity=Math.max(0,1-d*.42).toFixed(4);muted.style.opacity=smooth(clamp(d/.45,0,1)).toFixed(4);});}
 function frame(now){raf=0;setTarget();const dt=Math.min((now-last)/1000,1/30);last=now;if(motionPreference.matches||!visible){y=target;vy=0;}else{const x=y-target;const a=-omega*omega*x-2*omega*vy;vy+=a*dt;y+=vy*dt;}if(Math.abs(y-target)<.01&&Math.abs(vy)<.01){y=target;vy=0;}render();if(visible&&!document.hidden&&(Math.abs(y-target)>=.01||Math.abs(vy)>=.01))raf=requestAnimationFrame(frame);}
 function queue(){if(!raf&&!document.hidden){last=performance.now();raf=requestAnimationFrame(frame);}}
 function measure(){words.forEach(({el})=>el.style.transform='none');step=Math.max(...words.map(({el})=>el.getBoundingClientRect().height))*1.44;const mobile=innerWidth<=700;const stageHeight=section.querySelector('.mastery-stage').offsetHeight;section.style.height=((N-1)*innerHeight*(mobile?.38:SCROLL_PER_WORD)+stageHeight)+'px';setTarget();y=target;vy=0;render();queue();}
 new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;queue();}).observe(section);
 addEventListener('scroll',queue,{passive:true});addEventListener('resize',measure);addEventListener('load',measure);document.fonts.ready.then(measure);motionPreference.addEventListener('change',queue);document.addEventListener('visibilitychange',queue);measure();
})();

// Native FAQ semantics with reversible pointer-driven expansion.
document.querySelectorAll('.faq details').forEach(details=>{
 const summary=details.querySelector('summary');
 let animation,expanded=details.open;
 summary.addEventListener('click',event=>{
   if(event.detail===0||motionPreference.matches){event.preventDefault();animation?.cancel();animation=null;expanded=!expanded;details.open=expanded;details.style.height='';details.style.overflow='';details.classList.remove('is-expanding');delete details.dataset.expanded;return;}
   event.preventDefault();
   const from=details.getBoundingClientRect().height;
   animation?.cancel();expanded=!expanded;
   details.style.height='';details.style.overflow='hidden';
   details.open=false;const closed=details.getBoundingClientRect().height;
   details.open=true;const opened=details.getBoundingClientRect().height;
   details.classList.toggle('is-expanding',expanded);
   details.dataset.expanded=String(expanded);
   animation=details.animate([{height:from+'px'},{height:(expanded?opened:closed)+'px'}],{duration:220,easing:'cubic-bezier(.23,1,.32,1)'});
   animation.onfinish=()=>{details.open=expanded;details.style.height='';details.style.overflow='';delete details.dataset.expanded;animation=null;};
 });
});

// Explicit handoff: prepare a message, never send it on the visitor's behalf.
(()=>{
 const questionForm=document.querySelector('.faq-question');
 const input=questionForm.querySelector('input'),button=questionForm.querySelector('button'),status=questionForm.querySelector('.faq-question-status');
 let timer;
 function reset(){clearTimeout(timer);questionForm.dataset.loading='false';questionForm.setAttribute('aria-busy','false');input.readOnly=false;button.disabled=false;status.textContent='';}
 input.addEventListener('input',()=>{input.setCustomValidity('');status.textContent='';});
 questionForm.addEventListener('submit',event=>{
   event.preventDefault();if(questionForm.dataset.loading==='true')return;
   const question=input.value.trim();
   if(!question){input.setCustomValidity('Escreva sua pergunta para continuar.');input.reportValidity();return;}
   const phone=questionForm.dataset.whatsapp;
   if(!/^\d{10,15}$/.test(phone)){status.textContent='O atendimento pelo WhatsApp estará disponível em breve.';return;}
   const destination=new URL('https://wa.me/'+phone);
   destination.searchParams.set('text','Olá! Tenho uma dúvida sobre a formação Lean 6 Sigma: '+question);
   questionForm.dataset.loading='true';questionForm.setAttribute('aria-busy','true');input.readOnly=true;button.disabled=true;
   status.textContent='Abrindo WhatsApp…';
   timer=setTimeout(()=>{window.location.assign(destination.href);},350);
 });
 addEventListener('pageshow',reset);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&questionForm.dataset.loading==='true')reset();});
})();

// Branded select-only comboboxes; native selects retain submission values.
(()=>{
 let closeCurrent;
 form.querySelectorAll('select').forEach(select=>{
  const field=select.closest('.field'),label=field.querySelector('label');
  const shell=document.createElement('div');shell.className='site-select';
  const trigger=document.createElement('button');trigger.type='button';trigger.id=select.id+'-control';trigger.className='site-select-trigger';
  trigger.setAttribute('role','combobox');trigger.setAttribute('aria-haspopup','listbox');trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-required',String(select.required));
  const text=document.createElement('span');const chevron=document.createElement('span');chevron.className='select-chevron';chevron.setAttribute('aria-hidden','true');chevron.textContent='⌄';trigger.append(text,chevron);
  const menu=document.createElement('div');menu.id=select.id+'-options';menu.className='site-select-menu';menu.setAttribute('role','listbox');menu.setAttribute('aria-label',label.textContent);menu.hidden=true;trigger.setAttribute('aria-controls',menu.id);
  const error=document.createElement('p');error.id=select.id+'-error';error.className='site-select-error';error.hidden=true;error.textContent='Selecione uma opção para continuar.';trigger.setAttribute('aria-describedby',error.id);
  const options=[...select.options].filter(o=>!o.disabled);let active=0,open=false,typed='',typeTimer;
  const items=options.map((option,i)=>{const item=document.createElement('div');item.id=select.id+'-option-'+i;item.className='site-select-option';item.setAttribute('role','option');item.textContent=option.textContent;item.addEventListener('pointerdown',e=>e.preventDefault());item.addEventListener('click',()=>choose(i));menu.append(item);return item;});
  function highlight(i){active=(i+items.length)%items.length;items.forEach((el,k)=>el.classList.toggle('is-active',k===active));trigger.setAttribute('aria-activedescendant',items[active].id);const item=items[active];if(item.offsetTop<menu.scrollTop)menu.scrollTop=item.offsetTop;else if(item.offsetTop+item.offsetHeight>menu.scrollTop+menu.clientHeight)menu.scrollTop=item.offsetTop+item.offsetHeight-menu.clientHeight;}
  function sync(){text.textContent=select.selectedOptions[0]?.textContent||'Selecione uma opção';trigger.classList.toggle('is-placeholder',!select.value);items.forEach((el,i)=>el.setAttribute('aria-selected',String(options[i].value===select.value)));if(select.value){error.hidden=true;trigger.removeAttribute('aria-invalid');}}
  function close(){open=false;menu.hidden=true;trigger.setAttribute('aria-expanded','false');trigger.removeAttribute('aria-activedescendant');shell.classList.remove('is-open');if(closeCurrent===close)closeCurrent=null;}
  function show(keyboard=false){closeCurrent?.();closeCurrent=close;open=true;menu.hidden=false;trigger.setAttribute('aria-expanded','true');shell.classList.add('is-open');shell.classList.toggle('by-keyboard',keyboard);const r=trigger.getBoundingClientRect(),below=innerHeight-r.bottom-16,above=r.top-16;const up=below<220&&above>below;shell.classList.toggle('opens-up',up);menu.style.maxHeight=Math.max(100,Math.min(280,up?above:below))+'px';highlight(Math.max(0,options.findIndex(o=>o.value===select.value)));}
  function choose(i){select.value=options[i].value;sync();close();trigger.focus({preventScroll:true});select.dispatchEvent(new Event('input',{bubbles:true}));select.dispatchEvent(new Event('change',{bubbles:true}));}
  trigger.addEventListener('click',e=>open?close():show(e.detail===0));
  trigger.addEventListener('keydown',e=>{
   if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();const wasOpen=open;if(!open)show(true);if(e.key==='Home')highlight(0);else if(e.key==='End')highlight(items.length-1);else if(wasOpen)highlight(active+(e.key==='ArrowDown'?1:-1));}
   else if(e.key==='Escape'&&open){e.preventDefault();e.stopPropagation();close();}
   else if(e.key==='Tab'){close();}
   else if((e.key==='Enter'||e.key===' ')&&open){e.preventDefault();choose(active);}
   else if(e.key.length===1&&e.key!==' '&&!e.ctrlKey&&!e.metaKey&&!e.altKey){e.preventDefault();clearTimeout(typeTimer);typed+=e.key.toLocaleLowerCase();typeTimer=setTimeout(()=>typed='',600);if(!open)show(true);const i=options.findIndex(o=>o.textContent.toLocaleLowerCase().startsWith(typed));if(i>=0)highlight(i);}
  });
  document.addEventListener('pointerdown',e=>{if(open&&!shell.contains(e.target))close();});trigger.addEventListener('blur',close);
  select.addEventListener('change',sync);select.addEventListener('invalid',e=>{e.preventDefault();trigger.setAttribute('aria-invalid','true');error.hidden=false;if(!form.querySelector('.site-select-trigger[aria-invalid=true]')||form.querySelector('.site-select-trigger[aria-invalid=true]')===trigger)trigger.focus();});
  form.addEventListener('reset',()=>setTimeout(()=>{close();sync();error.hidden=true;trigger.removeAttribute('aria-invalid');},0));
  addEventListener('resize',close);
  select.classList.add('select-source');select.tabIndex=-1;select.setAttribute('aria-hidden','true');label.htmlFor=trigger.id;
  select.after(shell);shell.append(trigger,menu,error);sync();
 });
})();
