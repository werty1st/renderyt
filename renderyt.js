
/*
node-debug --web-host 0.0.0.0 --save-live-edit true renderyt.js 
http://wmaiz-v-sofa02.dbc.zdf.de:8080/debug?port=5858
*/

//starte 2 fb

//per request select fb
var drivers = {};

//setup environment
var By = require('selenium-webdriver').By,
    until = require('selenium-webdriver').until,
    firefox = require('selenium-webdriver/firefox');

var runHeadless = require('./headless');
var options = {
	//keine unterschiedlichen displaygrößen per request eher per server
	display: {width: 600, height: 600, depth: 24}
};

var headless = runHeadless(options,function(err, childProcess, servernum){
	//xvfb ready
	if(!err){
		//console.log("display at:",servernum);
		process.env.DISPLAY = ":" + servernum;
		drivers.driver1 = new firefox.Driver();
		drivers.driver2 = new firefox.Driver();		
		initcompleted();
	} else {
		//error
		throw new Error("X or Selenium not running.");
	}
});

var waitingCalls = [];
function initcompleted(){
	for (var i = waitingCalls.length - 1; i >= 0; i--) {
		waitingCalls[i]();
	};
	waitingCalls = null;
}

function pageloaded(driver,posttarget,Timeout,driverNo){
	clearTimeout(Timeout);

	console.log("session",driverNo,"loaded");

	//posttarget = curl -v -X PUT http://127.0.0.1:5984/albums/6e1295ed6c29495e54cc05947f18c8af/artwork.jpg?rev=2-2739352689 --data-binary @artwork.jpg -H "Content-Type: image/jpg"
	setTimeout(function (){
			driver.takeScreenshot().then(
			    function(image, err) {
			        require('fs').writeFile('google.png', image, 'base64', function(err) {
			            console.log("error:",err);
			            //driver.quit(); not reuseable on quit
			            //process.exit(code=0);
			        });
			    }
			);	
			
		},2000);	
}



module.exports = function renderrequest(url,posttarget, driverNo){

	driver = drivers["driver"+driverNo];

	if (!driver){
		waitingCalls.push( function ()
		{
			var _url = url;
			var _posttarget = posttarget;
			var _driverNo = driverNo;
			renderrequest(_url,_posttarget,_driverNo);
		} );
		return;
	}

	console.log("running on session:", driverNo);

	//todo
	//laufenden process/timeout abfragen wenn vorhandn dann push nach waitingCalls
	//alternativ einen pool aus new firefox.Driver(); //bringt keinen performane vorteil lieber eins nach dem anderen

	var url = url || 'http://merlin.intern.zdf.de:5984/twr/c0cb0d515756ec82976722085fa7d904257eb5de/rendersource.html';

	var timeout1 = 0;
	//driver.get('http://merlin.intern.zdf.de:8811/');
	driver.get(url);
	//driver.findElement(By.name('q')).sendKeys('webdriver');
	//driver.findElement(By.name('btnG')).click();

	var pagestate = driver.executeScript('return document.readyState;')

	timeout1 = setTimeout(function ()
	{
		console.log("session",driverNo,"took to much time to load");
		//driver.quit();
		//process.exit(code=0);		
	},10000)

	pagestate.then(function(readyState){
		console.log("pagestate",readyState);
		if (readyState === "complete"){
			pageloaded(driver, posttarget, timeout1, driverNo);
		}
	});

	



}


//debug
module.exports(0,0,1);
module.exports(0,0,2);


// driver.wait(until.titleIs('webdriver - Google Search'), 1000);




