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
            console.log('started randomDemos');
        } else {
            clearTimeout(playDemoLooper.id);        
            console.log('stopped randomDemos');
        }
        return isActive;
    },
    toggle: function() {
        return playDemoLooper.set(!playDemoLooper.isActive);        
    },
    onTimeout: function() {
        // randomDemo();
        playNextDemo();
        playDemoLooper.start();
    },
    start: function() {
        if (playDemoLooper.isActive)
            playDemoLooper.id = setTimeout(playDemoLooper.onTimeout, playDemoLooper.timeout);
    },    
};

const selectedDemos = {};

// const resetSelectedDemos = () => {
//     let keys = Object.keys(selectedDemos);
//     for(let i=0;i<keys.length;i++) {
//         selectedDemos[keys[i]] = false;
//     }
// };

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
    highlightDemoLink(key);
    demos[key]();
};

const randomDemo = () => {    
    var keys = Object.keys(randomDemoCollection);
    // var limit = keys.indexOf('stop') - 1;
    var key =  keys[randomIntFromInterval(0, keys.length-1)];
    randomDemoCollection[key]();
};

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

function transformBySelector(map) {
    // TODO: change arg list to an object
    return function(propertyValue, selectorText, rule) {
        
        for(var i=0;i<map.length;i++) {
            
            // if 'how' is an Array, then create a new function that
            // loops through all the functions in how an applies their transform
            if (map[i].how instanceof Array) {
                var howArray = map[i].how;
                map[i].how = function(propertyValue, selectorText, rule) {
                    for(var a=0;a<howArray.length;a++) {
                        propertyValue = howArray[a](propertyValue, selectorText, rule);
                    }
                    return propertyValue;
                }
            }

            
            if (false == (map[i].when instanceof Array)) {
                map[i].when = [map[i].when];
            }

            // this loop tests the selectorText against a series of tests
            // if any test in the array is successful, then the transform is applied
            for(var j=0;j<map[i].when.length;j++) {
                var when = map[i].when[j];
                var testPassed = false;
                
                if (when === '*') {
                    testPassed = true;
                } else if (when instanceof RegExp) {
                    testPassed = when.test(selectorText);                    
                } else if (typeof when === 'string') {
                    testPassed = (selectorText.indexOf(when) != -1);
                }  else if (typeof when === 'function') {
                    // if when is a function, then you can do more advanced testing
                    testPassed = when(propertyValue, selectorText, rule);
                }

                if (testPassed) {
                    var ddd = 'debugger!';
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

const hideEverythingOld = transformBySelector([
    {
        func: toggleDisplay,
        tests: [/(^((?!body|html).)*$)/]
    }
]);

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

const hairEyesLips = transformBySelector([
    {
        how: transformColors(getRandomColorRgb),
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

const makeDemoFn = function(getColorFn) {    
    return function() { 
        getColorFn({resetStartColor: true});
        updateAllStyles(transformColors(getColorFn), settings.updateDelay)
    };
};

const demos = {
    getRandomColorRgb: makeDemoFn(getRandomColorRgb),
    randomReds: makeDemoFn(randomReds),
    randomGreens: makeDemoFn(randomGreens),
    randomBlues: makeDemoFn(randomBlues),
    randomRedsGreensBlues: makeDemoFn(randomRedsGreensBlues),
    randomRangedRgb: makeDemoFn(randomRangedRgb),
    randomRangedRgbEasy: makeDemoFn(randomRangedRgbEasy),
    rotateRgb: makeDemoFn(rotateRgb),    
    rotateReds: makeDemoFn(rotateReds),
    rotateGreens: makeDemoFn(rotateGreens),
    rotateBlues: makeDemoFn(rotateBlues),
    hairEyesLips: () => updateAllStyles(hairEyesLips),
    hideEverything: () => updateAllStyles(hideEverything),
    randomDemo
}

const randomDemoCollection = (() => {
   const {
       hairEyesLips
       , hideEverything
       , randomDemo    
    , ...rest } = demos;
    // the above line creates a new object containing 
    // the items from demos, except for the ones prior
    // to ...rest
   return rest; 
})();


// { 
//     hairEyesLips, 
//     hideEverything, 
//     randomDemo, 
//     ...
//     randomDemoCollection } = demo;