
////////////////////////////////////////////////////////////////////
// START: Code to support playDemoLooper

/*
    randomDemoLooper is a timeout looper which when
    active will run a random styles transformation demo
    from the list of demos

    you can change the timeout speed by editing randomDemos.timeout
*/
const playDemoLooper = {
    id: 0,
    timeout: 500,
    isActive: false,
    set: (isActive) => {
        playDemoLooper.isActive = isActive;
        if(isActive) {            
            playDemoLooper.start();
            // console.log('started randomDemos');
        } else {
            clearTimeout(playDemoLooper.id);        
            // console.log('stopped randomDemos');
        }
        return isActive;
    },
    toggle: function() {
        return playDemoLooper.set(!playDemoLooper.isActive);        
    },
    onTimeout: function() {
        playNextDemo();
        playDemoLooper.start();
    },
    start: function() {
        if (playDemoLooper.isActive)
            playDemoLooper.id = setTimeout(playDemoLooper.onTimeout, playDemoLooper.timeout);
    },    
};

const selectedDemos = {
    'randomColorRgb': true
    ,'randomRangedRgb': true
};

let currentDemoIndex = 0;
let rotateCurrentDemoIndex = (max) => {
    currentDemoIndex++;
    if(currentDemoIndex == max)
        currentDemoIndex = 0;
};

const playNextDemo = () => {
    let keys = Object.keys(demos);
  
    let isPlayed = false;
    let timeout = 0;

    while(false == isPlayed) {

        let key = keys[currentDemoIndex];
        rotateCurrentDemoIndex(keys.length);
    
        if(false == selectedDemos.hasOwnProperty[key]) {
            continue;
        }

        if(true == selectedDemos[key]) {
            console.log(`playNextDemo: playing demo ${key}`);
            isPlayed = true;
            playDemo(key);
        } 

        timeout++;
        if(timeout>keys.length*2) {
            console.log(`playNextDemo: Timeout!`);
            break;            
        }

    }
};

const playDemo = (key) => {
    if(key !== 'randomDemo')
        highlightDemoLink(key);
    demos[key]();
};

const randomDemo = () => {    
    var key = getRandomDemoKey();
    highlightDemoLink(key);
    demos[key]();
};

// END: Code to support playDemoLooper
////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////
// Start: Code for CSS transformers

/*
Please note: I failed to comment a lot of this code when I initially 
wrote it. As a result, I may be getting some CSS terms/definitions wrong 
in these comments. It's been a while since I've studied CSS, so I forget
what everything is called.

The function in this section are what I call "CSS style transformation functions"
(or CSS transformers) (I'm not sure how accurate that term is)

The job of a CSS transformer is to makes changes to the style of a CSS rule
*/

/**
 * Example of direct rule manipulation.
 * @param {*} cssText 
 * @param {*} selectorText 
 * @param {*} rule 
 */
function toggleDisplay(cssText, selectorText, rule) {
    var value = rule.style.getPropertyValue('display');
    value =  value === '' ? 'none' : '';
    rule.style.setProperty('display', value);
    return rule.cssText;
}

function showDisplay(rule) {    
    rule.style.setProperty('display', '');
    return rule.cssText;
}

/**
transformBySelector allows for advanced CSS transformations

You can define {how} to transformation a style, {when} a given rule's selector passes a test

I failed to document the code when I initially wrote it, but I think it's pretty easy to read.

@param {object} map - an array of how-when objects see {hairEyesLips} below for a usage example
@return {function} - a CSS transformation function (defined above) 
*/
function transformBySelector(map) {
    
    return function(propertyValue, selectorText, rule) {
        
        for(var i=0;i<map.length;i++) {
            
            // if 'how' is an Array, then create a new function that
            // loops through all the functions in how an applies their transform
            if (Array.isArray(map[i].how) ) {
                var howArray = map[i].how;
                map[i].how = function(propertyValue, selectorText, rule) {
                    for(var a=0;a<howArray.length;a++) {
                        propertyValue = howArray[a](propertyValue, selectorText, rule);
                    }
                    return propertyValue;
                }
            }

            
            if (false == Array.isArray(map[i].when)) {
                map[i].when = [map[i].when];
            }

            // this loop tests the selectorText against a series of tests
            // if any test in the array is successful, then the transform is applied            
            for(var j=0;j<map[i].when.length;j++) {
                var when = map[i].when[j];
                var testPassed = false;
                
                // {when-test logic}
                if (when === '*') {
                    testPassed = true;
                } else if (when instanceof RegExp) {
                    testPassed = when.test(selectorText);                    
                } else if (typeof when === 'string') {
                    testPassed = (selectorText.indexOf(when) != -1);
                }  else if (typeof when === 'function') {
                    // if {when} is a function, then you can do more advanced testing
                    testPassed = when(propertyValue, selectorText, rule);
                }

                if (testPassed) {
                    return map[i].how(propertyValue, selectorText, rule);
                }
                
            }
            
        }
    }

}

const transformColors = (getColorFn,skipShowDisplay) => {
    return function(propertyValue, selectorText, rule) {
        if (!skipShowDisplay) 
            showDisplay(rule);
        return replaceColors(propertyValue, getColorFn);
    }
}

const hideEverything = transformBySelector([
    {
        how: toggleDisplay,
        when: (propertyValue, selectorText, rule) => {
            return (
                (selectorText.indexOf('body') == -1)
                && (selectorText.indexOf('html') == -1)
            );
        }        
    }
]);

/*
    how-when objects:
    { 
        how: 
            a function which defines how to transform a CSS style
        when: 
            a string, RegExp, or function which represents a test
            against a CSS selector
    }

    // for more info, search this file for the string "{when-test logic}"
    // and read the if-else block 

*/
const hairEyesLips = transformBySelector([
    {
        how: transformColors(randomColorRgb),
        when: ['hair']
    },
    {
        how: [transformColors(randomRangedRgb,true), toggleDisplay],
        when: ['iris']
    },
    {
        how: transformColors(randomReds),
        when: [/top.*lip/]
    },
    {
        how: transformColors(randomGreens),
        when: [/bottom.*lip/]
    },
]);

const makeTransformFunc = function(getColorFn) {    
    return function() { 
        getColorFn({resetStartColor: true});
        updateAllStyles(transformColors(getColorFn), settings.updateDelay)
    };
};

const demos = {
    randomColorRgb: makeTransformFunc(randomColorRgb),
    randomReds: makeTransformFunc(randomReds),
    randomGreens: makeTransformFunc(randomGreens),
    randomBlues: makeTransformFunc(randomBlues),
    randomRedsGreensBlues: makeTransformFunc(randomRedsGreensBlues),
    randomRangedRgb: makeTransformFunc(randomRangedRgb),
    randomRangedRgbEasy: makeTransformFunc(randomRangedRgbEasy),
    rotateRgb: makeTransformFunc(rotateRgb),    
    rotateReds: makeTransformFunc(rotateReds),
    rotateGreens: makeTransformFunc(rotateGreens),
    rotateBlues: makeTransformFunc(rotateBlues),
    hairEyesLips: () => updateAllStyles(hairEyesLips),
    // hideEverything: () => updateAllStyles(hideEverything),
    randomDemo
}

// https://stackoverflow.com/a/41169035
const demosToExcludeFromRandomChoices = [
    'hairEyesLips'
    , 'randomDemo'
];

const randomDemoCollection = 
    Object.keys(demos).filter(o=> !demosToExcludeFromRandomChoices.includes(o));

const getRandomDemoKey = () => {
    let i = Math.floor(Math.random() * randomDemoCollection.length);
    return randomDemoCollection[i];
}

// const randomDemoCollection2 = (() => {
//    const {
//        hairEyesLips
//        , hideEverything
//        , randomDemo    
//     , ...rest } = demos;
//     // the above line creates a new object containing 
//     // the items from demos, except for the ones prior
//     // to ...rest
//    return rest; 
// })();


