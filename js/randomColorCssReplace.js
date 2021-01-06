/* TODO:

explore this as an alternative API: https://developers.google.com/web/updates/2019/02/constructable-stylesheets
buildStyleCache: iterate over all items in document.styleSheets, not just document.styleSheets[0]

BUG:
there is a bug

*/

// https://gist.github.com/bobspace/2712980
var CSS_COLOR_NAMES = ["AliceBlue","AntiqueWhite","Aqua","Aquamarine","Azure","Beige","Bisque","Black","BlanchedAlmond","Blue","BlueViolet","Brown","BurlyWood","CadetBlue","Chartreuse","Chocolate","Coral","CornflowerBlue","Cornsilk","Crimson","Cyan","DarkBlue","DarkCyan","DarkGoldenRod","DarkGray","DarkGrey","DarkGreen","DarkKhaki","DarkMagenta","DarkOliveGreen","DarkOrange","DarkOrchid","DarkRed","DarkSalmon","DarkSeaGreen","DarkSlateBlue","DarkSlateGray","DarkSlateGrey","DarkTurquoise","DarkViolet","DeepPink","DeepSkyBlue","DimGray","DimGrey","DodgerBlue","FireBrick","FloralWhite","ForestGreen","Fuchsia","Gainsboro","GhostWhite","Gold","GoldenRod","Gray","Grey","Green","GreenYellow","HoneyDew","HotPink","IndianRed","Indigo","Ivory","Khaki","Lavender","LavenderBlush","LawnGreen","LemonChiffon","LightBlue","LightCoral","LightCyan","LightGoldenRodYellow","LightGray","LightGrey","LightGreen","LightPink","LightSalmon","LightSeaGreen","LightSkyBlue","LightSlateGray","LightSlateGrey","LightSteelBlue","LightYellow","Lime","LimeGreen","Linen","Magenta","Maroon","MediumAquaMarine","MediumBlue","MediumOrchid","MediumPurple","MediumSeaGreen","MediumSlateBlue","MediumSpringGreen","MediumTurquoise","MediumVioletRed","MidnightBlue","MintCream","MistyRose","Moccasin","NavajoWhite","Navy","OldLace","Olive","OliveDrab","Orange","OrangeRed","Orchid","PaleGoldenRod","PaleGreen","PaleTurquoise","PaleVioletRed","PapayaWhip","PeachPuff","Peru","Pink","Plum","PowderBlue","Purple","RebeccaPurple","Red","RosyBrown","RoyalBlue","SaddleBrown","Salmon","SandyBrown","SeaGreen","SeaShell","Sienna","Silver","SkyBlue","SlateBlue","SlateGray","SlateGrey","Snow","SpringGreen","SteelBlue","Tan","Teal","Thistle","Tomato","Turquoise","Violet","Wheat","White","WhiteSmoke","Yellow","YellowGreen"];
CSS_COLOR_NAMES.push("currentColor");

var regexs = {
	hex: new RegExp(/(#[A-Fa-f0-9]{3,6})/g),
	rgba: new RegExp(/rgba\(([^\)]*)\)/g),
	rgb: new RegExp(/rgb\(([^\)]*)\)/g)
}

var settings = {
    StyleCache: [],
    CSSRuleList: null,
    StyleTransformFn: null,
    updateDelay: 0
};


/**
@description replaces instances of color inside CSS text with new colors, handles hex, rgb, and rgba
@returns {string} The CSS rules with the replacement colors
@param {text} cssText The css text whose colors will be replaced
@param {function} getColorFn A function that will return a color {r:12,g:34,b:56}
*/
function replaceColors(cssText, getColorFn)  {
	
	var hexMatches = cssText.match(regexs.hex);
	var rgbaMatches = cssText.match(regexs.rgba);
	var rgbMatches = cssText.match(regexs.rgb);

	if (hexMatches != null) 
		hexMatches.forEach((match) => cssText = replaceHex(match, cssText, getColorFn));

	if (rgbaMatches != null)
		rgbaMatches.forEach((match) => cssText = replaceRgba(match, cssText, getColorFn));

	if (rgbMatches != null)
		rgbMatches.forEach((match) => cssText = replaceRgb(match, cssText, getColorFn));

	cssText = replaceCssColor(cssText, getColorFn);

	return cssText;
}


/**
 * @description Get a random integer
 * @param {number} min the smallest possible random number to be returned
 * @param {number} max the largest possible random number to be returned
 * @returns {number} a random integer between min and max
 */
function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + ((+r) << 16) + ((+g) << 8) + (+b)).toString(16).slice(1);
}

function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function replaceHex(oldHex, text, getColorFn) {
	var rgb = getColorFn();
	newHex = rgbToHex(rgb.r,rgb.b);
	return text.replace(oldHex, newHex);
}

function replaceRgb(oldRgb,text, getColorFn) {
	var rgb = getColorFn();
	var newRgb = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
	return text.replace(oldRgb, newRgb);
}

function replaceRgba(oldRgba,text, getColorFn) {

	var rgb = getColorFn();
	var a = oldRgba.match(/\([^\)]+\)/g)[0].replace(/[\(\)]/g,'').split(',')[3];

	var newRgba = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;

	return text.replace(oldRgba, newRgba);
}

function replaceCssColor(text, getColorFn) {

	for(var i=0;i<CSS_COLOR_NAMES.length;i++) {	

		var color = CSS_COLOR_NAMES[i].toLowerCase();
		var pos;

		while((pos = text.toLowerCase().indexOf(color)) != -1) {
			var rgb = getColorFn();
			var newRgb = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
			text = text.substr(0,pos) + newRgb + text.substr(pos + color.length);
		}

	}

	return text;
	
}

/**
 * String replace function with case-insensative feature
 * @param {*} str 
 * @param {*} replace 
 * @param {*} isCaseSensitive 
 */
function replace(str, replace, isCaseSensitive) {
    if(!isCaseSensitive){
        return this.split(str).join(replace);
    } else { 

        var strLower = this.toLowerCase();
        var findLower = String(str).toLowerCase();
        var strTemp = this.toString();

        var pos = strLower.length;
        while((pos = strLower.lastIndexOf(findLower, pos)) != -1){
            strTemp = strTemp.substr(0, pos) + replace + strTemp.substr(pos + findLower.length);
            pos--;
        }
        return strTemp;
    }
};

/**
@description Checks a string of css text to determine if it contains color styles
@returns {boolean} true if color styles are found
@param cssText the css text to be checked
*/
function containsColorStyles(cssText) {
	cssText = cssText.toLowerCase();
    return (
        (cssText.indexOf('#') > -1)
        || (cssText.indexOf('rgb') > -1)
        || (CSS_COLOR_NAMES.some((e) => (cssText.indexOf(e.toLowerCase()) > -1)))
    );
}

function containsDisplay(cssText) {
	cssText = cssText.toLowerCase();
    return (cssText.indexOf('display') > -1);
}

/**
 * 
 * @param {string} cssText the cssText to test for style rules
 * @param {array<bool function(string)>} tests an array of test functions that accept a string and return a bool
 */
function testRules(cssText, tests) {
    // exit early if a test returns false
    var result = true;
    for(var i=0;i<tests.length;i++) {
        result = result && tests[i](cssText);        
        if (!result)
            return false;
    }
    return true;
}

function TEST_TestRules() {    
    var r =
    [
        testRules('apple', [
            (text) => {return text == 'apple';}, 
            (text) => {return text.length == 5}        
        ]),
        testRules('banana', [
            (text) => {return text == 'apple';}, 
            (text) => {return text.length == 5}        
        ]),
        testRules('orange', [
            (text) => {return text == 'orange';}, 
            (text) => {return text.length == 6},
            (text) => {return text == 'orange'},
            (text) => {return text.length == 8},
        ]),
    ];
    // r should == [true,false,false];

    console.log(r);
}

function tryGetAllRules() {
    var allRules = [];
    for (var i=0;i<document.styleSheets.length;i++) {
        var rules = tryGetRules(document.styleSheets[i]);

        if (rules == null)
            continue;
        
        allRules.push(rules);
    }
}

function tryGetRules(stylesheet) {
    
    try {
        return stylesheet.cssRules;
    } catch (error) {
        // https://stackoverflow.com/questions/48753691/cannot-access-cssrules-from-local-css-file-in-chrome-64/49160760#49160760
        // TL;DR: As of Chrome 64 you'll need to use a local development server to test functionality that depends on the CSS Object Model.
        // Good news: you can bypass this if you use fetch API to load an external CSS into the scope of your document
        return null;
    }
}

/**
@description Iterate over a CSSRuleList object and finds the CSSStyleRule items that contain a color style. Then stores them in an cache.
@param {CSSStyleSheet} stylesheet The CSStyleSheet whose CSSRulesList will be iterated
@param {bool function(string)>} test A function that tests the cssText of a CSSTypeRule to see if it should be included in cache
*/
function buildStyleCache(stylesheet, test) {

    var rules = tryGetRules(stylesheet);
    
    if (!rules)
        throw 'tryGetRules failed';

    delete settings.StyleCache;
    delete settings.CSSRuleList;

    settings.StyleCache = [];
    settings.CSSRuleList = rules;

	for (var i=0;i<rules.length;i++) {

		var rule = rules[i];

		if(false == test(rule.cssText))
			continue;
					
		for (var j=0;j<rule.style.length;j++) {

			var name = rule.style[j];
			var value = rule.style.getPropertyValue(name);
			
			if(false == test(value))
				continue;

            /*
                i: The offset in the CSSRuleList that points to a CSSStyleRule object
                j: The offset in the CSSStyleRule that points to a CSSStyleDeclaration object                
                name: The property name of the style (ex: border, line-height, font-family)
                selectorText: The HTML selector to which the styles are applied
            */
			settings.StyleCache.push([i,j,name,rule.selectorText]);

		}

	}

}

/**
@description Iterate over all the styles in a CSSRuleList replacing them with new style rules
@param {function} styleTransformFn A function that accepts css text, and returns the text with modifications
*/
function updateAllStyles(styleTransformFn, delay) {

    // console.log('updateAllStyles');

	if (settings.CSSRuleList == null)
		throw 'Please tell me some CSS rules to transform.';

    if (typeof styleTransformFn !== 'function')
        throw 'First param to this function must be of type function!'

    var styleCache = settings.StyleCache;
    var rules = settings.CSSRuleList;

    var applyUpdate = (x) => {

        var c = styleCache[x];
        var i = c[0];
        var j = c[1];
        var name = c[2];
        var selectorText = c[3];

        var rule = rules[i];

        var propertyValue = rule.style.getPropertyValue(name);
                
        // BUG: styleTransformFn can now manipulate rules by itself ex: toggleDisplay
        // I'm not sure 
        var newValue = styleTransformFn(propertyValue, selectorText, rule);
        rule.style.setProperty(name, newValue);

    };

    if (!delay) {

        for (var x=0;x<styleCache.length;x++) {
            applyUpdate(x);
        }

    } else {

        settings.updateDelay = delay;

        var lock = updateAllStyles;
        updateAllStyles = function() {};

        var loop = function(x) {

            if(x == styleCache.length) {
                updateAllStyles = lock;
                return;
            }
    
            applyUpdate(x);
            setTimeout(() => loop(++x), settings.updateDelay);
        
        }
    
        loop(0);
    }
    

}






