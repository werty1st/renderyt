
//node-debug --web-host 0.0.0.0 renderyt.js 

//starte 2 fb

//per request select fb
var runHeadless = require('./headless');
var options = {
  display: {width: 600, height: 800, depth: 24}
};

var headless = runHeadless(options,function(err, childProcess, servernum){
	//xvfb ready
	if(!err){
		console.log("display at:",servernum);
		process.env.DISPLAY = ":" + servernum;
		renderrequest();		
	}
});


var By = require('selenium-webdriver').By,
    until = require('selenium-webdriver').until,
    firefox = require('selenium-webdriver/firefox');



function renderrequest(){
	console.log("run renderrequest");

	var driver = new firefox.Driver();
	//driver.get('http://merlin.intern.zdf.de:8811/');
	driver.get('http://merlin.intern.zdf.de:5984/twr/f4a7e6e2567107a950d86d74af9eea8b41904090/rendersource.html');
	//driver.findElement(By.name('q')).sendKeys('webdriver');
	//driver.findElement(By.name('btnG')).click();
	setTimeout(function (){
		driver.takeScreenshot().then(
		    function(image, err) {
		        require('fs').writeFile('google.png', image, 'base64', function(err) {
		            console.log(err);
		            driver.quit();
		            //process.exit(code=0);
		        });
		    }
		);	
		
	},5000);

}



// driver.wait(until.titleIs('webdriver - Google Search'), 1000);




