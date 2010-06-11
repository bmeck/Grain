function ajax() {
	if (typeof XMLHttpRequest !== "undefined") {
		return new XMLHttpRequest();
	}
	try { return new ActiveXObject("Msxml2.XMLHTTP.6.0"); }
		catch (e) {}
	try { return new ActiveXObject("Msxml2.XMLHTTP.3.0"); }
		catch (e) {}
	try { return new ActiveXObject("Msxml2.XMLHTTP"); }
		catch (e) {}
	//Microsoft.XMLHTTP points to Msxml2.XMLHTTP.3.0 and is redundant
	throw new Error("This browser does not support XMLHttpRequest.");
}
Grain=(function(){
	var $this={}
	, _state;
	$this.transition=function(goal,context){
		var request=ajax();
		request.onreadystatechange=function() {
			if(request.status==4) {
				var newState;
				try{newState=window.eval(this.responseText);}
				catch(e){throw(e);}
				newState(_blockClosure);
			}
		}
		request.open("GET","./grain.js?action=transition&state="+(_state||"default")+"&goal="+goal,true);
		request.send(JSON.stringify(context));
	}
	$this.refresh=function(context) {
		var request=ajax();
		request.open("GET","./grain.js?action=refresh&state="+(_state||"default"),true);
		request.onreadystatechange=function() {
			if(this.readyState==4) {
				var newState;
				try{newState=window.eval(this.responseText);}
				catch(e){throw(e);}
			}
		}
		request.send(JSON.stringify(context));
	}
	$this.integrate=function(obj) {
		for(var id in obj) {
			var block=document.getElementById(id);
			var html=obj[id];
			if(html==null) {
				block.parentNode.removeChild(block);
			}
			var toDom=document.createElement("span");
			document.body.appendChild(toDom);
			toDom.innerHTML=html;
			var newBlock=toDom.firstChild;
			document.body.removeChild(toDom);
			block.parentNode.replaceChild(newBlock,block);
		}
	}
	return $this;
})();
//alert(Grain.refresh)