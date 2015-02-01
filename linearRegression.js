console.time('time');

// define all options
var options = {
	// set the starting alpha
	alpha: 1,
	// break when the all theta values doesn't change more than changeBreak %
	changeBreak: 1,
	// the number of maximum steps for the minimize function
	steps: 100000
};
options.changeBreak /= 100;

// the start data (x1,x2,x3,y)
var startData = [
			[30,2,4, 424], 
			[40,3,10, 556],
			[43,2,2, 544],
			[50,2,8, 644],
			[80,3,10, 956],
			[100,3,4, 1126],
		];

// n => # features
var n = startData[0].length-1;

// # training data
var m = startData.length;

// set all thetas to 0
var theta = [];
for (var i = 0; i <= n; i++) {
	theta[i] = 0;
}

// average and reange values for the features
var averageValues= [];
var rangeValues	 = [];

var derivations	 = [];
var cache		 = {derivation: []};

// normalize the data using (feature-average)/range
var data = normalize();

// try to minimize the difs between hypo and training data
minimize();

// log all training data and the last hypo
testLog();

console.timeEnd('time');

/**
 * Normalizes the startData using 
 * {@link range range values} & {@link average average}
 * @returns {Object} the normalized data
 */
function normalize() {
	for (var i = 0; i < n; i++) {
		averageValues[i] = average(i);
		rangeValues[i] 	 = range(i);
	}
	
	var newData = [];
	for (var i = 0; i < m; i++) {
		newData[i] = [];
		for (var c = 0; c < n ; c++) {
			newData[i][c] = (startData[i][c]-averageValues[c])/rangeValues[c];
		}
		newData[i][n] = startData[i][n];
	}
	return newData;
}

/**
 * Return the colum for a specific feature 
 * @param   {Number} feature feature number (0 for x1)
 * @returns {Number} maxium value - minimum value
 */
function range(feature) {
	var max = startData[0][feature];
	var min = max;
	for (var i = 1; i < m; i++) {
		max = (max < startData[i][feature]) ? startData[i][feature] : max;
		min = (min > startData[i][feature]) ? startData[i][feature] : min;
	}
	return max-min;
}

/**
 * Return the average number for a specific feature
 * @param   {Number} feature feature number (0 for x1) 
 * @returns {Number} average value
 */
function average(feature) {
	var sum = 0;
	for (var i = 0; i < m; i++) {
		sum += startData[i][feature];
	}
	return sum/m;
}

/**
 * Calculate the hypothesis for a given input
 * @param   {Array}   x                 the x values 
 * @param   {Boolean} [normalize=false] true => normalize the x values 
 * @returns {Number}  the hypothesis y for the given input
 */
function hypothesis(x,normalize) {
	normalize = (typeof normalize === 'undefined') ? false : true;
	if (normalize) {
		for(var i = 0; i < n; i++) {
			x[i] = (x[i]-averageValues[i])/rangeValues[i];	
		}
	}
	
	var result = 0;
	x.unshift(1);
	for (var i = 0; i <= n; i++) {
		result += theta[i]*x[i];	
	}
	return result;
}

/**
 * Return the derivation of the quadratic difference function
 * @param   {Array}  params [iteration,index_x]
 * @returns {Number} the derivation
 */
function derivation(params) {
	var i = params[0];
	var index_x = params[1];
	if (!index_x) {
		var hypo = hypothesis(data[i].slice(0,n))-data[i][n];
		cache.derivation[i] = hypo;
		return hypo;
	} else {
		if ('derivation' in cache) {
			return cache.derivation[i]*data[i][index_x-1];		
		}
		return (hypothesis(data[i].slice(0,n))-data[i][n])*data[i][index_x-1];	
	}	
}

/**
 * Sum the return values of a function
 * @param   {Function} func      function that should be called iteration times
 * @param   {Array}    params    params of the function func
 * @param   {Array}    iteration [iteration variable name (ie. 'i'),start,end]
 * @returns {Number}   the sum
 */
function Sum(func,params,iteration) {
	var result = 0;
	var itParam = false;
	for (var p = 0; p < params.length; p++) {
		if (iteration[0] === params[p]) {
			itParam = p;
			break;
		}
	}
	for (var i = iteration[1]; i <= iteration[2]; i++) {
		if (itParam !== false) {
			params[itParam] = i;
		}
		result += func(params);
	}
	return result;
}

/**
 * Minimize the difference between hypo and training data
 */
function minimize() {
	var minChangeBreak = 1-options.changeBreak;
	var maxChangeBreak = 1+options.changeBreak;
	for (var i=1; i <= options.steps; i++) {
		var temp = [];
		var breakNr = 0; 
		for (var t=0; t <= n; t++) {
			temp[t] = theta[t]-(options.alpha/m)*Sum(derivation,['i',t],['i',0,m-1]);
			if ((temp[t]/theta[t]) > minChangeBreak && (temp[t]/theta[t]) < maxChangeBreak) {
				breakNr++;
			}
		}
		theta = temp;
		if (breakNr == n+1) {
			console.log('break after iteration: '+i);
			break;	
		}
	}
	console.log('theta: ',theta);
}

function testLog() {
	for(var i = 0; i < m; i++) {
		console.log('hypo for ',startData[i].slice(0,n),': ',hypothesis(startData[i].slice(0,n),true));	
	}
}

