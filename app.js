var rasterrizer = require('./renderyt');

function sendImagebuffer(imagebuffer, onCompleted)
{

    require('fs').writeFile("temp1.png", imagebuffer, 'base64', function(err) {
		console.log("done");
		onCompleted();
	});

}
//rasterrizer.renderUrl("http://merlin.intern.zdf.de:5984/twr/c0cb0d515756ec82976722085fa7d904257eb5de/rendersource.html","bild1.png" /*url, posttarget*/);
rasterrizer.renderUrl(
		"http://merlin.intern.zdf.de:5984/twr/803f9bcf81781f7ffe5c6cb15d54646dc5cebce1/rendersource.html",
		sendImagebuffer
		/*url, sendImagebuffer(imagebuffer, onCompleted)*/
		);



