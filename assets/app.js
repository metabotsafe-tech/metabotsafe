// Stripe Checkout via Netlify Function, 1€
window.startCheckout = async function(name){
  const email = prompt('Votre e-mail (pour recevoir le guide PDF):') || undefined;
  try {
    const res = await fetch('/.netlify/functions/create-checkout-session', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ name, email })
    });
    const j = await res.json();
    if (j.url) window.location = j.url;
    else alert('Erreur de paiement');
  } catch(e){ console.error(e); alert('Erreur réseau'); }
};

// Langues: FR↔EN local; autres via Google Translate
(function(){
  function applyEN(){
    const map = {
      'Accueil':'Home','Mon compte':'My account','Panier':'Cart','FAQ':'FAQ',
      'Conseils pour bien investir':'Investment tips','Nos catégories':'Our categories',
      'En développement':'Roadmap','Voir les bots':'See bots','Voir le pack':'See pack',
      'Retour':'Back'
    };
    const sel = (q) => Array.from(document.querySelectorAll(q));
    sel('a, h1, h2, h3, button, .site-footer, p, li, summary').forEach(el=>{
      const t = (el.textContent||'').trim();
      if (t && map[t]) el.textContent = map[t];
    });
  }
  window.changeLanguage = function(lang){
    if (lang==='fr'){ localStorage.removeItem('lang'); location.reload(); return; }
    if (lang==='en'){ localStorage.setItem('lang','en'); applyEN(); return; }
    const url = 'https://translate.google.com/translate?sl=auto&tl='+encodeURIComponent(lang)+'&u='+encodeURIComponent(location.href);
    window.open(url,'_blank');
  };
  document.addEventListener('DOMContentLoaded', function(){
    if (localStorage.getItem('lang')==='en') applyEN();
  });
})();