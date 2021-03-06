export default {
	package$: "youni.works/base",
	package$util: "youni.works/util",
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
		forName: function(name) {
			return name && name.indexOf("/") < 0 ? this.components[name] : this.sys.forName(name);
		}
	},
	Controller: {
		super$: "Object",
		type$app: "Application",
		initialize: function() {
		},
		control: function(object) {
			object.of = this;
			object.actions = this.actions;
		},
		bind: function(control, data) {
		},
		extend$actions: {
			receive: function(on, signal) {
				signal = prepareSignal(on, signal);
				this[signal.topic] && this[signal.topic].call(this, on, signal);
			},
			send: function(to, message) {
				message = prepareSignal(to, message);
				log(to, message);
				message && down(to, message);
			},
			sense: function(on, event) {
				event = prepareSignal(on, event);
				log(on, event);
				event && up(on, event);
			}
		}
	},
	Owner: {
		super$: "Controller",
		type$app: "Application",
		create: function(data, type) {
			let controller;
			if (typeof type == "object") {
				controller = type;
			} else {
				type = type || data.type;
				controller = this.app.forName(type);
				if (!controller) {
					console.error(`Control type "${type} does not exist.`);
					return;
				}
			}
			let control = this.createControl(controller, data);
			controller.control(control);
			controller.bind(control, data);
			return control;
		},
		createControl: function(controller, data) {
			return this.sys.extend({
				owner: this
			});
		}
	}
}

Symbol.observers = Symbol("observers");

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
		for (let observer in observers) {
			if (observer == control) return; //Already observing
		}					
	} else {
		observers = [];
		model[Symbol.observers] = observers;
	}
	observers.push(control);
}

function prepareSignal(on, signal) {
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
	on.actions && on.actions.receive(on, message);
	if (on.to) for (on of on.to) {
		down(on, message);
	}
}

function up(on, event) {
	if (event.path) for (let on of event.path) {
		if (!event.topic) return;
		on.actions && on.actions.receive(on, event);
	}
	if (event.preventDefault && !event.topic) event.preventDefault();
}

const DONTLOG = ["receive", "mousemove", "tracking", "selectionchange"];
function log(on, event) {
	for (let topic of DONTLOG) {
		if (event.topic == topic) return;
	}
	console.debug(event.topic + " " + on.nodeName);
}