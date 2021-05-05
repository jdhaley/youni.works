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
	Node: {
		type$: "Component",
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
		send: function(to, message) {
			message = prepareSignal(message);
			log(to, message);
			message && down(to, message);
		},
		sense: function(on, event) {
			event = prepareSignal(event);
			log(on, event);
			event && up(on, event);
		},
		notify: function(on, signal) {
			const OBSERVERS = on.sys.symbols.observers;
			let model = signal.model || on.model;
			let observers = model && model[OBSERVERS];
			if (!observers) return;
			signal = prepareSignal(signal);
			for (let ctl of observers) {
				//Set the following for each iteration in case of a bad behaving control.
				signal.source = on;
				signal.model = model;
				ctl.receive(signal);
			}
		}
	}
}

function prepareSignal(signal) {
	if (typeof signal != "object") {
		signal = {
			subject: signal
		};
	}
	signal.stopPropagation && signal.stopPropagation();
	if (!signal.subject) signal.subject = signal.type;
	return signal;
}

function down(on, message) {
	if (!message.subject) return;
	on.receive(message);
	if (message.push) message.pushPath(on);
	for (on of on.to) {
		down(on, message);
	}
}

function up(on, event) {
	if (event.path) for (let on of event.path) {
		if (!event.subject) return;
		on.receive(event);
	}
	if (event.preventDefault && !event.subject) event.preventDefault();
}

const DONTLOG = ["receive", "track", "mousemove", "selectionchange"];
function log(on, event) {
	for (let subject of DONTLOG) {
		if (event.subject == subject) return;
	}
	console.debug(event.subject + " " + on.nodeName + " " + on.className);
}