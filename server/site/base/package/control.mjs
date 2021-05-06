export default {
	type$: "/system.youni.works/core",
	Control: {
		type$: "Instance",
		receive: function(signal) {
			let action = this.actions[typeof signal == "string" ? signal : signal.subject];
			action && action.call(this, signal);			
		},
		start: function(conf) {
		},
		actions: {	
		}
	},
	Node: {
		type$: "Control",
		type$owner: "Owner",	//The graph.
		type$to: "Array",		//The arcs.  Each arc should be a Node.
		append: function(component) {
			Array.prototype.push.call(this.to, component);
		}
	},
	Owner: {
		type$: "",
		create: function(controlType, conf) {
			if (typeof controlType != "object") {
				controlType = this.sys.forName(controlType);
			}
			let control = this.sys.extend(controlType, {
				owner: this
			});
			control.start(conf);
			return control;
		},
		send: function(to, msg) {
			if (to.owner != this) console.warn("sending to a node not owned by this.");
			msg = this.prepareSignal(msg);
			this.log(to, msg);
			msg && down(to, msg);

			function down(on, message) {
				if (!message.subject) return;
				on.receive(message);
				if (message.pushPath) message.pushPath(on);
				if (on.to) for (on of on.to) {
					down(on, message);
				}
			}			
		},
		sense: function(on, event) {
			if (to.owner != this) console.warn("sensing on a node not owned by this.");
			event = this.prepareSignal(event);
			this.log(on, event);
			if (event.path) for (let on of event.path) {
				if (!event.subject) return;
				on.receive(event);
			}
			//DOM-specific .preventDefault() logic moved to Frame.
		},
		notify: function(on, signal) {
			const OBSERVERS = on.sys.symbols.observers;
			let model = signal.model || on.model;
			let observers = model && model[OBSERVERS];
			if (!observers) return;
			signal = this.prepareSignal(signal);
			for (let ctl of observers) {
				//Set the following for each iteration in case of a bad behaving control.
				signal.source = on;
				signal.model = model;
				ctl.receive(signal);
			}
		},
		prepareSignal: function(signal) {
			if (typeof signal != "object") return {
				subject: signal
			};
			return signal;
		},
		log: function(on, event) {
			// const DONTLOG = ["receive", "track", "mousemove", "selectionchange"];
			// for (let subject of DONTLOG) {
			// 	if (event.subject == subject) return;
			// }
			// console.debug(event.subject + " " + on.nodeName + " " + on.className);
		}
	},
	DomOwner: {
		type$: "Owner",
		window: null,
		createNode: function(name) {
			if (name.indexOf("/") >= 0) {
				let idx = name.lastIndexOf("/");
				return this.window.document.createElementNs(name.substring(0, idx), name.substring(idx + 1));
			} else {
				return this.window.document.createElement(name);
			}
		},
		sense: function(on, event) {
			this.super("sense", on, event);
			if (event.preventDefault && !event.subject) event.preventDefault();
		},
		prepareSignal: function(signal) {
			signal = this.super("prepareSignal", signal);
			signal.stopPropagation && signal.stopPropagation();
			if (!signal.subject) signal.subject = signal.type;
			return signal;
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