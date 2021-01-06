/*
This file contains functions that return rgb colors as objects {r:0-255,g:0-255,b:255}
*/

const colorComponents = ['r','g','b'];



function getRandomColorRgb() {
	return {
		r: Math.floor(Math.random() * 256),
		g: Math.floor(Math.random() * 256),
		b: Math.floor(Math.random() * 256)
	};
}


/**
 * @description Returns a rgbColor with a random value in one component, and zero values in the other component
 * @param {string} component the color component to contain a random value, either 'r','g','b'. If undefined, a component is chosen at random.
 * @returns {object} An rgbColor
 */
function getRandomColorOf(component) {
    if (component === undefined) {
        component = colorComponents[randomIntFromInterval(0,2)];
    }
        
    var color = {
        r: 0,
        g: 0,
        b: 0
    };
    color[component] = Math.floor(Math.random() * 256);
    return color;
}

// uncomplete
function nextColor2(skip, range, startRgb, rotateColorSlotFn) {

	skip = skip || [15,15,15];
	
	range = range || [
		[128,255],
		[128,255],
		[128,255],
	];

	startRgb = startRgb || getRandomColorRgb();	

	var lastColor = [startRgb.r,startRgb.g,startRgb.b];
	var colorSlot = 0;

	rotateColorSlotFn = rotateColorSlotFn || function() {
		if (++colorSlot > 2)
			colorSlot = 0;
		return colorSlot;
	}
	return function() {
		
		var i = rotateColorSlotFn();
		lastColor[i] += skip[i];
		if (lastColor[i] > range[i][1])
			lastColor[i] = range[i][0];
		return {
			r: lastColor[0],
			g: lastColor[1],
			b: lastColor[2],
		};
	}
}

// returns a funciton
/*
Starts with a random color
then for each call to this function, returns a new color that
on each call, one of the components is increased by {skip} amount
The component that gets increased is rotated each call using the rotateColorSlotFn

example:
skip = 5
{r:10,g:50,b:70}, 
{r:15,g:50,b:70}, slot = red
{r:15,g:55,b:70}, slot = green
{r:15,g:55,b:75}, slot = blue
{r:20,g:55,b:75}, slot = red
... etc ...

if a components value exceeds a max value, the value is reset
to the minimum + ((oldValue + skip) - max)
*/
/**
 * 
 * @param {number} options.skip the number by which to increment the value of the color component each time this method is called
 * @param {number} options.min the minimum value that can be assigned to a component
 * @param {number} options.max the maximum value that can be assigned to a component
 * @param {rgbColor} options.startColorFn the color to start rotating from {r:g:b}
 * @param {function} options.rotateColorSlotFn a function that rotates the component to be incremented. must return either 0,1,2
 * 
 */
function nextColor(options) {
    
    var colorSlot = 0;
    
    options = Object.assign({
        skip: 15, 
        min: 128,
        max: 255,
        startColorFn: getRandomColorRgb,
        // must return either: 0,1,2
        rotateColorSlotFn: function() {
            if (++colorSlot > 2)
                colorSlot = 0;
            return colorSlot;
        }
    }, options);
    
    var startColor = options.startColorFn();

    var prevColor = {
        r: startColor.r,
        g: startColor.g,
        b: startColor.b
    };

    return function(options2) {    
        // named "options2" to prevent overwriting to "options"  within the scope of this function
        options2 = Object.assign({
            resetStartColor: false
        }, options2);

        if(options2.resetStartColor) {
            prevColor = options.startColorFn();
            return;
        }

        var slot = colorComponents[options.rotateColorSlotFn()];
        
		prevColor[slot] += options.skip;
		if (prevColor[slot] > options.max)
            prevColor[slot] = options.min + (prevColor[slot] - options.max);
            
		return {
			r: prevColor.r,
			g: prevColor.g,
			b: prevColor.b,
		};
	};
}



/*
This demo is an example of how to override the getColorFn option of demo.basic
This demo will update the css color using random shades of blue
*/
var randomReds = function() {
    // var getColorFn = () => {
	// 	return getRandomColorOf('r');
    // };
    
    // return getColorFn;

    return getRandomColorOf('r');
}

var randomGreens = function() {
    // return (() => { return getRandomColorOf('g' ) });
    return getRandomColorOf('g');

}

var randomBlues = function() {
    return getRandomColorOf('b');
}

/*
This demo returns colors that has one component set to a random value, and zero in the other two components
ex: {r:124,g:0,b:0}, {r:0,g:0,b:22}, etc
The component that has a non-zero value is picked at random
*/
var randomRedsGreensBlues = function() {
    return getRandomColorOf();
}

/*
This demo also overrides demo.basic's getColorFn. It recolors the css using random values for the red, green, and blue components.
*/
var randomRangedRgb = function(range) {

    if(!Array.isArray(range)) {
        range = 
        {
            r: [128,255],
            g: [128,255],
            b: [128,255],
        };
    }
    
    
    // return function() {
    return {
        r: randomIntFromInterval(range.r[0],range.r[1]),
        g: randomIntFromInterval(range.g[0],range.g[1]),
        b: randomIntFromInterval(range.b[0],range.b[1])
    };
    // };

};

/*
This demo is the same as randomRangedRgb, except it will create the range for you given min and max values
*/
var randomRangedRgbEasy = function(min,max) {	
	min = (min === undefined ? 128 : min);
	max = (max === undefined ? 255 : max);
	return randomRangedRgb({
		r: [min,max],
		b: [min,max],
		g: [min,max],
	});
}

// skip, min, max, startColor, rotateColorSlotFn
var rotateRgb =     
    nextColor(
    {
        skip: 15, 
        min: 128,
        max: 255,
        startColorFn: getRandomColorRgb
    });

/*
    pass in a colorSlot of 'r','g','b'

    examples:
    demo.rotateOneComponent({colorSlot:'g',startColor: {r:0,g:0,b:0}})
    demo.rotateOneComponent({colorSlot:'g',startColor: {r:0,g:0,b:150}})
*/
var rotateOneComponent = function(options) {
        
    options = Object.assign({
        colorSlot: 'g'
    }, options);

    // translate the option.colorSlot into an integer for use in the rotateColorSlotFn    
    var colorSlot = colorComponents.indexOf(options.colorSlot.toLowerCase());
    
    options = Object.assign({
        rotateColorSlotFn: () => {return colorSlot;}
    }, options);

    return nextColor(options);

}


//start with a random color, then rotate the red component
var rotateReds = rotateOneComponent({
   colorSlot: 'r' 
});

//start with a random color, then rotate the green component
var rotateGreens = rotateOneComponent({
    colorSlot: 'g'
});

//start with a random color, then rotate the blue component
var rotateBlues = rotateOneComponent({
    colorSlot: 'b'
});

// demo.g = function(colorSlot,skip,min,max) {
// 	colorSlot = 2;
// 	skip = 12;
// 	min = 128;
// 	max = 200;

// 	//go.f(colorSlot,[skip,skip,skip],[[min,max],[min,max],[min,max]],{r:252,g:182,b:12});
// 	demo.f(1,12,128,200,{r:252,g:182,b:12})
// }


//#endregion
