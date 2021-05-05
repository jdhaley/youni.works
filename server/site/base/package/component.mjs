export default {
	type$: "/system.youni.works/core",
	Component: {
		type$: "Instance",
		start: function(conf) {
		},
		receive: function(msg) {
			let action = this.actions[typeof msg == "string" ? msg : msg.subject];
			action && action.call(this.actions, this, msg);			
		},
		extend$actions: {	
		}
	}
}