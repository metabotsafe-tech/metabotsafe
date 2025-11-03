// Google Translate widget loader
// This script injects the Google Translate widget into the language selector area
// and loads the Google Translate script. The widget allows translation into
// all supported languages provided by Google. It does not hard‑code a list
// of languages, so users can pick any language from the drop‑down menu.
(function(){
  // Called by Google once the translation library is loaded
  function googleTranslateElementInit() {
    // Create a TranslateElement. Leave includedLanguages undefined to allow all languages.
    new google.translate.TranslateElement({
      pageLanguage: 'fr',
      layout: google.translate.TranslateElement.InlineLayout.SIMPLE
    }, 'google_translate_element');
  }
  // Expose callback globally as Google requires a global function name
  window.googleTranslateElementInit = googleTranslateElementInit;
  // When the page is ready, insert the widget container and load Google script
  document.addEventListener('DOMContentLoaded', function(){
    // Find existing language selector container
    var container = document.querySelector('.lang-selector');
    if (!container) {
      // If no language selector exists, create one at the top of the body
      container = document.createElement('div');
      container.className = 'lang-selector';
      document.body.insertBefore(container, document.body.firstChild);
    }
    // Create the placeholder div for Google widget
    var div = document.createElement('div');
    div.id = 'google_translate_element';
    container.appendChild(div);
    // Load Google Translate library
    var script = document.createElement('script');
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.defer = true;
    document.body.appendChild(script);
  });
})();
