var EventEmitter=require("events").EventEmitter;
var sys=require("sys");

exports.Renderer=function() {
	var $this={}
	, _blocks={};
	$this.render=function(block,context,dataListener,endListener,errorListener) {
		//sys.puts(sys.inspect(_blocks)+"?")
		var parts=_blocks[block].render(context,_blocks)
		, length=parts.length
		//sys.puts(sys.inspect(parts))
		if(!length) {
			return "";
		}
		var sendingIndex=0
		, postBuffer=null
		, sendQueue={}
		, $this={};
		//sys.puts(sys.inspect(parts));
		for(var i=0;i<length;i++) {
			var part=parts.shift();
			//sys.puts(sys.inspect(part));
			//if we get a stream back gotta queue up the buffers etc
			if(part.addListener) {
				postBuffer=[];
				(function(part,postBuffer,index) {
					part.addListener("data",function(chunk){
						//just send if its at right index
						if(sendingIndex===index) {
							dataListener(chunk);
						}
						else {
							index in sendQueue
							? sendQueue[index].push(chunk)
							: sendQueue[index]=[chunk];
						}
					});
					part.addListener("end",function(){
						//just send if its at right index
						if(sendingIndex===index) {
							dataListener(postBuffer.join(""));
							sendingIndex++;
							if(sendingIndex===length) {
								endListener()
							}
							else {
								while(sendingIndex in sendQueue) {
									var chunk=sendQueue[sendingIndex++].join("");
									dataListener(chunk);
								}
							}
							if(sendingIndex===length) {
								endListener()
							}
						}
						else {
							sendQueue[index].push(postBuffer)
						}
					})
					part.addListener("error",function(err){
						errorListener();
					})
				})(part,postBuffer,i);
			}
			else {
				if(postBuffer === null) {
					dataListener(part);
					sendingIndex++;
					if(sendingIndex===length) {
						endListener()
					}
				}
				else {
					postBuffer.push(part)
				}
			}
		}
		return $this;
	}
	$this.refresh=function(blockName,context,onData,onEnd) {
		var mapping=_blocks[blockName].refresh(context,_blocks);

		var first=true;
		var streamCounts={};
		var data={}
		var needed=0
		var current=0
		for(var id in mapping) {
			sys.puts("ADDED TASK: "+id)
			needed++;
			data[id]=[]
			streamCounts[id]={needed:0,current:0};
			var parts=mapping[id];
			for(var i=0;i<parts.length;i++) {
				var part=parts[i];
				if(part.addListener) {
					streamCounts[id].needed++;
					//have to wrap the data callback in closure otherwise for loop closure = fail
					part.addListener("data",(function(i){return function(chunk){
						data[id][i]+=chunk;
					}})(i))
					part.addListener("end",function(){
						streamCounts[id].current++;
						if(streamCounts[id].current==streamCounts[id].needed) {
							onData((first?"{":",")+JSON.stringify(id)+":"+JSON.stringify(data[id].join("")))
							current++;
						}
						if(needed==current) {
							onData("}")
							onEnd();
						}
					})
					continue;
				}
				data[id][i]=typeof part=="function"?part(context):part;
			}
			if(streamCounts[id].current==streamCounts[id].needed) {
				onData((first?"{":",")+JSON.stringify(id)+":"+JSON.stringify(data[id].join(""))+"}")
				onEnd();
			}
			first=false;
		}
		return $this;
	}
	$this.setBlock=function(name,block) {
		_blocks[name]=block;
	}
	//how to get to $that from $this
	//dict of path arrays to blocks [part,part]:Block()
	//
	$this.diff=function($that) {

	}
	return $this;
}