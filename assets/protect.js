(function(){
  const PASS = 'metabotsafe';
  if (sessionStorage.getItem('site_authenticated') === '1') return;
  const o = document.createElement('div');
  o.id='pw-overlay';
  o.innerHTML = `
  <style>
  #pw-overlay{position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:99999;display:flex;align-items:center;justify-content:center}
  #pw-box{background:#0b2133;color:#fff;padding:28px;border-radius:10px;width:320px;max-width:92%}
  #pw-box input{width:100%;padding:10px;margin-top:12px;border-radius:6px;border:1px solid #2b5a76;background:#071122;color:#fff}
  #pw-box button{margin-top:12px;padding:10px 14px;border-radius:6px;border:none;background:#ffbf00;color:#08181f;font-weight:700;cursor:pointer}
  </style>
  <div id="pw-box"><h3>Site en test — accès privé</h3>
    <p>Entrez le mot de passe :</p>
    <input id="pw-in" type="password" placeholder="mot de passe">
    <button id="pw-ok">Valider</button>
  </div>`;
  document.addEventListener('DOMContentLoaded', function(){ document.body.appendChild(o); });
  function ok(){
    const i = document.getElementById('pw-in');
    if (!i) return;
    if (i.value==='metabotsafe'){ sessionStorage.setItem('site_authenticated','1'); o.remove(); }
    else { i.value=''; i.placeholder='Incorrect'; i.focus(); }
  }
  document.addEventListener('click', function(ev){
    if (ev.target && ev.target.id==='pw-ok') ok();
  });
  document.addEventListener('keydown', function(e){
    if (e.key==='Enter'){ ok(); }
  });
})();