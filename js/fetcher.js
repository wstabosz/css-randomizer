const baseUrl = 'https://wstabosz.github.io/css-randomizer/artwork'

const artPieces = {
    'purecss-lace': {
        html: 'index.html'
        ,css: ['style.css']
    }
    ,'purecss-francine': {
        html: 'index.html'
        ,css: ['francine.css']
    }
    ,'purecss-pink': {
        html: 'index.html'
        ,css: ['pink.css']
    }
    ,'purecss-gaze': {
        html: 'index.html'
        ,css: ['style.css']
    }
    ,'purecss-zigario': {
        html: 'index.html'
        ,css: ['zigario.css','font.css']
    }
    ,'purecss-vignes': {
        html: 'index.html'
        ,css: ['vignes.css','font.css']
    }
    ,'purecss-character': {
        html: 'index.html'
        ,css: ['style.css']
    }    
};

function buildUrls(key) {
    let html = artPieces[key].html;
    let css = artPieces[key].css;
    
    return {
        html: `${baseUrl}/${key}/${html}`
        , css: css.map(x=> `${baseUrl}/${key}/${x}`)
    };       

}

/**
  * @param {String} url - address for the HTML to fetch
  * @return {String} the resulting HTML string fragment
  * https://stackoverflow.com/a/52349344/740639
  */
 async function fetchHtmlAsText(url) {
    return await (await fetch(url)).text();
}

async function loadArtwork(key) {

    let urls = buildUrls(key);
    fetchAndInjectHtml(urls.html);
    fetchAndInjectCss(urls.css);

    // I added a timeout because I couldn't figure out a way
    // to detect when the browser had applied the stylesheets 
    setTimeout(afterLoadArtwork,1000);
    
}

async function afterLoadArtwork() {

    var tests = (cssText) => {
        return containsColorStyles(cssText) || containsDisplay(cssText);
    };

    let styleSheet = await getStyleSheet();
    buildStyleCache(styleSheet, tests);

    ui_main();

}


function getStyleSheet() {

    const get = () => {
        var ss = document.styleSheets;
        for(let i=0;i<ss.length;i++) {
            if (ss[i].title == 'artwork-stylesheet')
                return ss[i];
        }
        return null;
    };

    // this setInterval loop is to prevent an error
    // where document.styleSheets[0] is undefined
    // until after the browser has finished parsing styles
    return new Promise(resolve => {
        let styleSheet = get();

        if(styleSheet)
            resolve(styleSheet);
        
        let id = setInterval(() => {
            styleSheet = get();
            if(styleSheet) {
                clearInterval(id);
                resolve(styleSheet);
            }
        },300);
    });

}

async function fetchAndInjectHtml(url) {
    let html = await fetchHtmlAsText(url);
    html = getTextInsideBodyElement(html);    
    clearBody();
    document.body.innerHTML = html;
}

function clearBody() {
    var range = document.createRange();
    range.selectNodeContents(document.body);
    range.deleteContents();
}


/**
@description Given a string of HTML, find the contents inside the body
@param {string} html A string of HTML
@return {string} a string of the HTML found inside the body element
*/
function getTextInsideBodyElement(html) {
    return html.substring(
        html.indexOf('<body>')+'<body>'.length
        ,html.indexOf('</body>')
    );
}

async function fetchAndInjectCss(url,callback) {

    let id = 'art-style';

    let style = document.getElementById(id);
    if (style)
        style.remove();
    
    style = document.createElement('style');
    style.setAttribute('id',id);
    style.setAttribute('title','artwork-stylesheet');

    let css = [];

    for(let i=0;i<url.length;i++)
        css.push(await fetchHtmlAsText(url[i]));        
    
    style.innerText = css.join('');

    let head = document.getElementsByTagName('head')[0];
    head.appendChild(style);

}