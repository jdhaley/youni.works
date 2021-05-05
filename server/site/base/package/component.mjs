export default {
	type$: "/system.youni.works/core",
	Component: {
		type$: "Instance",
		receive: function(msg) {
			let action = this.actions[typeof msg == "string" ? msg : msg.subject];
			action && action.call(this, msg);			
		},
		start: function(conf) {
		},
		actions: {	
		}
	},
	Observer: {
		type$: "",
		observe: function(object) {
			const OBSERVERS = this.sys.symbols.observers;
			if (typeof object != "object" || object == null) return; //Only observe objects.
			let observers = object[OBSERVERS];
			if (observers) {
				for (let observer of observers) {
					if (observer == this) return; //Already observing
				}
			} else {
				observers = [];
				object[OBSERVERS] = observers;
			}
			observers.push(this);
		},
		unobserve: function(control, object) {
			const OBSERVERS = this.sys.symbols.observers;
			let list = object ? object[OBSERVERS] : null;
			if (list) for (let i = 0, len = list.length; i < len; i++) {
				if (this == list[i]) {
					list.splice(i, 1);
					break;
				}
			}
		}
	}
}
