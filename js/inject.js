// http://allben.net/post/2010/01/30/CSS-JavaScript-Injection-Bookmarklets
// javascript:(function(){var%20s=document.createElement('script');s.setAttribute('src','http://127.0.0.1:8080/inject.js');document.getElementsByTagName('body')[0].appendChild(s);})();

// the scripts are already loaded on the page


function inject(src) {
    var s=document.createElement('script');
    s.setAttribute('src',src);
    document.getElementsByTagName('body')[0].appendChild(s);
}

var scripts = [
    'js/getColorFunctions.js',
    'js/demos.js',
    'js/randomColorCssReplace.js',
    'js/ui.js'
];

var prefix = document.getElementById('injection').getAttribute('x-prefix');
console.log(prefix);

if(typeof colorComponents === 'undefined') {
    
    for (var i=0;i<scripts.length;i++) {
        inject(prefix + scripts[i]);
    }
} else {
    console.log('UI already injected.');
}