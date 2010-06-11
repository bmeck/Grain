var Event=require("./Event")
, EventListener=Event.EventListener
, Event=Event.Event;

exports.StateMachine=function() {
	var states={}
	, $this=new EventEmitter();
	$this.addState=function(label,value){
		return states[label]=value;
	};
	$this.transitionTo=function(label,toLabel){
		$this.dispatchEvent(new Event(
			"transition"
			, states[label]
			, states[toLabel]
		));
	};
	$this.removeState=function(label){
		//if state == label?
		return delete states[label];
	};
	return $this;
}