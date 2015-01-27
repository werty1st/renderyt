
/*
node-debug --web-host 0.0.0.0 --save-live-edit true renderyt.js 
http://wmaiz-v-sofa02.dbc.zdf.de:8080/debug?port=5858
*/




function RenderWorker()
{
	var initcompleted = false;
	var pool = [];
	var running = false;

	this.add = function add(func)
	{
		pool.push(func);
		run();
	}

	this.init = function init()
	{
		initcompleted = true;
		run();
	}

	var completed = function completed()
	{
		running = false;
		console.log("next rw");
		run();
	}

	var run = function run()
	{
		if (running) return;		
		if (!initcompleted) return;

		if (pool.length > 0)
		{
			running = true;
			var task = pool.shift();			
				task(completed);
		}
	}

}
var rw = new RenderWorker();



var gm = require('gm');
//per request select fb
var driver = false;

//setup environment
var webdriver = require('selenium-webdriver'),
	By = webdriver.By,
    until = webdriver.until,
    firefox = require('selenium-webdriver/firefox');

var runHeadless = require('./headless');
var options = {
	//keine unterschiedlichen displaygrößen per request eher per server
	display: {width: 800, height: 800, depth: 24}
};

var headless = runHeadless(options,function(err, childProcess, servernum){
	//xvfb ready
	if(!err){
		//console.log("display at:",servernum);
		process.env.DISPLAY = ":" + servernum;
		driver = new firefox.Driver();
		rw.init();
	} else {
		//error
		throw new Error("X or Selenium not running.");
	}
});



function saveImage(buffer, imagebuffertarget, onCompleted)
{
	
	imagebuffertarget(buffer, onCompleted);
	
}


function captureScreen(imagedimensions, posttarget, onCompleted)
{

	function convertImage(image)
	{
		gm(image, "temp.png")
			.options({imageMagick: true})
			.crop(imagedimensions.width, imagedimensions.height, imagedimensions.x, imagedimensions.y)
			.toBuffer('PNG',function (err, buffer) {
				saveImage(buffer, posttarget, onCompleted);
			});
			// .write(imagefile, function (err) {
			// 	if (!err) console.log('crazytown has arrived');
			// 	console.log("saved to:",imagefile);
			//     saveImage(imagefile, posttarget, onCompleted);
			// })
	}

	driver.takeScreenshot().then(
	    function(image, err) {
	    	var buf = new Buffer(image, 'base64');
	        convertImage(buf);
	        // require('fs').writeFile("temp.png", image, 'base64', function(err) {
	        // });
	    }
	);
}


function pageloaded(driver, posttarget, Timeout, onCompleted){
	clearTimeout(Timeout);
	console.log("session loaded");

	setTimeout(function (){
			var imagedimensions = {};
			var ele = driver.findElement(By.id("maincontainer"));
				ele.getLocation().then(function(point){
					imagedimensions.x = point.x;
					imagedimensions.y = point.y;
	
					ele.getSize().then(function(size){
						imagedimensions.width = size.width;
						imagedimensions.height = size.height;
						//take screenshot
						captureScreen(imagedimensions, posttarget, onCompleted);
					})
				});			
		},1000);	
}



function renderRequestTask(url, posttarget, onCompleted){

	console.log("running session",url);

	//todo
	//laufenden process/timeout abfragen wenn vorhandn dann push nach waitingCalls
	//alternativ einen pool aus new firefox.Driver(); //bringt keinen performane vorteil lieber eins nach dem anderen

	//todo fehler einbauen kein default
	//var url = url || 'http://merlin.intern.zdf.de:5984/twr/c0cb0d515756ec82976722085fa7d904257eb5de/rendersource.html';

	var timeout1 = 0;
	driver.get(url);	

	var pagestate = driver.executeScript('return document.readyState;')

	timeout1 = setTimeout(function ()
	{
		console.log("session took to much time to load");
	},15000)

	pagestate.then(function(readyState){
		console.log("pagestate",readyState);
		if (readyState === "complete"){
			pageloaded(driver, posttarget, timeout1, onCompleted);
		}
	});

}


module.exports.renderUrl = function renderUrl(url, posttarget){
	rw.add(function(onCompleted){
		var _url = url;
		var _posttarget = posttarget;
		renderRequestTask(_url, _posttarget, onCompleted);		
	});
}

