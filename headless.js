function test_selenium(){
	//check if selenium is running
	var spawn = require('child_process').spawn,
	    servicestate = spawn('service', ['selenium', 'status']);
	var selenium_running = false;

	servicestate.stdout.on('data', function (data) {
	  selenium_running = (data.toString().indexOf("Selenium Grid Server is not running"))==-1;
	  console.log("selenium:", selenium_running);
	  servicestate.kill();
	  if (!selenium_running) throw new Error("Selenium not running.");
	});

	servicestate.stderr.on('data', function (data) {
	  console.log("selenium: State could not be determined. Continuing anyway.");
	  selenium_running = true;
	  servicestate.kill();
	});

	servicestate.on('close', function (code) {
	  //console.log('child process exited with code ' + code);
	  servicestate = null;
	});	
}

var headless = require('headless');

var options = {
	display: {width: 1024, height: 980, depth: 24}
};

module.exports = function runHeadless(myoptions, callback){
	
	test_selenium(); //throws error if not running	

	options = myoptions || options;

	headless(options, function(err, childProcess, servernum) {
	  // childProcess is a ChildProcess, as returned from child_process.spawn()
	  console.log('Xvfb running on server number', servernum);
	  console.log('Xvfb pid', childProcess.pid);
	  console.log('err should be null', err);

	  if (typeof callback === "function") callback(err, childProcess, servernum);
	  // console.log('dying in 5 sek');
	  // setTimeout(function(){process.exit(code=0)},5000);

	});

}


var diretcall = !module.parent;
if (diretcall){
	//console.log("diretcall");
	module.exports();
} else {
	//console.log("module call");	
}
