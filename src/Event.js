exports.Event=Event=function(evtType,evtTarget,stoppable,preventable) {
	//preventMe and stopMe exist outside of the event object to keep
	var preventMe=false,stopMe=false,$this;
	$this={
		get type(){return evtType;}
		,set type(){}

		,get target() {return evtTarget;}

		,get preventDefault(){return function(){
			if(preventable
			&& preventMe===false) {
				preventMe=true;
				$this.dispatchEvent("EventPrevented",$this);
			}
		}}
		,set preventDefault(){}

		,get stopPropagation(){return function(){
			if(stoppable
			&& stopMe===false) {
				stopMe=true;
				$this.dispatchEvent("EventStopped",$this);
			}
		}}
		,set stopPropagation(){}

		,get isPrevented(){return preventMe;}
		,set isPrevented(){}

		,get isStopped(){return stopMe;}
		,set isStopped(){}
	};
	EventListener($this);
	return $this;
};
exports.EventListener=EventListener=function($this,defaultActions){
	var eListeners={}
	,defaultActions=defaultActions||{};
	$this=$this||{}
	if(!$this.addEventListener){
		$this.addEventListener=function(evtType,evtHandler) {
			if(!eListeners[evtType]) {
				eListeners[evtType]={};
			}
			eListeners[evtType][evtHandler]=evtHandler;
		};
	}
	if(!$this.removeEventListener){
		$this.removeEventListener=function(evtType,evtHandler) {
			evtType=eListeners[evtType];
			if(evtType){
				if(evtType[evtHandler]) {
					delete evtType[evtHandler];
					return $this;
				}
			}
		};
	}
	if(!$this.dispatchEvent){
		$this.dispatchEvent=function(evt) {
			if(this!==$this) {
				throw "Attempt to dispatch event on object other than origin.";
			}
			var etype=evt.type,listeners,actions,handler;
			if(etype && eListeners[etype]) {
				listeners=eListeners[etype];
				for(handler in listeners) {
					listeners[handler].call($this,evt);
				}
				if(defaultActions[etype]) {
					actions=defaultActions[etype];
					for(handler in actions) {
						actions[handler].call($this,evt);
					}
				}
			}
			return evt.isPrevented;
		};
	}
	return $this;
};