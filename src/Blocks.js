var sys=require("sys")
//value is a JS object, with any key/value pairs
function GetBlock(blockName) {
	return function(context,renders){return renders[blockName].render(context,renders);}]
}
function Block(value) {
	var $this={};
	$this.id=value.tagName
		&& value.attributes
		&& value.attributes.id
		? value.attributes.id
		: false;
	var parts=[];
	var subblocks=[];
	var blockids=[];
	var children=value.children
	, length=children
	? children.length
	: 0;
	if(value.tagName) {
		parts.push("<",value.tagName);
		var attrs=[];
		for(var i in value.attributes) {
			attrs.push(i+"="+JSON.stringify(value.attributes[i]));
		}
		if(attrs.length) {
			parts.push(" ",attrs.join(" "))
		}
		parts.push(length?">":"/>")
	}
	for(var i=0;i<length;i++) {
		var node=children[i];
		if(typeof node!=="object") {
			parts.push(node);
			continue;
		}
		else if(node.refresh) {
			parts.push(node);
			subblocks.push(node)
			continue;
		}
		else if(node.render) {
			parts=parts.concat(
				(function(node){return function(context,renders){
					return node.render(context,renders);
				}})(node)
			);
			continue;
		}
	}
	if(value.tagName
	&& length) {
		parts.push("</"+value.tagName+">");
	}
	delete children;
	delete length;

	for(var i=0;i<parts.length-1;) {
		if(typeof parts[i]=="string"
		&& typeof parts[i+1]=="string") {
			var substr=parts[i]+parts[i+1];
			parts.splice(i,2,substr);
		}
		else {
			i++;
		}
	}
	sys.puts(parts.map(function(item){return item.toString();}))
	$this.render=function(context,renders) {
		var result=[];
		for(var i=0;i<parts.length;i++) {
			var item=parts[i]
			if(typeof item=="string") {
				result.push(item);
			}
			else if(typeof item=="function") {
				result.push(String(item(context,renders)));
			}
			else {
				result=result.concat(item.render(context,renders));
			}
		};
		return result;
	}
	$this.root = (!$this.id&&!value.tagName)
	//returns a mapping of block ids to newly rendered content
	$this.refresh=function(context,renders) {
		var result={};
		for(var i=0;i<subblocks.length;i++) {
			var block=subblocks[i];
			sys.puts(sys.inspect(block))
			if(block.root) {
				throw "Root template cannot be a sub template"
			}
			//dont refresh sub blocks, we want their content!
			if(block.id) {
				result[block.id]=block.render(context,renders);
			}
			//anonymous blocks only refresh their sub blocks
			else {
				var subs=block.refresh(context,renders);
				for(var segment in subs) {
					result[segment]=subs[segment];
				}
			}
		}
		return result;
	}
	return $this;
}
exports.Block=Block

//block values are dynamic values
exports.CompoundValue=function() {
	var $this = {}
	, _children = []
	, _rendering = false;
	$this.render=function(context,renders) {
		var length=_children.length
		, results=[]
		, wasRendering=_rendering;
		_rendering=true;
		for(var i=0;i<length;i++) {
			var child=_children[i];
			results=results.concat(
				child.render(context,renders)
			);
		}
		_rendering=wasRendering;
		return results;
	}
	$this.addChild=function(block) {
		if(_rendering){
			throw "Cannot Modify Block during render";
		}
		return _children.push(block);
	}
	$this.removeChild=function(block) {
		if(_rendering){
			throw "Cannot Modify Block during render";
		}
		return _children.splice(_children.indexOf(block),1);
	}
	return $this;
}
exports.BlockingValue=function(spawner) {
	return {render:function(context){return function(){
		var stream=spawner();
		if(!stream.addListener) {
			throw "BlockingValue must be given a ReadableStream factory";
		}
		return stream;
	}}}
}
