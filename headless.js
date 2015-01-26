
var headless = require('headless');

module.exports = function runHeadless(myoptions, callback){

	// var options = {
	// 	display: {width: 1024, height: 980, depth: 24}
	// };	
	
	test_selenium(); //throws error if not running	

	options = myoptions;

	headless(options, function(err, childProcess, servernum) {

		if (!err){
			// childProcess is a ChildProcess, as returned from child_process.spawn()
			console.log('Xvfb:', true);
			if (typeof callback === "function") callback(err, childProcess, servernum);
		} else {
			console.log('Xvfb:',err);
			throw new Error("Xvfb not running.");
		}

	});

}


var diretcall = !module.parent;
if (diretcall){
	throw new Error("diretcall not supported");
}

function test_selenium(){
	//check if selenium is running
	var spawn = require('child_process').spawn,
	    servicestate = spawn('service', ['selenium', 'status']);
	var selenium_running = false;

	servicestate.stdout.on('data', function (data) {
	  selenium_running = (data.toString().indexOf("Selenium Grid Server is not running"))==-1;
	  console.log("Selenium:", selenium_running);
	  servicestate.kill();
	  if (!selenium_running) throw new Error("Selenium not running.");
	});

	servicestate.stderr.on('data', function (data) {
	  console.log("Selenium: State could not be determined. Continuing anyway.");
	  selenium_running = true;
	  servicestate.kill();
	});

	servicestate.on('close', function (code) {
	  //console.log('child process exited with code ' + code);
	  servicestate = null;
	});	
}
