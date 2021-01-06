/*
    NOTE:
    This code was written while I was still learning modern JS
    
    There are coding bad practices such as demos[] being referenced in this
    file, but defined in demos.js, with no export/imports

    */

    function clearHighlightAllDemoLinks() {

        var elements = document.querySelectorAll('a.demo');
        for(var i=0;i<elements.length;i++) {
            elements[i].classList.remove('active-demo');
        }

    }

    function highlightDemoLink(key) {

        clearHighlightAllDemoLinks();
        var a = document.querySelectorAll(`a[value="${key}"]`);

        if(0 == a.length)
            return;

        a[0].classList.add('active-demo');

        
    }

function addDemosLinks(parent) {

    var keys = Object.keys(demos);
    for(var i=0;i<keys.length;i++) {

        var key = keys[i];        
        
        // let div = document.createElement('div');
        // div.classList.add(['demo','reset']);
        // div.setAttribute('value',key);
         //createElement(`<div class="demo" value="${key}" />`);

        let cb = document.createElement('input');
        cb.setAttribute('type','checkbox');
        cb.setAttribute('value',key);
        if (selectedDemos[key])
            cb.setAttribute('checked','checked');
        // parent.appendChild(div);
        
        cb.onchange = (e) => {
            let cb = e.target;
            selectedDemos[cb.value] = cb.checked;
        };

        var a = document.createElement('a');
        a.text = key;
        a.href = '#';
        a.setAttribute('value',key);
        a.classList.add('demo');
        
        a.onclick = function(e) {
            e.preventDefault();
            var key = e.target.text;
            playDemo(key);
        }

        parent.appendChild(cb);
        parent.appendChild(a);
        br(parent);
    }    
    
}

function addArtworkLinks(parent) {
    

    // document.createElement('h1')
     appendHtmlToParent(
         '<p><strong>Art Pieces</strong></p>'
         , parent
    );

    var keys = Object.keys(artPieces);
    for(var i=0;i<keys.length;i++) {

        var key = keys[i];

        var a = document.createElement('a');
        a.text = key;
        a.href = '#';
        a.onclick = function(e) {
            e.preventDefault();
            playDemoLooper.set(false);
            var key = e.target.text;            
            loadArtwork(key);
        }

        parent.appendChild(a);
        br(parent);        
    }

}

function br(parent) {
    parent.appendChild(document.createElement('br'));
}

function appendHtmlToParent(childHtml, parentElement) {
    var child = createElement(childHtml);
    parentElement.appendChild(child);
}

function createElement(html) {
    
    let template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content;

}

function addRepeaterUI(parent) {

    var ui = createElement(`
    <br/>        
        <button id="playPauseDemoLoop" type="button">Play selected demos</button>
    <br/><br/>

        Delay
        <input type="range" name="playerSpeed" id="playerSpeed" 
            min="250" max="3000" step="50" value="500">
        <output id="playerSpeedOutput" for="playerSpeed">500 ms</output>
    `);    

    var playerSpeed = ui.getElementById('playerSpeed');
    var playerSpeedOutput = ui.getElementById('playerSpeedOutput');
    let playPauseDemoLoopButton = ui.getElementById('playPauseDemoLoop');

    playPauseDemoLoopButton.addEventListener('click', (e) => {
        if(playDemoLooper.toggle())
            playPauseDemoLoopButton.innerText='Pause';
        else
            playPauseDemoLoopButton.innerText='Play selected demos';
    });

    playerSpeed.addEventListener('input', (e) => {
        playDemoLooper.timeout = playerSpeed.value;
        playerSpeedOutput.textContent = `${playerSpeed.value} ms`;
    });

    parent.appendChild(ui);

}

function addBookmarklet(parent) {

    // TODO: refactor and retest
    let currentHref = window.location.href;

    var d = document.createElement('div');
    d.style.cssText = 'position: relative;'

    var uri = [
        `javascript:(function(){`
        ,`var s=document.createElement('script');`
        ,`s.setAttribute('src','${currentHref}/inject.js');`
        ,`s.setAttribute('id','injection');`
        ,`s.setAttribute('x-prefix','${currentHref}');`
        ,`document.getElementsByTagName('body')[0].appendChild(s);`
        ,`})();`
    ].join('')
    .replace(' ','%20');
    
    d.innerHTML = [
        '<br/>',
        `Bookmarklet: <a href="${uri}" style="text-decoration: none;">🌈</a>`,
        '<br/>',
        '<p style="font-size: 8pt">To install: drag rainbow to bookmark bar.</p>'
    ].join('');

    parent.appendChild(d);
}


function ui_main() {
    
    var ui = 
    createElement(`
        <div class="_ignore" style="border-radius: 10px; margin: 1em; padding: 0.5em; background: white; font-size: 11pt; font-family: Arial, Helvetica, sans-serif; text-align: left; position: absolute; left: 1em; top: 1em; filter: drop-shadow(3px 3px 8px black); z-index: 100000;">
            <p><strong>Demos</strong></p>
            <div id="demo-links" />
        </div>
    `).firstChild;
    
    // TODO: add placeholders
    document.getElementsByTagName('body')[0].appendChild(ui);

    addDemosLinks(ui);
    addRepeaterUI(ui)
    // addBookmarklet(ui);
    addArtworkLinks(ui);

}

function ui_main_old() {
    
    var ui = document.createElement('div');

    ui.style.cssText = ' border-radius: 10px; margin: 1em; padding: 0.5em; background: white; font-size: 11pt; font-family: Arial, Helvetica, sans-serif; text-align: left; position: absolute; left: 1em; top: 1em; filter: drop-shadow(3px 3px 8px black); z-index: 100000;';
    ui.classList.add('_ignore');
    document.getElementsByTagName('body')[0].appendChild(ui);

    ui.innerHTML = '<p><strong>Demos</strong></p>'
    addDemosLinks(ui);
    addRepeaterUI(ui)
    // addBookmarklet(ui);
    addArtworkLinks(ui);

}