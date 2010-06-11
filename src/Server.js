var sys = require('sys')
  , http = require('http')
  , fs = require('fs')
  , url = require('url');

var renderer=require("./Renderer");
var blocks=require("./Blocks");


var renderFactory=renderer.Renderer();
var indexBlock=blocks.CompoundValue();

var counter=0;
var counter_block=blocks.Block({
	tagName: "span"
	, attributes: {
		id:"counter"
	}
	, children:[
		function(context){sys.puts("COUNTER++");return counter++;}
	]
})
var transition_block=blocks.Block({
	tagName: "span"
	, attributes: {
		id:"transition"
	}
	, children:[
		"<button onclick='Grain.transition(\"other\")'>Other</button>"
	]
})
var other_transition_block=blocks.Block({
	tagName: "span"
	, attributes: {
		id:"transition"
	}
	, children:[
		"<button onclick='Grain.transition(\"default\")'>Default</button>"
	]
})
renderFactory.setBlock("counter",counter_block)
var page_block=blocks.Block({
	tagName: "body"
	, children:[
		"<script src='./grain.js' type='text/javascript'></script>RENDERS: "
		, counter_block
		, "<button onclick='Grain.refresh()'>Refresh</button>"
		, transition_block
	]
})
renderFactory.setBlock("page",page_block)
renderFactory.setBlock("default",blocks.Block({
	//root template attributes equate to headers
	//root template has no tagName
	attributes:{
		"content-type":"text/html"
	}
	, children:[
		page_block
	]
}));
var other_page_block=blocks.Block({
	tagName: "body"
	, children:[
		"<script src='./grain.js' type='text/javascript'></script>RENDERS: "
		, counter_block
		, "<button onclick='Grain.refresh()'>Refresh</button>"
		, other_transition_block
	]
})
renderFactory.setBlock("other",other_page_block)


http.createServer(function (request, response) {
	sys.puts("REQUEST FOR : "+request.url)

  var info=url.parse(request.url,true);
  switch(info.pathname) {
  	case "/grain.js":
  	response.writeHead(200, {'Content-Type': 'text/javascript'});
  		sys.puts(sys.inspect(info));
  		switch(info.query?info.query.action:"display") {
  			case "refresh":
  				response.write("Grain.integrate(")
  				sys.puts("REFRESH")
  				var actions=renderFactory.refresh(
  				info.query.state
  				,{otherState:info.query.state&&info.query.state!="default"?"default":"other"}
  				,function(chunk) {
  					sys.puts("WRITING: "+chunk)
					response.write(chunk);
				}
				,function(){
					response.write(")")
					response.end();
				})
  			break;
  			default:
				var stream=fs.createReadStream("grain.js");
				stream.addListener("data",function(chunk) {
					response.write(chunk);
				});
				stream.addListener("end",function(){
					response.end();
				})
  		}
  		break;
  	case "/":
  	response.writeHead(200, {'Content-Type': 'text/html'});
	  renderFactory.render(
		"default"
		,{otherState:"other"}
		, function(chunk){
			//sys.puts("WRITING:"+sys.inspect(chunk));
			response.write(chunk);
		}
		,function(){
			//sys.puts("DONE");
			response.end();
		}
	  );
  }
}).listen(8000);

sys.puts('Server running at http://127.0.0.1:8000/');