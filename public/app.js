const strings=JSON.parse(document.querySelector("#ui-strings").textContent);
const themeButton=document.querySelector('.theme');
try{const saved=localStorage.getItem('hcai-theme');if(saved)document.documentElement.dataset.theme=saved;}catch{}
themeButton?.addEventListener('click',()=>{const dark=document.documentElement.dataset.theme==='dark'||(!document.documentElement.dataset.theme&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=dark?'light':'dark';try{localStorage.setItem('hcai-theme',dark?'light':'dark');}catch{}});
const input=document.querySelector('input[type=search]');let category='all';
function filter(){const q=input.value.toLowerCase().trim();let count=0;document.querySelectorAll('.post').forEach(p=>{p.hidden=!((category==='all'||p.dataset.category===category)&&p.dataset.search.includes(q));if(!p.hidden)count++;});document.querySelector('.empty').hidden=count!==0;document.querySelector('.results').textContent=q||category!=='all'?strings.found.replace('{n}',count):'';document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b.dataset.filter===category);b.setAttribute('aria-pressed',String(b.dataset.filter===category));});}
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.filter;filter();}));
document.querySelectorAll('[data-library]').forEach(a=>a.addEventListener('click',()=>{category=a.dataset.library;input.value='';filter();}));input?.addEventListener('input',filter);
document.addEventListener('keydown',e=>{if(e.key==='/'&&input&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();input.focus();}});
if(input)filter();
document.querySelectorAll('.prose pre').forEach(pre=>{const b=document.createElement('button');b.className='copy';b.textContent=strings.copy;b.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(pre.querySelector('code').textContent);b.textContent=strings.copied;setTimeout(()=>b.textContent=strings.copy,1600);}catch{b.textContent=strings.copyFail;}});pre.append(b);});


const languageToggle=document.querySelector('.language-toggle');
const languagePanel=document.querySelector('.language-panel');
languageToggle?.addEventListener('click',()=>{languagePanel.hidden=!languagePanel.hidden;languageToggle.setAttribute('aria-expanded',String(!languagePanel.hidden));});
document.addEventListener('click',e=>{if(!e.target.closest('.language')){languagePanel.hidden=true;languageToggle.setAttribute('aria-expanded','false');}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!languagePanel.hidden){languagePanel.hidden=true;languageToggle.setAttribute('aria-expanded','false');languageToggle.focus();}});
