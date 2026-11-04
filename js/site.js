'use strict';
// Static, GitHub Pages compatible. GA4 tracking is initialized in document head.
document.documentElement.classList.add('js');
(() => {
  const btn = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.mobile-nav');
  if (btn && nav) {
    const toggle = (open) => {
      document.body.classList.toggle('menu-open', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
      nav.inert = !open;
    };
    btn.addEventListener('click', () => toggle(btn.getAttribute('aria-expanded') !== 'true'));
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggle(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') toggle(false); });
    window.addEventListener('resize', () => { if (window.innerWidth > 880) toggle(false); });
  }
  // Editorial reveal, gracefully skipped for users who prefer reduced motion.
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
    }), {threshold:.09,rootMargin:'0px 0px -30px 0px'});
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  } else {document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));}
  document.querySelectorAll('.current-year').forEach(el => el.textContent = String(new Date().getFullYear()));
  // Image viewer: all images are locally supplied and optimized for this site.
  const modal=document.getElementById('lightbox');
  if(modal){
    const target=modal.querySelector('img'),counter=modal.querySelector('.lightbox-counter');
    let items=[],index=0,previousFocus=null;
    const show=(i) => {
      index=(i+items.length)%items.length;
      target.src=items[index].dataset.src;
      target.alt=items[index].dataset.alt || '';
      counter.textContent=String(index+1).padStart(2,'0')+' / '+String(items.length).padStart(2,'0');
    };
    const close=()=>{
      if(modal.hidden)return;
      modal.hidden=true;document.body.style.overflow='';target.removeAttribute('src');
      if(previousFocus) previousFocus.focus();
    };
    document.querySelectorAll('[data-gallery]').forEach(item=>item.addEventListener('click',()=>{
      items=Array.from(document.querySelectorAll(`[data-gallery="${item.dataset.gallery}"]`));
      previousFocus=document.activeElement;
      show(items.indexOf(item));
      modal.hidden=false;
      document.body.style.overflow='hidden';
      modal.querySelector('.lightbox-close').focus();
    }));
    modal.querySelector('.lightbox-close').addEventListener('click',close);
    modal.querySelector('.lightbox-prev').addEventListener('click',()=>show(index-1));
    modal.querySelector('.lightbox-next').addEventListener('click',()=>show(index+1));
    modal.addEventListener('click',e=>{if(e.target===modal)close();});
    document.addEventListener('keydown',e=>{
      if(modal.hidden)return;
      if(e.key==='Escape')close();
      if(e.key==='ArrowLeft')show(index-1);
      if(e.key==='ArrowRight')show(index+1);
      if(e.key==='Tab'){
        const focusable=Array.from(modal.querySelectorAll('button'));
        const first=focusable[0],last=focusable[focusable.length-1];
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
        if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
      }
    });
  }
})();


// Existing DAYS inquiry flow, migrated from the previous homepage.
// Verify actual delivery to the authorized inbox after deploying.
(() => {
  const form=document.getElementById('contactForm');
  if (!form) return;
  const btn=document.getElementById('submitBtn');
  const status=document.getElementById('inquiry-feedback');
  const GAS_URL='https://script.google.com/macros/s/AKfycbzFj8AtuJKo5u8f3at5CemGUdp6-1RD-b7n9FCjeIm4bmPXmuFiBCt3z5m8j4sRmQgwfA/exec';
  form.addEventListener('submit',async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    btn.disabled=true;
    btn.textContent='SENDING...';
    status.textContent='送信中です。';
    status.dataset.state='pending';
    try {
      const response=await fetch(GAS_URL,{method:'POST',body:new FormData(form),redirect:'follow'});
      if (!response.ok) throw new Error('HTTP '+response.status);
      const data=await response.json();
      if (data && (data.success === false || data.status === 'error' || data.result === 'error')) throw new Error('GAS returned error');
      form.reset();
      status.textContent='お問い合わせを受け付けました。ご連絡ありがとうございます。';
      status.dataset.state='success';
    } catch (err) {
      status.textContent='送信できませんでした。お手数ですが、お電話でお問い合わせください。';
      status.dataset.state='error';
      console.error('Inquiry send failed:',err);
    } finally {
      btn.disabled=false;
      btn.innerHTML='SEND MESSAGE <span aria-hidden="true">↗</span>';
    }
  });
})();
