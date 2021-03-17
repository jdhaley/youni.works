export default {
	package$: "youni.works/base",
	package$util: "youni.works/util",
	Control: {
		super$: "Object",
		to: Object.freeze([]),
		model: undefined,
		receive: function(signal) {
			signal = prepareSignal(signal);
			let action = this.actions[signal.topic];
			action && action.call(this.actions, this, signal);			
		},
		extend$actions: {
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
			notify: notify
		},
		initialize: function() {
		}
	},
	Owner: {
		super$: "Control",
		type$app: "Application",
		typeFor: function(data, type) {
			type = type || data.type;
			if (typeof type == "object") return type;
			return this.app.forName(type);
		},
		create: function(data, type) {
			type = this.typeFor(data, type);
			type = this.sys.extend(type, {
				owner: this,
				model: data
			});
			type.initialize();
			return type;
		}
	},
	Application: {
		super$: "Object",
		components: null,
		type$remote: "util.Remote",
		observe: function(observer, object) {
			unobserve(observer, observer.model);
			observe(observer, object);
		},
		open: function(pathname, receiver) {
			this.remote.service(receiver, "opened", {
				url: pathname,
				method: "GET"
			});
		},
		save: function(pathname, content, receiver) {
			this.remote.service(receiver, "saved", {
				url: pathname,
				content: content,
				method: "PUT"
			});
		},
		forName: function(name) {
			return name && name.indexOf("/") < 0 ? this.components[name] : this.sys.forName(name);
		}
	}
}
//
//Controller: {
//	super$: "Object",
//	type$app: "Application",
//	initialize: function() {
//	},
//	control: function(object) {
//		object.kind = this;
//		object.actions = this.actions;
//	},
//	bind: function(control, data) {
//	},
//	extend$actions: {
//		receive: function(on, signal) {
//			signal = prepareSignal(signal);
//			this[signal.topic] && this[signal.topic].call(this, on, signal);
//		},
//		send: function(to, message) {
//			message = prepareSignal(message);
//			log(to, message);
//			message && down(to, message);
//		},
//		sense: function(on, event) {
//			event = prepareSignal(event);
//			log(on, event);
//			event && up(on, event);
//		},
//		notify: notify
//	}
//},
//

Symbol.observers = Symbol("observers");

function notify(control, signal) {
	let observers = control.model && control.model[Symbol.observers];
	if (!observers) return;
	signal = prepareSignal(signal);
	for (let on of observers) {
		//Set the following for each iteration in case of a bad behaving control.
		signal.source = control;
		signal.model = control.model;
		on.receive(signal);			
	}
}

function unobserve(control, model) {
	let list = model ? model[Symbol.observers] : null;
	if (list) for (let i = 0, len = list.length; i < len; i++) {
		if (control == list[i]) {
			list.splice(i, 1);
			break;
		}
	}
	//Caller is now responsible to:
	//delete control.model or re-assign, etc.
}

function observe(control, model) {
	if (typeof model != "object" || model == null) return; //Only observe objects.
	let observers = model[Symbol.observers];
	if (observers) {
		for (let observer of observers) {
			if (observer == control) return; //Already observing
		}					
	} else {
		observers = [];
		model[Symbol.observers] = observers;
	}
	observers.push(control);
}

function prepareSignal(signal) {
	if (typeof signal != "object") {
		signal = {
			topic: signal
		};
	}
	signal.stopPropagation && signal.stopPropagation();
	if (!signal.topic) signal.topic = signal.type;
	return signal;
}

function down(on, message) {
	if (!message.topic) return;
	on.receive(message);
	if (message.push) message.pushPath(on);
	for (on of on.to) {
		down(on, message);
	}
}

function up(on, event) {
	if (event.path) for (let on of event.path) {
		if (!event.topic) return;
		on.receive(event);
	}
	if (event.preventDefault && !event.topic) event.preventDefault();
}

const DONTLOG = ["receive", "track", "mousemove", "selectionchange"];
function log(on, event) {
	for (let topic of DONTLOG) {
		if (event.topic == topic) return;
	}
	console.debug(event.topic + " " + on.nodeName + " " + on.className);
}