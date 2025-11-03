// GoatCounter analytics integration
// This script invisibly loads GoatCounter to count visits without showing any counter
(function(){
  document.addEventListener('DOMContentLoaded', function(){
    var script = document.createElement('script');
    script.setAttribute('data-goatcounter', 'https://metabotsafe.goatcounter.com/count');
    script.src = '//gc.zgo.at/count.js';
    script.async = true;
    document.body.appendChild(script);
  });
})();
